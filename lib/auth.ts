import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { polarClient } from "@/module/payment/config/polar";
import {polar, checkout, portal, usage, webhooks} from "@polar-sh/better-auth"
import { getLocalSubscriptionState, updateUserTier, updatePolarCustomerId, syncPolarCustomerState } from "@/module/payment/lib/subscription";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await syncPolarCustomerState(user.id, user.email);
                },
            },
        },
    },
    socialProviders:{
        github:{
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope:["repo"]
        }
    },
    trustedOrigins: ["http://localhost:3000/", "https://hastily-unsettled-bodacious.ngrok-free.dev"],
    plugins:[
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "149acef0-7a9e-4234-87bb-45b0f7c97243",
                            slug: "Code-Audit"
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL || "/dashboard/subscription/?success=true",
                    authenticatedUsersOnly: true
                }),
                portal({
                    returnUrl:process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/dashboard"
                }),
                usage(),
                webhooks({
                    secret:process.env.POLAR_WEBHOOK_SECRET!,
                    onSubscriptionActive:async(payload) => {
                        const customerId = payload.data.customerId;
                        const externalId = payload.data.customer.externalId;
                        const user = externalId
                            ? await prisma.user.findUnique({ where: { id: externalId } })
                            : await prisma.user.findUnique({
                                where:{
                                    polarCustomerId:customerId
                                }
                            });

                        if (user) {
                            await updateUserTier(user.id, "PRO", "ACTIVE", payload.data.id);
                            if (user.polarCustomerId !== customerId) {
                                await updatePolarCustomerId(user.id, customerId);
                            }
                        }
                    },
                    onSubscriptionCanceled:async(payload) => {
                        const customerId = payload.data.customerId;
                        const externalId = payload.data.customer.externalId;
                        const user = externalId
                            ? await prisma.user.findUnique({ where: { id: externalId } })
                            : await prisma.user.findUnique({
                                where:{
                                    polarCustomerId:customerId
                                }
                            });

                        if (user) {
                            const { tier, status } = await getLocalSubscriptionState(payload.data.status);
                            await updateUserTier(user.id, tier, status, payload.data.id);
                            if (user.polarCustomerId !== customerId) {
                                await updatePolarCustomerId(user.id, customerId);
                            }
                        }
                    },
                    onSubscriptionRevoked:async(payload) => {
                        const customerId = payload.data.customerId;
                        const externalId = payload.data.customer.externalId;
                        const user = externalId
                            ? await prisma.user.findUnique({ where: { id: externalId } })
                            : await prisma.user.findUnique({
                                where:{
                                    polarCustomerId:customerId
                                }
                            });

                        if (user) {
                            await updateUserTier(user.id, "FREE", "EXPIRED", payload.data.id);
                            if (user.polarCustomerId !== customerId) {
                                await updatePolarCustomerId(user.id, customerId);
                            }
                        }
                    },
                    onSubscriptionUpdated:async(payload) => {
                        const customerId = payload.data.customerId;
                        const externalId = payload.data.customer.externalId;
                        const user = externalId
                            ? await prisma.user.findUnique({ where: { id: externalId } })
                            : await prisma.user.findUnique({
                                where:{
                                    polarCustomerId:customerId
                                }
                            });

                        if (user) {
                            const { tier, status } = await getLocalSubscriptionState(payload.data.status);
                            await updateUserTier(user.id, tier, status, payload.data.id);
                            if (user.polarCustomerId !== customerId) {
                                await updatePolarCustomerId(user.id, customerId);
                            }
                        }
                    },
                    onOrderPaid:async() => {},
                    onCustomerCreated:async(payload) => {
                        const externalId = payload.data.externalId;

                        if (!externalId && !payload.data.email) {
                            console.error("Customer mapping not found in payload");
                            return;
                        }

                        const user = await prisma.user.findUnique({
                            where: externalId
                                ? { id: externalId }
                                : { email: payload.data.email as string },
                        });

                        if (user) {
                            await updatePolarCustomerId(user.id, payload.data.id);
                            await syncPolarCustomerState(user.id, user.email);
                        }
                    },
                })
            ],
        })
    ]
});
