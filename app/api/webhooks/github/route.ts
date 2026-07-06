import { reviewPullRequest } from '@/module/ai/actions';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req:NextRequest) {
    try{
        const body = await req.json();
        const event = req.headers.get('x-github-event');

        if (event === 'ping') {
            return NextResponse.json({message: 'pong'}, {status:200});
        }

        if (event === 'pull_request') {
            const action = body.action;
            const repo = body.repository.full_name;
            const prNumber = body.number;

            const [owner, repoName] = repo.split("/");

            if (action === 'opened' || action === 'synchronize') {
                await reviewPullRequest(owner, repoName, prNumber);
                console.log(`Review queued/completed for ${repo} #${prNumber}`);
            }
        }

        return NextResponse.json({message: 'Event Processes'}, {status:200});
    } catch(error) {
        console.error('error processing webhook', error);
        return NextResponse.json({error:"Internal server error"}, {status:500});
    }
}