import { NextResponse } from 'next/server';

/**
 * Global middleware for security headers and basic protection
 * This runs on all routes before they're processed
 */
export function middleware(request) {
  // Get response
  const response = NextResponse.next();

  // Apply security headers to all responses
  const securityHeaders = {
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
    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    // Remove server fingerprinting
    'X-Powered-By': '',
  };

  // Apply headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check for suspicious patterns in URL
  const url = request.nextUrl.pathname;
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS
    /union.*select/i, // SQL injection
    /\$where/i, // NoSQL injection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.warn(`Suspicious request blocked: ${url}`);
      return new NextResponse('Forbidden', {
        status: 403,
        headers: securityHeaders,
      });
    }
  }

  // Log API requests (optional - can be disabled in production)
  if (url.startsWith('/api/')) {
    const ip = request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-forwarded-for') ||
               'unknown';
    console.log(`[API] ${request.method} ${url} - IP: ${ip}`);
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
