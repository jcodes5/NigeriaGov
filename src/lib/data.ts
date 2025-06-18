
import type { Ministry, State, Project as AppProject, Feedback as AppFeedback, ImpactStat, Video, User as AppUser, NewsArticle, ServiceItem } from '@/types';
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
    budget: prismaProject.budget ? Number(prismaProject.budget) : undefined, // Ensure budget is number
    expenditure: prismaProject.expenditure ? Number(prismaProject.expenditure) : undefined, // Ensure expenditure is number
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


// --- Project Data Functions (Prisma Integrated) ---
export const getProjectById = async (id: string): Promise<AppProject | null> => {
  try {
    const projectWithFeedback = await prisma.project.findUnique({
      where: { id },
      include: {
        feedback_list: { // Matches the relation field name in Prisma schema
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!projectWithFeedback) return null;
    return mapPrismaProjectToAppProject(projectWithFeedback);
  } catch (error) {
    console.error('Error fetching project by ID with Prisma:', error);
    return null; // Or throw error to be handled by caller
  }
};

export const getAllProjects = async (): Promise<AppProject[]> => {
  try {
    const prismaProjects = await prisma.project.findMany({
      orderBy: {
        last_updated_at: 'desc', // Example: order by last updated
      },
    });
    return prismaProjects.map(mapPrismaProjectToAppProject);
  } catch (error) {
    console.error('Error fetching all projects with Prisma:', error);
    return [];
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
        project: { // This 'project' must match the relation field name in your Prisma schema for Feedback
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
    // Ensure related feedback user_id is handled (e.g., set to null or use onDelete: SetNull in Prisma schema)
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
      // Update if exists, e.g. if name or avatar changed during a re-sync scenario
      const updatedUser = await prisma.user.update({
        where: { id: userData.id },
        data: {
          name: userData.name,
          email: userData.email, // Email might not change often here, but good to keep sync
          avatar_url: userData.avatar_url,
          // role is typically managed separately, not on every sync
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

// --- Mock Data (to be phased out) ---
export const MOCK_PROJECTS_TEMP: AppProject[] = [
  // {
  //   id: 'proj1',
  //   title: 'Lagos-Ibadan Expressway Reconstruction',
  //   subtitle: 'Expansion and rehabilitation of a critical transport corridor.',
  //   ministry: ministries[0],
  //   state: states[0],
  //   status: 'Ongoing',
  //   startDate: new Date('2018-07-01'),
  //   expectedEndDate: new Date('2024-12-31'),
  //   description: '<p>The Lagos-Ibadan Expressway project involves the full reconstruction and expansion of the 127.6-kilometer road, a vital link between Nigeria\'s economic hub, Lagos, and other parts of the country. The project aims to reduce travel time, improve safety, and facilitate economic activities.</p><h3>Key Features:</h3><ul><li>Expansion from two to three lanes in each direction for a significant portion.</li><li>Reconstruction of existing pavement and construction of new interchanges.</li><li>Installation of road furniture, street lighting, and safety barriers.</li></ul>',
  //   images: [{ url: 'https://placehold.co/800x600.png', alt: 'Lagos-Ibadan Expressway under construction', dataAiHint: 'road construction' }, { url: 'https://placehold.co/800x600.png', alt: 'Completed section of Lagos-Ibadan Expressway', dataAiHint: 'highway asphalt' }],
  //   videos: [ {id: 'vid1', title: 'Project Update Q1 2024', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'construction site', description: 'Latest progress on the Lagos-Ibadan Expressway.'} ],
  //   impactStats: [
  //     { label: 'Kilometers Reconstructed', value: '95km / 127.6km', iconName: 'Road' },
  //     { label: 'Jobs Created (Direct)', value: '5,000+', iconName: 'Users' },
  //     { label: 'Travel Time Reduction (Projected)', value: '40%', iconName: 'Clock' },
  //   ],
  //   budget: 167000000000, // ~167 Billion Naira
  //   expenditure: 120000000000,
  //   tags: ['infrastructure', 'transportation', 'road construction', 'economic development'],
  //   lastUpdatedAt: new Date('2024-04-15'),
  //   feedback: [
  //     { id: 'fb1', projectId: 'proj1', userName: 'Adekunle Gold', comment: 'Great progress, but need more traffic management during construction.', rating: 4, sentimentSummary: "Positive with concerns", createdAt: new Date('2024-03-10').toISOString() },
  //   ]
  // },
  // {
  //   id: 'proj2',
  //   title: 'Second Niger Bridge',
  //   subtitle: 'A new bridge connecting Asaba and Onitsha over the River Niger.',
  //   ministry: ministries[0],
  //   state: states[2], // Assuming Rivers for Onitsha side, could be Anambra
  //   status: 'Completed',
  //   startDate: new Date('2018-09-01'),
  //   actualEndDate: new Date('2023-05-15'),
  //   description: '<p>The Second Niger Bridge is a key national infrastructure project, designed to ease traffic congestion on the existing Niger Bridge and enhance connectivity between Southeastern Nigeria and the rest of the country. It is a 1.6 km long bridge with approach roads.</p>',
  //   images: [{ url: 'https://placehold.co/800x600.png', alt: 'Second Niger Bridge aerial view', dataAiHint: 'bridge river' }],
  //   impactStats: [ { label: 'Bridge Length', value: '1.6 km', iconName: 'TrendingUp' } ],
  //   budget: 336000000000, // ~336 Billion Naira
  //   tags: ['infrastructure', 'bridge', 'transportation', 'connectivity'],
  //   lastUpdatedAt: new Date('2023-06-01'),
  // },
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
  // Add more news articles if needed
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
  {
    id: 'service2',
    slug: 'file-taxes-online',
    title: 'File Taxes Online (e-FIRS)',
    summary: 'Use the Federal Inland Revenue Service portal to file your tax returns.',
    icon: Briefcase, // Placeholder, consider 'Scale' or similar for taxes
    category: 'Taxation',
    link: '#', // Placeholder
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'tax document',
  },
  // Add more services if needed
];

export const mockFeaturedVideos: Video[] = [
  { id: 'fv1', title: 'Nigeria\'s Vision 2050', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'futuristic city', description: 'A look into Nigeria\'s long-term development plan.' },
  { id: 'fv2', title: 'Agricultural Revolution Initiatives', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'farm tractor', description: 'Boosting food security and empowering farmers.' },
  { id: 'fv3', title: 'Digital Nigeria: Connecting the Nation', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'data network', description: 'Expanding digital infrastructure and literacy.' },
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

// --- Mock Data (to be phased out as features are migrated) ---
export const projects: AppProject[] = MOCK_PROJECTS_TEMP; // Temporary alias for compatibility during migration
