
import type { Ministry, State, Project, Feedback, ImpactStat, NewsArticle, ServiceItem, Video, User } from '@/types';
import { Briefcase, Users, DollarSign, TrendingUp, MapPin, CalendarDays, Flag, ShieldCheck, BookOpen, Heart, Building, Globe, Plane, Award, Rss, MessageCircle, PersonStanding, Construction, CheckCircle, Zap } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { Database } from '@/types/supabase';

// --- Mock Data for Ministries and States (until they are moved to Supabase) ---
export const ministries: Ministry[] = [
  { id: 'm1', name: 'Federal Ministry of Works and Housing' },
  { id: 'm2', name: 'Federal Ministry of Finance, Budget and National Planning' },
  { id: 'm3', name: 'Federal Ministry of Education' },
  { id: 'm4', name: 'Federal Ministry of Health' },
  { id: 'm5', name: 'Federal Ministry of Agriculture and Rural Development' },
  { id: 'm6', name: 'Federal Ministry of Communications and Digital Economy' },
  { id: 'm7', name: 'Federal Ministry of Humanitarian Affairs, Disaster Management and Social Development' },
];

export const states: State[] = [
  { id: 's1', name: 'Lagos' },
  { id: 's2', name: 'Kano' },
  { id: 's3', name: 'Rivers' },
  { id: 's4', name: 'Abuja (FCT)' },
  { id: 's5', name: 'Oyo' },
  { id: 's6', name: 'Kaduna' },
  { id: 's7', name: 'Enugu' },
];
// --- End Mock Data ---


// --- Project Data Functions (Supabase Integrated) ---

// Helper to map Supabase project row to our Project type, including resolving ministry/state names
const mapProjectRowToProject = (row: Database['public']['Tables']['projects']['Row']): Project => {
  const ministry = ministries.find(m => m.id === row.ministry_id) || { id: row.ministry_id || 'unknown', name: 'Unknown Ministry' };
  const state = states.find(s => s.id === row.state_id) || { id: row.state_id || 'unknown', name: 'Unknown State' };
  
  // Map iconName to actual Lucide icon components for impactStats
  const mappedImpactStats = (row.impact_stats as ImpactStat[] || []).map(stat => {
    let iconComponent;
    switch (stat.iconName) {
      case 'Briefcase': iconComponent = Briefcase; break;
      case 'Users': iconComponent = Users; break;
      case 'DollarSign': iconComponent = DollarSign; break;
      case 'TrendingUp': iconComponent = TrendingUp; break;
      case 'MapPin': iconComponent = MapPin; break;
      case 'CalendarDays': iconComponent = CalendarDays; break;
      case 'Flag': iconComponent = Flag; break;
      case 'PersonStanding': iconComponent = PersonStanding; break;
      case 'Construction': iconComponent = Construction; break;
      case 'CheckCircle': iconComponent = CheckCircle; break;
      case 'Zap': iconComponent = Zap; break;
      default: iconComponent = TrendingUp; // Default icon
    }
    return { ...stat, icon: iconComponent };
  });

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    ministry,
    state,
    status: row.status as Project['status'],
    startDate: row.start_date,
    expectedEndDate: row.expected_end_date || undefined,
    actualEndDate: row.actual_end_date || undefined,
    description: row.description,
    images: (row.images as { url: string; alt: string, dataAiHint?: string }[] || []),
    videos: (row.videos as Video[] || []),
    impactStats: mappedImpactStats,
    budget: row.budget || undefined,
    expenditure: row.expenditure || undefined,
    tags: (row.tags as string[] || []),
    lastUpdatedAt: row.last_updated_at,
    ministry_id: row.ministry_id,
    state_id: row.state_id,
    // Feedback will be fetched separately
  };
};


export const getProjectById = async (id: string): Promise<Project | null> => {
  const { data: projectRow, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projectError) {
    console.error('Error fetching project by ID:', projectError);
    return null;
  }
  if (!projectRow) return null;

  const project = mapProjectRowToProject(projectRow);

  // Fetch related feedback
  const { data: feedbackRows, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  if (feedbackError) {
    console.error('Error fetching feedback for project:', feedbackError);
    // Continue with project data even if feedback fails, but log it
  }
  
  project.feedback = (feedbackRows as Feedback[] || []);
  
  return project;
};

export const getAllProjects = (filters?: { ministryId?: string; stateId?: string; status?: string; startDate?: Date }): Project[] => {
  // TODO: Migrate this to Supabase. For now, returning mock data for other list pages.
  console.warn("getAllProjects is still using mock data. Needs Supabase migration.");
  let filteredProjects = MOCK_PROJECTS_TEMP; // Using temporary mock projects
  if (filters?.ministryId) {
    filteredProjects = filteredProjects.filter(p => p.ministry.id === filters.ministryId);
  }
  if (filters?.stateId) {
    filteredProjects = filteredProjects.filter(p => p.state.id === filters.stateId);
  }
  if (filters?.status) {
    filteredProjects = filteredProjects.filter(p => p.status === filters.status);
  }
  return filteredProjects;
};


// --- Feedback Data Functions (Supabase Integrated) ---
export const addFeedbackToProject = async (
  projectId: string,
  feedbackData: Omit<Feedback, 'id' | 'created_at' | 'project_id'> & { userId?: string } // userId is optional
): Promise<Feedback | null> => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{ 
      project_id: projectId, 
      user_name: feedbackData.userName,
      comment: feedbackData.comment,
      rating: feedbackData.rating,
      sentiment_summary: feedbackData.sentimentSummary, // This will come from Genkit
      user_id: feedbackData.userId, // Pass if available
      // created_at will be set by Supabase (default now())
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding feedback to Supabase:', error);
    return null;
  }
  return data as Feedback;
};

export const getAllFeedbackWithProjectTitles = async (): Promise<Array<Feedback & { projectTitle: string }>> => {
  const { data: feedbackRows, error: feedbackError } = await supabase
    .from('feedback')
    .select(`
      *,
      projects (
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (feedbackError) {
    console.error('Error fetching all feedback:', feedbackError);
    return [];
  }

  return feedbackRows.map(fb_row => {
    const fb = fb_row as any; // Cast to access joined project
    return {
      ...fb,
      project_id: fb.project_id, // ensure project_id is correctly assigned
      projectTitle: fb.projects?.title || 'Unknown Project',
      // created_at: new Date(fb.created_at), // Ensure dates are Date objects if needed client-side
    } as Feedback & { projectTitle: string };
  });
};


// --- User Management Functions (Supabase Integrated) ---
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return []; 
  }
  return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as User['role'],
      avatarUrl: row.avatar_url,
      created_at: row.created_at,
  }));
}

export async function deleteUserById(userId: string): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) {
    console.error('Error deleting user from Supabase:', error);
    return { success: false, error };
  }
  return { success: true };
}


// --- Mock Data (to be phased out) ---
const generateMockFeedback = (projectId: string, count: number): Feedback[] => {
  const feedbackList: Feedback[] = [];
  const users = ['Aisha Bello', 'Chinedu Okafor', 'Yemi Adebayo', 'Fatima Sani'];
  const comments = [
    "This is a great initiative, keep up the good work!",
    "I have some concerns about the timeline, seems a bit ambitious.",
    "Excellent progress so far, very impressive.",
    "Could we get more frequent updates on this project?",
    "The impact on our community is already visible. Thank you!"
  ];
  for (let i = 0; i < count; i++) {
    feedbackList.push({
      id: `f${projectId}-${i + 1}`,
      project_id: projectId, // Corrected from projectId
      user_name: users[i % users.length],
      comment: comments[i % comments.length],
      rating: Math.floor(Math.random() * 3) + 3, 
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
      sentiment_summary: Math.random() > 0.5 ? 'Positive' : 'Mixed',
      user_id: null, // Explicitly set user_id
    });
  }
  return feedbackList;
};

const MOCK_PROJECTS_TEMP: Project[] = [
  {
    id: 'p1-mock',
    title: 'Mock: Lagos-Ibadan Expressway Rehab',
    subtitle: 'Mock: Enhancing connectivity.',
    ministry: ministries[0],
    state: states[0],
    status: 'Ongoing',
    startDate: new Date('2018-07-01').toISOString(),
    expectedEndDate: new Date('2024-12-31').toISOString(),
    description: `<p>Mock data for Lagos-Ibadan Expressway.</p>`,
    images: [ { url: 'https://placehold.co/800x600.png', alt: 'Mock road construction', dataAiHint: 'road construction' } ],
    impactStats: [ { label: "Jobs Created", value: "1,200+", iconName: "Briefcase" } ],
    budget: 310000000000, 
    lastUpdatedAt: new Date().toISOString(), 
    feedback: generateMockFeedback('p1-mock', 2),
  },
];


export const mockNews: NewsArticle[] = [
  {
    id: 'news1',
    slug: 'government-launches-new-portal-for-project-transparency',
    title: 'Government Launches New Portal for Project Transparency',
    summary: 'A new online platform, NigeriaGovHub, has been launched to provide citizens with transparent access to government projects and initiatives.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'government building',
    category: 'Governance',
    publishedDate: new Date('2024-05-15T10:00:00Z'),
    content: '<p>The Federal Government today unveiled NigeriaGovHub, a landmark initiative aimed at enhancing transparency and accountability in public project execution. The portal offers detailed information on projects nationwide, including budgets, timelines, and implementing agencies. Citizens can track progress, provide feedback, and engage directly with governance processes. This platform marks a significant step towards open government and citizen participation.</p>',
  },
];

export const mockServices: ServiceItem[] = [
  {
    id: 'service1',
    slug: 'apply-for-passport',
    title: 'Apply for International Passport',
    summary: 'Access the portal to apply for or renew your Nigerian international passport.',
    icon: Plane,
    category: 'Immigration',
    link: '#', 
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'passport document',
  },
];

export const mockFeaturedVideos: Video[] = [
  { id: 'fv1', title: 'Nigeria\'s Vision 2050', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'futuristic city', description: 'A look into Nigeria\'s long-term development plan.' },
];


// --- News & Services (Still using mock data, to be migrated) ---
export const getNewsArticleBySlug = (slug: string): NewsArticle | undefined => {
  return mockNews.find(article => article.slug === slug);
};

export const getAllNewsArticles = (): NewsArticle[] => {
  return mockNews.sort((a,b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
};

export const getAllServices = (): ServiceItem[] => {
  return mockServices;
};

export const getServiceBySlug = (slug: string): ServiceItem | undefined => {
  return mockServices.find(service => service.slug === slug);
};
