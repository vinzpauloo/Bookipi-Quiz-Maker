// ** React Imports **
import { useState } from 'react';

// ** Component Imports **
import { QuizBuilder } from './components/QuizBuilder';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResults } from './components/QuizResults';
import { useAntiCheat } from './hooks/use-anti-cheat';

// ** CSS Imports **
import './App.css';

// ** Type Definitions **
type AppView = 'home' | 'builder' | 'player' | 'results';

// ** Results Data Type **
interface ResultsData {
  attemptId: number;
  score: number;
  totalQuestions: number;
  details: Array<{
    questionId: number;
    correct: boolean;
    expected?: string;
  }>;
}

// ** Main App Component **
function App() {
  // ** State Declarations **
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  
  // ** Anti-cheat Tracking **
  const antiCheat = useAntiCheat(
    currentView === 'player' ? 1 : null, // Enable only during quiz
    currentView === 'player'
  );

  // ** Quiz Completion Handler **
  const handleQuizComplete = (attemptId: number, score: number, details: ResultsData['details']) => {
    const totalQuestions = details.length;
    setResultsData({
      attemptId,
      score,
      totalQuestions,
      details,
    });
    setCurrentView('results');
  };

  // ** Retry Handler **
  const handleRetry = () => {
    antiCheat.reset();
    setResultsData(null);
    setCurrentView('home');
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>📝 Bookipi Quiz Maker</h1>
        </div>
        {currentView !== 'home' && (
          <button onClick={() => setCurrentView('home')} className="btn btn-secondary">
            ← Home
          </button>
        )}
      </nav>

      <main className="app-main">
        {currentView === 'home' && (
          <div className="home-view">
            <div className="hero">
              <h2>Welcome to Quiz Maker</h2>
              <p className="hero-subtitle">
                Create coding quizzes or take existing ones
              </p>
            </div>

            <div className="action-cards">
              <div className="action-card">
                <div className="card-icon">📚</div>
                <h3>Create Quiz</h3>
                <p>Build a new quiz with multiple choice and short answer questions</p>
                <button
                  onClick={() => setCurrentView('builder')}
                  className="btn btn-primary btn-large"
                >
                  Start Building
                </button>
              </div>

              <div className="action-card">
                <div className="card-icon">✏️</div>
                <h3>Take Quiz</h3>
                <p>Enter a quiz ID to start taking a quiz and test your knowledge</p>
                <button
                  onClick={() => setCurrentView('player')}
                  className="btn btn-primary btn-large"
                >
                  Start Quiz
                </button>
              </div>
            </div>

            <div className="features">
              <h3>Features</h3>
              <ul>
                <li>✓ Multiple question types (MCQ, Short Answer)</li>
                <li>✓ Optional code snippets for coding questions</li>
                <li>✓ Timed quizzes with countdown</li>
                <li>✓ Real-time answer saving</li>
                <li>✓ Anti-cheat tracking (focus and paste detection)</li>
                <li>✓ Detailed results with per-question feedback</li>
              </ul>
            </div>
          </div>
        )}

        {currentView === 'builder' && <QuizBuilder />}

        {currentView === 'player' && (
          <QuizPlayer onComplete={handleQuizComplete} />
        )}

        {currentView === 'results' && resultsData && (
          <QuizResults
            score={resultsData.score}
            totalQuestions={resultsData.totalQuestions}
            details={resultsData.details}
            antiCheatSummary={antiCheat.getSummary()}
            onRetry={handleRetry}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React, TanStack Query, and TypeScript</p>
      </footer>
    </div>
  );
}

export default App;
