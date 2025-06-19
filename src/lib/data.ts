
import type { Ministry, State, Project as AppProject, Feedback as AppFeedback, ImpactStat, Video, User as AppUser, NewsArticle as AppNewsArticle, ServiceItem, ProjectFormData } from '@/types';
import { Briefcase, Users, DollarSign, TrendingUp, MapPin, CalendarDays, Flag, ShieldCheck, BookOpen, Heart, Building, Globe, Plane, Award, Rss, MessageCircle, PersonStanding, Construction, CheckCircle, Zap } from 'lucide-react';
import prisma from './prisma';
import type { Project as PrismaProject, Feedback as PrismaFeedback, User as PrismaUser, NewsArticle as PrismaNewsArticle } from '@prisma/client';

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
  const ministry = ministries.find(m => m.id === prismaProject.ministry_id) || { id: prismaProject.ministry_id || 'unknown_ministry', name: prismaProject.ministry_id || 'Unknown Ministry' };
  const state = states.find(s => s.id === prismaProject.state_id) || { id: prismaProject.state_id || 'unknown_state', name: prismaProject.state_id || 'Unknown State' };

  const mappedImpactStats = (prismaProject.impact_stats as unknown as ImpactStat[] || []).map(stat => {
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
    startDate: new Date(prismaProject.start_date),
    expectedEndDate: prismaProject.expected_end_date ? new Date(prismaProject.expected_end_date) : undefined,
    actualEndDate: prismaProject.actual_end_date ? new Date(prismaProject.actual_end_date) : undefined,
    description: prismaProject.description,
    images: (prismaProject.images as unknown as { url: string; alt: string, dataAiHint?: string }[] || []),
    videos: (prismaProject.videos as unknown as Video[] || []),
    impactStats: mappedImpactStats,
    budget: prismaProject.budget ? Number(prismaProject.budget) : undefined, 
    expenditure: prismaProject.expenditure ? Number(prismaProject.expenditure) : undefined, 
    tags: prismaProject.tags || [],
    lastUpdatedAt: new Date(prismaProject.last_updated_at),
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

// --- Helper function to map Prisma NewsArticle to AppNewsArticle ---
const mapPrismaNewsToAppNews = (prismaNews: PrismaNewsArticle): AppNewsArticle => {
  return {
    id: prismaNews.id,
    slug: prismaNews.slug,
    title: prismaNews.title,
    summary: prismaNews.summary,
    imageUrl: prismaNews.image_url, 
    dataAiHint: prismaNews.data_ai_hint, 
    category: prismaNews.category,
    publishedDate: new Date(prismaNews.published_date), 
    content: prismaNews.content,
    createdAt: new Date(prismaNews.created_at),
    updatedAt: new Date(prismaNews.updated_at),
  };
};


// --- Project Data Functions (Prisma Integrated) ---
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

export const getAllProjects = async (): Promise<AppProject[]> => {
  try {
    const prismaProjects = await prisma.project.findMany({
      orderBy: {
        last_updated_at: 'desc', 
      },
    });
    return prismaProjects.map(mapPrismaProjectToAppProject);
  } catch (error) {
    console.error('Error fetching all projects with Prisma:', error);
    return [];
  }
};

export type ProjectCreationData = Omit<PrismaProject, 'id' | 'created_at' | 'last_updated_at' | 'images' | 'videos' | 'impact_stats' | 'feedback_list'> & {
  tags?: string[];
};

export const createProjectInDb = async (projectData: ProjectCreationData): Promise<AppProject | null> => {
  try {
    const newProject = await prisma.project.create({
      data: {
        ...projectData,
        budget: projectData.budget ?? undefined, 
        expenditure: projectData.expenditure ?? undefined,
        images: [], 
        videos: [], 
        impact_stats: [], 
      },
    });
    return mapPrismaProjectToAppProject(newProject);
  } catch (error) {
    console.error('Error creating project in DB with Prisma:', error);
    return null;
  }
};

export const updateProjectInDb = async (id: string, projectData: Partial<ProjectCreationData>): Promise<AppProject | null> => {
  try {
    const dataToUpdate = { ...projectData };
    // Ensure dates are Date objects if provided
    if (dataToUpdate.start_date && typeof dataToUpdate.start_date === 'string') {
      dataToUpdate.start_date = new Date(dataToUpdate.start_date);
    }
    if (dataToUpdate.expected_end_date && typeof dataToUpdate.expected_end_date === 'string') {
      dataToUpdate.expected_end_date = new Date(dataToUpdate.expected_end_date);
    }
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...dataToUpdate,
        budget: dataToUpdate.budget ?? undefined,
        expenditure: dataToUpdate.expenditure ?? undefined,
        // images, videos, impact_stats are not updated via this simple form for now
      },
    });
    return mapPrismaProjectToAppProject(updatedProject);
  } catch (error) {
    console.error(`Error updating project with ID "${id}" in DB with Prisma:`, error);
    return null;
  }
};

export const deleteProjectFromDb = async (id: string): Promise<boolean> => {
  try {
    // First, delete related feedback to avoid foreign key constraint violations
    await prisma.feedback.deleteMany({
      where: { project_id: id },
    });
    // Then delete the project
    await prisma.project.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting project with ID "${id}" from DB with Prisma:`, error);
    return false;
  }
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
     await prisma.feedback.updateMany({
      where: { user_id: userId },
      data: { user_id: null },
    });
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting user with Prisma:', error);
    return { success: false, error };
  }
}

export async function createUserProfileInDb(userData: Omit<PrismaUser, 'created_at' | 'updated_at' | 'avatar_url'> & { avatar_url?: string | null }): Promise<AppUser | null> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
    });
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: userData.id },
        data: {
          name: userData.name,
          email: userData.email, 
          avatar_url: userData.avatar_url,
        },
      });
      return mapPrismaUserToAppUser(updatedUser);
    }

    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        avatar_url: userData.avatar_url,
      },
    });
    return mapPrismaUserToAppUser(newUser);
  } catch (error) {
    console.error('Error creating/updating user profile in DB with Prisma:', error);
    throw error;
  }
}

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

// --- News Data Functions (Prisma Integrated) ---
export const getNewsArticleBySlug = async (slug: string): Promise<AppNewsArticle | null> => {
  try {
    const newsArticle = await prisma.newsArticle.findUnique({
      where: { slug },
    });
    return newsArticle ? mapPrismaNewsToAppNews(newsArticle) : null;
  } catch (error) {
    console.error(`Error fetching news article by slug "${slug}" with Prisma:`, error);
    return null;
  }
};

export const getNewsArticleById = async (id: string): Promise<AppNewsArticle | null> => {
  try {
    const newsArticle = await prisma.newsArticle.findUnique({
      where: { id },
    });
    return newsArticle ? mapPrismaNewsToAppNews(newsArticle) : null;
  } catch (error) {
    console.error(`Error fetching news article by ID "${id}" with Prisma:`, error);
    return null;
  }
};

export const getAllNewsArticles = async (): Promise<AppNewsArticle[]> => {
  try {
    const newsArticles = await prisma.newsArticle.findMany({
      orderBy: {
        published_date: 'desc',
      },
    });
    return newsArticles.map(mapPrismaNewsToAppNews);
  } catch (error) {
    console.error('Error fetching all news articles with Prisma:', error);
    return [];
  }
};

export type NewsArticleCreationData = Omit<PrismaNewsArticle, 'id' | 'created_at' | 'updated_at'>;

export const createNewsArticleInDb = async (newsData: NewsArticleCreationData): Promise<AppNewsArticle | null> => {
  try {
    const newArticle = await prisma.newsArticle.create({
      data: {
        ...newsData,
        image_url: newsData.image_url || null, 
        data_ai_hint: newsData.data_ai_hint || null, 
      }
    });
    return mapPrismaNewsToAppNews(newArticle);
  } catch (error) {
    console.error('Error creating news article in DB with Prisma:', error);
    return null;
  }
};

export const updateNewsArticleInDb = async (id: string, newsData: Partial<NewsArticleCreationData>): Promise<AppNewsArticle | null> => {
  try {
    const dataToUpdate = { ...newsData };
    if (dataToUpdate.published_date && typeof dataToUpdate.published_date === 'string') {
      dataToUpdate.published_date = new Date(dataToUpdate.published_date);
    }
    
    const updatedArticle = await prisma.newsArticle.update({
      where: { id },
      data: {
        ...dataToUpdate,
        image_url: dataToUpdate.image_url === '' ? null : dataToUpdate.image_url,
        data_ai_hint: dataToUpdate.data_ai_hint === '' ? null : dataToUpdate.data_ai_hint,
      },
    });
    return mapPrismaNewsToAppNews(updatedArticle);
  } catch (error) {
    console.error(`Error updating news article with ID "${id}" in DB with Prisma:`, error);
    return null;
  }
};

export const deleteNewsArticleFromDb = async (id: string): Promise<boolean> => {
  try {
    await prisma.newsArticle.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting news article with ID "${id}" from DB with Prisma:`, error);
    return false;
  }
};


// --- Services (Still using mock data, to be migrated to Prisma) ---
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
  {
    id: 'service2',
    slug: 'file-taxes-online',
    title: 'File Taxes Online (e-FIRS)',
    summary: 'Use the Federal Inland Revenue Service portal to file your tax returns.',
    icon: Briefcase, 
    category: 'Taxation',
    link: '#', // Placeholder
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'tax document',
  },
];

export const getAllServices = (): ServiceItem[] => {
  console.warn("getAllServices is using mock data.");
  return mockServices;
};

export const getServiceBySlug = (slug: string): ServiceItem | undefined => {
  console.warn("getServiceBySlug is using mock data.");
  return mockServices.find(service => service.slug === slug);
};

// --- Mock Data (to be phased out as features are migrated) ---
export const MOCK_PROJECTS_TEMP: AppProject[] = []; 
export const mockFeaturedVideos: Video[] = [
  { id: 'fv1', title: 'Nigeria\'s Vision 2050', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'futuristic city', description: 'A look into Nigeria\'s long-term development plan.' },
  { id: 'fv2', title: 'Agricultural Revolution Initiatives', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'farm tractor', description: 'Boosting food security and empowering farmers.' },
  { id: 'fv3', title: 'Digital Nigeria: Connecting the Nation', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'data network', description: 'Expanding digital infrastructure and literacy.' },
];

