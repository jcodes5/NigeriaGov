
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Star } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import type { Feedback, Project } from "@/types"; 
import { getAllProjects } from "@/lib/data"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';

type AggregatedFeedback = Feedback & { projectTitle: string };

export default function ManageFeedbackPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [allFeedback, setAllFeedback] = useState<AggregatedFeedback[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        const projects = getAllProjects();
        const feedbackList: AggregatedFeedback[] = [];
        projects.forEach(project => {
          project.feedback?.forEach(fb => {
            feedbackList.push({ ...fb, projectTitle: project.title });
          });
        });
        // Sort by newest first
        feedbackList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllFeedback(feedbackList);
      }
    }
  }, [user, isAdmin, authLoading, router, toast]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Verifying admin access and loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><MessageSquare className="mr-2 h-6 w-6"/>Manage User Feedback</CardTitle>
            <CardDescription>Review and moderate user feedback from all projects.</CardDescription>
          </div>
          {/* Add button for bulk actions or settings if needed later */}
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Comment (Snippet)</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allFeedback.map((fb) => (
                <TableRow key={fb.id}>
                  <TableCell className="font-medium max-w-[150px] truncate" title={fb.projectTitle}>{fb.projectTitle}</TableCell>
                  <TableCell className="max-w-[100px] truncate" title={fb.userName}>{fb.userName}</TableCell>
                  <TableCell className="max-w-xs truncate" title={fb.comment}>{fb.comment}</TableCell>
                  <TableCell>
                    {fb.rating ? (
                      <div className="flex items-center">
                        {fb.rating} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400"/>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {fb.sentimentSummary ? <Badge variant="outline">{fb.sentimentSummary}</Badge> : <span className="text-muted-foreground">N/A</span>}
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                           <span className="sr-only">Feedback Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Full Feedback</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Reviewed</DropdownMenuItem>
                        {/* Add more actions like 'Hide Comment' or 'Respond' if needed */}
                        <DropdownMenuItem className="text-destructive">Delete Feedback</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
