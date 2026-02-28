# SyncTimer 実装計画

## 概要
このドキュメントでは、SyncTimerの実装を段階的に進めるための詳細な計画を記載します。

## Phase 1: 基本機能の実装

### 1.1 Firebase SDK の統合
**ブランチ**: `feature/firebase-setup`

#### タスク
- [ ] Firebase プロジェクトの作成（Firebase Console）
- [ ] Firebase SDK のインストール（既にインストール済み）
- [ ] Firebase設定ファイルの作成
  - `src/config/firebase.ts` - Firebase初期化設定
  - `.env.local` - 環境変数（Git管理外）
  - `.env.example` - 環境変数のテンプレート
- [ ] Firebase Authentication のセットアップ（匿名認証）
- [ ] Firebase Realtime Database または Firestore のセットアップ

#### ファイル構成
```
src/
  config/
    firebase.ts         # Firebase初期化
  services/
    database.service.ts # データベース操作
```

### 1.2 タイマーコンポーネントの実装
**ブランチ**: `feature/timer-component`

#### タスク
- [ ] タイマーロジックの実装
  - カウントダウン機能
  - 開始/一時停止/リセット
  - 時間フォーマット表示
- [ ] タイマーUIコンポーネント
  - 時間表示部分
  - コントロールボタン（開始/停止/リセット）
  - 時間設定フォーム
- [ ] カスタムフック作成
  - `useTimer` - タイマーロジック
  - `useTimerSync` - Firebase同期（Phase 2で実装）

#### ファイル構成
```
src/
  components/
    Timer/
      Timer.tsx          # メインタイマーコンポーネント
      TimerDisplay.tsx   # 時間表示
      TimerControls.tsx  # コントロール部分
      TimerSettings.tsx  # 設定UI
      Timer.module.css   # スタイル
  hooks/
    useTimer.ts          # タイマーロジック
```

#### タイマー状態管理
```typescript
interface TimerState {
  duration: number;      // 設定時間（秒）
  remaining: number;     // 残り時間（秒）
  isRunning: boolean;    // 実行中フラグ
  startedAt: number | null; // 開始時刻（Unix timestamp）
}
```

---

## Phase 2: リアルタイム同期機能

### 2.1 Firebase Realtime Database セットアップ
**ブランチ**: `feature/realtime-sync`

#### データベース構造
```json
{
  "rooms": {
    "room-id-1": {
      "timer": {
        "duration": 300,
        "remaining": 180,
        "isRunning": true,
        "startedAt": 1234567890,
        "updatedAt": 1234567891
      },
      "createdAt": 1234567890,
      "participants": {
        "user-id-1": {
          "name": "User 1",
          "joinedAt": 1234567890
        }
      }
    }
  }
}
```

#### タスク
- [ ] データベースルールの設定
- [ ] ルーム作成機能
- [ ] ルーム参加機能
- [ ] タイマー状態の同期
- [ ] リアルタイムリスナーの実装

### 2.2 ルーム機能実装
**ブランチ**: `feature/room-management`

#### タスク
- [ ] ルームID生成ロジック
- [ ] ルーム作成画面
- [ ] ルーム参加画面（ID入力）
- [ ] ルームURL共有機能
- [ ] React Router の導入
  - `/` - ホーム画面
  - `/room/:roomId` - タイマールーム

#### ファイル構成
```
src/
  pages/
    Home.tsx           # ホーム画面
    Room.tsx           # タイマールーム
  components/
    RoomCreate/
      RoomCreate.tsx   # ルーム作成
    RoomJoin/
      RoomJoin.tsx     # ルーム参加
  services/
    room.service.ts    # ルーム管理
  utils/
    roomId.ts          # ルームID生成
```

---

## Phase 3: UI/UX改善

### 3.1 レスポンシブデザイン
**ブランチ**: `feature/responsive-design`

#### タスク
- [ ] モバイルファーストのレイアウト
- [ ] タブレット・PC対応
- [ ] CSS Modules または TailwindCSS の導入検討

### 3.2 ダークモード対応
**ブランチ**: `feature/dark-mode`

#### タスク
- [ ] カラーテーマの定義
- [ ] テーマ切り替え機能
- [ ] ローカルストレージで設定保存

### 3.3 アニメーション実装
**ブランチ**: `feature/animations`

#### タスク
- [ ] タイマー数字の変更アニメーション
- [ ] 状態遷移のトランジション
- [ ] 終了時のアラートアニメーション

### 3.4 通知機能
**ブランチ**: `feature/notifications`

#### タスク
- [ ] ブラウザ通知API連携
- [ ] タイマー終了時の通知
- [ ] 音声アラート（オプション）

---

## Phase 4: 追加機能

### 4.1 ユーザー機能
**ブランチ**: `feature/user-management`

#### タスク
- [ ] ユーザー名設定機能
- [ ] 参加者リスト表示
- [ ] オンライン状態管理

### 4.2 タイマー履歴
**ブランチ**: `feature/timer-history`

#### タスク
- [ ] 履歴データの保存
- [ ] 履歴表示UI
- [ ] 履歴からの再利用

### 4.3 プリセット機能
**ブランチ**: `feature/presets`

#### タスク
- [ ] よく使う時間のプリセット
- [ ] カスタムプリセット作成
- [ ] プリセットの保存

---

## Phase 5: デプロイ・運用

### 5.1 Firebase Hosting デプロイ
**ブランチ**: `feature/deployment`

#### タスク
- [ ] Firebase Hosting の設定
- [ ] ビルド最適化
- [ ] デプロイスクリプト作成
- [ ] CI/CD パイプライン（GitHub Actions）

### 5.2 パフォーマンス最適化
**ブランチ**: `feature/performance`

#### タスク
- [ ] コード分割
- [ ] 遅延ロード
- [ ] バンドルサイズ最適化
- [ ] Lighthouse スコア改善

### 5.3 エラーハンドリング
**ブランチ**: `feature/error-handling`

#### タスク
- [ ] エラーバウンダリの実装
- [ ] ネットワークエラー処理
- [ ] ユーザーフィードバック
- [ ] ロギング（Firebase Analytics / Sentry）

---

## 技術的な決定事項

### 状態管理
- **ローカル状態**: React hooks（useState, useReducer）
- **グローバル状態**: Context API または Zustand（必要に応じて）
- **サーバー状態**: Firebase SDK + カスタムフック

### スタイリング
- 初期: CSS Modules
- 検討: TailwindCSS（Phase 3で導入検討）

### ルーティング
- React Router v6

### テスト
- ユニットテスト: Vitest
- コンポーネントテスト: React Testing Library
- E2Eテスト: Playwright（Phase 5で検討）

---

## スケジュール（目安）

| Phase | 所要時間（目安） |
|-------|------------------|
| Phase 1 | 2-3日 |
| Phase 2 | 3-4日 |
| Phase 3 | 2-3日 |
| Phase 4 | 2-3日 |
| Phase 5 | 1-2日 |

**合計**: 約2週間（パートタイム開発想定）

---

## 次のステップ

1. Firebase プロジェクトの作成
2. `feature/firebase-setup` ブランチの作成
3. Firebase SDK の統合
4. PR作成・レビュー・マージ
