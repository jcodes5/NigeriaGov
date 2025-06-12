"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import type { User } from '@/types';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication logic
    if (data.email === "user@example.com" && data.password === "password") {
      const userData: User = { id: "user1", name: "John Doe", email: data.email, role: "user" };
      login(userData);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/dashboard/user');
    } else if (data.email === "admin@example.com" && data.password === "password") {
      const adminData: User = { id: "admin1", name: "Admin User", email: data.email, role: "admin" };
      login(adminData);
      toast({ title: "Admin Login Successful", description: "Welcome, Admin!" });
      router.push('/dashboard/admin');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

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
        <Label htmlFor="password">Password</Label>
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
      
      {/* <div className="flex items-center justify-between">
        <div className="text-sm">
          <Button variant="link" className="p-0 font-medium text-primary hover:text-primary/80">Forgot your password?</Button>
        </div>
      </div> */}

      <Button type="submit" className="w-full button-hover" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </Button>
    </form>
  );
}
