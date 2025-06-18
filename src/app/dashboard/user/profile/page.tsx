
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useEffect } from "react";
// TODO: Import a server action to update user profile in Prisma DB

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional(), // Email might not be updatable here directly via Supabase if it's primary identifier
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfilePage() {
  const { profile, isLoading: authLoading, authUser } = useAuth(); 
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || authUser?.email || "", // Email might be from Supabase authUser if profile not fully loaded
    },
  });

  useEffect(() => {
    if (profile) {
      setValue("name", profile.name || "");
      setValue("email", profile.email || authUser?.email || "");
    } else if (authUser) {
        setValue("email", authUser.email || "");
    }
  }, [profile, authUser, setValue]);


  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    //setIsSubmitting(true); // useForm's isSubmitting handles this
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
    
    // TODO: Implement actual profile update logic here
    // 1. Call a server action to update the user's profile in your public 'users' table (Prisma)
    //    const { success, error } = await updateUserProfile(profile.id, { name: data.name });
    // 2. If Supabase email needs to be updated (more complex, involves re-verification):
    //    await supabase.auth.updateUser({ email: data.email })
    // 3. If successful, potentially re-fetch profile in AuthContext or update it locally.
    
    console.log("Profile update data (simulation):", data);
    // For now, just show a toast and update form values if needed
    toast({
      title: "Profile Update (Simulated)",
      description: "Your profile information update has been simulated.",
    });
    // If you were updating context:
    // login({ ...user, name: data.name, email: data.email }); 
    // reset(data); // Reset form with new default values
    // setIsSubmitting(false);
  };

  if (authLoading) {
    return <p>Loading profile...</p>;
  }
  
  if (!profile && !authUser) {
    return <p>Please log in to view your profile. Redirecting...</p>; // Or redirect
  }
  
  const currentName = profile?.name || "User";
  const currentEmail = profile?.email || authUser?.email || "No email";
  const avatarName = profile?.name || authUser?.email?.split('@')[0] || "User";


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My Profile</CardTitle>
          <CardDescription>Manage your personal information and account settings.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader className="items-center text-center">
                    <Image 
                        src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=13714C&color=fff&size=128&font-size=0.4`} 
                        alt={currentName} 
                        width={128} 
                        height={128} 
                        className="rounded-full border-4 border-primary shadow-md mb-4"
                    />
                    <CardTitle className="font-headline text-xl">{currentName}</CardTitle>
                    <CardDescription>{currentEmail}</CardDescription>
                    <Button variant="outline" size="sm" className="mt-2 button-hover">Change Avatar (Coming Soon)</Button>
                </CardHeader>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...register("name")} className="mt-1" />
                            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address (Cannot be changed here)</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                {...register("email")} 
                                className="mt-1 bg-muted/50" 
                                readOnly 
                                disabled
                            />
                            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                            <p className="text-xs text-muted-foreground mt-1">Email changes require a verification process and are handled separately.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                             <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => reset({ name: profile?.name || "", email: profile?.email || authUser?.email || "" })} 
                                disabled={isSubmitting} 
                                className="w-full sm:w-auto"
                              >
                                Cancel
                            </Button>
                            <Button type="submit" className="button-hover w-full sm:w-auto" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes (Simulated)"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
