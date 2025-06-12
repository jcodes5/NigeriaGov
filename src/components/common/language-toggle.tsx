"use client";

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';

export function LanguageToggle() {
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Here you would typically load the saved language preference
    // For now, defaulting to EN
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0" aria-label="Loading language options"><Globe className="h-5 w-5" /></Button>;
  }

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    // Here you would implement logic to change the application's language
    console.log(`Language changed to: ${lang}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9" aria-label={`Current language: ${currentLanguage}, Change language`}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange("EN")}>
          English (EN)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("HA")}>
          Hausa (HA)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("IG")}>
          Igbo (IG)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("YO")}>
          Yoruba (YO)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
