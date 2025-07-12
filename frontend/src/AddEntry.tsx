import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import NicknameSearch from './NicknameSearch';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Ledger {
  nickname: string;
  total_amount: number;
  start_date: string;
  used_amount: number;
  remain_amount: number;
}

function AddEntry() {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entry, setEntry] = useState({ date: '', menu: '', amount: '', note: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const navigate = useNavigate();
  const [menuOptions, setMenuOptions] = useState<any[]>([]);
  const [menuMap, setMenuMap] = useState<Record<string, { price: number; category: string }>>({});
  const [date, setDate] = useState<Date | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const inputStyle = {
    background: '#f6f8fa', border: 'none', borderRadius: 16, padding: '1.1rem', fontSize: '1.1rem', marginBottom: 18, width: '100%', color: '#22223b', fontWeight: 500, outline: 'none', boxSizing: 'border-box' as const
  };
  const buttonStyle = {
    width: '100%', height: 56, borderRadius: 16, background: '#646cff', color: '#fff', fontWeight: 700, fontSize: '1.2rem', border: 'none', marginTop: 10, marginBottom: 8, cursor: 'pointer', letterSpacing: 1
  };

  useEffect(() => {
    if (!ledger) return;
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API 오류: ${res.status} - ${text}`);
        }
        const data = await res.json();
        // 카테고리별 그룹화
        const grouped: Record<string, any[]> = {};
        const map: Record<string, { price: number; category: string }> = {};
        data.forEach((item: any) => {
          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push({ value: item.name, label: item.name, price: item.price });
          map[item.name] = { price: item.price, category: item.category };
        });
        setMenuMap(map);
        setMenuOptions(
          Object.keys(grouped).map(cat => ({ label: cat, options: grouped[cat] }))
        );
      } catch (err) {
        console.error('메뉴 fetch 에러:', err);
      }
    };
    fetchMenu();
  }, [ledger]);

  useEffect(() => {
    // entry.date와 date 상태 동기화 (닉네임 재검색 시 초기화)
    if (!ledger) {
      setDate(null);
      setEntry(e => ({ ...e, date: '' }));
    }
  }, [ledger]);

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

  const validateAmount = (amount: string) => {
    return /^\d+$/.test(amount) && Number(amount) > 0;
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(''); setAddLoading(true);
    if (!validateAmount(entry.amount)) {
      setAddError('금액은 0보다 큰 정수만 입력 가능합니다.');
      setAddLoading(false);
      return;
    }
    try {
      if (!ledger) throw new Error('장부를 먼저 조회하세요.');
      const res = await fetch(`${API_URL}/entry`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: ledger.nickname,
          date: entry.date,
          menu: entry.menu,
          amount: Number(entry.amount),
          note: entry.note,
        }),
      });
      if (!res.ok) {
        let data; try { data = await res.json(); } catch { data = {}; }
        throw new Error(data.detail || '내역 추가 실패');
      }
      setEntry({ date: '', menu: '', amount: '', note: '' });
      // 사용 금액 갱신
      const refreshed = await fetch(`${API_URL}/ledger/${ledger.nickname}`);
      setLedger(await refreshed.json());
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'rgb(245,246,250)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-rounded" style={{ textAlign: 'center' as const, margin: '40px auto', padding: '2.5rem 2rem', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 8 }} aria-label="뒤로가기">
            <FiArrowLeft size={28} color="#646cff" />
          </button>
          <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#22223b' }}>장부 관리</span>
        </div>
        <NicknameSearch onSearch={handleSearch} loading={loading} label="닉네임으로 장부 검색" />
        {error && <div className="text-error">{error}</div>}
        {ledger && (
          <>
            <div className="text-body" style={{ marginBottom: 18 }}>
              <strong>총 사용 금액:</strong> {ledger.used_amount}원<br />
              <strong>남은 금액:</strong> {(ledger.total_amount - ledger.used_amount)}원
            </div>
            <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 18 }}>
              <DatePicker
                selected={date}
                onChange={d => {
                  setDate(d);
                  setEntry({ ...entry, date: d ? d.toISOString().slice(0, 10) : '' });
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="날짜 선택"
                className="custom-datepicker"
                required
                autoComplete="off"
                popperPlacement="bottom"
                popperModifiers={[]}
                wrapperClassName="datepicker-wrapper"
                showPopperArrow={false}
              />
              <Select
                options={menuOptions}
                placeholder="메뉴 선택"
                value={entry.menu ? { value: entry.menu, label: entry.menu } : null}
                onChange={option => {
                  if (!option) return;
                  setEntry({ ...entry, menu: option.value, amount: String(menuMap[option.value]?.price ?? '') });
                }}
                isClearable
                styles={{
                  control: (base) => ({ ...base, ...inputStyle, padding: 0, minHeight: 48 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  option: (base, state) => ({ ...base, color: '#22223b', backgroundColor: state.isSelected ? '#e0e0ff' : '#fff' }),
                  singleValue: (base) => ({ ...base, color: '#22223b' }),
                  input: (base) => ({ ...base, color: '#22223b' }),
                }}
              />
              <input type="number" placeholder="금액" value={entry.amount} onChange={e => setEntry({ ...entry, amount: e.target.value })} required name="amount" style={inputStyle} autoComplete="off" />
              <input type="text" placeholder="비고" value={entry.note} onChange={e => setEntry({ ...entry, note: e.target.value })} name="note" style={inputStyle} autoComplete="off" />
              <button type="submit" style={buttonStyle} disabled={addLoading}>{addLoading ? '추가 중...' : '내역 추가'}</button>
              {addError && <div className="text-error">{addError}</div>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AddEntry; 