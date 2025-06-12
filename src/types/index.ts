
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
  createdAt: Date;
}

export interface ImpactStat {
  label: string;
  value: string;
  icon?: React.ElementType; 
}

export interface Video {
  id: string;
  title: string;
  url: string; // Should be an embeddable URL (e.g., YouTube embed link)
  thumbnailUrl?: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  ministry: Ministry;
  state: State;
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On Hold';
  startDate: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  description: string; 
  images: { url: string; alt: string, dataAiHint?: string }[];
  videos?: Video[];
  impactStats: ImpactStat[];
  budget?: number; 
  expenditure?: number; 
  tags?: string[];
  lastUpdatedAt: Date;
  feedback?: Feedback[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string;
  dataAiHint?: string;
  category: string;
  publishedDate: Date;
  content: string; // HTML content for the article
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  icon?: React.ElementType; // Lucide icon component
  link?: string; // External link or path to an internal page
  category: string;
  imageUrl?: string;
  dataAiHint?: string;
}
