"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/module/review/actions";

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => await getReviews(),
  });

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Review History</h1>
        <p className="text-muted-foreground">View all AI reviews</p>
      </div>

      {reviews?.length === 0 ? (
        <div>No reviews yet. Create a repo and open a PR.</div>
      ) : (
        reviews?.map((review: any) => (
          <Card key={review.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                 <div>
                   <CardTitle>{review.prTitle}</CardTitle>
                   <Badge variant={review.status?.toLowerCase() === "failed" ? "destructive" : "default"}>
                     {review.status || "completed"}
                   </Badge>
                 </div>
                 <CardDescription>
                   {review.repository.fullName} • PR #{review.prNumber}
                 </CardDescription>
                 <Button asChild>
                   <Link href={review.prUrl} target="_blank">Full PR on GitHub</Link>
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 border-t">
              {review.status?.toLowerCase() === "completed" ? (
                <div className="relative">
                  <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground line-clamp-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {review.review}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none" />
                </div>
              ) : review.status?.toLowerCase() === "failed" ? (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                   <strong>Error:</strong> {review.review}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground animate-pulse">
                  AI is currently analyzing this pull request...
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}