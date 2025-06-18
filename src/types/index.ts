
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
  projectId: string;
  userId?: string; 
  userName: string;
  comment: string;
  rating?: number; 
  sentimentSummary?: string;
  createdAt: Date | string; // Adjusted to allow string for Supabase dates
}

export interface ImpactStat {
  label: string;
  value: string;
  icon?: React.ElementType; 
}

export interface Video {
  id: string;
  title: string;
  url: string; 
  thumbnailUrl?: string;
  description?: string;
  dataAiHint?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  ministry: Ministry; // This might need to be ministry_id: string and fetched separately or joined
  state: State;     // This might need to be state_id: string and fetched separately or joined
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On Hold';
  startDate: Date | string;
  expectedEndDate?: Date | string;
  actualEndDate?: Date | string;
  description: string; 
  images: { url: string; alt: string, dataAiHint?: string }[]; // JSONB or separate table
  videos?: Video[]; // JSONB or separate table
  impactStats: ImpactStat[]; // JSONB
  budget?: number; 
  expenditure?: number; 
  tags?: string[]; // array of text
  lastUpdatedAt: Date | string;
  feedback?: Feedback[]; // Likely a separate table related by project_id
}

export interface User {
  id: string; // Typically UUID from Supabase
  name: string | null;
  email: string | null;
  role: 'user' | 'admin' | null;
  avatarUrl?: string | null;
  // Supabase might add other fields like created_at, updated_at
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
  iconName?: string; // Store icon name, resolve to component on client
  icon?: React.ElementType; // For client-side rendering
  link?: string; 
  category: string;
  imageUrl?: string;
  dataAiHint?: string;
}
