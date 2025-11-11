// ** API client with typed methods and error handling **

import type { Quiz, Question, Attempt, SubmitResult, CreateQuizPayload, CreateQuestionPayload } from '../types/quiz';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'dev-token';

export class APIError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.error || 'Request failed',
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  // Quiz endpoints
  listQuizzes: () => 
    fetchAPI<Quiz[]>('/quizzes'),
  
  getQuiz: (id: number) => 
    fetchAPI<Quiz>(`/quizzes/${id}`),
  
  createQuiz: (data: CreateQuizPayload) => 
    fetchAPI<Quiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateQuiz: (id: number, data: Partial<CreateQuizPayload>) => 
    fetchAPI<Quiz>(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Question endpoints
  createQuestion: (quizId: number, data: CreateQuestionPayload) => 
    fetchAPI<Question>(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateQuestion: (id: number, data: Partial<CreateQuestionPayload>) => 
    fetchAPI<Question>(`/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  deleteQuestion: (id: number) => 
    fetchAPI<void>(`/questions/${id}`, {
      method: 'DELETE',
    }),

  // Attempt endpoints
  startAttempt: (quizId: number) => 
    fetchAPI<Attempt>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    }),
  
  submitAnswer: (attemptId: number, questionId: number, value: string) => 
    fetchAPI<{ ok: boolean }>(`/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, value }),
    }),
  
  submitAttempt: (attemptId: number) => 
    fetchAPI<SubmitResult>(`/attempts/${attemptId}/submit`, {
      method: 'POST',
    }),
  
  recordEvent: (attemptId: number, event: string) => 
    fetchAPI<{ ok: boolean }>(`/attempts/${attemptId}/events`, {
      method: 'POST',
      body: JSON.stringify({ event }),
    }),
};

