import { Timestamp } from 'firebase/firestore';

/**
 * タイマー（ポスト）の型定義
 */
export interface Timer {
  id: string;                    // Firestore ドキュメントID
  title: string;                 // タイマーのタイトル（例: "ラーメン完成まで"）
  endTime: Timestamp;            // 終了時刻（Firebase Timestamp型）
  endTimeGroup: string;          // 終了時刻グループ（秒単位のISO文字列、カウント用）
  nickname: string;              // 投稿者のニックネーム
  createdAt: Timestamp;          // 作成日時
}

/**
 * タイマー作成時の入力データ
 */
export interface CreateTimerInput {
  title: string;
  endTime: Date;
  nickname: string;
}

/**
 * タイマーカウント（同時待機人数）の型定義
 */
export interface TimerCount {
  endTimeGroup: string;          // ドキュメントID: 終了時刻グループ
  count: number;                 // 同時待機人数
  lastUpdated: Timestamp;        // 最終更新時刻
}
