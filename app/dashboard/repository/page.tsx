"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRepositories } from "@/module/repository/hooks/use-repositories";
import { RepositoryCardSkeleton } from "@/module/repository/components/repository-skeleton";
import { useConnectRepository } from "@/module/repository/hooks/use-connect-repository";
import { Search } from "lucide-react";

export interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
    topics: string[];
    isConnected?: boolean;
}

export default function RepositoryPage() {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useRepositories();

    const [searchQuery, setSearchQuery] = useState("");
    const observerTarget = useRef<HTMLDivElement>(null);
    const [localConnectingId, setLocalConnectingId] = useState<number | null>(null);

    const { mutate: connectRepo } = useConnectRepository();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleConnect = (repo: Repository) => {
        setLocalConnectingId(repo.id);
        const owner = repo.full_name.split("/")[0];

        connectRepo(
            {
                owner,
                repo: repo.name,
                githubId: repo.id,
            },
            {
                onSettled: () => setLocalConnectingId(null),
            }
        );
    };

    if (isLoading) {
        return <RepositoryCardSkeleton />;
    }

    if (isError) {
        return <div>Failed to load repositories.</div>;
    }

    const allRepositories = data?.pages?.flatMap((page: any) => page) ?? [];
    const filteredRepositories = allRepositories.filter(
        (repo: Repository) =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Repositories</h1>
                <p className="text-muted-foreground">Manage and view all your Git repos</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRepositories.map((repo: Repository) => (
                    <Card key={repo.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                                    <div className="flex flex-wrap gap-2">
                                        {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                                        {repo.isConnected && <Badge variant="default">Connected</Badge>}
                                    </div>
                                </div>
                            </div>
                            <CardDescription className="line-clamp-2 mt-2">
                                {repo.description || "No description provided."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild className="flex-1">
                                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                        View on GitHub
                                    </a>
                                </Button>
                                <Button
                                    onClick={() => handleConnect(repo)}
                                    disabled={repo.isConnected || localConnectingId === repo.id}
                                    className="flex-1"
                                >
                                    {localConnectingId === repo.id
                                        ? "Connecting..."
                                        : repo.isConnected
                                            ? "Connected"
                                            : "Connect"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div ref={observerTarget} className="py-4">
                {isFetchingNextPage && <RepositoryCardSkeleton />}
                {!hasNextPage && allRepositories.length > 0 && (
                    <p className="text-center text-muted-foreground">No more repositories</p>
                )}
            </div>
        </div>
    );
}