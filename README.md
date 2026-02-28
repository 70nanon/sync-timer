# SyncTimer

複数人で同じタイマーを共有して、待ち時間をリアルタイムで同期できるWebアプリケーション。

## 📋 概要

SyncTimerは、複数のユーザーがリアルタイムで同じタイマーを共有できるアプリケーションです。
Firebaseのリアルタイムデータベースを活用し、全員のタイマーが常に同期された状態を保ちます。

## 🚀 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **データベース**: Firebase Realtime Database / Firestore
- **デプロイ**: Firebase Hosting（予定）

## � ドキュメント

詳細な設計・実装ドキュメントは [docs/](docs/) ディレクトリを参照してください：

- [実装計画](docs/implementation-plan.md) - フェーズごとの詳細なタスク
- [データベーススキーマ](docs/database-schema.md) - Firebaseのデータ構造設計
- [機能仕様](docs/features.md) - 各機能の詳細仕様

## �💻 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 📝 開発計画

### Phase 1: 基本機能の実装
- [x] プロジェクトセットアップ（Vite + React + TypeScript）
- [ ] Firebase SDK の統合
- [ ] Firebase プロジェクトの作成と設定
- [ ] タイマーコンポーネントの実装
  - [ ] カウントダウン機能
  - [ ] 開始/停止/リセット機能
  - [ ] 時間設定UI

### Phase 2: リアルタイム同期機能
- [ ] Firebase Realtime Database / Firestore のセットアップ
- [ ] タイマー状態のリアルタイム同期
- [ ] ルーム機能（複数のタイマーセッション）
- [ ] ルームID生成・共有機能

### Phase 3: UI/UX改善
- [ ] レスポンシブデザインの実装
- [ ] アニメーション・トランジション
- [ ] ダークモード対応
- [ ] 通知機能（タイマー終了時）

### Phase 4: 追加機能
- [ ] ユーザー名表示機能
- [ ] 参加者リスト表示
- [ ] タイマー履歴
- [ ] プリセット時間設定

### Phase 5: デプロイ・運用
- [ ] Firebase Hosting へのデプロイ
- [ ] カスタムドメイン設定
- [ ] パフォーマンス最適化
- [ ] エラーハンドリング・ロギング

## 🤝 コントリビューション

このプロジェクトは開発中です。機能追加や改善の提案は Issue や Pull Request でお願いします。

## 📄 ライセンス

MIT
