
import type { Ministry, State, Project as AppProject, Feedback as AppFeedback, ImpactStat, Video, User as AppUser } from '@/types';
import { Briefcase, Users, DollarSign, TrendingUp, MapPin, CalendarDays, Flag, ShieldCheck, BookOpen, Heart, Building, Globe, Plane, Award, Rss, MessageCircle, PersonStanding, Construction, CheckCircle, Zap } from 'lucide-react';
import prisma from './prisma';
import type { Project as PrismaProject, Feedback as PrismaFeedback, User as PrismaUser } from '@prisma/client';

// --- Mock Data for Ministries and States (These will eventually move to DB) ---
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


// --- Helper function to map Prisma Project to AppProject ---
const mapPrismaProjectToAppProject = (prismaProject: PrismaProject & { feedback_list?: PrismaFeedback[] }): AppProject => {
  const ministry = ministries.find(m => m.id === prismaProject.ministry_id) || { id: prismaProject.ministry_id || 'unknown_ministry', name: 'Unknown Ministry' };
  const state = states.find(s => s.id === prismaProject.state_id) || { id: prismaProject.state_id || 'unknown_state', name: 'Unknown State' };

  const mappedImpactStats = (prismaProject.impact_stats as unknown as ImpactStat[] || []).map(stat => {
    let iconComponent;
    // Simplified mapping for brevity, ensure all icons are covered
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
      default: iconComponent = TrendingUp;
    }
    return { ...stat, icon: iconComponent };
  });

  return {
    id: prismaProject.id,
    title: prismaProject.title,
    subtitle: prismaProject.subtitle,
    ministry,
    state,
    status: prismaProject.status as AppProject['status'],
    startDate: new Date(prismaProject.start_date), // Ensure Date object
    expectedEndDate: prismaProject.expected_end_date ? new Date(prismaProject.expected_end_date) : undefined,
    actualEndDate: prismaProject.actual_end_date ? new Date(prismaProject.actual_end_date) : undefined,
    description: prismaProject.description,
    images: (prismaProject.images as unknown as { url: string; alt: string, dataAiHint?: string }[] || []),
    videos: (prismaProject.videos as unknown as Video[] || []),
    impactStats: mappedImpactStats,
    budget: prismaProject.budget || undefined,
    expenditure: prismaProject.expenditure || undefined,
    tags: prismaProject.tags || [],
    lastUpdatedAt: new Date(prismaProject.last_updated_at), // Ensure Date object
    feedback: prismaProject.feedback_list?.map(mapPrismaFeedbackToAppFeedback) || [],
    ministry_id: prismaProject.ministry_id,
    state_id: prismaProject.state_id,
  };
};

// --- Helper function to map Prisma Feedback to AppFeedback ---
const mapPrismaFeedbackToAppFeedback = (prismaFeedback: PrismaFeedback): AppFeedback => {
  return {
    id: prismaFeedback.id,
    project_id: prismaFeedback.project_id,
    user_id: prismaFeedback.user_id,
    user_name: prismaFeedback.user_name,
    comment: prismaFeedback.comment,
    rating: prismaFeedback.rating,
    sentiment_summary: prismaFeedback.sentiment_summary,
    created_at: new Date(prismaFeedback.created_at).toISOString(),
  };
};

// --- Helper function to map Prisma User to AppUser ---
const mapPrismaUserToAppUser = (prismaUser: PrismaUser): AppUser => {
  return {
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    role: prismaUser.role as AppUser['role'] | null,
    avatarUrl: prismaUser.avatar_url,
    created_at: prismaUser.created_at ? new Date(prismaUser.created_at).toISOString() : null,
  };
};


// --- Project Data Functions (Prisma Integrated for getProjectById) ---
export const getProjectById = async (id: string): Promise<AppProject | null> => {
  try {
    const projectWithFeedback = await prisma.project.findUnique({
      where: { id },
      include: {
        feedback_list: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!projectWithFeedback) return null;
    return mapPrismaProjectToAppProject(projectWithFeedback);
  } catch (error) {
    console.error('Error fetching project by ID with Prisma:', error);
    return null;
  }
};

export const getAllProjects = (filters?: { ministryId?: string; stateId?: string; status?: string; startDate?: Date }): AppProject[] => {
  // TODO: Migrate this to Prisma with actual filtering.
  console.warn("getAllProjects is still using mock data for listing. Needs Prisma migration for filtering.");
  let filteredProjects = MOCK_PROJECTS_TEMP;
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


// --- Feedback Data Functions (Prisma Integrated) ---
export const addFeedbackToProject = async (
  projectId: string,
  feedbackData: { userName: string; comment: string; rating?: number | null; sentimentSummary?: string | null; userId?: string | null }
): Promise<AppFeedback | null> => {
  try {
    const savedFeedback = await prisma.feedback.create({
      data: {
        project_id: projectId,
        user_name: feedbackData.userName,
        comment: feedbackData.comment,
        rating: feedbackData.rating,
        sentiment_summary: feedbackData.sentimentSummary,
        user_id: feedbackData.userId,
      },
    });
    return mapPrismaFeedbackToAppFeedback(savedFeedback);
  } catch (error) {
    console.error('Error adding feedback to project with Prisma:', error);
    return null;
  }
};

export const getAllFeedbackWithProjectTitles = async (): Promise<Array<AppFeedback & { projectTitle: string }>> => {
  try {
    const feedbackWithProjects = await prisma.feedback.findMany({
      include: {
        project: {
          select: { title: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return feedbackWithProjects.map(fb => ({
      ...mapPrismaFeedbackToAppFeedback(fb),
      projectTitle: fb.project?.title || 'Unknown Project',
    }));
  } catch (error) {
    console.error('Error fetching all feedback with project titles using Prisma:', error);
    return [];
  }
};


// --- User Management Functions (Prisma Integrated) ---
export async function getUsers(): Promise<AppUser[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc'}
    });
    return users.map(mapPrismaUserToAppUser);
  } catch (error) {
    console.error('Error fetching users with Prisma:', error);
    return [];
  }
}

export async function deleteUserById(userId: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Before deleting a user, ensure related feedback user_id is handled (e.g., set to null) if there's a foreign key constraint.
    // For simplicity, this example assumes cascading null or no strict FK enforcement on feedback.user_id from the DB side for now.
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting user with Prisma:', error);
    // Check for specific Prisma error codes if needed, e.g., P2025 for record not found
    return { success: false, error };
  }
}

// New function to create a user profile in our public 'users' table
export async function createUserProfileInDb(userData: Omit<PrismaUser, 'created_at' | 'updated_at' | 'avatar_url'> & { avatar_url?: string | null }): Promise<AppUser | null> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
    });
    if (existingUser) {
      // Optionally update if exists, or just return existing. For now, return existing.
      return mapPrismaUserToAppUser(existingUser);
    }

    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user', // Default to 'user'
        avatar_url: userData.avatar_url,
      },
    });
    return mapPrismaUserToAppUser(newUser);
  } catch (error) {
    console.error('Error creating user profile in DB with Prisma:', error);
    throw error; // Re-throw to be caught by server action
  }
}

// New function to get a user profile by ID from our public 'users' table
export async function getUserProfileFromDb(userId: string): Promise<AppUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user ? mapPrismaUserToAppUser(user) : null;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId} from DB with Prisma:`, error);
    return null;
  }
}

// --- Mock Data (to be phased out) ---
const generateMockFeedback = (projectId: string, count: number): AppFeedback[] => {
  const feedbackList: AppFeedback[] = [];
  // ... (mock feedback generation remains for projects still using mock data) ...
  return feedbackList;
};

const MOCK_PROJECTS_TEMP: AppProject[] = [
  // ... (mock project data remains for projects still using mock data) ...
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
    link: '#', // Placeholder
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'passport document',
  },
];

export const mockFeaturedVideos: Video[] = [
  { id: 'fv1', title: 'Nigeria\'s Vision 2050', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'futuristic city', description: 'A look into Nigeria\'s long-term development plan.' },
  // ... other mock videos
];


// --- News & Services (Still using mock data, to be migrated to Prisma) ---
export const getNewsArticleBySlug = (slug: string): NewsArticle | undefined => {
  console.warn("getNewsArticleBySlug is using mock data.");
  return mockNews.find(article => article.slug === slug);
};

export const getAllNewsArticles = (): NewsArticle[] => {
  console.warn("getAllNewsArticles is using mock data.");
  return mockNews.sort((a,b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
};

export const getAllServices = (): ServiceItem[] => {
  console.warn("getAllServices is using mock data.");
  return mockServices;
};

export const getServiceBySlug = (slug: string): ServiceItem | undefined => {
  console.warn("getServiceBySlug is using mock data.");
  return mockServices.find(service => service.slug === slug);
};
