import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Timer, CreateTimerInput } from '../types/timer';

/**
 * タイマーを作成
 */
export const createTimer = async (input: CreateTimerInput): Promise<string> => {
  // 秒単位に丸める
  const roundedEndTime = new Date(input.endTime);
  roundedEndTime.setMilliseconds(0);
  
  const endTimeGroup = roundedEndTime.toISOString();
  
  const docRef = await addDoc(collection(db, 'timers'), {
    title: input.title,
    endTime: Timestamp.fromDate(roundedEndTime),
    endTimeGroup: endTimeGroup,
    nickname: input.nickname,
    createdAt: serverTimestamp(),
  });
  
  return docRef.id;
};

/**
 * タイムラインを取得（未来のタイマーのみ、終了時刻が近い順）
 */
export const getTimeline = async (limitCount = 50): Promise<Timer[]> => {
  const q = query(
    collection(db, 'timers'),
    where('endTime', '>', Timestamp.now()),
    orderBy('endTime', 'asc'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<Timer, 'id'>,
  }));
};

/**
 * タイムラインをリアルタイムで購読
 */
export const subscribeToTimeline = (
  callback: (timers: Timer[]) => void,
  limitCount = 50
): (() => void) => {
  const q = query(
    collection(db, 'timers'),
    where('endTime', '>', Timestamp.now()),
    orderBy('endTime', 'asc'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const timers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Timer, 'id'>,
    }));
    callback(timers);
  });
};

/**
 * 同時待機人数を取得（COUNT クエリ）
 */
export const getWaitCount = async (endTimeGroup: string): Promise<number> => {
  const q = query(
    collection(db, 'timers'),
    where('endTimeGroup', '==', endTimeGroup)
  );
  
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

/**
 * 「私も待つ」機能 - 同じ終了時刻のタイマーを作成
 */
export const joinWait = async (
  originalTimer: Timer,
  myNickname: string
): Promise<string> => {
  return createTimer({
    title: originalTimer.title,
    endTime: originalTimer.endTime.toDate(),
    nickname: myNickname,
  });
};
