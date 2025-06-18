
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { syncUserProfile } from '@/lib/actions'; // Import the server action

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormData> = async (formData) => {
    setIsLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        // You can add user_metadata here if needed by Supabase Auth itself
        // For our public 'users' table, we'll use a separate server action
      }
    });

    if (authError) {
      toast({
        title: "Signup Failed",
        description: authError.message || "Could not create your account.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      // User created in Supabase Auth, now create profile in public users table
      const { error: profileError } = await syncUserProfile({
        userId: authData.user.id,
        email: formData.email, // Use email from form as Supabase might not return it immediately if email confirmation is pending
        name: formData.name,
      });

      if (profileError) {
        toast({
          title: "Profile Creation Failed",
          description: profileError || "Your account was created, but we couldn't set up your profile. Please contact support.",
          variant: "destructive",
        });
        // Potentially, you might want to clean up the Supabase auth user here if profile creation is critical
      } else {
         if (authData.session) {
          // User is logged in (e.g. autoVerifyEmail is on, or no email verification required)
          toast({
            title: "Account Created",
            description: "You have successfully signed up and are logged in!",
          });
          router.push('/dashboard/user');
          router.refresh();
        } else {
          // Email confirmation required
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account before logging in.",
          });
          router.push('/login'); // Redirect to login page
        }
      }
    } else {
      // Should not happen if authError is null, but as a safeguard
      toast({
        title: "Signup Issue",
        description: "An unexpected issue occurred during signup. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register("name")}
          className="mt-1"
          aria-invalid={errors.name ? "true" : "false"}
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="mt-1"
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className="mt-1"
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className="mt-1"
          aria-invalid={errors.confirmPassword ? "true" : "false"}
        />
        {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full button-hover" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
