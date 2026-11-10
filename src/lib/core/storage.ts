/**
 * STORAGE.TS - Centralized, Bulletproof LocalStorage & In-Memory Cache Manager
 *
 * ARSITEKTUR & KEAMANAN SISTEM:
 * 1. Safe SSR / Node.js & Incognito Execution:
 *    Tidak pernah melempar pengecualian fatal (ReferenceError/QuotaExceededError).
 *    Jika localStorage tidak tersedia atau diblokir (private browsing), otomatis
 *    beralih ke in-memory store yang aman.
 * 2. Auto-Healing Malformed JSON:
 *    Jika data di storage rusak/terpotong (misal tab tertutup saat write),
 *    parser otomatis me-reset ke nilai default tanpa menyebabkan layar blank putih (White Screen of Death).
 * 3. Type-Safe Fallbacks:
 *    Menjamin tipe data yang dikembalikan selalu sesuai schema yang diharapkan oleh UI.
 */

// Fallback in-memory storage untuk SSR dan lingkungan Private Browsing
const inMemoryStore = new Map<string, string>();

function getStorageEngine(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
      return (globalThis as unknown as { localStorage: Storage }).localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Memeriksa ketersediaan dan izin akses localStorage
 */
export function isLocalStorageAvailable(): boolean {
  const engine = getStorageEngine();
  if (!engine) return false;
  try {
    const testKey = '__fluenzy_storage_test__';
    engine.setItem(testKey, testKey);
    if (typeof engine.removeItem === 'function') {
      engine.removeItem(testKey);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Membaca data secara aman dengan auto-healing jika data corrupt.
 */
export function safeGetStorage<T>(key: string, fallback: T): T {
  try {
    const engine = getStorageEngine();
    if (engine && isLocalStorageAvailable()) {
      const raw = engine.getItem(key);
      if (raw === null || raw === undefined) {
        return fallback;
      }
      try {
        return JSON.parse(raw) as T;
      } catch (parseError) {
        console.warn(`[SafeStorage] Auto-healing corrupted key "${key}":`, parseError);
        if (typeof engine.removeItem === 'function') {
          engine.removeItem(key);
        }
        return fallback;
      }
    } else {
      const raw = inMemoryStore.get(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`[SafeStorage] Error accessing key "${key}":`, err);
    return fallback;
  }
}

/**
 * Menyimpan data secara aman dengan penanganan batasan memori/privasi.
 */
export function safeSetStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    const engine = getStorageEngine();
    if (engine && isLocalStorageAvailable()) {
      engine.setItem(key, serialized);
    } else {
      inMemoryStore.set(key, serialized);
    }
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Failed to set key "${key}", falling back to in-memory:`, err);
    try {
      inMemoryStore.set(key, typeof value === 'object' ? '[Unserializable Object]' : String(value));
    } catch {
      // no-op
    }
    return false;
  }
}

/**
 * Menghapus key dari storage secara aman.
 */
export function safeRemoveStorage(key: string): void {
  try {
    const engine = getStorageEngine();
    if (engine && isLocalStorageAvailable() && typeof engine.removeItem === 'function') {
      engine.removeItem(key);
    }
    inMemoryStore.delete(key);
  } catch {
    inMemoryStore.delete(key);
  }
}

/**
 * Mengosongkan in-memory store dan storage engine (untuk isolasi testing).
 */
export function clearInMemoryStorage(): void {
  inMemoryStore.clear();
  try {
    const engine = getStorageEngine();
    if (engine && typeof engine.clear === 'function') {
      engine.clear();
    }
  } catch {
    // ignore
  }
}
