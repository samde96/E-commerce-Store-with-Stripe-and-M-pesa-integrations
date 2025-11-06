/**
 * In-memory rate limiter for API endpoints
 * Prevents DDoS and brute force attacks
 */

const rateLimitStore = new Map();

/**
 * Clean up old entries every 10 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
  STRICT: { windowMs: 60 * 1000, max: 5 },        // 5 requests per minute (login, signup)
  MODERATE: { windowMs: 60 * 1000, max: 20 },    // 20 requests per minute (orders, payments)
  LENIENT: { windowMs: 60 * 1000, max: 60 },     // 60 requests per minute (general API)
  VERY_LENIENT: { windowMs: 60 * 1000, max: 100 } // 100 requests per minute (read-only)
};

/**
 * Rate limiter middleware
 * @param {Object} options - Rate limit configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests allowed in window
 * @param {string} options.identifier - Custom identifier (defaults to IP)
 * @returns {Promise<{allowed: boolean, remaining: number, resetTime: number}>}
 */
export async function rateLimit(request, options = RateLimitPresets.MODERATE) {
  const { windowMs, max } = options;

  // Get identifier (IP address or custom key)
  let identifier = options.identifier;
  if (!identifier) {
    // Extract IP from various headers
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIp = request.headers.get('x-real-ip');

    identifier = cfConnectingIp ||
                (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) ||
                xRealIp ||
                'unknown';
  }

  const key = `${identifier}:${request.url}`;
  const now = Date.now();

  // Get or create rate limit data
  let limitData = rateLimitStore.get(key);

  if (!limitData || now > limitData.resetTime) {
    // Create new window
    limitData = {
      count: 0,
      resetTime: now + windowMs
    };
  }

  // Increment counter
  limitData.count++;
  rateLimitStore.set(key, limitData);

  const allowed = limitData.count <= max;
  const remaining = Math.max(0, max - limitData.count);

  return {
    allowed,
    remaining,
    resetTime: limitData.resetTime,
    retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
  };
}

/**
 * Check if request is allowed, return rate limit response if not
 */
export async function checkRateLimit(request, options) {
  const result = await rateLimit(request, options);

  if (!result.allowed) {
    return {
      error: true,
      status: 429,
      response: {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter
      },
      headers: {
        'X-RateLimit-Limit': options.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        'Retry-After': result.retryAfter.toString()
      }
    };
  }

  return {
    error: false,
    headers: {
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    }
  };
}

/**
 * Get rate limit status for a request without incrementing
 */
export function getRateLimitStatus(request, options = RateLimitPresets.MODERATE) {
  const identifier = request.headers.get('cf-connecting-ip') ||
                    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                    'unknown';
  const key = `${identifier}:${request.url}`;
  const limitData = rateLimitStore.get(key);
  const now = Date.now();

  if (!limitData || now > limitData.resetTime) {
    return {
      count: 0,
      remaining: options.max,
      resetTime: now + options.windowMs
    };
  }

  return {
    count: limitData.count,
    remaining: Math.max(0, options.max - limitData.count),
    resetTime: limitData.resetTime
  };
}
