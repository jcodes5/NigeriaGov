
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Server } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState, useTransition } from "react";
import type { ServiceItem } from "@/types"; 
import { getAllServices as fetchServicesFromDb } from "@/lib/data"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageServicesPage() {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  // Add transitions and delete state if/when delete is implemented
  // const [isDeleting, startDeleteTransition] = useTransition();
  // const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  useEffect(() => {
    const fetchAdminServices = async () => {
      if (!authLoading) {
        if (!isAdmin) {
          toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
          router.replace("/dashboard/user");
          return;
        }
        
        setIsLoadingData(true);
        try {
          const fetchedServices = await fetchServicesFromDb(); 
          setServices(fetchedServices);
        } catch (error) {
          console.error("Failed to fetch services for admin:", error);
          toast({ title: "Error", description: "Failed to load services.", variant: "destructive" });
          setServices([]);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    fetchAdminServices();
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
            <Skeleton className="h-10 w-40" /> 
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
            <p className="ml-3 text-lg">{authLoading ? "Verifying admin access..." : "Loading services..."}</p>
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
            <CardTitle className="font-headline text-2xl flex items-center"><Server className="mr-2 h-6 w-6"/>Manage Services</CardTitle>
            <CardDescription>Add, edit, and update government service listings.</CardDescription>
          </div>
          <Button asChild className="button-hover w-full sm:w-auto">
            <Link href="/dashboard/admin/manage-services/add">
              <PlusCircle className="mr-2 h-4 w-4"/> Add New Service
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
                <TableHead>Category</TableHead>
                <TableHead>Link/Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No services found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={service.title}>{service.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={service.link || service.slug}>{service.link || `/services/${service.slug}`}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Service Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Service (Soon)</DropdownMenuItem>
                          {service.link ? (
                            <DropdownMenuItem asChild><a href={service.link} target="_blank" rel="noopener noreferrer">Visit External Link</a></DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem asChild><Link href={`/services/${service.slug}`} target="_blank">View Service Page (Soon)</Link></DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">Delete Service (Soon)</DropdownMenuItem>
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
