
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, BarChart3, ShieldAlert, Settings, Newspaper, Server, MessageSquare, PlayCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast"; 

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast(); 

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.replace("/dashboard/user"); 
    }
  }, [user, isAdmin, isLoading, router, toast]); 

  if (isLoading || !isAdmin) { 
     return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Verifying admin access...</p>
      </div>
    );
  }
  
  const totalProjects = 150; // Mock data
  const pendingApprovals = 5; // Mock data
  const totalUsers = 1250; // Mock data
  const siteHealth = "Good"; // Mock data
  const totalNewsArticles = 25; // Mock data
  const totalServices = 12; // Mock data
  const totalVideos = 6; // Mock data for videos

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardHeader>
           <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:space-x-4 space-y-2 sm:space-y-0">
            <Image 
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=13714C&color=fff&font-size=0.5`} 
                alt={user?.name || 'Admin'} 
                width={80} 
                height={80} 
                className="rounded-full border-2 border-primary shrink-0"
            />
            <div>
                <CardTitle className="font-headline text-3xl text-primary">Administrator Dashboard</CardTitle>
                <CardDescription className="text-md text-foreground/80">Manage NigeriaGovHub content and users.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Articles</CardTitle>
            <Newspaper className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewsArticles}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Services</CardTitle>
            <Server className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Videos</CardTitle>
            <PlayCircleIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingApprovals}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Health</CardTitle>
            <ShieldAlert className="h-5 w-5 text-green-500" /> 
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{siteHealth}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Admin Tools</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-projects" className="flex items-start space-x-3">
                    <BarChart3 className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Projects</p>
                        <p className="text-xs text-muted-foreground">Add, edit, or remove project listings.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-users" className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Users</p>
                        <p className="text-xs text-muted-foreground">View user activity and manage accounts.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-news" className="flex items-start space-x-3">
                    <Newspaper className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage News</p>
                        <p className="text-xs text-muted-foreground">Create, edit, and publish news articles.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-services" className="flex items-start space-x-3">
                    <Server className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Services</p>
                        <p className="text-xs text-muted-foreground">Add or update government service listings.</p>
                    </div>
                </Link>
            </Button>
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-videos" className="flex items-start space-x-3">
                    <PlayCircleIcon className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Videos</p>
                        <p className="text-xs text-muted-foreground">Add, edit, or remove video content.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-feedback" className="flex items-start space-x-3">
                    <MessageSquare className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Feedback</p>
                        <p className="text-xs text-muted-foreground">Review and moderate user feedback.</p>
                    </div>
                </Link>
            </Button>
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/site-settings" className="flex items-start space-x-3">
                    <Settings className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Site Settings</p>
                        <p className="text-xs text-muted-foreground">Configure global application settings.</p>
                    </div>
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
