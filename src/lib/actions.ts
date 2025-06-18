
"use server";

import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import { 
  addFeedbackToProject as saveFeedbackToDb, 
  deleteUserById as removeUserFromDb,
  createUserProfileInDb,
  getUserProfileFromDb,
  createProjectInDb as saveProjectToDb, // Renamed for clarity
  type ProjectCreationData,
  createNewsArticleInDb as saveNewsArticleToDb, // Renamed for clarity
  type NewsArticleCreationData,
} from './data';
import type { Feedback as AppFeedback, User as AppUser, Project as AppProject, NewsArticle as AppNewsArticle } from '@/types';
import prisma from './prisma';


export interface SubmitFeedbackResult {
  success: boolean;
  message: string;
  feedback?: AppFeedback;
  sentimentSummary?: string;
}

export async function submitProjectFeedback(
  projectId: string,
  formData: { userName: string; comment: string; rating?: number; userId?: string | null; }
): Promise<SubmitFeedbackResult> {
  try {
    const sentimentInput: SummarizeFeedbackSentimentInput = {
      feedback: formData.comment,
    };
    const sentimentOutput = await summarizeFeedbackSentiment(sentimentInput);
    
    const feedbackToSave = {
      userName: formData.userName,
      comment: formData.comment,
      rating: formData.rating,
      sentimentSummary: sentimentOutput.sentimentSummary,
      userId: formData.userId || null,
    };

    const savedFeedback = await saveFeedbackToDb(projectId, feedbackToSave);

    if (!savedFeedback) {
      return { success: false, message: "Failed to save feedback to the database." };
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard/admin/manage-feedback');
    revalidatePath(`/dashboard/user/feedback`);

    return {
      success: true,
      message: 'Feedback submitted successfully!',
      feedback: savedFeedback,
      sentimentSummary: sentimentOutput.sentimentSummary,
    };

  } catch (error) {
    console.error('Error submitting feedback:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, message: `Failed to submit feedback: ${errorMessage}` };
  }
}

export interface DeleteUserResult {
  success: boolean;
  message: string;
}

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  try {
    const { success, error } = await removeUserFromDb(userId);

    if (success) {
      revalidatePath("/dashboard/admin/manage-users");
      return { success: true, message: "User profile deleted successfully from public table." };
    } else {
      console.error("Prisma delete error (public.users):", error);
      return { success: false, message: `Failed to delete user profile: ${error?.message || 'Unknown error'}` };
    }
  } catch (error) {
    console.error('Error in deleteUser server action:', error);
    let errorMessage = 'An unexpected error occurred while deleting the user profile.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

export async function syncUserProfile(
  data: { userId: string; email: string; name: string; avatarUrl?: string | null }
): Promise<{ user: AppUser | null; error: string | null }> {
  try {
    const profile = await createUserProfileInDb({
      id: data.userId,
      email: data.email,
      name: data.name,
      role: 'user', 
      avatar_url: data.avatarUrl || null,
    });
    if (profile) {
      return { user: profile, error: null };
    }
    return { user: null, error: "Failed to create user profile." };
  } catch (error) {
    console.error("Error syncing user profile:", error);
    if (error instanceof Error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
      return { user: null, error: "A user with this email may already exist. If this is you, try logging in." };
    }
     if (error instanceof Error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('PRIMARY')) {
      const existingUser = await getUserProfileFromDb(data.userId);
      if (existingUser) return { user: existingUser, error: null }; 
      return { user: null, error: "User profile already exists, but could not be retrieved." };
    }
    return { user: null, error: error instanceof Error ? error.message : "An unknown error occurred during profile sync." };
  }
}

export async function getUserProfile(userId: string): Promise<AppUser | null> {
  try {
    const profile = await getUserProfileFromDb(userId);
    return profile;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return null;
  }
}

// Server Action Result Type
interface ActionResult<T = null> {
  success: boolean;
  message: string;
  item?: T;
  errorDetails?: string;
}

export async function addProject(
  projectData: Omit<ProjectCreationData, 'ministry_id' | 'state_id'> & { ministryId: string; stateId: string;}
): Promise<ActionResult<AppProject>> {
  try {
    const dataToSave: ProjectCreationData = {
      title: projectData.title,
      subtitle: projectData.subtitle,
      ministry_id: projectData.ministryId,
      state_id: projectData.stateId,
      status: projectData.status,
      start_date: projectData.startDate,
      expected_end_date: projectData.expectedEndDate,
      description: projectData.description,
      budget: projectData.budget,
      expenditure: projectData.expenditure,
      tags: projectData.tags,
    };

    const newProject = await saveProjectToDb(dataToSave);
    if (!newProject) {
      return { success: false, message: 'Failed to save project to the database.' };
    }

    revalidatePath('/projects');
    revalidatePath('/dashboard/admin/manage-projects');
    revalidatePath('/'); // For featured projects on homepage
    return { success: true, message: 'Project added successfully!', item: newProject };
  } catch (error) {
    console.error('Error adding project:', error);
    let errorMessage = 'An unexpected error occurred while adding the project.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('title')) { // Example for unique constraint, adjust if needed
          errorMessage = 'A project with this title already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function addNewsArticle(
  newsData: NewsArticleCreationData
): Promise<ActionResult<AppNewsArticle>> {
  try {
    // Basic slug check (Prisma will enforce uniqueness at DB level)
    const existingArticle = await prisma.newsArticle.findUnique({ where: { slug: newsData.slug }});
    if (existingArticle) {
      return { success: false, message: `A news article with the slug "${newsData.slug}" already exists.`};
    }

    const newArticle = await saveNewsArticleToDb(newsData);
    if (!newArticle) {
      return { success: false, message: 'Failed to save news article to the database.' };
    }

    revalidatePath('/news');
    revalidatePath(`/news/${newArticle.slug}`);
    revalidatePath('/dashboard/admin/manage-news');
    revalidatePath('/'); // For latest news on homepage
    return { success: true, message: 'News article added successfully!', item: newArticle };
  } catch (error) {
    console.error('Error adding news article:', error);
    let errorMessage = 'An unexpected error occurred while adding the news article.';
     if (error instanceof Error) {
      errorMessage = error.message;
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('slug')) {
          errorMessage = 'A news article with this slug already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}
