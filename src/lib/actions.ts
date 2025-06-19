
"use server";

import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import { 
  addFeedbackToProject as saveFeedbackToDb, 
  deleteUserById as removeUserFromDb,
  createUserProfileInDb,
  getUserProfileFromDb,
  createProjectInDb as saveProjectToDb, 
  updateProjectInDb,
  deleteProjectFromDb,
  type ProjectCreationData,
  createNewsArticleInDb as saveNewsArticleToDb, 
  type NewsArticleCreationData,
  updateNewsArticleInDb,
  deleteNewsArticleFromDb,
} from './data';
import type { Feedback as AppFeedback, User as AppUser, Project as AppProject, NewsArticle as AppNewsArticle, NewsArticleFormData, ProjectFormData } from '@/types';
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
  formData: ProjectFormData
): Promise<ActionResult<AppProject>> {
  try {
    const dataToSave: ProjectCreationData = {
      title: formData.title,
      subtitle: formData.subtitle,
      ministry_id: formData.ministryId,
      state_id: formData.stateId,
      status: formData.status,
      start_date: formData.startDate,
      expected_end_date: formData.expectedEndDate,
      description: formData.description,
      budget: formData.budget,
      expenditure: formData.expenditure,
      tags: formData.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    };

    const newProject = await saveProjectToDb(dataToSave);
    if (!newProject) {
      return { success: false, message: 'Failed to save project to the database.' };
    }

    revalidatePath('/projects');
    revalidatePath('/dashboard/admin/manage-projects');
    revalidatePath('/'); 
    return { success: true, message: 'Project added successfully!', item: newProject };
  } catch (error) {
    console.error('Error adding project:', error);
    let errorMessage = 'An unexpected error occurred while adding the project.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('title')) { 
          errorMessage = 'A project with this title already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function updateProject(
  id: string,
  formData: ProjectFormData
): Promise<ActionResult<AppProject>> {
  try {
    const dataToUpdate: Partial<ProjectCreationData> = {
      title: formData.title,
      subtitle: formData.subtitle,
      ministry_id: formData.ministryId,
      state_id: formData.stateId,
      status: formData.status,
      start_date: formData.startDate,
      expected_end_date: formData.expectedEndDate,
      description: formData.description,
      budget: formData.budget,
      expenditure: formData.expenditure,
      tags: formData.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    };

    const updatedProject = await updateProjectInDb(id, dataToUpdate);
    if (!updatedProject) {
      return { success: false, message: 'Failed to update project in the database.' };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/dashboard/admin/manage-projects');
    revalidatePath('/');
    return { success: true, message: 'Project updated successfully!', item: updatedProject };
  } catch (error) {
    console.error('Error updating project:', error);
    let errorMessage = 'An unexpected error occurred while updating the project.';
     if (error instanceof Error) {
      errorMessage = error.message;
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('title')) {
          errorMessage = 'A project with this title already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const success = await deleteProjectFromDb(id);
    if (!success) {
      return { success: false, message: 'Failed to delete project from the database.' };
    }
    revalidatePath('/projects');
    revalidatePath('/dashboard/admin/manage-projects');
    revalidatePath('/');
    return { success: true, message: 'Project deleted successfully!' };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the project.', errorDetails: error instanceof Error ? error.stack : undefined };
  }
}


export async function addNewsArticle(
  newsData: NewsArticleFormData
): Promise<ActionResult<AppNewsArticle>> {
  try {
    const existingArticleBySlug = await prisma.newsArticle.findUnique({ where: { slug: newsData.slug }});
    if (existingArticleBySlug) {
      return { success: false, message: `A news article with the slug "${newsData.slug}" already exists.`};
    }

    const dataToSave: NewsArticleCreationData = {
      ...newsData,
      published_date: newsData.publishedDate, 
      image_url: newsData.imageUrl,
      data_ai_hint: newsData.dataAiHint,
    };

    const newArticle = await saveNewsArticleToDb(dataToSave);
    if (!newArticle) {
      return { success: false, message: 'Failed to save news article to the database.' };
    }

    revalidatePath('/news');
    revalidatePath(`/news/${newArticle.slug}`);
    revalidatePath('/dashboard/admin/manage-news');
    revalidatePath('/'); 
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

export async function updateNewsArticle(
  id: string,
  newsData: NewsArticleFormData
): Promise<ActionResult<AppNewsArticle>> {
  try {
    if (newsData.slug) {
      const existingArticleBySlug = await prisma.newsArticle.findFirst({ 
        where: { 
          slug: newsData.slug,
          id: { not: id } 
        }
      });
      if (existingArticleBySlug) {
        return { success: false, message: `Another news article with the slug "${newsData.slug}" already exists.`};
      }
    }
    
    const dataToUpdate: Partial<NewsArticleCreationData> = {
      ...newsData,
      published_date: newsData.publishedDate,
      image_url: newsData.imageUrl,
      data_ai_hint: newsData.dataAiHint,
    };


    const updatedArticle = await updateNewsArticleInDb(id, dataToUpdate);
    if (!updatedArticle) {
      return { success: false, message: 'Failed to update news article in the database.' };
    }

    revalidatePath('/news');
    revalidatePath(`/news/${updatedArticle.slug}`); 
    revalidatePath('/dashboard/admin/manage-news');
    revalidatePath('/'); 
    return { success: true, message: 'News article updated successfully!', item: updatedArticle };
  } catch (error) {
    console.error('Error updating news article:', error);
    let errorMessage = 'An unexpected error occurred while updating the news article.';
     if (error instanceof Error) {
      errorMessage = error.message;
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('slug')) {
          errorMessage = 'A news article with this slug already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}


export async function deleteNewsArticle(id: string): Promise<ActionResult> {
  try {
    const success = await deleteNewsArticleFromDb(id);
    if (!success) {
      return { success: false, message: 'Failed to delete news article from the database.' };
    }

    revalidatePath('/news');
    revalidatePath('/dashboard/admin/manage-news');
    revalidatePath('/');
    return { success: true, message: 'News article deleted successfully!' };
  } catch (error) {
    console.error('Error deleting news article:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the news article.', errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

