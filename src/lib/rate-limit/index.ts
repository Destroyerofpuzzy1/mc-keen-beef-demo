import 'server-only';
import { env } from '@/lib/env';
import { logEvent } from '@/lib/security/log';

/**
 * Fixed-window rate limiter with two backends (docs/security.md §4):
 *  - upstash: Upstash Redis REST (INCR + EXPIRE). Required for serverless / multi-instance.
 *  - memory:  per-process Map. Valid for development and single-instance hosting only.
 */
export interface LimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
  /** True when the backend failed and the decision was taken by the fail policy. */
  degraded?: boolean;
}

export interface LimitOptions {
  limit: number;
  windowSec: number;
  /** What to do if the persistent backend is unreachable. */
  onBackendError: 'allow' | 'deny';
}

const memory = new Map<string, { count: number; resetAt: number }>();
let warned = false;

function memoryLimit(key: string, { limit, windowSec }: LimitOptions): LimitResult {
  const now = Date.now();
  if (memory.size > 10_000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  }
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  entry.count += 1;
  const ok = entry.count <= limit;
  return { ok, remaining: Math.max(0, limit - entry.count), retryAfterSec: ok ? 0 : Math.ceil((entry.resetAt - now) / 1000) };
}

async function upstashLimit(key: string, opts: LimitOptions): Promise<LimitResult> {
  const { upstashUrl, upstashToken } = env.rateLimit;
  const res = await fetch(`${upstashUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${upstashToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(opts.windowSec), 'NX'],
      ['TTL', key],
    ]),
    signal: AbortSignal.timeout(3000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const data = (await res.json()) as { result: number }[];
  const count = Number(data[0]?.result ?? 0);
  const ttl = Number(data[2]?.result ?? opts.windowSec);
  const ok = count <= opts.limit;
  return { ok, remaining: Math.max(0, opts.limit - count), retryAfterSec: ok ? 0 : Math.max(1, ttl) };
}

export async function rateLimit(bucket: string, clientKey: string, opts: LimitOptions): Promise<LimitResult> {
  const key = `rl:${bucket}:${clientKey}`;
  if (env.rateLimit.upstashUrl && env.rateLimit.upstashToken) {
    try {
      return await upstashLimit(key, opts);
    } catch (err) {
      logEvent('error', 'rate-limit.backend-error', { bucket, policy: opts.onBackendError, message: (err as Error).message });
      return { ok: opts.onBackendError === 'allow', remaining: 0, retryAfterSec: 60, degraded: true };
    }
  }
  if (env.isProd && !warned) {
    warned = true;
    logEvent('warn', 'rate-limit.memory-in-production', {
      note: 'In-memory limiter is per instance. Configure UPSTASH_REDIS_REST_URL/TOKEN for serverless or multi-instance hosting.',
    });
  }
  return memoryLimit(key, opts);
}
