
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Newspaper } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import type { NewsArticle } from "@/types"; 
import { getAllNewsArticles } from "@/lib/data"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageNewsPage() {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchAdminNews = async () => {
      if (!authLoading) {
        if (!isAdmin) {
          toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
          router.replace("/dashboard/user");
          return;
        }
        
        setIsLoadingData(true);
        try {
          const fetchedNews = await getAllNewsArticles();
          setNewsArticles(fetchedNews);
        } catch (error) {
          console.error("Failed to fetch news articles for admin:", error);
          toast({ title: "Error", description: "Failed to load news articles.", variant: "destructive" });
          setNewsArticles([]);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    fetchAdminNews();
  }, [profile, isAdmin, authLoading, router, toast]);

  const overallLoading = authLoading || (isLoadingData && isAdmin);

  if (overallLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
            <Skeleton className="h-10 w-36" />
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="p-0">
             <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
         <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-3 text-lg">{authLoading ? "Verifying admin access..." : "Loading news..."}</p>
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
            <CardTitle className="font-headline text-2xl flex items-center"><Newspaper className="mr-2 h-6 w-6"/>Manage News Articles</CardTitle>
            <CardDescription>Add, edit, and publish news articles from the database.</CardDescription>
          </div>
          <Button className="button-hover w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4"/> Add New Article (Coming Soon)
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsArticles.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No news articles found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                newsArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={article.title}>{article.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{article.category}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(article.publishedDate), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Article Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Article (Coming Soon)</DropdownMenuItem>
                          <DropdownMenuItem>View Article (Coming Soon)</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Article (Coming Soon)</DropdownMenuItem>
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
