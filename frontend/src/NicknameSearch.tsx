import { useState } from 'react';

interface NicknameSearchProps {
  onSearch: (nickname: string) => void;
  loading?: boolean;
  label?: string;
}

function NicknameSearch({ onSearch, loading, label }: NicknameSearchProps) {
  const [nickname, setNickname] = useState('');

  const validateNickname = (nickname: string) => {
    // 2~12자, 한글/영문/숫자만 허용, 공백/특수문자 불가
    return /^[A-Za-z0-9가-힣]{2,12}$/.test(nickname);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNickname(nickname)) {
      alert('닉네임은 2~12자, 한글/영문/숫자만 입력 가능합니다.');
      return;
    }
    if (nickname.trim()) onSearch(nickname.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
      {label && <label className="title-sub" style={{ textAlign: 'left', marginBottom: 12 }}>{label}</label>}
      <input
        type="text"
        placeholder="닉네임 입력"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        required
        style={{
          background: '#f6f8fa', border: 'none', borderRadius: 16, padding: '1.1rem', fontSize: '1.1rem', marginBottom: 12, width: '100%', color: '#22223b', fontWeight: 500, outline: 'none', boxSizing: 'border-box'
        }}
        autoComplete="off"
      />
      <button type="submit" className="btn-main" style={{ width: '100%' }} disabled={loading}>{loading ? '검색 중...' : '검색'}</button>
    </form>
  );
}

export default NicknameSearch; 