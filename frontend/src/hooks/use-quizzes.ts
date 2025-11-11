// ** TanStack Query hooks for quiz operations **

// ** TanStack Query Imports **
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ** API Client Imports **
import { apiClient } from '../lib/api-client';

// ** Type Definitions **
import type { CreateQuizPayload, CreateQuestionPayload } from '../types/quiz';

// ** Custom Hooks **
export function useQuizzes() {
  // ** Use Query **
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: () => apiClient.listQuizzes(),
  });
}

export function useQuiz(id: number | null) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => apiClient.getQuiz(id!),
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateQuizPayload) => apiClient.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateQuizPayload> }) =>
      apiClient.updateQuiz(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: number; data: CreateQuestionPayload }) =>
      apiClient.createQuestion(quizId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateQuestionPayload> }) =>
      apiClient.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
  });
}

