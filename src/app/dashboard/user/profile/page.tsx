
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

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfilePage() {
  const { user, login } = useAuth(); 
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (user) {
      const updatedUser = { ...user, name: data.name, email: data.email };
      login(updatedUser); 
    }

    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

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
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13714C&color=fff&size=128&font-size=0.4`} 
                        alt={user.name} 
                        width={128} 
                        height={128} 
                        className="rounded-full border-4 border-primary shadow-md mb-4"
                    />
                    <CardTitle className="font-headline text-xl">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <Button variant="outline" size="sm" className="mt-2 button-hover">Change Avatar</Button>
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
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" {...register("email")} className="mt-1" />
                            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                             <Button type="button" variant="outline" onClick={() => reset({ name: user.name, email: user.email })} disabled={isSubmitting} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" className="button-hover w-full sm:w-auto" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
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
