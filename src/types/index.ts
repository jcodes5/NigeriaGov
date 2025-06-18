
import type { Database } from "./supabase";

export interface Ministry {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

// Corresponds to public.feedback table
export type Feedback = Database['public']['Tables']['feedback']['Row'] & {
  // Add any client-side transformations or additional properties if needed
  // For example, if you resolve user_id to a full User object on client
  user?: User; 
};


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

// Represents the data structure after fetching from Supabase and 'joining' ministry/state names
export interface Project {
  id: string; // from projects.id
  title: string; // from projects.title
  subtitle: string; // from projects.subtitle
  ministry: Ministry; // Resolved from projects.ministry_id
  state: State;     // Resolved from projects.state_id
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On Hold'; // from projects.status
  startDate: string | Date; // from projects.start_date
  expectedEndDate?: string | Date; // from projects.expected_end_date
  actualEndDate?: string | Date; // from projects.actual_end_date
  description: string; // from projects.description
  images: { url: string; alt: string, dataAiHint?: string }[]; // from projects.images (JSONB)
  videos?: Video[]; // from projects.videos (JSONB)
  impactStats: ImpactStat[]; // from projects.impact_stats (JSONB, with iconName)
  budget?: number; // from projects.budget
  expenditure?: number; // from projects.expenditure
  tags?: string[]; // from projects.tags (array of text)
  lastUpdatedAt: string | Date; // from projects.last_updated_at
  feedback?: Feedback[]; // Fetched separately from feedback table
  // raw supabase row data
  ministry_id?: string | null; 
  state_id?: string | null; 
}


export interface User {
  id: string; 
  name: string | null;
  email: string | null;
  role: 'user' | 'admin' | null;
  avatarUrl?: string | null;
  created_at?: string; 
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string;
  dataAiHint?: string;
  category: string;
  publishedDate: Date | string;
  content: string; 
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
