
"use client";

import { NewsArticleForm } from "@/components/admin/news-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getNewsArticleById } from "@/lib/data";
import type { NewsArticle } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditNewsArticlePage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { toast } = useToast();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.replace("/dashboard/user");
      return;
    }

    if (isAdmin && articleId) {
      setIsLoadingData(true);
      getNewsArticleById(articleId)
        .then(data => {
          if (data) {
            setArticle(data);
          } else {
            toast({ title: "Error", description: "News article not found.", variant: "destructive" });
            router.replace("/dashboard/admin/manage-news");
          }
        })
        .catch(err => {
          console.error("Failed to fetch article:", err);
          toast({ title: "Error", description: "Failed to load news article.", variant: "destructive" });
        })
        .finally(() => setIsLoadingData(false));
    } else if (!authLoading && !articleId) {
        // Handle case where ID might be missing after auth check (should not happen if routing is correct)
        toast({ title: "Error", description: "Article ID is missing.", variant: "destructive" });
        router.replace("/dashboard/admin/manage-news");
        setIsLoadingData(false);
    }


  }, [isAdmin, authLoading, router, toast, articleId]);

  if (authLoading || isLoadingData || (!article && isAdmin)) { // Show loader if auth is loading, data is loading, or if admin but article not yet fetched
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
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
         <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-lg">
                {authLoading ? "Verifying admin access..." : "Loading article data..."}
            </p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin && !authLoading) { // Fallback if useEffect redirect doesn't catch it immediately
      return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-start">
        <Button variant="outline" asChild className="button-hover">
          <Link href="/dashboard/admin/manage-news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage News
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Edit News Article</CardTitle>
          <CardDescription>Modify the details below to update the news article.</CardDescription>
        </CardHeader>
        <CardContent>
          {article && <NewsArticleForm initialData={article} articleId={article.id} />}
        </CardContent>
      </Card>
    </div>
  );
}
