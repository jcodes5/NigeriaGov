"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackItem } from "@/components/projects/feedback-item"; // Assuming FeedbackItem can be reused
import { projects as allProjectsData } from "@/lib/data"; // Mock data
import type { Feedback, Project } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function MyFeedbackPage() {
  const { user } = useAuth();
  const [myFeedback, setMyFeedback] = useState<Array<Feedback & { projectTitle: string, projectId: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate fetching user's feedback from all projects
      const userFeedback: Array<Feedback & { projectTitle: string, projectId: string }> = [];
      allProjectsData.forEach((project: Project) => {
        project.feedback?.forEach(fb => {
          // In a real app, you'd filter by fb.userId === user.id
          // For mock, we assume some feedback is by the current user by name match
          if (fb.userName === user.name) { 
            userFeedback.push({ ...fb, projectTitle: project.title, projectId: project.id });
          }
        });
      });
      // Sort by newest first
      userFeedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyFeedback(userFeedback);
    }
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return <p>Loading your feedback...</p>;
  }

  if (!user) {
    return <p>Please log in to see your feedback.</p>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My Submitted Feedback</CardTitle>
          <CardDescription>Review all the comments and ratings you&apos;ve provided on various projects.</CardDescription>
        </CardHeader>
      </Card>

      {myFeedback.length > 0 ? (
        <div className="space-y-6">
          {myFeedback.map(fb => (
            <Card key={fb.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 p-4 border-b">
                <CardTitle className="text-lg">
                  Feedback on: <Link href={`/projects/${fb.projectId}`} className="text-primary hover:underline">{fb.projectTitle}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <FeedbackItem feedback={fb} />
              </CardContent>
              <CardFooter className="p-4 border-t">
                  <Button variant="outline" size="sm" asChild className="button-hover">
                      <Link href={`/projects/${fb.projectId}#feedback-section`}>View on Project Page <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">You haven&apos;t submitted any feedback yet.</p>
            <Button asChild className="button-hover">
              <Link href="/projects">Explore Projects and Share Your Thoughts</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
