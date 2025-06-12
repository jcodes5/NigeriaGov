
"use client";

import Link from 'next/link';
import { Logo } from '@/components/common/logo';
import { LanguageToggle } from '@/components/common/language-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, LogIn, LogOut, UserPlus, ChevronDown, Newspaper, Briefcase, Heart, Landmark, Scale, Users, Globe, Palette, Bike, MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode, className?: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link href={href} className={cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-foreground/80",
      className
    )}>
      {children}
    </Link>
  );
};

const NavDropdown = ({ label, icon: Icon, items }: { label: string; icon?: React.ElementType; items: { href: string; label: string; icon?: React.ElementType }[] }) => {
  const pathname = usePathname();
  const isGroupActive = items.some(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn(
          "text-sm font-medium hover:text-primary px-2",
          isGroupActive ? "text-primary" : "text-foreground/80"
        )}>
          {Icon && <Icon className="mr-1 h-4 w-4" />}
          {label}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full justify-start px-2 py-1.5">
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.label}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const publicServicesItems = [
    { href: "/benefits", label: "Benefits", icon: Landmark },
    { href: "/health", label: "Health", icon: Heart },
    { href: "/taxes", label: "Taxes", icon: Scale },
    { href: "/business", label: "Business & Industry", icon: Briefcase },
  ];

  const exploreNigeriaItems = [
    { href: "/culture", label: "Culture & History", icon: Palette },
    { href: "/tourism", label: "Travel & Tourism", icon: Globe },
    { href: "/sports", label: "Sports", icon: Bike }, // Using Bike as placeholder for Sports
  ];
  
  const governmentCitizenshipItems = [
    // { href: "/ministries", label: "Ministries", icon: Landmark }, // Link to /projects with filter
    // { href: "/states", label: "States", icon: MapPin }, // Link to /projects with filter
    { href: "/immigration", label: "Immigration & Citizenship", icon: Users },
  ];


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden lg:flex items-center space-x-1">
          <NavLink href="/" className="px-2">Home</NavLink>
          <NavLink href="/projects" className="px-2">Projects</NavLink>
          <NavLink href="/news" className="px-2">News</NavLink>
          <NavLink href="/services" className="px-2">Services</NavLink>
          
          <NavDropdown label="Public Services" items={publicServicesItems} />
          <NavDropdown label="Explore Nigeria" items={exploreNigeriaItems} />
          <NavDropdown label="Govt. & Citizenship" items={governmentCitizenshipItems} />
          <NavLink href="/site-feedback" className="px-2">Feedback</NavLink>

        </nav>
        <div className="flex items-center space-x-2">
          <LanguageToggle />
          {isLoading ? (
             <Button variant="ghost" size="sm" className="opacity-50 hidden sm:inline-flex">Loading...</Button>
          ) : user ? (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/user')} className="button-hover hidden sm:inline-flex">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="button-hover hidden sm:inline-flex">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
               <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/user')} className="button-hover sm:hidden">
                <LayoutDashboard className="h-5 w-5" />
                 <span className="sr-only">Dashboard</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="button-hover hidden sm:inline-flex">
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="button-hover hidden sm:inline-flex">
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
              </Button>
               <Button variant="ghost" size="icon" asChild className="button-hover sm:hidden">
                <Link href="/login"><LogIn className="h-5 w-5" /><span className="sr-only">Login</span></Link>
              </Button>
            </>
          )}
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}


const MobileNav = () => {
 const publicServicesItems = [
    { href: "/benefits", label: "Benefits", icon: Landmark },
    { href: "/health", label: "Health", icon: Heart },
    { href: "/taxes", label: "Taxes", icon: Scale },
    { href: "/business", label: "Business & Industry", icon: Briefcase },
  ];

  const exploreNigeriaItems = [
    { href: "/culture", label: "Culture & History", icon: Palette },
    { href: "/tourism", label: "Travel & Tourism", icon: Globe },
    { href: "/sports", label: "Sports", icon: Bike },
  ];
  
  const governmentCitizenshipItems = [
    // { href: "/ministries", label: "Ministries", icon: Landmark },
    // { href: "/states", label: "States", icon: MapPin },
    { href: "/immigration", label: "Immigration & Citizenship", icon: Users },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <ChevronDown className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild><NavLink href="/" className="w-full">Home</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/projects" className="w-full">Projects</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/news" className="w-full">News</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/services" className="w-full">Services</NavLink></DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Public Services</DropdownMenuLabel>
        {publicServicesItems.map(item => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full">{item.icon && <item.icon className="mr-2 h-4 w-4" />}{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Explore Nigeria</DropdownMenuLabel>
         {exploreNigeriaItems.map(item => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full">{item.icon && <item.icon className="mr-2 h-4 w-4" />}{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Govt. & Citizenship</DropdownMenuLabel>
        {governmentCitizenshipItems.map(item => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full">{item.icon && <item.icon className="mr-2 h-4 w-4" />}{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
         <DropdownMenuSeparator />
        <DropdownMenuItem asChild><NavLink href="/site-feedback" className="w-full"><MessageSquare className="mr-2 h-4 w-4" />Site Feedback</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/about" className="w-full">About</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/contact" className="w-full">Contact</NavLink></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
