import { Octokit } from 'octokit';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { headers } from 'next/headers';

export const getGithubToken = async() => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error('Unauthorized');
    }

    const account = await prisma.account.findFirst({
        where:{
            userId: session.user.id,
            providerId: 'github'
        }
    });

    if (!account) {
        throw new Error('No github access token found');
    }

    if (!account.accessToken) {
        throw new Error('No github access token found');
    }

    return account.accessToken;
}

export async function fetchUserContribution(token: string, username: string | null) {
    const octokit = new Octokit({auth: token});

    if (!username) {
        throw new Error('GitHub username not found');
    }
    
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
    `
    interface contributionData{
        user: {
            contributionsCollection: {
                contributionCalendar: {
                    totalContributions: number,
                    weeks: {
                        contributionDays: {
                            contributionCount:number
                            date:string | Date,
                            color:string
                        }[]
                    }[]
                }
            }
        }
    }

    try{
        const response:contributionData = await octokit.graphql(query, {
            username
        });

        return response.user.contributionsCollection.contributionCalendar;
    } catch(error) {
        console.error('Error fetching contributions graph', error);
        return null;
    }
}

export const getRepositories = async(page:number = 1, perPage:number = 10) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth:token});

    const {data} = await octokit.rest.repos.listForAuthenticatedUser({
        sort:"updated",
        direction:"desc",
        visibility:"all",
        per_page:perPage,
        page:page
    })

    return data;
}