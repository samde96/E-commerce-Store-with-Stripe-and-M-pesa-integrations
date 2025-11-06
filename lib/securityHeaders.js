/**
 * Security headers and middleware for API protection
 * Prevents common attacks and secures authorization headers
 */

/**
 * Validate and sanitize authorization header
 * Prevents header injection and token theft
 */
export function validateAuthHeader(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return { valid: false, error: 'No authorization header' };
  }

  // Check Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Invalid authorization format' };
  }

  const token = authHeader.substring(7);

  // Validate token format (alphanumeric, dots, dashes, underscores only)
  if (!/^[a-zA-Z0-9._-]+$/.test(token)) {
    return { valid: false, error: 'Invalid token format' };
  }

  // Check token length (Clerk tokens are typically 200+ characters)
  if (token.length < 50 || token.length > 2000) {
    return { valid: false, error: 'Invalid token length' };
  }

  return { valid: true, token };
}

/**
 * Apply comprehensive security headers to response
 */
export function applySecurityHeaders(headers = {}) {
  return {
    ...headers,
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    // Content Security Policy
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    // Remove server fingerprinting
    'X-Powered-By': '',
    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
}

/**
 * Detect suspicious patterns in request
 */
export function detectSuspiciousActivity(request) {
  const suspiciousPatterns = [
    // SQL Injection patterns
    /(\bor\b|\band\b).*=.*['"]|union.*select|insert.*into|delete.*from|drop.*table/i,
    // XSS patterns
    /<script|javascript:|onerror=|onload=/i,
    // Path traversal
    /\.\.\/|\.\.\\|\%2e\%2e/i,
    // Command injection
    /;.*\||&&|\$\(|\`/,
    // NoSQL injection
    /\$where|\$ne|\$gt|\$lt/i
  ];

  const url = request.url;
  const body = request.body;

  // Check URL
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return {
        suspicious: true,
        reason: 'Suspicious pattern in URL',
        pattern: pattern.toString()
      };
    }
  }

  return { suspicious: false };
}

/**
 * Validate request origin
 */
export function validateOrigin(request, allowedOrigins = []) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // If no allowed origins specified, check if same origin
  if (allowedOrigins.length === 0) {
    const host = request.headers.get('host');
    if (origin && !origin.includes(host)) {
      return { valid: false, error: 'Invalid origin' };
    }
    return { valid: true };
  }

  // Check against allowed origins
  if (origin && !allowedOrigins.some(allowed => origin.includes(allowed))) {
    return { valid: false, error: 'Origin not allowed' };
  }

  return { valid: true };
}

/**
 * Check if request has valid CSRF token (for state-changing operations)
 */
export function validateCSRFToken(request) {
  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies?.get('csrf-token');

  // For development, you might want to skip this
  if (process.env.NODE_ENV === 'development') {
    return { valid: true };
  }

  if (!csrfHeader || !csrfCookie) {
    return { valid: false, error: 'Missing CSRF token' };
  }

  if (csrfHeader !== csrfCookie) {
    return { valid: false, error: 'Invalid CSRF token' };
  }

  return { valid: true };
}

/**
 * Check for bot/crawler User-Agent
 */
export function isSuspiciousUserAgent(request) {
  const userAgent = request.headers.get('user-agent') || '';

  const suspiciousAgents = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests',
    'postman',
    'insomnia'
  ];

  const lowerUA = userAgent.toLowerCase();
  return suspiciousAgents.some(agent => lowerUA.includes(agent));
}

/**
 * Apply rate limit headers to response
 */
export function applyRateLimitHeaders(response, rateLimitData) {
  if (rateLimitData.headers) {
    Object.entries(rateLimitData.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

/**
 * Complete security check middleware
 */
export function performSecurityChecks(request, options = {}) {
  const {
    checkAuth = false,
    checkOrigin = false,
    checkCSRF = false,
    checkSuspicious = true,
    allowedOrigins = []
  } = options;

  // Check for suspicious patterns
  if (checkSuspicious) {
    const suspiciousCheck = detectSuspiciousActivity(request);
    if (suspiciousCheck.suspicious) {
      return {
        passed: false,
        status: 403,
        message: 'Suspicious activity detected',
        details: suspiciousCheck
      };
    }
  }

  // Check authorization header format
  if (checkAuth) {
    const authCheck = validateAuthHeader(request);
    if (!authCheck.valid) {
      return {
        passed: false,
        status: 401,
        message: 'Invalid authorization',
        details: authCheck
      };
    }
  }

  // Check origin
  if (checkOrigin) {
    const originCheck = validateOrigin(request, allowedOrigins);
    if (!originCheck.valid) {
      return {
        passed: false,
        status: 403,
        message: 'Invalid origin',
        details: originCheck
      };
    }
  }

  // Check CSRF for POST/PUT/DELETE
  if (checkCSRF && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfCheck = validateCSRFToken(request);
    if (!csrfCheck.valid) {
      return {
        passed: false,
        status: 403,
        message: 'CSRF validation failed',
        details: csrfCheck
      };
    }
  }

  return { passed: true };
}
