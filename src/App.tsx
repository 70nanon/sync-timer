import { useEffect, useState } from 'react';
import { createTimer, subscribeToTimeline, joinWait, getWaitCount } from './services/timer.service';
import type { Timer } from './types/timer';
import './App.css';

function App() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [waitCounts, setWaitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // フォーム入力用のstate
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // タイムラインをリアルタイム購読
  useEffect(() => {
    const unsubscribe = subscribeToTimeline((newTimers) => {
      setTimers(newTimers);
      setLoading(false);
      
      // 各タイマーの待機人数を取得
      newTimers.forEach(async (timer) => {
        const count = await getWaitCount(timer.endTimeGroup);
        setWaitCounts(prev => ({ ...prev, [timer.endTimeGroup]: count }));
      });
    });

    return () => unsubscribe();
  }, []);

  // タイマー作成
  const handleCreateTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      alert('ニックネームを入力してください');
      return;
    }
    
    if (hours === 0 && minutes === 0 && seconds === 0) {
      alert('待ち時間を設定してください');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + hours);
      endTime.setMinutes(endTime.getMinutes() + minutes);
      endTime.setSeconds(endTime.getSeconds() + seconds);

      // タイトルの自動生成
      let autoTitle = '';
      if (hours > 0) autoTitle += `${hours}時間`;
      if (minutes > 0) autoTitle += `${minutes}分`;
      if (seconds > 0) autoTitle += `${seconds}秒`;
      if (autoTitle) autoTitle += '待ち';

      await createTimer({
        title: title.trim() || autoTitle,
        endTime: endTime,
        nickname: nickname.trim(),
      });
      
      // フォームをリセット
      setTitle('');
      setHours(0);
      setMinutes(5);
      setSeconds(0);
      
      alert('投稿しました！');
    } catch (err) {
      console.error('タイマー作成エラー:', err);
      setError(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 「私も待つ」ボタン
  const handleJoinWait = async (timer: Timer) => {
    if (!nickname.trim()) {
      alert('ニックネームを入力してください');
      return;
    }
    
    try {
      await joinWait(timer.endTimeGroup, nickname.trim());
      
      // 待機人数を更新
      const count = await getWaitCount(timer.endTimeGroup);
      setWaitCounts(prev => ({ ...prev, [timer.endTimeGroup]: count }));
      
      alert('「私も待つ」を投稿しました！');
    } catch (err) {
      console.error('「私も待つ」エラー:', err);
      alert('投稿に失敗しました');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏱️ SyncTimer</h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.875rem' }}>
        待ち時間を共有しよう
      </p>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {/* タイマー作成フォーム */}
      <form onSubmit={handleCreateTimer} style={{ marginBottom: '2rem' }}>
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>新しい待ちを投稿</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
              ニックネーム *
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: たろう"
              maxLength={20}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
              タイトル（任意）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: バスを待ってます"
              maxLength={50}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
              待ち時間 *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={23}
                  style={{
                    width: '60px',
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '0.875rem' }}>時間</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={59}
                  style={{
                    width: '60px',
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '0.875rem' }}>分</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={59}
                  style={{
                    width: '60px',
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '0.875rem' }}>秒</span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>

      {/* タイムライン */}
      <div>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          タイムライン ({timers.length}件)
        </h2>
        
        {timers.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            まだ投稿がありません。<br />最初の待ちを投稿してみましょう！
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {timers.map((timer) => (
              <div
                key={timer.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 'bold' }}>
                    {timer.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6c757d' }}>
                    by {timer.nickname}
                  </p>
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#495057' }}>
                    📅 {timer.endTime.toDate().toLocaleString('ja-JP', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} まで
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6c757d' }}>
                    👥 {waitCounts[timer.endTimeGroup] || 1}人が待っています
                  </p>
                </div>
                
                <button
                  onClick={() => handleJoinWait(timer)}
                  disabled={!nickname.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    backgroundColor: nickname.trim() ? '#28a745' : '#e9ecef',
                    color: nickname.trim() ? 'white' : '#6c757d',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: nickname.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  私も待つ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
