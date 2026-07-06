"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getConnectedRepositories, disconnectRepository, disconnectAllRepositories } from "../actions";

export function RepositoryList() {
  const queryClient = useQueryClient();
  const [disconnectAllOpen, setDisconnectAllOpen] = useState(false);

  const { data: repositories, isLoading } = useQuery({
    queryKey: ["connectedRepositories"],
    queryFn: async () => {
      return await getConnectedRepositories();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      return await disconnectRepository(repositoryId);
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connectedRepositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        toast.success("Repository disconnected successfully.");
      }
    },
    onError: (error) => {
      console.error("Disconnection error:", error);
      toast.error("Failed to disconnect repository.");
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepositories();
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connectedRepositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        toast.success("All repositories disconnected successfully.");
        setDisconnectAllOpen(false);
      }
    },
    onError: (error) => {
      console.error("Bulk disconnection error:", error);
      toast.error("Failed to clear connected repositories.");
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasRepos = repositories && repositories.length > 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>Manage your connected GitHub repositories and webhooks.</CardDescription>
        </div>
        
        {hasRepos && (
          <AlertDialog open={disconnectAllOpen} onOpenChange={setDisconnectAllOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Disconnect All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will remove all webhooks from GitHub and disconnect all repositories ({repositories.length}) from your current account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => disconnectAllMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {disconnectAllMutation.isPending ? "Disconnecting..." : "Disconnect All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>

      <CardContent>
        {!hasRepos ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg border-muted-foreground/20">
            <p className="text-sm text-muted-foreground mb-2">No repositories connected yet.</p>
            <p className="text-xs text-muted-foreground/70">Connect repositories from the Repository layout section.</p>
          </div>
        ) : (
          <div className="divide-y divide-muted-foreground/10 space-y-3">
            {repositories.map((repo: any) => (
              <div key={repo.id} className="flex items-center justify-between pt-3 first:pt-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{repo.name}</span>
                    <a 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">{repo.fullName}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={disconnectMutation.isPending}
                  onClick={() => disconnectMutation.mutate(repo.id)}
                >
                  {disconnectMutation.isPending && disconnectMutation.variables === repo.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}