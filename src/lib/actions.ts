
"use server";

import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import { addFeedbackToProject, deleteUserById as removeUserFromSupabase } from './data'; // Removed getProjectById as it's async now and logic will change
import type { Feedback } from '@/types';

export interface SubmitFeedbackResult {
  success: boolean;
  message: string;
  feedback?: Feedback; // This will be the Feedback object returned from Supabase
  sentimentSummary?: string;
}

export async function submitProjectFeedback(
  projectId: string,
  formData: { userName: string; comment: string; rating?: number; userId?: string; } // Added userId
): Promise<SubmitFeedbackResult> {
  try {
    // 1. Get sentiment summary using GenAI flow FIRST (optional, could be after saving)
    const sentimentInput: SummarizeFeedbackSentimentInput = {
      feedback: formData.comment,
    };
    const sentimentOutput = await summarizeFeedbackSentiment(sentimentInput);
    
    // 2. Prepare feedback data for Supabase
    const feedbackToSave = {
      userName: formData.userName,
      comment: formData.comment,
      rating: formData.rating,
      sentimentSummary: sentimentOutput.sentimentSummary,
      userId: formData.userId, // Include if available
    };

    // 3. Save feedback to Supabase
    const savedFeedback = await addFeedbackToProject(projectId, feedbackToSave);

    if (!savedFeedback) {
      return { success: false, message: "Failed to save feedback to the database." };
    }

    // 4. Revalidate paths
    revalidatePath(`/projects/${projectId}`); // Revalidate the specific project page
    // Consider revalidating other paths if feedback lists are displayed elsewhere broadly
    revalidatePath('/dashboard/admin/manage-feedback'); 
    revalidatePath(`/dashboard/user/feedback`); // If user feedback page exists

    return {
      success: true,
      message: 'Feedback submitted successfully!',
      feedback: savedFeedback, // Return the feedback object from Supabase
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
    // This check is fine as is, assuming user IDs like "admin1" are not UUIDs from Supabase
    if (userId === "admin1") { 
      return { success: false, message: "Cannot delete the primary mock admin account." };
    }

    const { success, error } = await removeUserFromSupabase(userId);

    if (success) {
      revalidatePath("/dashboard/admin/manage-users");
      return { success: true, message: "User deleted successfully." };
    } else {
      console.error("Supabase delete error:", error);
      return { success: false, message: `Failed to delete user: ${error?.message || 'Unknown error'}` };
    }
  } catch (error) {
    console.error('Error in deleteUser server action:', error);
    let errorMessage = 'An unexpected error occurred while deleting the user.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}
