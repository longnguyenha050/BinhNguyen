import { useState } from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { GradeForm } from './components/GradeForm';
import { ResultCard } from './components/ResultCard';

interface GradeResult {
  group_name: string;
  score: number;
  feedback_text: string;
  audio_url: string;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GradeResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGradeSubmit = async (sheet_url: string, correct_answers: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('http://localhost:8000/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheet_url,
          correct_answers
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to grade sheets. Please check the URL and try again.');
      }

      const data = await response.json();
      setResults(data.results);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <Bot size={48} color="var(--primary-color)" />
      </div>
      <h1>Trợ Lý AI Chấm Điểm</h1>
      <p className="subtitle">
        Tự động chấm phiếu học tập Sinh học & sinh nhận xét bằng giọng nói truyền cảm
      </p>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <GradeForm onSubmit={handleGradeSubmit} isLoading={isLoading} />

      {results.length > 0 && (
        <div className="results-container mt-8">
          <h2 style={{ textAlign: 'center', color: 'var(--text-dark)', marginBottom: '1.5rem', fontWeight: 600 }}>
            Kết Quả Chấm Điểm
          </h2>
          {results.map((result, idx) => (
            <ResultCard 
              key={idx}
              groupName={result.group_name}
              score={result.score}
              feedbackText={result.feedback_text}
              audioUrl={result.audio_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
