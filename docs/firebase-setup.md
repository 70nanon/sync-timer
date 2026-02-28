# Firebase セットアップガイド

このドキュメントでは、SyncTimerで使用するFirebaseプロジェクトの作成と設定方法を説明します。

## 1. Firebaseプロジェクトの作成

### 1.1 Firebase Console にアクセス
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. Googleアカウントでログイン

### 1.2 新しいプロジェクトを作成
1. 「プロジェクトを追加」をクリック
2. プロジェクト名を入力（例: `sync-timer`）
3. Google Analytics の設定（任意、後で有効化も可能）
4. 「プロジェクトを作成」をクリック

## 2. Webアプリの登録

### 2.1 アプリを追加
1. プロジェクトのホーム画面で、Webアイコン（`</>`）をクリック
2. アプリのニックネームを入力（例: `SyncTimer Web`）
3. Firebase Hosting は後で設定するためチェックを外してOK
4. 「アプリを登録」をクリック

### 2.2 Firebase SDK の設定情報を取得
1. 表示される設定情報（`firebaseConfig`）をコピー
2. または、「プロジェクト設定」→「全般」→「マイアプリ」から取得可能

## 3. 環境変数の設定

### 3.1 `.env.local` ファイルを作成
プロジェクトルートに `.env.local` ファイルを作成し、Firebase の設定情報を記載します。

```bash
cp .env.example .env.local
```

### 3.2 Firebase 設定値を入力
`.env.local` ファイルを開き、以下のように実際の値を設定します：

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**注意**: `.env.local` は `.gitignore` に含まれているため、Git にコミットされません。

## 4. Firestore Database のセットアップ

### 4.1 Firestore を有効化
1. Firebase Console の左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（例: `asia-northeast1` - 東京）
4. セキュリティルールの開始モード:
   - **開発時**: 「テストモードで開始」を選択
   - **本番時**: 「本番モードで開始」を選択し、後でルールをカスタマイズ

### 4.2 セキュリティルールの設定

開発時は以下のルールでOK（誰でも読み書き可能）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**本番環境用の推奨ルール**（後で設定）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // timers コレクション
    match /timers/{timerId} {
      allow read: if true;  // 誰でも読み取り可能
      allow create: if true;  // 誰でも作成可能（匿名投稿）
      allow update, delete: if false;  // 更新・削除は不可
    }
    
    // timer_counts コレクション（Phase 2で使用）
    match /timer_counts/{countId} {
      allow read: if true;
      allow write: if false;  // Cloud Functions からのみ書き込み
    }
  }
}
```

### 4.3 インデックスの作成

1. Firebase Console の「Firestore Database」→「インデックス」タブ
2. 以下の複合インデックスを作成：

**インデックス1: タイムライン用**
- コレクション: `timers`
- フィールド1: `endTime` (昇順)
- フィールド2: `createdAt` (降順)

**インデックス2: カウント用（Phase 2）**
- コレクション: `timers`
- フィールド1: `endTimeGroup` (昇順)
- フィールド2: `createdAt` (降順)

**自動作成される場合**:
アプリを実行してクエリエラーが出た場合、エラーメッセージにインデックス作成リンクが表示されます。そのリンクをクリックすれば自動で作成されます。

## 5. 動作確認

### 5.1 開発サーバーを起動
```bash
npm run dev
```

### 5.2 ブラウザで確認
1. `http://localhost:5173/` にアクセス
2. ブラウザのコンソールでFirebaseのエラーがないか確認

### 5.3 Firestoreにテストデータを追加
Firebase Console で `timers` コレクションに手動でドキュメントを追加して、表示されるか確認できます。

## トラブルシューティング

### エラー: "Firebase: Error (auth/invalid-api-key)"
- `.env.local` の `VITE_FIREBASE_API_KEY` が正しいか確認
- 環境変数を変更した場合、開発サーバーを再起動

### エラー: "Missing or insufficient permissions"
- Firestore のセキュリティルールを確認
- 開発時は「テストモード」で開始していることを確認

### インデックスエラー
- エラーメッセージ内のリンクからインデックスを作成
- または Firebase Console から手動で作成

## 次のステップ

Firebase のセットアップが完了したら、以下の実装に進めます：

1. タイマー作成UIの実装
2. タイムライン表示の実装
3. リアルタイム同期の実装
4. 「私も待つ」機能の実装
