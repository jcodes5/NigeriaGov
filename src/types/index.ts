
import type { Project as PrismaProject, NewsArticle as PrismaNewsArticle, Service as PrismaService, Video as PrismaVideo } from '@prisma/client';
import type * as LucideIcons from 'lucide-react';


export interface Ministry {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

export interface Feedback {
  id: string;
  project_id: string;
  user_id: string | null; 
  user_name: string;
  comment: string;
  rating: number | null;
  sentiment_summary: string | null;
  created_at: string; 
  user?: User; 
}


export interface ImpactStat {
  label: string;
  value: string;
  iconName?: keyof typeof LucideIcons; 
  icon?: React.ElementType; 
}

export interface Video {
  id: string;
  title: string;
  url: string; // Should be the embeddable URL
  thumbnailUrl?: string | null;
  description?: string | null;
  dataAiHint?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  created_at?: string | null; 
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string | null; 
  dataAiHint?: string | null; 
  category: string;
  publishedDate: Date; 
  content: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  iconName?: keyof typeof LucideIcons | null; 
  icon?: React.ElementType; 
  link?: string | null;
  category: string;
  imageUrl?: string | null;
  dataAiHint?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  tags: (z: any) => z.string().optional(), 
};

export type ProjectFormData = {
  title: string;
  subtitle: string;
  ministryId: string;
  stateId: string;
  status: 'Planned' | 'Ongoing' | 'Completed' | 'On Hold';
  startDate: Date;
  expectedEndDate?: Date | null;
  description: string;
  budget?: number | null;
  expenditure?: number | null;
  tags?: string; 
};


export const newsArticleFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(200),
  slug: (z: any) => z.string().min(3, "Slug must be at least 3 characters.").max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens."),
  summary: (z: any) => z.string().min(10, "Summary must be at least 10 characters.").max(500),
  category: (z: any) => z.string().min(2, "Category must be at least 2 characters.").max(50),
  publishedDate: (z: any) => z.date({ required_error: "Published date is required."}),
  content: (z: any) => z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  dataAiHint: (z: any) => z.string().max(50, "AI hint too long.").optional().nullable(),
};

export type NewsArticleFormData = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  publishedDate: Date;
  content: string;
  imageUrl?: string | null;
  dataAiHint?: string | null;
};

export const serviceFormSchemaRaw = {
  title: (z: any) => z.string().min(3, "Title must be at least 3 characters.").max(150),
  slug: (z: any) => z.string().min(3, "Slug must be at least 3 chars.").max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens."),
  summary: (z: any) => z.string().min(10, "Summary must be at least 10 characters.").max(500),
  category: (z: any) => z.string().min(2, "Category must be at least 2 characters.").max(50),
  link: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  imageUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  dataAiHint: (z: any) => z.string().max(50, "AI hint too long (max 2 words).").optional().nullable(),
  iconName: (z: any) => z.string().max(50, "Icon name too long.").optional().nullable(),
};

export type ServiceFormData = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  link?: string | null;
  imageUrl?: string | null;
  dataAiHint?: string | null;
  iconName?: keyof typeof LucideIcons | null;
};

export const videoFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(200),
  url: (z: any) => z.string().url("Must be a valid embeddable URL (e.g., YouTube embed link)."),
  thumbnailUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  dataAiHint: (z: any) => z.string().max(50, "AI hint for thumbnail too long (max 2 words).").optional().nullable(),
  description: (z: any) => z.string().max(500, "Description too long.").optional().nullable(),
};

export type VideoFormData = {
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  dataAiHint?: string | null;
  description?: string | null;
};
