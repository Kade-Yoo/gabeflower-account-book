import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function AddLedger() {
  const [nickname, setNickname] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cardStyle = { textAlign: 'center' as const, width: '100%', maxWidth: 430, minWidth: 320, margin: '40px auto', padding: '2.5rem 2rem', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', background: '#fff' };
  const inputStyle = {
    background: '#f6f8fa', border: 'none', borderRadius: 16, padding: '1.1rem', fontSize: '1.1rem', marginBottom: 18, width: '100%', color: '#22223b', fontWeight: 500, outline: 'none', boxSizing: 'border-box' as const
  };
  const buttonStyle = {
    width: '100%', height: 56, borderRadius: 16, background: '#646cff', color: '#fff', fontWeight: 700, fontSize: '1.2rem', border: 'none', marginTop: 10, marginBottom: 8, cursor: 'pointer', letterSpacing: 1
  };

  const validateNickname = (nickname: string) => {
    return /^[A-Za-z0-9가-힣]{2,12}$/.test(nickname);
  };
  const validateAmount = (amount: string) => {
    return /^\d+$/.test(amount) && Number(amount) > 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateNickname(nickname)) {
      setError('닉네임은 2~12자, 한글/영문/숫자만 입력 가능합니다.');
      return;
    }
    if (!validateAmount(totalAmount)) {
      setError('총금액은 0보다 큰 정수만 입력 가능합니다.');
      return;
    }
    setLoading(true);
    try {
      // fetch: CORS 정책은 백엔드에서 허용 origin을 명확히 제한해야 안전합니다.
      const res = await fetch('/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          total_amount: Number(totalAmount),
          start_date: startDate,
        }),
      });
      if (!res.ok) {
        let data;
        try { data = await res.json(); } catch { data = {}; }
        throw new Error(data.detail || '등록 실패');
      }
      setRegistered(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'rgb(245,246,250)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-rounded" style={{ textAlign: 'center' as const, margin: '40px auto', padding: '2.5rem 2rem', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 8 }} aria-label="뒤로가기">
            <FiArrowLeft size={28} color="#646cff" />
          </button>
          <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#22223b' }}>장부 추가</span>
        </div>
        {error && <div className="text-error">{error}</div>}
        {loading && <div className="text-body">로딩 중...</div>}
        {!registered ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <h2 className="title-sub" style={{ textAlign: 'left', marginBottom: 24 }}>닉네임/총금액/시작일 입력</h2>
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
              name="nickname"
              style={inputStyle}
              autoComplete="off"
            />
            <input
              type="number"
              placeholder="총금액"
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value)}
              required
              name="totalAmount"
              style={inputStyle}
              autoComplete="off"
            />
            <DatePicker
              selected={dateObj}
              onChange={d => {
                setDateObj(d);
                setStartDate(d ? d.toISOString().slice(0, 10) : '');
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText="시작일 선택"
              className="custom-datepicker"
              required
              autoComplete="off"
              popperPlacement="bottom"
              popperModifiers={[]}
              wrapperClassName="datepicker-wrapper"
              showPopperArrow={false}
            />
            <button type="submit" style={buttonStyle}>등록</button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div className="text-body" style={{ marginBottom: 24 }}>장부가 성공적으로 추가되었습니다.</div>
            <button className="btn-main" style={{ width: '100%' }} onClick={() => navigate('/')}>홈으로</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddLedger; 