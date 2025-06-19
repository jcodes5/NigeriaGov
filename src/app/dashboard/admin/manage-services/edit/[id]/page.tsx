
"use client";

import { ServiceForm } from "@/components/admin/service-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getServiceById } from "@/lib/data";
import type { ServiceItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditServicePage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const { toast } = useToast();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.replace("/dashboard/user");
      return;
    }

    if (isAdmin && serviceId) {
      setIsLoadingData(true);
      getServiceById(serviceId)
        .then(data => {
          if (data) {
            setService(data);
          } else {
            toast({ title: "Error", description: "Service not found.", variant: "destructive" });
            router.replace("/dashboard/admin/manage-services");
          }
        })
        .catch(err => {
          console.error("Failed to fetch service:", err);
          toast({ title: "Error", description: "Failed to load service.", variant: "destructive" });
        })
        .finally(() => setIsLoadingData(false));
    } else if (!authLoading && !serviceId) {
        toast({ title: "Error", description: "Service ID is missing.", variant: "destructive" });
        router.replace("/dashboard/admin/manage-services");
        setIsLoadingData(false);
    }
  }, [isAdmin, authLoading, router, toast, serviceId]);

  if (authLoading || isLoadingData || (!service && isAdmin)) {
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
                {authLoading ? "Verifying admin access..." : "Loading service data..."}
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
          <Link href="/dashboard/admin/manage-services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Services
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Edit Service</CardTitle>
          <CardDescription>Modify the details below to update the service listing.</CardDescription>
        </CardHeader>
        <CardContent>
          {service && <ServiceForm initialData={service} serviceId={service.id} />}
        </CardContent>
      </Card>
    </div>
  );
}
