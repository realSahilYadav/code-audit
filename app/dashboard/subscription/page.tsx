"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Check, X, RefreshCw } from "lucide-react";
import { checkout, customer } from "@/lib/auth-client";
import { getSubscriptionData, syncSubscriptionStatus } from "@/module/payment/actions";


const PLAN_FEATURES = {
  free: [
    { name: "Up to 5 Repos", included: true },
    { name: "Up to 5 Reviews per Repo", included: true },
    { name: "Basic Code Review", included: true },
    { name: "Email Support", included: false },
    { name: "Advanced Analytics", included: false },
    { name: "Priority Support", included: false },
  ],
  pro: [
    { name: "Unlimited Repos", included: true },
    { name: "Unlimited Reviews", included: true },
    { name: "Advanced Code Review", included: true },
    { name: "Email Support", included: true },
    { name: "Advanced Analytics", included: true },
    { name: "Priority Support", included: true },
  ],
};

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["subscriptionData"],
    queryFn: async () => await getSubscriptionData(),
    refetchOnWindowFocus: true,
  });

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const result = await syncSubscriptionStatus();
      if (result.success) {
        toast.success("Subscription status updated");
        refetch();
      } else {
        toast.error("Failed to sync subscription");
      }
    } catch {
      toast.error("Failed to sync subscription");
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    if (success !== "true") {
      return;
    }

    let isCancelled = false;

    async function syncAfterCheckout() {
      const result = await syncSubscriptionStatus();

      if (!isCancelled && result.success) {
        refetch();
      }
    }

    void syncAfterCheckout();

    return () => {
      isCancelled = true;
    };
  }, [success, refetch]);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const result = await checkout({ slug: "Code-Audit" });

      // Fallback: If it returns an error, toast it.
      if (result?.error) {
        toast.error(result.error.message || "Failed to initiate checkout");
        return;
      }

      const redirectUrl = "data" in result && result.data && "url" in result.data
        ? result.data.url
        : "url" in result
          ? result.url
          : null;
      if (redirectUrl) {
        window.location.href = String(redirectUrl);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to open checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const result = await customer.portal();

      if (result?.error) {
        toast.error(result.error.message || "Failed to open portal");
        return;
      }

      const redirectUrl = "data" in result && result.data && "url" in result.data
        ? result.data.url
        : "url" in result
          ? result.url
          : null;
      if (redirectUrl) {
        window.location.href = String(redirectUrl);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to open portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <Spinner />
      </div>
    );
  }

  if (isError || !data?.user) {
    return <div>Please sign in to view subscription options.</div>;
  }

  const currentTier = (data.user.subscriptionTier || "FREE").toUpperCase();
  const isPro = currentTier === "PRO";
  const isActive = data.user.subscriptionStatus === "ACTIVE";
  const limits = data.limits;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscription Plan</h1>
          <p className="text-muted-foreground">Manage your billing and usage</p>
        </div>
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={syncLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncLoading ? "animate-spin" : ""}`} />
          Sync Status
        </Button>
      </div>

      {success === "true" && (
        <div className="p-4 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
          Success! Your subscription has been updated successfully. Changes may take a few moments to reflect.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>Your current plan limits and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Repositories Connected</span>
                <span>
                  {isPro ? "Unlimited" : `${limits?.repositories?.current || 0} / ${limits?.repositories?.limit || 5}`}
                </span>
              </div>
              <Progress value={isPro ? 100 : ((limits?.repositories?.current || 0) / (limits?.repositories?.limit || 5)) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Reviews Generated</span>
                <span>
                  {isPro ? "Unlimited" : `${limits?.reviews?.current || 0} / ${limits?.reviews?.limit || 5}`}
                </span>
              </div>
              <Progress value={isPro ? 100 : (Number(limits?.reviews?.current || 0) / Number(limits?.reviews?.limit || 5)) * 100} />
            </div>
          </div>
          <div className="pt-4 border-t">
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? "Pro Plan: No limits on reviews" : "Free Tier: Allows 5 repos and 5 reviews per repo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={!isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Free
              {!isPro && <Badge>Current Plan</Badge>}
            </CardTitle>
            <CardDescription>$0 / month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2 text-sm">
              {PLAN_FEATURES.free.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={feature.included ? "" : "text-muted-foreground"}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            {!isPro && (
              <Button className="w-full" disabled variant="outline">
                {isActive ? "Active" : "Inactive"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className={isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Pro
              {isPro && <Badge>Current Plan</Badge>}
            </CardTitle>
            <CardDescription>$44.99 / month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2 text-sm">
              {PLAN_FEATURES.pro.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={feature.included ? "" : "text-muted-foreground"}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {isActive ? "Manage Subscription" : "Renew Subscription"}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleUpgrade}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center mt-20">
        <Spinner />
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
