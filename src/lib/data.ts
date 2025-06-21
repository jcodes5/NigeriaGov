

import type { Ministry, State, Project as AppProject, Feedback as AppFeedback, ImpactStat, Video as AppVideo, User as AppUser, NewsArticle as AppNewsArticle, ServiceItem as AppServiceItem, ProjectFormData, SiteSettings, UserDashboardStats } from '@/types';
import type * as LucideIcons from 'lucide-react'; // Keep this for type checking
import { TrendingUp as DefaultIcon, Server as DefaultServiceIcon } from 'lucide-react'; // Import specific icons for default
import prisma from './prisma';
import type { Project as PrismaProject, Feedback as PrismaFeedback, User as PrismaUser, NewsArticle as PrismaNewsArticle, Service as PrismaService, Video as PrismaVideo, SiteSetting as PrismaSiteSetting, Prisma, ProjectTag as PrismaProjectTag, Tag as PrismaTag } from '@prisma/client';

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
const mapPrismaProjectToAppProject = (prismaProject: PrismaProject & { feedback_list?: PrismaFeedback[], tags?: { tag: PrismaTag }[] }): AppProject => {
  const ministry = ministries.find(m => m.id === prismaProject.ministry_id) || { id: prismaProject.ministry_id || 'unknown_ministry', name: prismaProject.ministry_id || 'Unknown Ministry' };
  const state = states.find(s => s.id === prismaProject.state_id) || { id: prismaProject.state_id || 'unknown_state', name: prismaProject.state_id || 'Unknown State' };

  const mappedImpactStats = (prismaProject.impact_stats as unknown as ImpactStat[] || []).map(stat => {
    const Lucide = require('lucide-react'); // Dynamically require for safety
    const IconComponent = stat.iconName && Lucide[stat.iconName as keyof typeof LucideIcons] ? Lucide[stat.iconName as keyof typeof LucideIcons] as React.ElementType : DefaultIcon;
    return { ...stat, icon: IconComponent };
  });

  const appProjectTags = prismaProject.tags?.map(pt => pt.tag.name) || [];


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
    videos: (prismaProject.videos as unknown as AppVideo[] || []),
    impactStats: mappedImpactStats,
    budget: prismaProject.budget ? Number(prismaProject.budget) : undefined,
    expenditure: prismaProject.expenditure ? Number(prismaProject.expenditure) : undefined,
    tags: appProjectTags,
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

// --- Helper function to map Prisma User to AppUser (NextAuth.js compatible) ---
const mapPrismaUserToAppUser = (prismaUser: PrismaUser): AppUser => {
  return {
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    emailVerified: prismaUser.emailVerified,
    image: prismaUser.image,
    role: prismaUser.role as AppUser['role'] | null,
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
    imageUrl: prismaNews.imageUrl,
    dataAiHint: prismaNews.dataAiHint,
    category: prismaNews.category,
    publishedDate: new Date(prismaNews.publishedDate),
    content: prismaNews.content,
    createdAt: new Date(prismaNews.createdAt),
    updatedAt: new Date(prismaNews.updatedAt),
  };
};

// --- Helper function to map Prisma Service to AppServiceItem ---
const mapPrismaServiceToAppServiceItem = (prismaService: PrismaService): AppServiceItem => {
  const Lucide = require('lucide-react');
  const IconComponent = prismaService.iconName && Lucide[prismaService.iconName as keyof typeof LucideIcons] ? Lucide[prismaService.iconName as keyof typeof LucideIcons] as React.ElementType : DefaultServiceIcon;

  return {
    id: prismaService.id,
    slug: prismaService.slug,
    title: prismaService.title,
    summary: prismaService.summary,
    iconName: prismaService.iconName as keyof typeof LucideIcons | null,
    icon: IconComponent,
    link: prismaService.link,
    category: prismaService.category,
    imageUrl: prismaService.imageUrl,
    dataAiHint: prismaService.dataAiHint,
    createdAt: new Date(prismaService.createdAt),
    updatedAt: new Date(prismaService.updatedAt),
  };
};

// --- Helper function to map Prisma Video to AppVideo ---
const mapPrismaVideoToAppVideo = (prismaVideo: PrismaVideo): AppVideo => {
  return {
    id: prismaVideo.id,
    title: prismaVideo.title,
    url: prismaVideo.url,
    thumbnailUrl: prismaVideo.thumbnailUrl,
    dataAiHint: prismaVideo.dataAiHint,
    description: prismaVideo.description,
    createdAt: new Date(prismaVideo.createdAt),
    updatedAt: new Date(prismaVideo.updatedAt),
  };
};

const mapPrismaSiteSettingToAppSiteSetting = (prismaSetting: PrismaSiteSetting): SiteSettings => {
  return {
    id: prismaSetting.id,
    siteName: prismaSetting.siteName,
    maintenanceMode: prismaSetting.maintenanceMode,
    contactEmail: prismaSetting.contactEmail,
    footerMessage: prismaSetting.footerMessage,
    updatedAt: new Date(prismaSetting.updatedAt),
  };
};


// --- Project Data Functions (Prisma Integrated) ---
export const getProjectById = async (id: string): Promise<AppProject | null> => {
  try {
    const projectWithDetails = await prisma.project.findUnique({
      where: { id },
      include: {
        feedback_list: {
          orderBy: { created_at: 'desc' },
        },
        tags: {
          select: {
            tag: true
          }
        }
      },
    });

    if (!projectWithDetails) return null;
    return mapPrismaProjectToAppProject(projectWithDetails);
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
      include: {
        tags: { select: { tag: { select: { name: true } } } }
      }
    });
    return prismaProjects.map(mapPrismaProjectToAppProject);
  } catch (error) {
    console.error('Error fetching all projects with Prisma:', error);
    return [];
  }
};

export type ProjectCreationData = Omit<PrismaProject, 'id' | 'created_at' | 'last_updated_at' | 'images' | 'videos' | 'impact_stats'> & {
  tags?: string[]; // These are tag *names*
  images?: any;
  videos?: any;
  impact_stats?: any;
};

export const createProjectInDb = async (projectData: ProjectCreationData): Promise<AppProject | null> => {
  try {
    const tagOperations = projectData.tags?.map(tagName => ({
        tag: {
            connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
            }
        }
    }));

    const newProject = await prisma.project.create({
      data: {
        title: projectData.title,
        subtitle: projectData.subtitle,
        ministry_id: projectData.ministry_id,
        state_id: projectData.state_id,
        status: projectData.status,
        start_date: projectData.start_date,
        expected_end_date: projectData.expected_end_date,
        description: projectData.description,
        budget: projectData.budget ?? undefined,
        expenditure: projectData.expenditure ?? undefined,
        images: projectData.images || [],
        videos: projectData.videos || [],
        impact_stats: projectData.impact_stats || [],
        ...(tagOperations && tagOperations.length > 0 && {
            tags: {
                create: tagOperations
            }
        })
      },
      include: {
        tags: { select: { tag: true } }
      }
    });
    return mapPrismaProjectToAppProject(newProject);
  } catch (error) {
    console.error('Error creating project in DB with Prisma:', error);
    throw error;
  }
};

export const updateProjectInDb = async (id: string, projectData: Partial<ProjectCreationData>): Promise<AppProject | null> => {
    try {
        const { tags, ...scalarData } = projectData;

        const baseUpdateData: Prisma.ProjectUpdateInput = {
            ...scalarData,
            start_date: scalarData.start_date ? new Date(scalarData.start_date) : undefined,
            expected_end_date: scalarData.expected_end_date === null ? null : (scalarData.expected_end_date ? new Date(scalarData.expected_end_date) : undefined),
            budget: scalarData.budget !== undefined ? (Number(scalarData.budget) || null) : undefined,
            expenditure: scalarData.expenditure !== undefined ? (Number(scalarData.expenditure) || null) : undefined,
        };

        if (tags !== undefined) {
            baseUpdateData.tags = {
                deleteMany: {}, // Delete all existing relations first
                create: tags.map(tagName => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tagName },
                            create: { name: tagName },
                        },
                    },
                })),
            };
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: baseUpdateData,
            include: {
                tags: { select: { tag: true } },
                feedback_list: { orderBy: { created_at: 'desc' } },
            },
        });

        return mapPrismaProjectToAppProject(updatedProject);
    } catch (error) {
        console.error(`Error updating project with ID "${id}" in DB with Prisma:`, error);
        throw error;
    }
};

export const deleteProjectFromDb = async (id: string): Promise<boolean> => {
  try {
    await prisma.projectTag.deleteMany({ where: { projectId: id }});
    await prisma.feedback.deleteMany({ where: { project_id: id } });
    await prisma.project.delete({ where: { id } });
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
    console.error('Error deleting user profile or disassociating feedback with Prisma:', error);
    return { success: false, error };
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
        publishedDate: 'desc',
      },
    });
    return newsArticles.map(mapPrismaNewsToAppNews);
  } catch (error) {
    console.error('Error fetching all news articles with Prisma:', error);
    return [];
  }
};

export type NewsArticleCreationData = Omit<PrismaNewsArticle, 'id' | 'createdAt' | 'updatedAt'>;

export const createNewsArticleInDb = async (newsData: NewsArticleCreationData): Promise<AppNewsArticle | null> => {
  try {
    const newArticle = await prisma.newsArticle.create({
      data: {
        ...newsData,
        imageUrl: newsData.imageUrl || null,
        dataAiHint: newsData.dataAiHint || null,
      }
    });
    return mapPrismaNewsToAppNews(newArticle);
  } catch (error) {
    console.error('Error creating news article in DB with Prisma:', error);
    throw error;
  }
};

export const updateNewsArticleInDb = async (id: string, newsData: Partial<NewsArticleCreationData>): Promise<AppNewsArticle | null> => {
  try {
    const dataToUpdate = { ...newsData };
    if (dataToUpdate.publishedDate && typeof dataToUpdate.publishedDate === 'string') {
      dataToUpdate.publishedDate = new Date(dataToUpdate.publishedDate);
    }

    const updatedArticle = await prisma.newsArticle.update({
      where: { id },
      data: {
        ...dataToUpdate,
        imageUrl: dataToUpdate.imageUrl === '' ? null : dataToUpdate.imageUrl,
        dataAiHint: dataToUpdate.dataAiHint === '' ? null : dataToUpdate.dataAiHint,
      },
    });
    return mapPrismaNewsToAppNews(updatedArticle);
  } catch (error) {
    console.error(`Error updating news article with ID "${id}" in DB with Prisma:`, error);
    throw error;
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


// --- Services Data Functions (Prisma Integrated) ---
export const getAllServices = async (): Promise<AppServiceItem[]> => {
  try {
    const prismaServices = await prisma.service.findMany({
      orderBy: {
        title: 'asc',
      },
    });
    return prismaServices.map(mapPrismaServiceToAppServiceItem);
  } catch (error) {
    console.error('Error fetching all services with Prisma:', error);
    return [];
  }
};

export const getServiceBySlug = async (slug: string): Promise<AppServiceItem | undefined> => {
  try {
    const prismaService = await prisma.service.findUnique({
      where: { slug },
    });
    return prismaService ? mapPrismaServiceToAppServiceItem(prismaService) : undefined;
  } catch (error) {
    console.error(`Error fetching service by slug "${slug}" with Prisma:`, error);
    return undefined;
  }
};

export const getServiceById = async (id: string): Promise<AppServiceItem | null> => {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    return service ? mapPrismaServiceToAppServiceItem(service) : null;
  } catch (error) {
    console.error(`Error fetching service by ID "${id}" with Prisma:`, error);
    return null;
  }
};

export type ServiceCreationData = Omit<PrismaService, 'id' | 'createdAt' | 'updatedAt'>;

export const createServiceInDb = async (serviceData: ServiceCreationData): Promise<AppServiceItem | null> => {
  try {
    const newService = await prisma.service.create({
      data: {
        ...serviceData,
        iconName: serviceData.iconName || null,
        link: serviceData.link || null,
        imageUrl: serviceData.imageUrl || null,
        dataAiHint: serviceData.dataAiHint || null,
      }
    });
    return mapPrismaServiceToAppServiceItem(newService);
  } catch (error) {
    console.error('Error creating service in DB with Prisma:', error);
    throw error;
  }
};

export const updateServiceInDb = async (id: string, serviceData: Partial<ServiceCreationData>): Promise<AppServiceItem | null> => {
  try {
    const dataToUpdate = {...serviceData};
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...dataToUpdate,
        iconName: dataToUpdate.iconName === '' ? null : dataToUpdate.iconName,
        link: dataToUpdate.link === '' ? null : dataToUpdate.link,
        imageUrl: dataToUpdate.imageUrl === '' ? null : dataToUpdate.imageUrl,
        dataAiHint: dataToUpdate.dataAiHint === '' ? null : dataToUpdate.dataAiHint,
      },
    });
    return mapPrismaServiceToAppServiceItem(updatedService);
  } catch (error) {
    console.error(`Error updating service with ID "${id}" in DB with Prisma:`, error);
    throw error;
  }
};

export const deleteServiceFromDb = async (id: string): Promise<boolean> => {
  try {
    await prisma.service.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting service with ID "${id}" from DB with Prisma:`, error);
    return false;
  }
};

// --- Video Data Functions (Prisma Integrated) ---
export const getAllVideosFromDb = async (): Promise<AppVideo[]> => {
  try {
    const prismaVideos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return prismaVideos.map(mapPrismaVideoToAppVideo);
  } catch (error) {
    console.error('Error fetching all videos with Prisma:', error);
    return [];
  }
};

export const getVideoById = async (id: string): Promise<AppVideo | null> => {
  try {
    const video = await prisma.video.findUnique({
      where: { id },
    });
    return video ? mapPrismaVideoToAppVideo(video) : null;
  } catch (error) {
    console.error(`Error fetching video by ID "${id}" with Prisma:`, error);
    return null;
  }
};

export type VideoCreationData = Omit<PrismaVideo, 'id' | 'createdAt' | 'updatedAt'>;

export const createVideoInDb = async (videoData: VideoCreationData): Promise<AppVideo | null> => {
  try {
    const newVideo = await prisma.video.create({
      data: {
        ...videoData,
        thumbnailUrl: videoData.thumbnailUrl || null,
        dataAiHint: videoData.dataAiHint || null,
        description: videoData.description || null,
      }
    });
    return mapPrismaVideoToAppVideo(newVideo);
  } catch (error) {
    console.error('Error creating video in DB with Prisma:', error);
    throw error;
  }
};

export const updateVideoInDb = async (id: string, videoData: Partial<VideoCreationData>): Promise<AppVideo | null> => {
  try {
    const dataToUpdate = { ...videoData };
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        ...dataToUpdate,
        thumbnailUrl: dataToUpdate.thumbnailUrl === '' ? null : dataToUpdate.thumbnailUrl,
        dataAiHint: dataToUpdate.dataAiHint === '' ? null : dataToUpdate.dataAiHint,
        description: dataToUpdate.description === '' ? null : dataToUpdate.description,
      },
    });
    return mapPrismaVideoToAppVideo(updatedVideo);
  } catch (error) {
    console.error(`Error updating video with ID "${id}" in DB with Prisma:`, error);
    throw error;
  }
};

export const deleteVideoFromDb = async (id: string): Promise<boolean> => {
  try {
    await prisma.video.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting video with ID "${id}" from DB with Prisma:`, error);
    return false;
  }
};

// --- Site Settings Data Functions ---
const SITE_SETTINGS_ID = "global_settings";

export const getSiteSettingsFromDb = async (): Promise<SiteSettings | null> => {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: SITE_SETTINGS_ID },
    });
    if (settings) {
      return mapPrismaSiteSettingToAppSiteSetting(settings);
    }
    return {
      id: SITE_SETTINGS_ID,
      siteName: "NigeriaGovHub",
      maintenanceMode: false,
      contactEmail: "info@example.com",
      footerMessage: `© ${new Date().getFullYear()} NigeriaGovHub. All rights reserved.`,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error fetching site settings from DB:", error);
    return null;
  }
};

export const updateSiteSettingsInDb = async (settingsData: Partial<Omit<SiteSettings, 'id' | 'updatedAt'>>): Promise<SiteSettings | null> => {
  try {
    const dataToUpsert = {
      siteName: settingsData.siteName,
      maintenanceMode: settingsData.maintenanceMode,
      contactEmail: settingsData.contactEmail,
      footerMessage: settingsData.footerMessage,
    };

    const updatedSettings = await prisma.siteSetting.upsert({
      where: { id: SITE_SETTINGS_ID },
      update: dataToUpsert,
      create: {
        id: SITE_SETTINGS_ID,
        ...dataToUpsert,
      },
    });
    return mapPrismaSiteSettingToAppSiteSetting(updatedSettings);
  } catch (error) {
    console.error("Error updating site settings in DB:", error);
    throw error;
  }
};

// Mock data (projects, newsArticles, services) is kept for now if needed by any page not yet fully converted to DB
// but primary data fetching should now use Prisma functions.
export let projects: AppProject[] = [];
export let newsArticles: AppNewsArticle[] = [];
export let services: AppServiceItem[] = [];
export const defaultVideos: AppVideo[] = [];


// --- NEW Functions for User Dashboard ---

export const getUserDashboardStatsFromDb = async (userId: string): Promise<UserDashboardStats> => {
  const feedbackCount = await prisma.feedback.count({
    where: { user_id: userId },
  });

  const ratingAgg = await prisma.feedback.aggregate({
    _avg: { rating: true },
    where: { user_id: userId, rating: { not: null } },
  });

  const bookmarkedCount = await prisma.bookmarkedProject.count({
      where: { user_id: userId },
  });

  return {
    feedbackSubmitted: feedbackCount,
    bookmarkedProjects: bookmarkedCount,
    averageRating: ratingAgg._avg.rating || 0,
  };
};

export const getUserFeedbackFromDb = async (userId: string): Promise<Array<AppFeedback & { projectTitle: string, projectId: string }>> => {
  const feedbackWithProjects = await prisma.feedback.findMany({
    where: { user_id: userId },
    include: {
      project: {
        select: { id: true, title: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return feedbackWithProjects.map(fb => ({
    ...mapPrismaFeedbackToAppFeedback(fb),
    projectTitle: fb.project?.title || 'Unknown Project',
    projectId: fb.project_id,
  }));
};

export const updateUserNameInDb = async (userId: string, name: string): Promise<AppUser | null> => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: name },
        });
        return mapPrismaUserToAppUser(updatedUser);
    } catch (error) {
        console.error(`Error updating user name for user ${userId}:`, error);
        return null;
    }
};



