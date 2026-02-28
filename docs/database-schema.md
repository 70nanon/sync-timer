# データベーススキーマ設計

## Firebase Realtime Database 構造

### 概要
Firebase Realtime Databaseを使用してタイマーの状態をリアルタイムで同期します。

### データ構造

```json
{
  "rooms": {
    "<roomId>": {
      "timer": {
        "duration": 300,        // 設定時間（秒）
        "remaining": 180,       // 残り時間（秒）
        "isRunning": true,      // 実行中フラグ
        "startedAt": 1234567890,// 開始時刻（Unix timestamp, ms）
        "pausedAt": null,       // 一時停止時刻（Unix timestamp, ms）
        "updatedAt": 1234567891 // 最終更新時刻（Unix timestamp, ms）
      },
      "metadata": {
        "createdAt": 1234567890,// ルーム作成時刻
        "createdBy": "user-id", // 作成者ID
        "name": "作業タイマー"   // ルーム名（オプション）
      },
      "participants": {
        "<userId>": {
          "name": "ユーザー名",
          "joinedAt": 1234567890,// 参加時刻
          "online": true,        // オンライン状態
          "lastSeen": 1234567890 // 最終アクセス時刻
        }
      }
    }
  }
}
```

### セキュリティルール

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        "timer": {
          ".validate": "newData.hasChildren(['duration', 'remaining', 'isRunning', 'updatedAt'])"
        },
        "participants": {
          "$userId": {
            ".write": "$userId === auth.uid"
          }
        }
      }
    }
  }
}
```

## データモデル（TypeScript型定義）

```typescript
// タイマー状態
interface TimerState {
  duration: number;      // 設定時間（秒）
  remaining: number;     // 残り時間（秒）
  isRunning: boolean;    // 実行中フラグ
  startedAt: number | null;  // 開始時刻（Unix timestamp, ms）
  pausedAt: number | null;   // 一時停止時刻（Unix timestamp, ms）
  updatedAt: number;     // 最終更新時刻（Unix timestamp, ms）
}

// ルームメタデータ
interface RoomMetadata {
  createdAt: number;     // ルーム作成時刻
  createdBy: string;     // 作成者ID
  name?: string;         // ルーム名（オプション）
}

// 参加者情報
interface Participant {
  name: string;          // ユーザー名
  joinedAt: number;      // 参加時刻
  online: boolean;       // オンライン状態
  lastSeen: number;      // 最終アクセス時刻
}

// ルーム全体
interface Room {
  timer: TimerState;
  metadata: RoomMetadata;
  participants: Record<string, Participant>;
}
```

## データ操作

### ルーム作成
```typescript
const createRoom = async (duration: number, userName: string): Promise<string> => {
  const roomId = generateRoomId();
  const userId = generateUserId();
  
  await set(ref(database, `rooms/${roomId}`), {
    timer: {
      duration,
      remaining: duration,
      isRunning: false,
      startedAt: null,
      pausedAt: null,
      updatedAt: Date.now()
    },
    metadata: {
      createdAt: Date.now(),
      createdBy: userId,
    },
    participants: {
      [userId]: {
        name: userName,
        joinedAt: Date.now(),
        online: true,
        lastSeen: Date.now()
      }
    }
  });
  
  return roomId;
};
```

### タイマー開始
```typescript
const startTimer = async (roomId: string): Promise<void> => {
  const timerRef = ref(database, `rooms/${roomId}/timer`);
  
  await update(timerRef, {
    isRunning: true,
    startedAt: Date.now(),
    pausedAt: null,
    updatedAt: Date.now()
  });
};
```

### タイマー一時停止
```typescript
const pauseTimer = async (roomId: string): Promise<void> => {
  const timerRef = ref(database, `rooms/${roomId}/timer`);
  const snapshot = await get(timerRef);
  const timer = snapshot.val() as TimerState;
  
  if (timer.isRunning && timer.startedAt) {
    const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
    const newRemaining = Math.max(0, timer.remaining - elapsed);
    
    await update(timerRef, {
      isRunning: false,
      remaining: newRemaining,
      pausedAt: Date.now(),
      updatedAt: Date.now()
    });
  }
};
```

### タイマーリセット
```typescript
const resetTimer = async (roomId: string): Promise<void> => {
  const timerRef = ref(database, `rooms/${roomId}/timer`);
  const snapshot = await get(timerRef);
  const timer = snapshot.val() as TimerState;
  
  await update(timerRef, {
    remaining: timer.duration,
    isRunning: false,
    startedAt: null,
    pausedAt: null,
    updatedAt: Date.now()
  });
};
```

### リアルタイム同期
```typescript
const subscribeToTimer = (
  roomId: string,
  callback: (timer: TimerState) => void
): (() => void) => {
  const timerRef = ref(database, `rooms/${roomId}/timer`);
  
  const unsubscribe = onValue(timerRef, (snapshot) => {
    const timer = snapshot.val() as TimerState;
    callback(timer);
  });
  
  return unsubscribe;
};
```

## インデックス設定

現在のスキーマでは特別なインデックスは不要ですが、将来的にルーム一覧などを実装する場合は以下のインデックスが必要になる可能性があります：

```json
{
  "rules": {
    "rooms": {
      ".indexOn": ["metadata/createdAt"]
    }
  }
}
```

## データ保持ポリシー

- アクティブなルーム: 最終更新から24時間保持
- 非アクティブなルーム: Cloud Functionsで自動削除（Phase 5で実装）
- 参加者がいなくなったルーム: 即座に削除可能
