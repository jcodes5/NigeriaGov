
"use client";

import { VideoForm } from "@/components/admin/video-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getVideoById } from "@/lib/data";
import type { Video } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditVideoPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;
  const { toast } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.replace("/dashboard/user");
      return;
    }

    if (isAdmin && videoId) {
      setIsLoadingData(true);
      getVideoById(videoId)
        .then(data => {
          if (data) {
            setVideo(data);
          } else {
            toast({ title: "Error", description: "Video not found.", variant: "destructive" });
            router.replace("/dashboard/admin/manage-videos");
          }
        })
        .catch(err => {
          console.error("Failed to fetch video:", err);
          toast({ title: "Error", description: "Failed to load video.", variant: "destructive" });
        })
        .finally(() => setIsLoadingData(false));
    } else if (!authLoading && !videoId) {
        toast({ title: "Error", description: "Video ID is missing.", variant: "destructive" });
        router.replace("/dashboard/admin/manage-videos");
        setIsLoadingData(false);
    }
  }, [isAdmin, authLoading, router, toast, videoId]);

  if (authLoading || isLoadingData || (!video && isAdmin)) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-60" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
         <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-lg">
                {authLoading ? "Verifying admin access..." : "Loading video data..."}
            </p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin && !authLoading) {
      return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-start">
        <Button variant="outline" asChild className="button-hover">
          <Link href="/dashboard/admin/manage-videos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Videos
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Edit Video</CardTitle>
          <CardDescription>Modify the details below to update the video.</CardDescription>
        </CardHeader>
        <CardContent>
          {video && <VideoForm initialData={video} videoId={video.id} />}
        </CardContent>
      </Card>
    </div>
  );
}
