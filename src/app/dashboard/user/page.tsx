"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Settings, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UserDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Please log in to view your dashboard.</p>;
  }

  // Mock data for user activity
  const recentFeedbackCount = 5;
  const bookmarkedProjectsCount = 3;
  const averageRatingGiven = 4.2;


  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Image 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff&font-size=0.5`} 
                alt={user.name} 
                width={80} 
                height={80} 
                className="rounded-full border-2 border-primary"
            />
            <div>
                <CardTitle className="font-headline text-3xl text-primary">Welcome, {user.name}!</CardTitle>
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
                    <MessageSquare className="h-6 w-6 mt-1"/> {/* Using MessageSquare as Find Projects icon */}
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
