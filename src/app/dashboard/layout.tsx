
"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  LogOut,
  BarChart3,
  ShieldAlert,
  Home,
  Newspaper, 
  Server, 
  MessageSquare, 
  PlayCircleIcon,
} from "lucide-react";
import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardSidebarContent = () => {
  const { isAdmin, logout } = useAuth(); // profile.role is now source of isAdmin
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();


  const handleLogout = async () => {
    await logout(); // logout is now async
    router.push("/");
    router.refresh(); // Refresh to ensure server components update
  };
  
  const closeMobileSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpenMobile(false);
    }
  }

  const commonLinks = [
    { href: "/dashboard/user", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/user/profile", label: "Profile Settings", icon: Settings },
    { href: "/dashboard/user/feedback", label: "My Feedback", icon: FileText },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: "Admin Overview", icon: ShieldAlert },
    { href: "/dashboard/admin/manage-users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/manage-projects", label: "Manage Projects", icon: BarChart3 },
    { href: "/dashboard/admin/manage-news", label: "Manage News", icon: Newspaper },
    { href: "/dashboard/admin/manage-services", label: "Manage Services", icon: Server },
    { href: "/dashboard/admin/manage-videos", label: "Manage Videos", icon: PlayCircleIcon },
    { href: "/dashboard/admin/manage-feedback", label: "Manage Feedback", icon: MessageSquare },
    { href: "/dashboard/admin/site-settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="p-2">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/">
                <SidebarMenuButton onClick={closeMobileSidebar} isActive={pathname === '/'} tooltip="Back to Homepage">
                  <Home />
                  Homepage
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>

          {commonLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton onClick={closeMobileSidebar} isActive={pathname === link.href} tooltip={link.label}>
                  <link.icon />
                  {link.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {isAdmin && (
            <>
              <SidebarMenuSubButton className="font-semibold text-muted-foreground mt-4 mb-1 px-2">Admin Tools</SidebarMenuSubButton>
              {adminLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton onClick={closeMobileSidebar} isActive={pathname === link.href} tooltip={link.label}>
                      <link.icon />
                      {link.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
          <LogOut className="mr-2" /> Logout
        </Button>
      </SidebarFooter>
    </>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, isLoading, profile } = useAuth(); // Using authUser from Supabase and profile from our DB
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !authUser) {
      // If not loading and no Supabase user, redirect to login
      // Preserve the current path for redirection after login
      const currentPath = pathname;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [authUser, isLoading, router, pathname]);

  if (isLoading || !authUser) { // Still loading or no Supabase user
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }
  
  // If Supabase user exists but profile is still loading (it might be a brief moment or if DB call fails)
  // You might want a more specific loading indicator for profile fetching if it's slow
  if (!profile && !isLoading) {
     // This case could mean the profile doesn't exist in public.users or failed to fetch.
     // For now, we show a generic loading, but you might want to handle this more gracefully.
     // E.g., redirect to a profile setup page or show an error.
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg">Loading user profile...</p>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar">
         <DashboardSidebarContent />
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:hidden">
                 <Logo />
                <SidebarTrigger />
            </div>
            <div className="hidden md:flex items-center justify-end mb-4">
                <SidebarTrigger />
            </div>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
