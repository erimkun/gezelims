import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface GeoJSONData {
  type: string;
  features: Array<{
    type: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
}

interface CacheDB extends DBSchema {
  'geojson': {
    key: string;
    value: {
      category: string;
      data: GeoJSONData;
      timestamp: number;
      version: number;
    };
  };
}

class CacheService {
  private db: IDBPDatabase<CacheDB> | null = null;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly CACHE_VERSION = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<CacheDB>('pearl-of-istanbul', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('geojson')) {
            db.createObjectStore('geojson', { keyPath: 'category' });
          }
        },
      });
    } catch (error) {
      console.error('❌ IndexedDB initialization failed:', error);
      // Fallback: Continue without cache
    }
  }

  async getCachedGeoJSON(category: string): Promise<GeoJSONData | null> {
    if (!this.db) {
      await this.init();
      if (!this.db) return null; // Failed to initialize
    }

    try {
      const cached = await this.db.get('geojson', category);

      if (!cached) {
        console.log(`📦 Cache MISS: ${category}`);
        return null;
      }

      // Check if expired
      const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
      const isOldVersion = cached.version !== this.CACHE_VERSION;

      if (isExpired || isOldVersion) {
        console.log(`🗑️ Cache EXPIRED/OUTDATED: ${category}`);
        await this.db.delete('geojson', category);
        return null;
      }

      console.log(`✅ Cache HIT: ${category}`);
      return cached.data;
    } catch (error) {
      console.error(`❌ Cache read error for ${category}:`, error);
      return null;
    }
  }

  async setCachedGeoJSON(category: string, data: GeoJSONData): Promise<void> {
    if (!this.db) {
      await this.init();
      if (!this.db) return; // Failed to initialize
    }

    try {
      await this.db.put('geojson', {
        category,
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      });
      console.log(`💾 Cache SAVED: ${category}`);
    } catch (error) {
      console.error(`❌ Cache write error for ${category}:`, error);
    }
  }

  async clearCache(): Promise<void> {
    if (!this.db) {
      await this.init();
      if (!this.db) return;
    }

    try {
      const tx = this.db.transaction('geojson', 'readwrite');
      await tx.objectStore('geojson').clear();
      console.log('🧹 Cache cleared');
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) {
      await this.init();
      if (!this.db) return 0;
    }

    try {
      const allKeys = await this.db.getAllKeys('geojson');
      return allKeys.length;
    } catch (error) {
      console.error('❌ Cache size error:', error);
      return 0;
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Initialize on module load
cacheService.init().catch(console.error);
