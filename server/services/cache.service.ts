import Redis from 'ioredis';
import { redis as upstashRedis } from '../../lib/redis';

class CacheService {
    private redis: Redis | null = null;
    private upstash: typeof upstashRedis | null = null;
    private isEnabled = false;
    private mode: 'ioredis' | 'upstash' | 'none' = 'none';

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
                    this.mode = 'none';
                });

                this.redis.on('connect', () => {
                    console.log('[Cache] Redis connected (ioredis)');
                    this.isEnabled = true;
                    this.mode = 'ioredis';
                });
            } catch (error) {
                console.warn('[Cache] Failed to initialize Redis:', error);
            }
        } else if (process.env.UPSTASH_REDIS_REST_URL) {
            this.upstash = upstashRedis;
            this.isEnabled = true;
            this.mode = 'upstash';
            console.log('[Cache] Using Upstash REST client');
        } else {
            console.log('[Cache] No Redis credentials provided, caching disabled.');
        }
    }

    /**
     * Get value from cache using a key
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isEnabled) return null;
        try {
            if (this.mode === 'ioredis' && this.redis) {
                const data = await this.redis.get(key);
                return data ? JSON.parse(data) : null;
            } else if (this.mode === 'upstash' && this.upstash) {
                return await this.upstash.get<T>(key);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Set value in cache with optional TTL (seconds)
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (!this.isEnabled) return;
        try {
            if (this.mode === 'ioredis' && this.redis) {
                const serialized = JSON.stringify(value);
                if (ttl) {
                    await this.redis.set(key, serialized, 'EX', ttl);
                } else {
                    await this.redis.set(key, serialized);
                }
            } else if (this.mode === 'upstash' && this.upstash) {
                if (ttl) {
                    await this.upstash.set(key, value, { ex: ttl });
                } else {
                    await this.upstash.set(key, value);
                }
            }
        } catch (error) {
            console.warn(`[Cache] Set failed for key ${key}`, error);
        }
    }

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        if (!this.isEnabled) return;
        if (this.mode === 'ioredis' && this.redis) {
            await this.redis.del(key);
        } else if (this.mode === 'upstash' && this.upstash) {
            await this.upstash.del(key);
        }
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
        if (!this.isEnabled) return;
        if (this.mode === 'ioredis' && this.redis) {
            await this.redis.flushdb();
        } else if (this.mode === 'upstash' && this.upstash) {
            await this.upstash.flushdb();
        }
    }
}

export const cacheService = new CacheService();
