import {
  postChatMessage,
  submitExpediterRequest,
  submitJobListing,
  submitWorkerProfile,
} from '@/lib/community.functions';
import type { ExpediterRequest, JobListing, WorkerProfile } from '@/types';

const OFFLINE_QUEUE_KEY = 'addisvault_offline_community_queue_v1';

export type OfflineQueuedAction =
  | { id: string; kind: 'worker'; payload: WorkerProfile; createdAt: string }
  | { id: string; kind: 'job'; payload: JobListing; createdAt: string }
  | { id: string; kind: 'expediter'; payload: ExpediterRequest; createdAt: string }
  | {
      id: string;
      kind: 'chat';
      payload: {
        id: string;
        room: 'trust' | 'exams' | 'careers';
        message: string;
        optionalPhone?: string;
      };
      createdAt: string;
    };

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // ignore subscriber error
    }
  });
}

export function subscribeOfflineQueue(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function readOfflineQueue(): OfflineQueuedAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OfflineQueuedAction[]) : [];
  } catch {
    return [];
  }
}

function writeOfflineQueue(items: OfflineQueuedAction[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
    notifyListeners();
  } catch {
    // ignore storage quota errors
  }
}

export function enqueueOfflineAction(action: Omit<OfflineQueuedAction, 'createdAt'>): void {
  const current = readOfflineQueue();
  const next: OfflineQueuedAction[] = [
    ...current.filter((item) => item.id !== action.id),
    { ...(action as OfflineQueuedAction), createdAt: new Date().toISOString() },
  ];
  writeOfflineQueue(next);
}

let flushInFlight = false;

export async function flushOfflineQueue(): Promise<{ synced: number; remaining: number }> {
  if (flushInFlight || typeof navigator === 'undefined' || !navigator.onLine) {
    return { synced: 0, remaining: readOfflineQueue().length };
  }
  const items = readOfflineQueue();
  if (items.length === 0) return { synced: 0, remaining: 0 };

  flushInFlight = true;
  let synced = 0;
  const remaining: OfflineQueuedAction[] = [];

  const asRecord = (value: object): Record<string, unknown> =>
    ({ ...value }) as Record<string, unknown>;

  try {
    for (const item of items) {
      try {
        if (item.kind === 'worker') {
          const res = await submitWorkerProfile({ data: asRecord(item.payload) });
          if (res.ok) synced += 1;
          else remaining.push(item);
        } else if (item.kind === 'job') {
          const res = await submitJobListing({ data: asRecord(item.payload) });
          if (res.ok) synced += 1;
          else remaining.push(item);
        } else if (item.kind === 'expediter') {
          const res = await submitExpediterRequest({ data: asRecord(item.payload) });
          if (res.ok) synced += 1;
          else remaining.push(item);
        } else if (item.kind === 'chat') {
          const res = await postChatMessage({ data: item.payload });
          if (res.ok) synced += 1;
          else remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }
    writeOfflineQueue(remaining);
    return { synced, remaining: remaining.length };
  } finally {
    flushInFlight = false;
  }
}
