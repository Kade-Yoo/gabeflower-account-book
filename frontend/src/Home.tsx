import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'rgb(245,246,250)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-rounded" style={{ textAlign: 'center' as const, margin: '40px auto', padding: '2.5rem 2rem', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', background: '#fff' }}>
        <h1 className="title-main" style={{ marginBottom: 12 }}>가비화 장부</h1>
        <p className="text-body" style={{ marginBottom: 32 }}>원하는 기능을 선택하세요.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
          <button className="btn-main" style={{ maxWidth: 390, width: '100%' }} onClick={() => navigate('/add')}>장부 추가</button>
          <button className="btn-main" style={{ maxWidth: 390, width: '100%' }} onClick={() => navigate('/add-entry')}>내역 추가</button>
          <button className="btn-main" style={{ maxWidth: 390, width: '100%' }} onClick={() => navigate('/view-ledger')}>내역 확인</button>
        </div>
      </div>
    </div>
  );
}

export default Home; 