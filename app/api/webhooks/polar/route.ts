import { NextResponse, type NextRequest } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import prisma from "@/lib/db";
import { getLocalSubscriptionState, updatePolarCustomerId, updateUserTier } from "@/module/payment/lib/subscription";

type PolarWebhookCustomer = {
    id: string;
    externalId?: string | null;
    email?: string | null;
};

type PolarWebhookSubscription = {
    id: string;
    customerId: string;
    status: string;
    customer: {
        externalId?: string | null;
        email?: string | null;
    };
};

function getWebhookHeaders(request: NextRequest) {
    const headers: Record<string, string> = {};

    for (const [key, value] of request.headers.entries()) {
        headers[key] = value;
    }

    return headers;
}

async function findUserFromCustomer(customer: PolarWebhookCustomer) {
    if (customer.externalId) {
        const user = await prisma.user.findUnique({
            where: { id: customer.externalId },
        });

        if (user) {
            return user;
        }
    }

    if (customer.email) {
        const user = await prisma.user.findUnique({
            where: { email: customer.email },
        });

        if (user) {
            return user;
        }
    }

    return null;
}

async function findUserFromSubscription(subscription: PolarWebhookSubscription) {
    if (subscription.customer.externalId) {
        const user = await prisma.user.findUnique({
            where: { id: subscription.customer.externalId },
        });

        if (user) {
            return user;
        }
    }

    const mappedUser = await prisma.user.findUnique({
        where: { polarCustomerId: subscription.customerId },
    });

    if (mappedUser) {
        return mappedUser;
    }

    if (subscription.customer.email) {
        const user = await prisma.user.findUnique({
            where: { email: subscription.customer.email },
        });

        if (user) {
            return user;
        }
    }

    return null;
}

export async function POST(request: NextRequest) {
    const secret = process.env.POLAR_WEBHOOK_SECRET;

    if (!secret) {
        return NextResponse.json({ error: "Polar webhook secret is not configured" }, { status: 500 });
    }

    try {
        const body = await request.text();
        const payload = validateEvent(body, getWebhookHeaders(request), secret);

        switch (payload.type) {
            case "customer.created":
            case "customer.updated": {
                const user = await findUserFromCustomer(payload.data as PolarWebhookCustomer);

                if (!user) {
                    return NextResponse.json({ received: true, matched: false }, { status: 200 });
                }

                await updatePolarCustomerId(user.id, payload.data.id);

                return NextResponse.json({ received: true }, { status: 200 });
            }

            case "subscription.created":
            case "subscription.active":
            case "subscription.updated":
            case "subscription.canceled":
            case "subscription.revoked":
            case "subscription.past_due": {
                const subscription = payload.data as PolarWebhookSubscription;
                const user = await findUserFromSubscription(subscription);

                if (!user) {
                    return NextResponse.json({ received: true, matched: false }, { status: 200 });
                }

                const { tier, status } = await getLocalSubscriptionState(subscription.status);

                await updateUserTier(user.id, tier, status, subscription.id);

                if (user.polarCustomerId !== subscription.customerId) {
                    await updatePolarCustomerId(user.id, subscription.customerId);
                }

                return NextResponse.json({ received: true }, { status: 200 });
            }

            default:
                return NextResponse.json({ received: true, ignored: true, type: payload.type }, { status: 200 });
        }
    } catch (error) {
        if (error instanceof WebhookVerificationError) {
            return NextResponse.json({ error: "Invalid Polar webhook signature" }, { status: 401 });
        }

        console.error("Error processing Polar webhook", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
