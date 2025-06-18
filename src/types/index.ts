
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

// Zod schema for Project Form (can be defined here or in the form component)
export const projectFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(150),
  subtitle: (z: any) => z.string().min(10, "Subtitle must be at least 10 characters.").max(250),
  ministryId: (z: any) => z.string().min(1, "Ministry is required."),
  stateId: (z: any) => z.string().min(1, "State is required."),
  status: (z: any) => z.enum(['Planned', 'Ongoing', 'Completed', 'On Hold']),
  startDate: (z: any) => z.date({ required_error: "Start date is required." }),
  expectedEndDate: (z: any) => z.date().optional().nullable(),
  description: (z: any) => z.string().min(20, "Description must be at least 20 characters."),
  budget: (z: any) => z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
    z.number().positive("Budget must be a positive number.").optional().nullable()
  ),
  expenditure: (z: any) => z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
    z.number().positive("Expenditure must be a positive number.").optional().nullable()
  ),
  tags: (z: any) => z.string().optional(), // Comma-separated
};


export const newsArticleFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(200),
  slug: (z: any) => z.string().min(3, "Slug must be at least 3 characters.").max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens."),
  summary: (z: any) => z.string().min(10, "Summary must be at least 10 characters.").max(500),
  category: (z: any) => z.string().min(2, "Category must be at least 2 characters.").max(50),
  publishedDate: (z: any) => z.date({ required_error: "Published date is required."}),
  content: (z: any) => z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  dataAiHint: (z: any) => z.string().max(50, "AI hint too long.").optional(),
};
