"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const settingsSchema = z.object({
  siteName: z.string().min(3, "Site name must be at least 3 characters."),
  maintenanceMode: z.boolean(),
  contactEmail: z.string().email("Invalid contact email."),
  footerMessage: z.string().max(200, "Footer message too long.").optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// Mock current settings
const currentSettings: SettingsFormData = {
  siteName: "NigeriaGovHub",
  maintenanceMode: false,
  contactEmail: "info@nigeriagovhub.gov.ng",
  footerMessage: `© ${new Date().getFullYear()} NigeriaGovHub. All rights reserved.`,
};


export default function SiteSettingsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: currentSettings, // Initialize with mock/fetched settings
  });
  
  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        // User is admin, potentially fetch and reset form with actual current settings
        // For now, defaultValues in useForm handles initial state with mock data.
        // If fetching real settings:
        // const fetchedSettings = await fetchSiteSettings(); 
        // reset(fetchedSettings);
      }
    }
  }, [user, isAdmin, authLoading, router, toast, reset]);


  const onSubmit: SubmitHandler<SettingsFormData> = async (data) => {
    // Simulate API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Settings saved:", data);
    Object.assign(currentSettings, data); // Update mock current settings
    toast({
      title: "Settings Saved",
      description: "Site settings have been successfully updated.",
    });
  };
  
  if (authLoading || !isAdmin) {
     return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Verifying admin access and loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Site Settings</CardTitle>
          <CardDescription>Configure global settings for NigeriaGovHub.</CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" {...register("siteName")} className="mt-1" />
              {errors.siteName && <p className="text-sm text-destructive mt-1">{errors.siteName.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactEmail">Default Contact Email</Label>
              <Input id="contactEmail" type="email" {...register("contactEmail")} className="mt-1" />
              {errors.contactEmail && <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>}
            </div>
             <div>
              <Label htmlFor="footerMessage">Footer Message</Label>
              <Textarea id="footerMessage" {...register("footerMessage")} className="mt-1" rows={3} />
              {errors.footerMessage && <p className="text-sm text-destructive mt-1">{errors.footerMessage.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
            <CardDescription>Temporarily make the site unavailable to visitors, except administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
               <Controller
                name="maintenanceMode"
                control={control}
                render={({ field }) => (
                   <Switch
                    id="maintenanceMode"
                    checked={field.value}
                    onCheckedChange={field.onChange}                    
                  />
                )}
              />
              <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
            </div>
            {errors.maintenanceMode && <p className="text-sm text-destructive mt-1">{errors.maintenanceMode.message}</p>}
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => reset(currentSettings)} disabled={isSubmitting}>
                Reset to Defaults
            </Button>
            <Button type="submit" className="button-hover" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
        </div>
      </form>
    </div>
  );
}
