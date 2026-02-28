import { useEffect, useState } from 'react';
import { createTimer, subscribeToTimeline } from './services/timer.service';
import type { Timer } from './types/timer';
import './App.css';

function App() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firebaseテスト: タイムラインをリアルタイム購読
  useEffect(() => {
    console.log('🔥 Firebase接続テスト開始...');
    
    const unsubscribe = subscribeToTimeline((newTimers) => {
      console.log('✅ タイムラインを取得:', newTimers);
      setTimers(newTimers);
      setLoading(false);
    });

    return () => {
      console.log('🔌 購読を解除');
      unsubscribe();
    };
  }, []);

  // テスト用: タイマーを作成
  const handleCreateTestTimer = async () => {
    try {
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 3); // 3分後

      const timerId = await createTimer({
        title: 'テストタイマー（3分後）',
        endTime: endTime,
        nickname: 'テストユーザー',
      });
      
      console.log('✅ タイマー作成成功:', timerId);
      alert('タイマーを作成しました！');
    } catch (err) {
      console.error('❌ タイマー作成エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>🔥 Firebase 接続テスト</h1>
        <p>Firestore に接続中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🔥 Firebase 接続テスト</h1>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '1rem' }}>
          エラー: {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={handleCreateTestTimer}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          テストタイマーを作成
        </button>
      </div>

      <h2>タイムライン ({timers.length}件)</h2>
      
      {timers.length === 0 ? (
        <p>タイマーがありません。上のボタンでテストタイマーを作成してみてください。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {timers.map((timer) => (
            <div
              key={timer.id}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{timer.title}</h3>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                投稿者: {timer.nickname}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                終了時刻: {timer.endTime.toDate().toLocaleString('ja-JP')}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#999' }}>
                ID: {timer.id}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <h3>✅ 接続確認ポイント</h3>
        <ul>
          <li>このページが表示されていれば Firebase に接続できています</li>
          <li>「テストタイマーを作成」ボタンでタイマーを作成できます</li>
          <li>作成したタイマーが自動的にタイムラインに表示されます（リアルタイム同期）</li>
          <li>ブラウザのコンソール（F12）でログを確認できます</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
