
"use server";

import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import { 
  addFeedbackToProject as saveFeedbackToDb, 
  deleteUserById as removeUserFromDb,
  createUserProfileInDb, // New function for creating user profile in public.users
  getUserProfileFromDb // New function for fetching user profile
} from './data';
import type { Feedback as AppFeedback, User as AppUser } from '@/types';
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
    // Assuming summarizeFeedbackSentiment doesn't require auth and is safe to call
    const sentimentOutput = await summarizeFeedbackSentiment(sentimentInput);
    
    const feedbackToSave = {
      userName: formData.userName,
      comment: formData.comment,
      rating: formData.rating,
      sentimentSummary: sentimentOutput.sentimentSummary,
      userId: formData.userId || null, // Ensure it's null if undefined
    };

    // Use the renamed function for clarity
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
    // This check might need to be re-evaluated if "admin1" ID is a real UUID in your DB
    // For Supabase Auth, user deletion should ideally be handled via Supabase admin SDK if you need to delete the auth user too.
    // This action currently only deletes from the public.users table.
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

// New server action to synchronize user profile from Supabase Auth to our public users table
export async function syncUserProfile(
  data: { userId: string; email: string; name: string; avatarUrl?: string | null }
): Promise<{ user: AppUser | null; error: string | null }> {
  try {
    const profile = await createUserProfileInDb({
      id: data.userId, // Use Supabase Auth user ID as primary key for our public user table
      email: data.email,
      name: data.name,
      role: 'user', // Default role
      avatar_url: data.avatarUrl || null,
    });
    if (profile) {
      return { user: profile, error: null };
    }
    return { user: null, error: "Failed to create user profile." };
  } catch (error) {
    console.error("Error syncing user profile:", error);
    if (error instanceof Error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
      // Handle unique constraint violation for email - user might exist
      // Try to fetch existing profile by email if ID doesn't match
      // This logic can get complex, for now, we return a specific error
      return { user: null, error: "A user with this email may already exist. If this is you, try logging in." };
    }
     if (error instanceof Error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('PRIMARY')) {
      // Primary key conflict, user likely already exists from a previous attempt or manual entry
      const existingUser = await getUserProfileFromDb(data.userId);
      if (existingUser) return { user: existingUser, error: null }; // User already exists, consider it a success
      return { user: null, error: "User profile already exists, but could not be retrieved." };
    }
    return { user: null, error: error instanceof Error ? error.message : "An unknown error occurred during profile sync." };
  }
}

// New server action to get user profile by ID (called by AuthContext)
export async function getUserProfile(userId: string): Promise<AppUser | null> {
  try {
    const profile = await getUserProfileFromDb(userId);
    return profile;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return null;
  }
}
