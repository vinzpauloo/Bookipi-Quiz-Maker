// ** Quiz Results - Display score and anti-cheat summary **

// ** Type Definitions **
import type { AntiCheatSummary } from '../types/quiz';

// ** CSS Imports **
import './QuizResults.css';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  details: Array<{
    questionId: number;
    correct: boolean;
    expected?: string;
  }>;
  antiCheatSummary: AntiCheatSummary;
  onRetry: () => void;
}

export function QuizResults({
  score,
  totalQuestions,
  details,
  antiCheatSummary,
  onRetry,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 70;

  return (
    <div className="quiz-results">
      <div className={`results-header ${passed ? 'passed' : 'failed'}`}>
        <div className="score-circle">
          <div className="score-percentage">{percentage}%</div>
          <div className="score-label">Score</div>
        </div>
        <h1>{passed ? '🎉 Congratulations!' : 'Keep Learning!'}</h1>
        <p className="score-text">
          You answered <strong>{score}</strong> out of <strong>{totalQuestions}</strong> questions correctly
        </p>
      </div>

      <div className="results-section">
        <h2>Question Results</h2>
        <div className="question-results">
          {details.map((detail, index) => (
            <div
              key={detail.questionId}
              className={`result-item ${detail.correct ? 'correct' : 'incorrect'}`}
            >
              <div className="result-icon">
                {detail.correct ? '✓' : '✗'}
              </div>
              <div className="result-content">
                <div className="result-title">Question {index + 1}</div>
                {!detail.correct && detail.expected && (
                  <div className="result-expected">
                    Expected: <code>{detail.expected}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {antiCheatSummary.events.length > 0 && (
        <div className="results-section">
          <h2>Anti-Cheat Summary</h2>
          <div className="anti-cheat-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{antiCheatSummary.tabSwitches}</div>
                <div className="stat-label">Tab Switches</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{antiCheatSummary.pasteEvents}</div>
                <div className="stat-label">Paste Events</div>
              </div>
            </div>

            {antiCheatSummary.events.length > 0 && (
              <details className="event-details">
                <summary>View Event Timeline ({antiCheatSummary.events.length} events)</summary>
                <div className="event-timeline">
                  {antiCheatSummary.events.map((event, index) => (
                    <div key={index} className={`event-item event-${event.type}`}>
                      <span className="event-type">{event.type}</span>
                      <span className="event-time">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      <div className="results-actions">
        <button onClick={onRetry} className="btn btn-primary btn-large">
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}

