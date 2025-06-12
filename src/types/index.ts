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
  userId?: string; // Optional if anonymous feedback is allowed
  userName: string;
  comment: string;
  rating?: number; // e.g., 1-5 stars
  sentimentSummary?: string;
  createdAt: Date;
}

export interface ImpactStat {
  label: string;
  value: string;
  icon?: React.ElementType; // Lucide icon component
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
  description: string; // Rich text / HTML content
  images: { url: string; alt: string, dataAiHint?: string }[];
  impactStats: ImpactStat[];
  budget?: number; // Optional
  expenditure?: number; // Optional
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
