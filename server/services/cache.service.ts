import Redis from 'ioredis';

class CacheService {
    private redis: Redis | null = null;
    private isEnabled = false;

    constructor() {
        if (process.env.REDIS_URL) {
            try {
                this.redis = new Redis(process.env.REDIS_URL, {
                    maxRetriesPerRequest: 3,
                    retryStrategy: (times) => {
                        if (times > 3) return null;
                        return Math.min(times * 50, 2000);
                    }
                });

                this.redis.on('error', (err) => {
                    console.warn('[Cache] Redis connection error, caching disabled:', err.message);
                    this.isEnabled = false;
                });

                this.redis.on('connect', () => {
                    console.log('[Cache] Redis connected');
                    this.isEnabled = true;
                });
            } catch (error) {
                console.warn('[Cache] Failed to initialize Redis:', error);
            }
        } else {
            console.log('[Cache] No REDIS_URL provided, caching disabled.');
        }
    }

    /**
     * Get value from cache using a key
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isEnabled || !this.redis) return null;
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Set value in cache with optional TTL (seconds)
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (!this.isEnabled || !this.redis) return;
        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await this.redis.set(key, serialized, 'EX', ttl);
            } else {
                await this.redis.set(key, serialized);
            }
        } catch (error) {
            console.warn(`[Cache] Set failed for key ${key}`, error);
        }
    }

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        if (!this.isEnabled || !this.redis) return;
        await this.redis.del(key);
    }

    /**
     * Delete all keys matching a pattern
     * Use carefully!
     */
    async delPattern(pattern: string): Promise<void> {
        if (!this.isEnabled || !this.redis) return;

        try {
            const stream = this.redis.scanStream({ match: pattern });
            stream.on('data', (keys) => {
                if (keys.length) {
                    const pipeline = this.redis!.pipeline();
                    keys.forEach((key: string) => pipeline.del(key));
                    pipeline.exec();
                }
            });
        } catch (error) {
            console.warn(`[Cache] DelPattern failed for ${pattern}`, error);
        }
    }

    /**
     * Clear all cache (flushdb)
     */
    async clear(): Promise<void> {
        if (!this.isEnabled || !this.redis) return;
        await this.redis.flushdb();
    }
}

export const cacheService = new CacheService();
