"use server";
import { auth } from "@/lib/auth";
import { getLocalSubscriptionState, getRemainingLimits, updateUserTier } from "@/module/payment/lib/subscription";
import { headers } from "next/headers";
import { polarClient } from "@/module/payment/config/polar";
import prisma from "@/lib/db";

type PolarSubscriptionListItem = {
    id: string;
    status: string;
    modifiedAt?: Date | null;
    createdAt?: Date | null;
};

export interface SubscriptionData {
    user: {
        id: string;
        name: string;
        email: string;
        subscriptionTier: string;
        subscriptionStatus: string | null;
        polarCustomerId: string | null;
        polarSubscriptionId: string | null;
    } | null;
    limits: {
        tier: "FREE" | "PRO";
        repositories: {
            current: number;
            limit: number | null;
            canAdd: boolean;
        };
        reviews: {
            [repositoryId: string]: {
                current: number;
                limit: number | null;
                canAdd: boolean;
            };
        };
    } | null;
}

export async function getSubscriptionData(): Promise<SubscriptionData> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { user: null, limits: null };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        return { user: null, limits: null };
    }

    const limits = await getRemainingLimits(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            subscriptionTier: user.subscriptionTier || 'FREE',
            subscriptionStatus: user.subscriptionStatus || null,
            polarCustomerId: user.polarCustomerId || null,
            polarSubscriptionId: user.polarSubscriptionId || null,
        },
        limits,
    };
}

export async function syncSubscriptionStatus() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || !user.polarCustomerId) {
        return { success: false, message: "No Polar customer ID found" };
    }

    try {
        const result = await polarClient.subscriptions.list({
            customerId: user.polarCustomerId,
        });

        const subscriptions: PolarSubscriptionListItem[] = result.result?.items || [];

        const activeSub = subscriptions.find((sub) => {
            const status = sub.status.toLowerCase();
            return status === "active" || status === "trialing";
        });
        const latestSub = subscriptions[0];

        if (activeSub) {
            await updateUserTier(user.id, "PRO", "ACTIVE", activeSub.id);
            return { success: true, status: "ACTIVE" };
        } else if (latestSub) {
            const { tier, status } = await getLocalSubscriptionState(latestSub.status);
            await updateUserTier(user.id, tier, status, latestSub.id);
            return { success: true, status };
        }

        return { success: true, status: "NO_SUBSCRIPTION" };
    } catch (error) {
        console.error("Failed to sync subscription:", error);
        return { success: false, error: "Failed to sync with Polar" };
    }
}
