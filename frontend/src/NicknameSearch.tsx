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
        style={{
          background: '#f6f8fa', border: 'none', borderRadius: 16, padding: '1.1rem', fontSize: '1.1rem', marginBottom: 12, width: '100%', color: '#22223b', fontWeight: 500, outline: 'none', boxSizing: 'border-box'
        }}
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