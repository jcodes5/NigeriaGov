
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Star } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import type { Feedback } from "@/types";
import { getAllFeedbackWithProjectTitles } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

type AggregatedFeedback = Feedback & { projectTitle: string };

export default function ManageFeedbackPage() {
  const { profile, isAdmin, isLoading: authLoading } = useAuth(); // Changed user to profile for consistency
  const router = useRouter();
  const { toast } = useToast();
  const [allFeedback, setAllFeedback] = useState<AggregatedFeedback[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!authLoading) {
        if (!isAdmin) {
          toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
          router.replace("/dashboard/user");
          return;
        }

        setIsLoadingData(true);
        try {
          const feedbackList = await getAllFeedbackWithProjectTitles();
          setAllFeedback(feedbackList);
        } catch (error) {
          console.error("Failed to fetch feedback:", error);
          toast({ title: "Error", description: "Failed to load feedback.", variant: "destructive"});
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    fetchFeedback();
  }, [profile, isAdmin, authLoading, router, toast]); // Updated dependency array

  if (authLoading || (isLoadingData && isAdmin)) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(7)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
         <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-3 text-lg">Verifying access and loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !authLoading) {
      return null;
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><MessageSquare className="mr-2 h-6 w-6"/>Manage User Feedback</CardTitle>
            <CardDescription>Review and moderate user feedback from all projects.</CardDescription>
          </div>
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
              {allFeedback.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No feedback found.
                    </TableCell>
                </TableRow>
              ) : (
                allFeedback.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="font-medium max-w-[150px] truncate" title={fb.projectTitle}>{fb.projectTitle}</TableCell>
                    <TableCell className="max-w-[100px] truncate" title={fb.user_name}>{fb.user_name}</TableCell>
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
                      {fb.sentiment_summary ? <Badge variant="outline">{fb.sentiment_summary}</Badge> : <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}</TableCell>
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
                          <DropdownMenuItem className="text-destructive">Delete Feedback</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
