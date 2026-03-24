import { Layout } from "lucide-react";

export const Header = () => (
  <header style={{
    position: 'sticky',
    top: 0,
    zIndex: 1000, 
    background: '#d2cbeeff',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #f1f5f9',
    padding: '0 24px',
    width: '1050px', // Đảm bảo chiếm hết chiều ngang,
    borderRadius: '12px',
    marginBottom: '30px',
  }}>
    <div style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#4f46e5' }}>
        <Layout size={20} /> <span style={{ fontSize: '1.1rem' }}>EduGrade</span>
      </div>
    </div>
  </header>
);