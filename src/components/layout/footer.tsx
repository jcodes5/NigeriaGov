import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Logo } from '@/components/common/logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 text-muted-foreground py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo />
            <p className="mt-2 text-sm">
              Tracking progress, fostering transparency.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook size={20} /></Link>
              <Link href="#" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter size={20} /></Link>
              <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram size={20} /></Link>
              <Link href="#" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin size={20} /></Link>
              <Link href="#" aria-label="YouTube" className="hover:text-primary transition-colors"><Youtube size={20} /></Link>
            </div>
            <p className="mt-4 text-sm">
              Ministry of Information & National Orientation<br />
              Federal Secretariat, Abuja, Nigeria.
            </p>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm">
          <p>&copy; {currentYear} NigeriaGovHub. All rights reserved.</p>
          <p className="mt-1">A Federal Government of Nigeria Initiative.</p>
        </div>
      </div>
    </footer>
  );
}
