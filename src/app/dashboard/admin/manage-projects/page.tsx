
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Construction, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useState, useTransition } from "react";
import type { Project } from "@/types"; 
import { getAllProjects } from "@/lib/data"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { deleteProject } from "@/lib/actions";

export default function ManageProjectsPage() {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);


  const fetchAdminProjects = React.useCallback(async () => {
    if (!authLoading) {
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
        return;
      }
      
      setIsLoadingData(true);
      try {
        const fetchedProjects = await getAllProjects(); 
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Failed to fetch projects for admin:", error);
        toast({ title: "Error", description: "Failed to load projects.", variant: "destructive" });
        setProjects([]);
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [isAdmin, authLoading, router, toast]);

  useEffect(() => {
    fetchAdminProjects();
  }, [fetchAdminProjects]);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteProject(projectToDelete.id);
      if (result.success) {
        toast({ title: "Project Deleted", description: result.message });
        setProjects((prevProjects) => prevProjects.filter((p) => p.id !== projectToDelete.id));
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setProjectToDelete(null);
    });
  };

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
            <Skeleton className="h-10 w-40" /> 
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="p-0">
             <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
         <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-3 text-lg">{authLoading ? "Verifying admin access..." : "Loading projects..."}</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin && !authLoading) { 
      return null; 
  }

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Ongoing: 'secondary',
    Completed: 'default',
    Planned: 'outline',
    'On Hold': 'destructive',
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><Construction className="mr-2 h-6 w-6"/>Manage Projects</CardTitle>
            <CardDescription>Add, edit, and oversee all government projects from the database.</CardDescription>
          </div>
          <Button asChild className="button-hover w-full sm:w-auto">
            <Link href="/dashboard/admin/manage-projects/add">
              <PlusCircle className="mr-2 h-4 w-4"/> Add New Project
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Ministry</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No projects found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={project.title}>{project.title}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={project.ministry.name}>{project.ministry.name}</TableCell>
                    <TableCell>{project.state.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[project.status] || 'outline'}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(project.lastUpdatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Project Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/manage-projects/edit/${project.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Project
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                             <Link href={`/projects/${project.id}`} target="_blank">View Project</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setProjectToDelete(project)} 
                            className="text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                          </DropdownMenuItem>
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

      {projectToDelete && (
        <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project titled &quot;{projectToDelete.title}&quot; and all its associated feedback.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
