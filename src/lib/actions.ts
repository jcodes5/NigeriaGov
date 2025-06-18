
"use server";

import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import { addFeedbackToProject, deleteUserById as removeUserFromDb } from './data';
import type { Feedback } from '@/types';

export interface SubmitFeedbackResult {
  success: boolean;
  message: string;
  feedback?: Feedback;
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
      userId: formData.userId,
    };

    const savedFeedback = await addFeedbackToProject(projectId, feedbackToSave);

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
    // This specific check might need to be re-evaluated if "admin1" ID is a real UUID in your DB
    if (userId === "admin1" && process.env.NODE_ENV === 'development') { // Example condition for mock admin
      return { success: false, message: "Cannot delete the primary mock/test admin account in development." };
    }

    const { success, error } = await removeUserFromDb(userId); // Renamed to removeUserFromDb

    if (success) {
      revalidatePath("/dashboard/admin/manage-users");
      return { success: true, message: "User deleted successfully." };
    } else {
      console.error("Prisma delete error:", error);
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
