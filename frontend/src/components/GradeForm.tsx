import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

interface GradeFormProps {
  onSubmit: (url: string, answers: Record<string, string>) => void;
  isLoading: boolean;
}

export function GradeForm({ onSubmit, isLoading }: GradeFormProps) {
  const [url, setUrl] = useState('');
  // 10 answers for the Biology worksheet based on user prompt
  const [answers, setAnswers] = useState<Record<string, string>>({
    '1': '', '2': '', '3': '', '4': '', '5': '',
    '6': '', '7': '', '8': '', '9': '', '10': ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onSubmit(url, answers);
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-panel">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="sheetUrl">Link Google Sheet (Public)</label>
          <input
            id="sheetUrl"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Đáp án chuẩn (Phiếu học tập môn Sinh học)</label>
          <div className="answers-grid">
            {Object.keys(answers).map((key) => (
              <div key={key} className="answer-input-wrapper">
                <span>{key}</span>
                <input
                  type="text"
                  value={answers[key]}
                  onChange={(e) => handleAnswerChange(key, e.target.value)}
                  placeholder={`Câu ${key}`}
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isLoading || !url}
        >
          {isLoading ? (
            <>
              <Loader2 className="spinner" size={20} />
              Đang chấm điểm...
            </>
          ) : (
            <>
              Chấm Điểm Tự Động <Send size={18} style={{ marginLeft: '8px' }} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
