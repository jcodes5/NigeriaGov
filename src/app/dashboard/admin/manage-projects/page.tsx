"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import type { Project } from "@/types"; 
import { projects as mockProjectsData } from "@/lib/data"; // Mock data

export default function ManageProjectsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

   useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        setProjects(mockProjectsData); // Use mock data
        setPageLoading(false);
      } else {
        console.error("Access denied: User is not an admin.");
        setPageLoading(false); 
      }
    }
  }, [isAdmin, authLoading]);

  if (authLoading || pageLoading) {
    return <p>Loading project management...</p>;
  }

  if (!isAdmin) {
    return <p>Access Denied. You must be an administrator to view this page.</p>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Manage Projects</CardTitle>
            <CardDescription>Add, edit, and oversee all government projects.</CardDescription>
          </div>
          <Button className="button-hover">
            <PlusCircle className="mr-2 h-4 w-4"/> Add New Project
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
              {projects.map((project) => (
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
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                           <span className="sr-only">Project Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Feedback</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Add Pagination if many projects */}
    </div>
  );
}
