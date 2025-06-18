
// Removed: import type { Database } from "./supabase"; // No longer primary source for DB types with Prisma
import type { NewsArticle as PrismaNewsArticle } from '@prisma/client';


export interface Ministry {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

// AppFeedback type, aligned with what Prisma will provide or what UI expects
export interface Feedback {
  id: string;
  project_id: string;
  user_id: string | null; // Can be null if feedback is anonymous or user not in DB
  user_name: string;
  comment: string;
  rating: number | null;
  sentiment_summary: string | null;
  created_at: string; // ISO date string
  user?: User; // Optional: if user data is joined/included
}


export interface ImpactStat {
  label: string;
  value: string;
  iconName?: string; // Store Lucide icon name
  icon?: React.ElementType; // Resolved on client
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  dataAiHint?: string;
}

// Represents the data structure for the application, potentially mapped from Prisma
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  ministry: Ministry; 
  state: State;     
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On Hold';
  startDate: Date; 
  expectedEndDate?: Date | null; 
  actualEndDate?: Date | null;   
  description: string;
  images: { url: string; alt: string, dataAiHint?: string }[]; 
  videos?: Video[]; 
  impactStats: ImpactStat[]; 
  budget?: number | null;
  expenditure?: number | null;
  tags?: string[];
  lastUpdatedAt: Date; 
  feedback?: Feedback[];
  ministry_id?: string | null;
  state_id?: string | null;
}


export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin' | null;
  avatarUrl?: string | null;
  created_at?: string | null; // ISO date string or null
}

// Updated to align with Prisma's Date object for publishedDate
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string | null; // Prisma might return null
  dataAiHint?: string | null; // Prisma might return null
  category: string;
  publishedDate: Date; // Prisma returns Date objects
  content: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  iconName?: string;
  icon?: React.ElementType;
  link?: string;
  category: string;
  imageUrl?: string;
  dataAiHint?: string;
}
