import React, { useState } from 'react';
import { Loader2, ArrowRight, ArrowLeft, Upload, CheckCircle, Plus, Minus } from 'lucide-react';

interface GradeFormProps {
  onSubmit: (sheetFile: File, studentFile: File, answers: Record<string, string>) => void;
  isLoading: boolean;
}

export function GradeForm({ onSubmit, isLoading }: GradeFormProps) {
  const [step, setStep] = useState(1);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  
  // Khởi tạo sẵn 8 đáp án mặc định
  const [answers, setAnswers] = useState<Record<string, string>>({
    '1': 'Thực quản', 
    '2': 'Biến đổi thức ăn', 
    '3': 'Co bóp', 
    '4': 'Ruột non', 
    '5': 'Máu',
    '6': 'Ruột già',
    '7': 'Các chất khí',
    '8': 'Hậu môn'
  });

  const handleNext = () => {
    if (!sheetFile) return alert("Chọn file đề bài trước nhé!");
    setStep(2);
  };

  const onFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentFile) onSubmit(sheetFile!, studentFile, answers);
  };

  return (
    <div style={{ width: '900px', margin: 'auto', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      
      {/* Tiêu đề từng bước */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{step === 1 ? "Bước 1: Cài đặt đề & Đáp án" : "Bước 2: Tải bài học sinh"}</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>{step === 1 ? "Tải file đề bài và nhập đáp án chuẩn" : "Tải file bài làm của các nhóm để chấm"}</p>
      </div>

      {step === 1 ? (
        <div>
          {/* Upload File Đề */}
          <div style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <input type="file" accept=".csv" id="f1" hidden onChange={e => setSheetFile(e.target.files?.[0] || null)} />
            <label htmlFor="f1" style={{ cursor: 'pointer' }}>
              {sheetFile ? <CheckCircle color="#10b981" size={32} /> : <Upload color="#666" size={32} />}
              <div style={{ marginTop: '8px', fontWeight: 500 }}>{sheetFile ? sheetFile.name : "Chọn file Đề bài (.csv)"}</div>
            </label>
          </div>

          {/* Nhập đáp án nhanh */}
          <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 700, color: '#333' }}>Đáp án chuẩn ({Object.keys(answers).length} câu)</span>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Nút Giảm - Màu đỏ nhạt */}
                <button 
                  type="button" 
                  onClick={() => setAnswers(prev => {
                    const keys = Object.keys(prev);
                    if (keys.length <= 1) return prev;
                    const newAns = {...prev}; delete newAns[keys[keys.length-1]];
                    return newAns;
                  })}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ffccc7', 
                    background: '#fff1f0', color: '#ff4d4f', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', transition: '0.2s', outline: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#ffccc7'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#fff1f0'}
                >
                  <Minus size={18} strokeWidth={3} />
                </button>

                {/* Nút Tăng - Màu xanh nhạt */}
                <button 
                  type="button" 
                  onClick={() => setAnswers(prev => { 
                    const nextId = Object.keys(prev).length + 1;
                    return {...prev, [nextId]: ''};
                  })}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #b7eb8f', 
                    background: '#f6ffed', color: '#52c41a', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', transition: '0.2s', outline: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#b7eb8f'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f6ffed'}
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Điều chỉnh lưới grid thành 4 cột thay vì 5 cột để 8 câu xếp thành 2 dòng đẹp mắt */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {Object.keys(answers).map(k => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#999', textAlign: 'center', fontWeight: 'bold' }}>Câu {k}</span>
                  <input 
                    placeholder="..." 
                    value={answers[k]} 
                    onChange={e => setAnswers({...answers, [k]: e.target.value})}
                    style={{ 
                      width: '100%', padding: '8px 4px', textAlign: 'center', borderRadius: '8px', 
                      border: '1px solid #ddd', fontSize: '0.9rem', fontWeight: '600', outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                  />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleNext} disabled={!sheetFile} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Tiếp tục <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
          </button>
        </div>
      ) : (
        <form onSubmit={onFinish}>
          <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div style={{width: '100%', border: '2px dashed #ddd', borderRadius: '12px', textAlign: 'center' }}>
            <input type="file" accept=".csv" id="f2" hidden onChange={e => setStudentFile(e.target.files?.[0] || null)} />
            <label htmlFor="f2" style={{ cursor: 'pointer' }}>
              <div style={{ marginTop: '30px'}}></div>
              {studentFile ? <CheckCircle  color="#10b981" size={32} /> : <Upload color="#666" size={32} />}
              <div style={{ marginTop: '8px', marginBottom: '30px', fontWeight: 600 }}>{studentFile ? studentFile.name : "Chọn file Bài làm học sinh (.zip)"}</div>
            </label>
          </div>

          <button type="submit" disabled={isLoading || !studentFile} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Xác nhận & Chấm điểm"}
          </button>
        </form>
      )}
    </div>
  );
}