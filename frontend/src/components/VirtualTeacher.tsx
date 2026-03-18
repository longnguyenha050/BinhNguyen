import { useEffect, useRef } from 'react';
import teacherThinking from '../assets/teacher-thinking.png';
import teacherHappy from '../assets/teacher-happy.png';
import thinkingSound from '../assets/teacher-voice.mp3'; 

export const VirtualTeacher = ({ status, message }: { status: string, message: string }) => {
  const audioRef = useRef(new Audio(thinkingSound));

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = false; // Cho phép chạy lặp lại

    if (status === 'grading') {
      audio.play().catch(err => console.log("Chờ tương tác người dùng để phát nhạc:", err));
    } else {
      audio.pause();
      audio.currentTime = 0; // Reset về đầu đoạn nhạc
    }

    // Cleanup: Dừng nhạc khi component bị gỡ bỏ (unmount)
    return () => {
      audio.pause();
    };
  }, [status]); // Chạy lại mỗi khi status thay đổi

  return (
    <div className="teacher-card" style={{ textAlign: 'center' }}>
      <div className="teacher-avatar" style={{ marginBottom: '1rem' }}>
        <img 
          src={status === 'grading' ? teacherThinking : teacherHappy} 
          alt="Virtual Teacher" 
          style={{ width: '75%', borderRadius: '10px' }}
        />
      </div>
      <p style={{ fontWeight: '500', color: '#4a5568', fontStyle: 'italic' }}>
        "{message}"
      </p>
    </div>
  );
}