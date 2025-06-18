
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Settings, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UserDashboardPage() {
  const { profile, isLoading } = useAuth(); // Use profile from AuthContext

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  if (!profile) {
     // This could happen if profile fetching failed or user has no profile in public.users
    return <p>Could not load user profile. Please try logging out and back in, or contact support.</p>;
  }

  const recentFeedbackCount = 5; // Mock data, replace with actual count later
  const bookmarkedProjectsCount = 3; // Mock data
  const averageRatingGiven = 4.2; // Mock data


  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardHeader>
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:space-x-4 space-y-2 sm:space-y-0">
            <Image 
                src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=13714C&color=fff&font-size=0.5`} 
                alt={profile.name || 'User'} 
                width={80} 
                height={80} 
                className="rounded-full border-2 border-primary shrink-0"
            />
            <div>
                <CardTitle className="font-headline text-3xl text-primary">Welcome, {profile.name || 'User'}!</CardTitle>
                <CardDescription className="text-md text-foreground/80">Here&apos;s an overview of your activity on NigeriaGovHub.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Submitted</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentFeedbackCount}</div>
            <p className="text-xs text-muted-foreground">
              Total comments and ratings you&apos;ve provided.
            </p>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarked Projects</CardTitle>
            <Star className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookmarkedProjectsCount}</div>
            <p className="text-xs text-muted-foreground">
              Projects you are actively tracking.
            </p>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating Given</CardTitle>
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRatingGiven.toFixed(1)} / 5</div>
            <p className="text-xs text-muted-foreground">
              Your average project rating.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/user/profile" className="flex items-start space-x-3">
                    <Settings className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Profile</p>
                        <p className="text-xs text-muted-foreground">Update your personal information and preferences.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/user/feedback" className="flex items-start space-x-3">
                    <FileText className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">View My Feedback</p>
                        <p className="text-xs text-muted-foreground">Review all the feedback you have submitted.</p>
                    </div>
                </Link>
            </Button>
            <Button variant="default" asChild className="button-hover justify-start p-6 text-left h-auto sm:col-span-2 lg:col-span-1">
                <Link href="/projects" className="flex items-start space-x-3">
                    <MessageSquare className="h-6 w-6 mt-1"/> 
                    <div>
                        <p className="font-semibold">Explore Projects</p>
                        <p className="text-xs ">Discover new projects and initiatives.</p>
                    </div>
                </Link>
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}
