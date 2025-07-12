import { useEffect, useState } from 'react';

interface NicknameSearchProps {
  onSearch: (nickname: string) => void;
  loading?: boolean;
  label?: string;
}

function NicknameSearch({ onSearch, loading, label }: NicknameSearchProps) {
  const [nicknames, setNicknames] = useState<string[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/nicknames`)
      .then(res => res.json())
      .then(data => setNicknames(data.nicknames || []));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) onSearch(selected);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
      {label && <label className="title-sub" style={{ textAlign: 'left', marginBottom: 12 }}>{label}</label>}
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        required
        className="input-rounded"
        style={{ height: 56, marginBottom: 18, fontSize: '1.1rem', fontWeight: 500, color: '#22223b', background: '#f6f8fa', border: 'none', borderRadius: 16, padding: '1.1rem', width: '100%', outline: 'none', boxSizing: 'border-box' }}
      >
        <option value="">닉네임 선택</option>
        {nicknames.map(nick => (
          <option key={nick} value={nick}>{nick}</option>
        ))}
      </select>
      <button type="submit" className="btn-main" style={{ width: '100%' }} disabled={loading || !selected}>{loading ? '검색 중...' : '검색'}</button>
    </form>
  );
}

export default NicknameSearch; 