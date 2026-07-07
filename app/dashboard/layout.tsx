import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeAudit",
  description: "AI Generated Code Reviews",
};

export default function DashboardLayout(
  { children }: { children: React.ReactNode }
) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className='flex-1 overflow-auto p-4 md:p-6'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}