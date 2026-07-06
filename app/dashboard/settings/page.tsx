"use client";

import React from "react";
import { ProfileForm } from "@/module/settings/components/profile-form";
import { RepositoryList } from "@/module/settings/components/repository-list";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your AI code review account configuration and connected repositories.
        </p>
      </div>

      <div className="space-y-6">
        <ProfileForm />
        
        <RepositoryList />
      </div>
    </div>
  );
}