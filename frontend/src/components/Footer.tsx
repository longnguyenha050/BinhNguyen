export const Footer = () => (
  <footer style={{
    padding: '24px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    marginTop: '30px', // QUAN TRỌNG: Kết hợp với Flexbox để đẩy xuống đáy
    borderRadius: '12px 12px 0 0', // Chỉ bo góc trên cho đẹp
    width: '1050px',   // Khớp với Header của bạn
    margin: '20px auto 0 auto', // Căn giữa footer
  }}>
    <div style={{
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
        © 2026 EduGrade AI. Đơn giản & Hiệu quả.
      </p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Bảo mật</a>
        <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Điều khoản</a>
      </div>
    </div>
  </footer>
);