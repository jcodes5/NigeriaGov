"use client";

import Link from 'next/link';
import { Logo } from '@/components/common/logo';
import { LanguageToggle } from '@/components/common/language-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, LogIn, LogOut, UserPlus } from 'lucide-react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className={cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-foreground/80"
    )}>
      {children}
    </Link>
  );
};

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          {/* Add more navigation links as needed */}
        </nav>
        <div className="flex items-center space-x-3">
          <LanguageToggle />
          {isLoading ? (
             <Button variant="ghost" size="sm" className="opacity-50">Loading...</Button>
          ) : user ? (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/user')} className="button-hover">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="button-hover">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="button-hover">
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="button-hover">
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
