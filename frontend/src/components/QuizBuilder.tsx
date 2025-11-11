// ** Quiz Builder - Create and manage quizzes with questions **

// ** React Imports **
import { useState, useReducer } from 'react';

// ** Hooks Imports **
import { useCreateQuiz, useCreateQuestion } from '../hooks/use-quizzes';

// ** Type Definitions **
import type { CreateQuestionPayload, QuestionType } from '../types/quiz';

// ** CSS Imports **
import './QuizBuilder.css';

type QuestionFormState = CreateQuestionPayload & { tempId: string };

type QuestionAction =
  | { type: 'ADD_QUESTION'; payload: QuestionFormState }
  | { type: 'REMOVE_QUESTION'; tempId: string }
  | { type: 'UPDATE_QUESTION'; tempId: string; payload: Partial<QuestionFormState> }
  | { type: 'RESET' };

function questionsReducer(state: QuestionFormState[], action: QuestionAction): QuestionFormState[] {
  switch (action.type) {
    case 'ADD_QUESTION':
      return [...state, action.payload];
    
    case 'REMOVE_QUESTION':
      return state.filter(q => q.tempId !== action.tempId);
    
    case 'UPDATE_QUESTION':
      return state.map(q => 
        q.tempId === action.tempId ? { ...q, ...action.payload } : q
      );
    
    case 'RESET':
      return [];
    
    default:
      return state;
  }
}

export function QuizBuilder() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | undefined>(300);
  const [questions, dispatch] = useReducer(questionsReducer, []);
  const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);

  const createQuiz = useCreateQuiz();
  const createQuestion = useCreateQuestion();

  const handleAddQuestion = () => {
    const newQuestion: QuestionFormState = {
      tempId: Date.now().toString(),
      type: 'mcq',
      prompt: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      position: questions.length,
    };
    dispatch({ type: 'ADD_QUESTION', payload: newQuestion });
  };

  const handleRemoveQuestion = (tempId: string) => {
    dispatch({ type: 'REMOVE_QUESTION', tempId });
  };

  const handleUpdateQuestion = (tempId: string, updates: Partial<QuestionFormState>) => {
    dispatch({ type: 'UPDATE_QUESTION', tempId, payload: updates });
  };

  const handleSaveQuiz = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Title and description are required');
      return;
    }

    if (questions.length < 2) {
      alert('Please add at least 2 questions');
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.prompt.trim()) {
        alert('All questions must have a prompt');
        return;
      }
      if (q.type === 'mcq') {
        const validOptions = q.options?.filter(o => o.trim()) || [];
        if (validOptions.length < 2) {
          alert('Multiple choice questions must have at least 2 options');
          return;
        }
      }
      if (q.type === 'short' && (q.correctAnswer === undefined || q.correctAnswer === '')) {
        alert('Short answer questions must have a correct answer');
        return;
      }
    }

    try {
      // Create quiz
      const quiz = await createQuiz.mutateAsync({
        title,
        description,
        timeLimitSeconds,
        isPublished: true,
      });

      // Create questions
      for (const q of questions) {
        const payload: CreateQuestionPayload = {
          type: q.type,
          prompt: q.prompt,
          codeSnippet: q.codeSnippet,
          position: q.position,
        };

        if (q.type === 'mcq') {
          payload.options = q.options?.filter(o => o.trim());
          payload.correctAnswer = Number(q.correctAnswer);
        } else if (q.type === 'short') {
          payload.correctAnswer = String(q.correctAnswer);
        }

        await createQuestion.mutateAsync({ quizId: quiz.id, data: payload });
      }

      setCreatedQuizId(quiz.id);
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz. Please try again.');
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setTimeLimitSeconds(300);
    dispatch({ type: 'RESET' });
    setCreatedQuizId(null);
  };

  if (createdQuizId) {
    return (
      <div className="quiz-builder">
        <div className="success-message">
          <h2>✓ Quiz Created Successfully!</h2>
          <p className="quiz-id">Quiz ID: <strong>{createdQuizId}</strong></p>
          <p className="instruction">Share this ID with quiz takers to let them start the quiz.</p>
          <button onClick={handleReset} className="btn btn-primary">
            Create Another Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-builder">
      <h1>Create Quiz</h1>

      <div className="form-section">
        <h2>Quiz Details</h2>
        
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., JavaScript Fundamentals"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the quiz content"
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="timeLimit">Time Limit (seconds)</label>
          <input
            id="timeLimit"
            type="number"
            value={timeLimitSeconds || ''}
            onChange={(e) => setTimeLimitSeconds(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Optional"
            min="30"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h2>Questions ({questions.length})</h2>
          <button onClick={handleAddQuestion} className="btn btn-secondary">
            + Add Question
          </button>
        </div>

        {questions.length === 0 && (
          <p className="empty-state">No questions added yet. Add at least 2 questions to continue.</p>
        )}

        {questions.map((question, index) => (
          <QuestionForm
            key={question.tempId}
            question={question}
            index={index}
            onUpdate={(updates) => handleUpdateQuestion(question.tempId, updates)}
            onRemove={() => handleRemoveQuestion(question.tempId)}
          />
        ))}
      </div>

      <div className="form-actions">
        <button
          onClick={handleSaveQuiz}
          disabled={createQuiz.isPending || createQuestion.isPending}
          className="btn btn-primary btn-large"
        >
          {createQuiz.isPending || createQuestion.isPending ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </div>
  );
}

interface QuestionFormProps {
  question: QuestionFormState;
  index: number;
  onUpdate: (updates: Partial<QuestionFormState>) => void;
  onRemove: () => void;
}

function QuestionForm({ question, index, onUpdate, onRemove }: QuestionFormProps) {
  const handleTypeChange = (type: QuestionType) => {
    if (type === 'mcq') {
      onUpdate({
        type,
        options: ['', '', '', ''],
        correctAnswer: 0,
      });
    } else if (type === 'short') {
      onUpdate({
        type,
        options: undefined,
        correctAnswer: '',
      });
    }
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    onUpdate({ options: [...(question.options || []), ''] });
  };

  const handleRemoveOption = (optionIndex: number) => {
    const newOptions = question.options?.filter((_, i) => i !== optionIndex);
    onUpdate({ options: newOptions });
    // Adjust correct answer if needed
    if (question.type === 'mcq' && Number(question.correctAnswer) >= (newOptions?.length || 0)) {
      onUpdate({ correctAnswer: Math.max(0, (newOptions?.length || 1) - 1) });
    }
  };

  return (
    <div className="question-form">
      <div className="question-header">
        <h3>Question {index + 1}</h3>
        <button onClick={onRemove} className="btn btn-danger btn-small">
          Remove
        </button>
      </div>

      <div className="form-group">
        <label>Question Type *</label>
        <div className="question-type-options">
          <label className="question-type-option">
            <input
              type="radio"
              name={`type-${question.tempId}`}
              value="mcq"
              checked={question.type === 'mcq'}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            />
            <span className="question-type-label">Multiple Choice</span>
          </label>
          <label className="question-type-option">
            <input
              type="radio"
              name={`type-${question.tempId}`}
              value="short"
              checked={question.type === 'short'}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            />
            <span className="question-type-label">Short Answer</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Prompt *</label>
        <textarea
          value={question.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Enter your question"
          rows={2}
          required
        />
      </div>

      <div className="form-group">
        <label>Code Snippet (optional)</label>
        <textarea
          value={question.codeSnippet || ''}
          onChange={(e) => onUpdate({ codeSnippet: e.target.value })}
          placeholder="Enter code snippet to display"
          rows={4}
          className="code-input"
        />
      </div>

      {question.type === 'mcq' && (
        <>
          <div className="form-group">
            <label>Answer Choices *</label>
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="option-input-group">
                <input
                  type="radio"
                  name={`correct-${question.tempId}`}
                  checked={Number(question.correctAnswer) === optionIndex}
                  onChange={() => onUpdate({ correctAnswer: optionIndex })}
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                {(question.options?.length || 0) > 2 && (
                  <button
                    onClick={() => handleRemoveOption(optionIndex)}
                    className="btn btn-danger btn-small"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button onClick={handleAddOption} className="btn btn-secondary btn-small">
              + Add Option
            </button>
          </div>
        </>
      )}

      {question.type === 'short' && (
        <div className="form-group">
          <label>Correct Answer * (case-insensitive)</label>
          <input
            type="text"
            value={String(question.correctAnswer || '')}
            onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
            placeholder="Enter the correct answer"
            required
          />
        </div>
      )}
    </div>
  );
}

