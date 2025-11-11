// ** TanStack Query hooks for quiz attempt operations **

// ** TanStack Query Imports **
import { useMutation } from '@tanstack/react-query';

// ** API Client Imports **
import { apiClient } from '../lib/api-client';

export function useStartAttempt() {
  return useMutation({
    mutationFn: (quizId: number) => apiClient.startAttempt(quizId),
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({ 
      attemptId, 
      questionId, 
      value 
    }: { 
      attemptId: number; 
      questionId: number; 
      value: string;
    }) => apiClient.submitAnswer(attemptId, questionId, value),
  });
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: (attemptId: number) => apiClient.submitAttempt(attemptId),
  });
}

export function useRecordEvent() {
  return useMutation({
    mutationFn: ({ 
      attemptId, 
      event 
    }: { 
      attemptId: number; 
      event: string;
    }) => apiClient.recordEvent(attemptId, event),
  });
}

