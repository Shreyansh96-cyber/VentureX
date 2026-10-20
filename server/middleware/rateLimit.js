const createRateLimiter = ({ limit, windowMs, message }) => {
  const buckets = new Map();
  let requestsSinceCleanup = 0;

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 256) {
      for (const [address, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(address);
      }
      requestsSinceCleanup = 0;
    }

    if (bucket.count >= limit) {
      return res.status(429).json({
        success: false,
        code: "RATE_LIMITED",
        message,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      });
    }

    bucket.count += 1;
    return next();
  };
};

export const registrationRateLimit = createRateLimiter({
  limit: 8,
  windowMs: 15 * 60 * 1000,
  message: "Too many registration attempts. Please try again later.",
});

export const verificationRateLimit = createRateLimiter({
  limit: 20,
  windowMs: 15 * 60 * 1000,
  message: "Too many verification attempts. Please try again later.",
});

export const resendRateLimit = createRateLimiter({
  limit: 8,
  windowMs: 15 * 60 * 1000,
  message: "Too many code requests. Please try again later.",
});