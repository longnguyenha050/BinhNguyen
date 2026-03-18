import React from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface GradeResult {
  group_name: string;
  score: number;
  feedback_text: string;
  student_answers: Record<string, string>;
  student_grades: Record<string, string>;
}

interface ReportSummaryProps {
  results: GradeResult[];
  onReset: () => void;
}

export function ReportSummary({ results, onReset }: ReportSummaryProps) {
  return (
    <div className="animate-slide-up" style={{width: '500px', background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', color: '#1a1a1a', margin: '0 0 8px 0' }}>Báo Cáo Tổng Hợp</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Thống kê kết quả làm bài của toàn bộ các nhóm</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.map((result, index) => {
          // Tính toán số lượng Đúng/Sai
          let correct = 0;
          let partial = 0;
          let wrong = 0;

          Object.values(result.student_grades).forEach(grade => {
            const lowerGrade = grade?.toLowerCase() || '';
            if (lowerGrade.includes('đúng một phần')) partial++;
            else if (lowerGrade.includes('đúng')) correct++;
            else if (lowerGrade.includes('sai')) wrong++;
          });

          return (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px 24px', 
              background: '#f8fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#1e293b' }}>
                  {result.group_name}
                </h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d' }}>
                    <CheckCircle size={16} /> Đúng: {correct}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b91c1c' }}>
                    <XCircle size={16} /> Sai: {wrong}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                  {correct}/{correct + wrong + partial}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Điểm số</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={onReset}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 24px',
            background: '#4f46e5',
            color: 'white',
            border: 'none', 
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          <RefreshCw size={18} /> Chấm bài mới
        </button>
      </div>
    </div>
  );
}