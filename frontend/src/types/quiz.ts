// Core domain types for the Quiz Maker application

export type QuestionType = 'mcq' | 'short' | 'code';

export interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitSeconds?: number;
  isPublished: boolean;
  createdAt: string;
  questions?: Question[];
}

export interface Question {
  id: number;
  quizId: number;
  type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer?: string | number;
  position: number;
}

export interface CreateQuizPayload {
  title: string;
  description: string;
  timeLimitSeconds?: number;
  isPublished: boolean;
}

export interface CreateQuestionPayload {
  type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer?: string | number;
  position?: number;
}

export interface Attempt {
  id: number;
  quizId: number;
  startedAt: string;
  submittedAt: string | null;
  answers: Answer[];
  quiz: {
    id: number;
    title: string;
    description: string;
    timeLimitSeconds?: number;
    questions: Question[];
  };
}

export interface Answer {
  questionId: number;
  value: string;
}

export interface SubmitResult {
  score: number;
  details: QuestionResult[];
}

export interface QuestionResult {
  questionId: number;
  correct: boolean;
  expected?: string;
}

export interface AntiCheatEvent {
  type: 'blur' | 'focus' | 'paste';
  timestamp: number;
}

export interface AntiCheatSummary {
  tabSwitches: number;
  pasteEvents: number;
  events: AntiCheatEvent[];
}

