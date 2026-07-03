"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession } from "@/lib/auth-client";
import {
  BookOpen,
  FolderGit2,
  GitPullRequest,
  CreditCard,
  Settings,
  LogOut,
  Moon,
  Sun,
  Laptop,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logout from "@/module/auth/components/logout";

const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    { title: "Dashboard", url: "/dashboard", icon: BookOpen },
    { title: "Repository", url: "/dashboard/repository", icon: FolderGit2 },
    { title: "Reviews", url: "/dashboard/reviews", icon: GitPullRequest },
    { title: "Subscription", url: "/dashboard/subscription", icon: CreditCard },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashboard");
  };

  if (!mounted || !session) return null;

  const user = session.user;
  const username = user?.name || "Guest";
  const userEmail = user?.email || "";
  const userImage = user?.image || "";
  
  const userInitials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Sidebar Header: Connected GitHub Status Platform Title */}
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col grid-flow-row truncate">
            <span className="font-semibold text-foreground leading-none">CodeAudit</span>
            <span className="text-xs text-muted-foreground mt-1">AI Integrity Engine</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Navigation Content */}
      <SidebarContent className="px-3 py-6 flex flex-col gap-1">
        <div className="mb-2 px-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
        </div>
        <SidebarMenu className="gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className="w-full"
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer: Profile Dropdown Menu */}
      <SidebarFooter className="border-t px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userImage} alt={username} />
                    <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight truncate">
                    <span className="truncate font-semibold">{username}</span>
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 rounded-lg"
                side="right"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userImage} alt={username} />
                      <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{username}</span>
                      <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                {/* Theme Configuration */}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1">
                  Theme
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                  {theme === "light" && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                  {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
                  {theme === "system" && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout Trigger */}
                <Logout>
                  <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4 shrink-0" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </Logout>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;