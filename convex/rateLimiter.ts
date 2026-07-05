import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

// ── Rate Limiter for Sensitive Operations ────────────────────

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  giving: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  role_change: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  auth_attempt: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  profile_update: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  notification_broadcast: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  member_deactivate: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
};

export async function checkRateLimit(
  ctx: MutationCtx,
  memberId: Id<"members">,
  action: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const config = RATE_LIMITS[action] ?? { maxRequests: 100, windowMs: 60 * 60 * 1000 };
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_member_action", (q) =>
      q.eq("memberId", memberId).eq("action", action)
    )
    .first();

  if (!existing || existing.windowStart < windowStart) {
    if (existing) {
      await ctx.db.patch(existing._id, { count: 1, windowStart: now });
    } else {
      await ctx.db.insert("rateLimits", {
        memberId,
        action,
        count: 1,
        windowStart: now,
      });
    }
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.windowStart + config.windowMs,
    };
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count - 1,
    resetAt: existing.windowStart + config.windowMs,
  };
}
