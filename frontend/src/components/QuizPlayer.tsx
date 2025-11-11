// ** Quiz Player - Take quiz with navigation and answer submission **

// ** React Imports **
import { useState, useEffect, useCallback } from 'react';

// ** Hooks Imports **
import { useStartAttempt, useSubmitAnswer, useSubmitAttempt } from '../hooks/use-attempts';
import { useAntiCheat } from '../hooks/use-anti-cheat';

// ** Type Definitions **
import type { Attempt, Question } from '../types/quiz';

// ** CSS Imports **
import './QuizPlayer.css';

interface QuizPlayerProps {
  onComplete: (attemptId: number, score: number, details: Array<{
    questionId: number;
    correct: boolean;
    expected?: string;
  }>) => void;
}

export function QuizPlayer({ onComplete }: QuizPlayerProps) {
  const [quizId, setQuizId] = useState('');
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const startAttempt = useStartAttempt();
  const submitAnswer = useSubmitAnswer();
  const submitAttempt = useSubmitAttempt();
  
  const antiCheat = useAntiCheat(attempt?.id || null, !!attempt);

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = useCallback(async () => {
    if (!attempt) return;

    setShowConfirmModal(false);

    try {
      const result = await submitAttempt.mutateAsync(attempt.id);
      onComplete(attempt.id, result.score, result.details);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  }, [attempt, submitAttempt, onComplete]);

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  // Timer effect
  useEffect(() => {
    if (!attempt || !attempt.quiz.timeLimitSeconds || timeRemaining === null) return;

    if (timeRemaining <= 0) {
      handleConfirmSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, timeRemaining, handleConfirmSubmit]);

  const handleStartQuiz = async () => {
    const id = Number(quizId);
    if (isNaN(id) || id <= 0) {
      alert('Please enter a valid quiz ID');
      return;
    }

    try {
      const attemptData = await startAttempt.mutateAsync(id);
      setAttempt(attemptData);
      if (attemptData.quiz.timeLimitSeconds) {
        setTimeRemaining(attemptData.quiz.timeLimitSeconds);
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start quiz. Please check the quiz ID and try again.';
      alert(errorMessage);
    }
  };

  const handleAnswerChange = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => new Map(prev).set(questionId, value));
    
    // Auto-save answer
    if (attempt) {
      submitAnswer.mutate({ attemptId: attempt.id, questionId, value });
    }
  }, [attempt, submitAnswer]);

  const handleNext = () => {
    if (attempt && currentQuestionIndex < attempt.quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Quiz ID input screen
  if (!attempt) {
    return (
      <div className="quiz-player">
        <div className="quiz-start">
          <h1>Start Quiz</h1>
          <div className="form-group">
            <label htmlFor="quizId">Enter Quiz ID</label>
            <input
              id="quizId"
              type="text"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              placeholder="e.g., 1"
              onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
            />
          </div>
          <button
            onClick={handleStartQuiz}
            disabled={startAttempt.isPending}
            className="btn btn-primary btn-large"
          >
            {startAttempt.isPending ? 'Loading...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / attempt.quiz.questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <div className="quiz-player">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{attempt.quiz.title}</h1>
          <p>{attempt.quiz.description}</p>
        </div>
        
        {timeRemaining !== null && (
          <div className={`timer ${timeRemaining < 60 ? 'timer-warning' : ''}`}>
            <span className="timer-label">Time Remaining:</span>
            <span className="timer-value">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          Question {currentQuestionIndex + 1} of {attempt.quiz.questions.length}
          <span className="answered-count">({answeredCount} answered)</span>
        </div>
      </div>

      <div className="question-container">
        <QuestionView
          question={currentQuestion}
          value={answers.get(currentQuestion.id) || ''}
          onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          onPaste={antiCheat.handlePaste}
        />
      </div>

      <div className="quiz-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary"
        >
          ← Previous
        </button>

        <div className="nav-center">
          {currentQuestionIndex === attempt.quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitClick}
              disabled={submitAttempt.isPending}
              className="btn btn-primary btn-large"
            >
              {submitAttempt.isPending ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button onClick={handleNext} className="btn btn-primary">
              Next →
            </button>
          )}
        </div>

        <div className="nav-spacer" />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmModal
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
          answeredCount={answeredCount}
          totalQuestions={attempt.quiz.questions.length}
        />
      )}
    </div>
  );
}

interface QuestionViewProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
}

function QuestionView({ question, value, onChange, onPaste }: QuestionViewProps) {
  return (
    <div className="question-view">
      <h2 className="question-prompt">{question.prompt}</h2>

      {question.codeSnippet && (
        <pre className="code-snippet">
          <code>{question.codeSnippet}</code>
        </pre>
      )}

      {question.type === 'mcq' && question.options && (
        <div className="answer-options">
          {question.options.map((option, index) => (
            <label key={index} className="option-label">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={String(index)}
                checked={value === String(index)}
                onChange={(e) => onChange(e.target.value)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'short' && (
        <div className="answer-input">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={onPaste}
            placeholder="Type your answer here"
            className="short-answer-input"
          />
        </div>
      )}
    </div>
  );
}

interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  answeredCount: number;
  totalQuestions: number;
}

function ConfirmModal({ onConfirm, onCancel, answeredCount, totalQuestions }: ConfirmModalProps) {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submit Quiz?</h2>
        </div>
        
        <div className="modal-body">
          <p className="modal-warning">
            Are you sure you want to submit your quiz? This action cannot be undone.
          </p>
          
          <div className="modal-stats">
            <div className="stat-item">
              <span className="stat-label">Answered:</span>
              <span className="stat-value stat-answered">{answeredCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unanswered:</span>
              <span className="stat-value stat-unanswered">{unansweredCount}</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <p className="modal-hint">
              ⚠️ You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
            </p>
          )}
        </div>
        
        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary">
            Yes, Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

