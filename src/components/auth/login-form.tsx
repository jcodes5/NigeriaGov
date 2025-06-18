
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Supabase allows various password lengths
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); // To get redirect URL
  const { isLoading: authContextLoading } = useAuth(); // Use context's loading state
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmittingForm(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Login Successful", description: "Welcome back!" });
      const redirectUrl = searchParams.get('redirect') || '/dashboard/user';
      router.push(redirectUrl);
      router.refresh(); // Important to refresh server components and ensure context updates
    }
    setIsSubmittingForm(false);
  };
  
  const overallLoading = authContextLoading || isSubmittingForm;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button variant="link" asChild className="p-0 text-xs font-medium text-primary hover:text-primary/80">
            <Link href="/forgot-password">
              Forgot password?
            </Link>
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="mt-1"
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>
      
      <Button type="submit" className="w-full button-hover" disabled={overallLoading}>
        {overallLoading ? 'Processing...' : 'Log In'}
      </Button>
    </form>
  );
}
