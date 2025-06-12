import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
         <Card className="shadow-xl">
          <CardHeader className="text-center">
             <div className="mx-auto h-12 w-12 text-primary">
                <ShieldCheck className="h-12 w-12" />
            </div>
            <CardTitle className="mt-6 text-3xl font-headline font-bold text-primary">
              Create an Account
            </CardTitle>
            <CardDescription>
              Join NigeriaGovHub to stay informed and engaged.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" asChild className="p-0 font-medium text-primary hover:text-primary/80">
                <Link href="/login">
                  Log in here
                </Link>
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
