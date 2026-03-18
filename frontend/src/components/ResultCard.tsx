import React from 'react';

interface ResultCardProps {
  groupName: string;
  score: number;
  feedbackText: string;
  audioUrl: string;
  studentAnswers?: Record<string, string>;
  studentGrades?: Record<string, string>; // Thêm trường lưu trạng thái Đúng/Sai
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function ResultCard({ 
  groupName, 
  score, 
  feedbackText, 
  audioUrl, 
  studentAnswers = {}, 
  studentGrades = {}, // Nhận dữ liệu từ props
  autoPlay = false, 
  onEnded 
}: ResultCardProps) {

  // Hàm phụ trợ để xác định màu sắc dựa trên kết quả chấm
  const getGradeStyle = (grade: string) => {
    if (!grade) return { bg: 'white', border: '#e2e8f0', text: '#1e293b', label: '#64748b' };

    const lowerGrade = grade.toLowerCase();
    if (lowerGrade.includes('sai')) {
      return { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', label: '#ef4444' }; // Đỏ
    }
    if (lowerGrade.includes('đúng')) {
      return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: '#22c55e' }; // Xanh lá
    }
    
    return { bg: 'white', border: '#e2e8f0', text: '#1e293b', label: '#64748b' };
  };

  return (
    <div className="result-card animate-slide-up" style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      border: '1px solid #f0f0f0',
      marginBottom: '20px'
    }}>
      {/* Ẩn hoàn toàn thẻ audio khỏi giao diện nhưng vẫn chạy logic */}
      {audioUrl && (
        <audio 
          src={audioUrl} 
          autoPlay={autoPlay} 
          onEnded={onEnded} 
          style={{ display: 'none' }} 
        />
      )}

      {/* Header: Tên nhóm và Điểm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a1a1a' }}>{groupName}</h3>
        {/* <span style={{ 
          background: '#eef2ff', 
          color: '#4f46e5', 
          padding: '4px 12px', 
          borderRadius: '20px', 
          fontWeight: 'bold' 
        }}>
          {score}/10
        </span> */}
      </div>

      {/* Nhận xét văn bản */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
          <span style={{ marginRight: '8px' }}>{autoPlay ? "" : "💬"}</span>
          {feedbackText}
        </p>
      </div>

      {/* HIỂN THỊ ĐÁP ÁN CHI TIẾT */}
      {Object.keys(studentAnswers).length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Bản đối soát đáp án:
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '8px',
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #f1f5f9'
          }}>
            {Object.entries(studentAnswers).map(([question, answer]) => {
              // Lấy kết quả Đúng/Sai từ studentGrades
              const grade = studentGrades[question];
              const style = getGradeStyle(grade);

              return (
                <div key={question} style={{ 
                  fontSize: '0.8rem', 
                  padding: '6px 10px', 
                  background: style.bg, 
                  borderRadius: '6px', 
                  border: `1px solid ${style.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: style.label }}>Câu {question}:</span>
                  <span style={{ color: style.text, fontWeight: 'bold' }}>
                    {answer}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}