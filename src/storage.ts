import { emptyState } from './data';
import type { SweepState } from './types';
import { restoreSweepState } from './validation';

const DB_NAME = 'unbilled-work-sweep';
const DEMO_KEY = 'demo:unbilled-work-sweep';

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('workspace');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadState(demo: boolean): Promise<SweepState> {
  if (demo) {
    const saved = sessionStorage.getItem(DEMO_KEY);
    if (!saved) return emptyState();
    try {
      const value: unknown = JSON.parse(saved);
      return restoreSweepState(value) ?? emptyState();
    } catch { return emptyState(); }
  }
  try {
    const database = await db();
    return await new Promise((resolve, reject) => {
      const request = database.transaction('workspace').objectStore('workspace').get('current');
      request.onsuccess = () => {
        const value: unknown = request.result;
        resolve(restoreSweepState(value) ?? emptyState());
      };
      request.onerror = () => reject(request.error);
    });
  } catch { return emptyState(); }
}

export async function saveState(state: SweepState, demo: boolean): Promise<void> {
  if (!restoreSweepState(state)) throw new Error('Refusing to save an invalid workspace.');
  if (demo) { sessionStorage.setItem(DEMO_KEY, JSON.stringify(state)); return; }
  const database = await db();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction('workspace', 'readwrite');
    tx.objectStore('workspace').put(state, 'current');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function resetDemo(): void {
  sessionStorage.removeItem(DEMO_KEY);
  sessionStorage.removeItem('demo:unbilled:snapshots');
}
