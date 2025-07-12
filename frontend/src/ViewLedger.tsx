import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import NicknameSearch from './NicknameSearch';

interface Entry {
  date: string;
  menu: string;
  amount: number;
  note: string;
}

interface Ledger {
  nickname: string;
  total_amount: number;
  start_date: string;
  used_amount: number;
  remain_amount: number;
  entries: Entry[];
}

function ViewLedger() {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeLoading, setChargeLoading] = useState(false);
  const [chargeError, setChargeError] = useState('');

  const cardStyle = { textAlign: 'center' as const, margin: '40px auto', padding: '2.5rem 2rem', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', background: '#fff' };

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSearch = async (nickname: string) => {
    setLoading(true); setError(''); setLedger(null);
    try {
      const res = await fetch(`${API_URL}/ledger/${nickname}`);
      if (!res.ok) {
        let data; try { data = await res.json(); } catch { data = {}; }
        throw new Error(data.detail || '장부 조회 실패');
      }
      const data = await res.json();
      setLedger(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargeError('');
    if (!ledger) return;
    const amount = Number(chargeAmount);
    if (!amount || amount <= 0) {
      setChargeError('금액은 0보다 큰 정수만 입력하세요.');
      return;
    }
    setChargeLoading(true);
    try {
      const res = await fetch(`${API_URL}/ledger/${ledger.nickname}/charge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        let data; try { data = await res.json(); } catch { data = {}; }
        throw new Error(data.detail || '충전 실패');
      }
      const data = await res.json();
      setLedger(data);
      setChargeAmount('');
    } catch (err: any) {
      setChargeError(err.message);
    } finally {
      setChargeLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'rgb(245,246,250)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-rounded" style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 8 }} aria-label="뒤로가기">
            <FiArrowLeft size={28} color="#646cff" />
          </button>
          <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#22223b' }}>장부 내역 확인</span>
        </div>
        <NicknameSearch onSearch={handleSearch} loading={loading} label="닉네임으로 장부 검색" />
        {error && <div className="text-error">{error}</div>}
        {ledger && (
          <div style={{ marginTop: 32 }}>
            <div style={{ marginBottom: 24 }} className="text-body">
              <strong>닉네임:</strong> {ledger.nickname} <br />
              <strong>총금액:</strong> {ledger.total_amount} <br />
              <strong>시작일:</strong> {ledger.start_date}
            </div>
            {/* 금액 충전 UI */}
            <form onSubmit={handleCharge} style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 16, width: '100%', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              <input
                type="number"
                className="input-rounded"
                placeholder="충전 금액"
                value={chargeAmount}
                onChange={e => setChargeAmount(e.target.value)}
                min={1}
                style={{ maxWidth: 140, height: 56, marginBottom: 0 }}
                disabled={chargeLoading}
              />
              <button type="submit" className="btn-main" style={{ width: 100, minWidth: 80, height: 56, marginBottom: 0, padding: 0 }} disabled={chargeLoading}>
                {chargeLoading ? '충전 중...' : '충전'}
              </button>
            </form>
            {chargeError && <div className="text-error" style={{ marginBottom: 8 }}>{chargeError}</div>}
            {/* 사용 내역 요약 */}
            {(() => {
              const entries = ledger.entries;
              if (!entries.length) return null;
              const days = Array.from(new Set(entries.map(e => e.date)));
              const menuCount: Record<string, number> = {};
              entries.forEach(e => { menuCount[e.menu] = (menuCount[e.menu] || 0) + 1; });
              const mostMenu = Object.entries(menuCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
              // 총 사용 금액과 남은 금액 계산
              const usedAmount = entries.reduce((sum, e) => sum + e.amount, 0);
              const remainAmount = ledger.total_amount - usedAmount;
              return (
                <div style={{ marginBottom: 18, background: '#f6f8fa', borderRadius: 12, padding: '1rem 1.2rem', fontSize: '1.05rem', color: '#22223b', boxShadow: '0 1px 4px rgba(100,108,255,0.04)' }}>
                  <span style={{ fontWeight: 600 }}>{days.length}일</span> 동안, <span style={{ fontWeight: 600 }}>{entries.length}번</span> <br />
                  <span style={{ color: '#646cff', fontWeight: 700 }}>{usedAmount.toLocaleString()}원</span> 사용했고 <br />
                  가장 많이 먹은 메뉴는 <span style={{ fontWeight: 700, color: '#4b53c3' }}>{mostMenu}</span> 입니다.
                </div>
              );
            })()}
            <h2 className="title-sub">사용 내역</h2>
            <ul className="entry-list">
              {ledger.entries.map((e, i) => (
                <li className="entry-item" key={i}>
                  <span className="entry-date">{e.date}</span>
                  <span className="entry-menu">{e.menu}</span>
                  <span className="entry-amount">{e.amount}원</span>
                  <span className="entry-note">{e.note}</span>
                </li>
              ))}
            </ul>
            {/* 총 사용 금액, 남은 금액을 직접 계산해서 표시 */}
            {(() => {
              const usedAmount = ledger.entries.reduce((sum, e) => sum + e.amount, 0);
              const remainAmount = ledger.total_amount - usedAmount;
              return (
                <div style={{ marginTop: 16 }} className="text-body">
                  <strong>총 사용 금액:</strong> {usedAmount}원<br />
                  <strong>남은 금액:</strong> {remainAmount}원
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewLedger; 