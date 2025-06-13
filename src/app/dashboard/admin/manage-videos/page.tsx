
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, PlayCircleIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import type { Video } from "@/types"; 
import { mockFeaturedVideos } from "@/lib/data"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function ManageVideosPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        setVideos(mockFeaturedVideos); // Using mockFeaturedVideos for now
      }
    }
  }, [user, isAdmin, authLoading, router, toast]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Verifying admin access and loading videos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><PlayCircleIcon className="mr-2 h-6 w-6"/>Manage Videos</CardTitle>
            <CardDescription>Add, edit, and manage video content for the platform.</CardDescription>
          </div>
          <Button className="button-hover w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4"/> Add New Video
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    {video.thumbnailUrl && (
                      <Image 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        width={60} 
                        height={40} 
                        className="rounded object-cover"
                        data-ai-hint={video.dataAiHint || "video thumbnail"}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate" title={video.title}>{video.title}</TableCell>
                  <TableCell className="max-w-sm truncate" title={video.description}>{video.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                           <span className="sr-only">Video Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Video</DropdownMenuItem>
                        <DropdownMenuItem>View Video</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Video</DropdownMenuItem>
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
