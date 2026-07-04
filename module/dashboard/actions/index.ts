"use server"

import { getGithubToken } from "@/module/github/lib/github"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Octokit } from "octokit";

type ContributionCalendar = {
    totalContributions: number;
    weeks: Array<{
        contributionDays: Array<{
            contributionCount: number;
            date: string;
            color: string;
        }>;
    }>;
};

type ContributionWeek = ContributionCalendar["weeks"][number];
type ContributionDay = ContributionWeek["contributionDays"][number];
type SearchIssue = {
    created_at: string;
    updated_at?: string | null;
};

async function getContributionCalendar(token: string, login: string) {
    const octokit = new Octokit({ auth: token });

    const query = `
    query($username:String!){
        user(login:$username){
            contributionsCollection{
                contributionCalendar{
                    totalContributions
                    weeks{
                        contributionDays{
                            contributionCount
                            date
                            color
                        }
                    }
                }
            }
        }
    }
    `;

    const response = await octokit.graphql<{ user: { contributionsCollection: { contributionCalendar: ContributionCalendar } } }>(query, {
        username: login,
    });

    return response.user.contributionsCollection.contributionCalendar;
}

export async function getContributionStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const token = await getGithubToken();

        // Get the actual GitHub username from the GitHub API
        const octokit = new Octokit({ auth: token });

        const { data: user } = await octokit.rest.users.getAuthenticated();
        const githubLogin: string = String(user.login ?? "");

        if (!githubLogin) {
            throw new Error("GitHub username not found");
        }

        const calendar = await getContributionCalendar(token, githubLogin);

        if (!calendar) {
            return null;
        }

        const contributions = calendar.weeks.flatMap((week: ContributionWeek) =>
            week.contributionDays.map((day: ContributionDay) => ({
                date: day.date,
                count: day.contributionCount,
                level: Math.min(4, Math.floor(day.contributionCount / 3)),
            }))
        )

        return {
            contributions,
            totalContributions:calendar.totalContributions
        }

    } catch (error) {
        console.error("Error fetching contribution stats:", error);
        return null;
    }
}


export async function getDashboardStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const token = await getGithubToken();
        const octokit = new Octokit({ auth: token })

        const { data: user } = await octokit.rest.users.getAuthenticated()

        const githubLogin: string = String(user.login ?? "");

        if (!githubLogin) {
            throw new Error("GitHub username not found");
        }

        let totalRepos = 0;
        let totalCommits = 0;
        let totalPRs = 0;
        let totalReviews = 0;

        try {
            const repositories = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
                per_page: 100,
                affiliation: "owner,collaborator,organization_member",
            })

            totalRepos = repositories.length;
        } catch (error) {
            console.error("Error fetching repository count:", error);
        }

        try {
            const calendar = await getContributionCalendar(token, githubLogin);
            totalCommits = calendar?.totalContributions || 0;
        } catch (error) {
            console.error("Error fetching contribution count:", error);
        }

        try {
            const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
                q: `author:${githubLogin} is:pr`,
                per_page: 100,
            })

            totalPRs = prs.total_count;
        } catch (error) {
            console.error("Error fetching pull request count:", error);
        }

        try {
            const { data: reviews } = await octokit.rest.search.issuesAndPullRequests({
                q: `reviewed-by:${githubLogin} is:pr`,
                per_page: 100,
            })

            totalReviews = reviews.total_count;
        } catch (error) {
            console.error("Error fetching review count:", error);
        }

        return {
            totalCommits,
            totalPRs,
            totalReviews,
            totalRepos
        }

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalCommits: 0,
            totalPRs: 0,
            totalReviews: 0,
            totalRepos: 0,
        };
    }
}

export async function getMonthlyActivity() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        const token = await getGithubToken();
        const octokit = new Octokit({ auth: token })

        const { data: user } = await octokit.rest.users.getAuthenticated()

        const githubLogin: string = String(user.login ?? "");

        if (!githubLogin) {
            throw new Error("GitHub username not found");
        }

        const calendar = await getContributionCalendar(token, githubLogin)

        if (!calendar) {
            return [];
        }

        const monthlyData: {
            [key: string]: { commits: number; prs: number; reviews: number }
        } = {}

        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = monthNames[date.getMonth()];
            monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 };
        }

        calendar.weeks.forEach((week: ContributionWeek) => {
            week.contributionDays.forEach((day: ContributionDay) => {
                const date = new Date(day.date);
                const monthKey = monthNames[date.getMonth()];
                if (monthlyData[monthKey]) {
                    monthlyData[monthKey].commits += day.contributionCount;
                }
            })
        })

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);


        const { data: reviewedPullRequests } = await octokit.rest.search.issuesAndPullRequests({
            q: `reviewed-by:${githubLogin} is:pr created:>${sixMonthsAgo.toISOString().split("T")[0]}`,
            per_page: 100,
        });

        reviewedPullRequests.items.forEach((pr: SearchIssue) => {
            const date = new Date(pr.updated_at ?? pr.created_at);
            const monthKey = monthNames[date.getMonth()];
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].reviews += 1;
            }
        });

        const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${githubLogin} is:pr created:>${sixMonthsAgo.toISOString().split("T")[0]}`,
            per_page: 100,
        });

        prs.items.forEach((pr: SearchIssue) => {
            const date = new Date(pr.created_at);
            const monthKey = monthNames[date.getMonth()];
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].prs += 1;
            }
        });

        return Object.keys(monthlyData).map((name) => ({
            name,
            ...monthlyData[name]
        }));

    } catch (error) {
        console.error("Error fetching monthly activity:", error);
        return [];
    }
}