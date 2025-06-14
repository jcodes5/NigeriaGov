"use server";

import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import { addFeedbackToProject, getProjectById } from './data';
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
    // 1. Save feedback (mock saving for now)
    const newFeedbackData: Omit<Feedback, 'id' | 'createdAt' | 'projectId'> = {
      userName: formData.userName,
      comment: formData.comment,
      rating: formData.rating,
    };
    
    const savedFeedback = addFeedbackToProject(projectId, newFeedbackData);

    if (!savedFeedback) {
      return { success: false, message: "Failed to save feedback." };
    }

    // 2. Get sentiment summary using GenAI flow
    const sentimentInput: SummarizeFeedbackSentimentInput = {
      feedback: formData.comment,
    };
    const sentimentOutput = await summarizeFeedbackSentiment(sentimentInput);
    
    // Attach sentiment summary to the feedback object (if your data model supports it)
    // For this example, we'll assume it's stored, or just return it.
    // In a real app, you'd update the stored feedback with this summary.
    savedFeedback.sentimentSummary = sentimentOutput.sentimentSummary;

    // Simulate updating the project's feedback list with the new sentiment summary
    const project = getProjectById(projectId);
    if (project && project.feedback) {
        const feedbackIndex = project.feedback.findIndex(f => f.id === savedFeedback.id);
        if (feedbackIndex !== -1) {
            project.feedback[feedbackIndex].sentimentSummary = sentimentOutput.sentimentSummary;
        }
    }


    // 3. Revalidate path to update UI
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects'); // If projects list page shows feedback counts/summaries

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
