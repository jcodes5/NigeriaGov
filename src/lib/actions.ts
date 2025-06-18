
"use server";

import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import { addFeedbackToProject, getProjectById, deleteUserById as removeUserFromSupabase } from './data';
import type { Feedback } from '@/types';

export interface SubmitFeedbackResult {
  success: boolean;
  message: string;
  feedback?: Feedback;
  sentimentSummary?: string;
}

export async function submitProjectFeedback(
  projectId: string,
  formData: { userName: string; comment: string; rating?: number }
): Promise<SubmitFeedbackResult> {
  try {
    // 1. Save feedback (mock saving for now, will be Supabase call)
    const newFeedbackData: Omit<Feedback, 'id' | 'createdAt' | 'projectId'> = {
      userName: formData.userName,
      comment: formData.comment,
      rating: formData.rating,
    };
    
    // TODO: Replace with Supabase insert for feedback
    const savedFeedback = addFeedbackToProject(projectId, newFeedbackData);

    if (!savedFeedback) {
      return { success: false, message: "Failed to save feedback." };
    }

    // 2. Get sentiment summary using GenAI flow
    const sentimentInput: SummarizeFeedbackSentimentInput = {
      feedback: formData.comment,
    };
    const sentimentOutput = await summarizeFeedbackSentiment(sentimentInput);
    
    savedFeedback.sentimentSummary = sentimentOutput.sentimentSummary;

    // TODO: Update the feedback record in Supabase with sentimentSummary
    const project = getProjectById(projectId); // This will also need to become async if projects are from Supabase
    if (project && project.feedback) {
        const feedbackIndex = project.feedback.findIndex(f => f.id === savedFeedback.id);
        if (feedbackIndex !== -1) {
            project.feedback[feedbackIndex].sentimentSummary = sentimentOutput.sentimentSummary;
        }
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    revalidatePath('/dashboard/admin/manage-feedback');

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
    // Prevent deleting the main admin user for demo purposes if still using mock auth ID "admin1"
    // This check might need adjustment if Supabase auth is fully integrated
    if (userId === "admin1") { 
      return { success: false, message: "Cannot delete the primary admin account (mock)." };
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
