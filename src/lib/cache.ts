import type { CacheEntry } from '@/types/github'

// In-memory cache for development
const memoryCache = new Map<string, CacheEntry<any>>()

// Redis cache for production (optional)
let redisClient: any = null

async function getRedisClient() {
  if (redisClient) return redisClient

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis')
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      return redisClient
    } catch (error) {
      console.warn('Failed to initialize Redis client:', error)
      return null
    }
  }
  return null
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    // Try Redis first in production
    if (!process.env.DEV_MODE) {
      const redis = await getRedisClient()
      if (redis) {
        const cached = await redis.get(key)
        if (cached) {
          const entry: CacheEntry<T> = typeof cached === 'string' ? JSON.parse(cached) : cached
          if (entry.expiresAt > Date.now()) {
            return entry.data
          } else {
            // Clean up expired entry
            await redis.del(key)
          }
        }
      }
    }

    // Fallback to memory cache
    const cached = memoryCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    } else if (cached) {
      // Clean up expired entry
      memoryCache.delete(key)
    }

    return null
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

export async function setCachedData<T>(
  key: string, 
  data: T, 
  ttlMs: number = 6 * 60 * 60 * 1000 // 6 hours default
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  }

  try {
    // Try Redis first in production
    if (!process.env.DEV_MODE) {
      const redis = await getRedisClient()
      if (redis) {
        await redis.set(key, JSON.stringify(entry), { px: ttlMs })
        return
      }
    }

    // Fallback to memory cache
    memoryCache.set(key, entry)

    // Clean up old entries periodically
    if (memoryCache.size > 100) {
      const now = Date.now()
      for (const [cacheKey, cacheEntry] of memoryCache.entries()) {
        if (cacheEntry.expiresAt < now) {
          memoryCache.delete(cacheKey)
        }
      }
    }
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

export async function clearCache(pattern?: string): Promise<void> {
  try {
    if (!process.env.DEV_MODE) {
      const redis = await getRedisClient()
      if (redis) {
        if (pattern) {
          const keys = await redis.keys(pattern)
          if (keys.length > 0) {
            await redis.del(...keys)
          }
        } else {
          await redis.flushall()
        }
        return
      }
    }

    // Clear memory cache
    if (pattern) {
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key)
        }
      }
    } else {
      memoryCache.clear()
    }
  } catch (error) {
    console.error('Cache clear error:', error)
  }
}
