# Security Setup Guide

This guide explains how to configure and use the security features implemented in M-Shop E-Commerce application.

## Table of Contents
1. [Cloudflare Turnstile Setup](#cloudflare-turnstile-setup)
2. [Environment Variables](#environment-variables)
3. [Rate Limiting](#rate-limiting)
4. [Security Headers](#security-headers)
5. [Protected Endpoints](#protected-endpoints)
6. [Usage Examples](#usage-examples)

---

## Cloudflare Turnstile Setup

### 1. Create Turnstile Site Key

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** section
3. Click **Add Site**
4. Configure your site:
   - **Site name**: M-Shop E-Commerce
   - **Domain**: Your domain (e.g., `localhost` for development, `mshop.com` for production)
   - **Widget Mode**: Managed (recommended)
5. Copy the **Site Key** and **Secret Key**

### 2. Add Keys to Environment Variables

Add these to your `.env.local` file:

```env
# Cloudflare Turnstile
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key_here
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key_here
```

---

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# ================================
# CLOUDFLARE SECURITY
# ================================

# Turnstile CAPTCHA (Get from https://dash.cloudflare.com/turnstile)
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CLOUDFLARE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# ================================
# EXISTING VARIABLES
# ================================

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# MongoDB
MONGODB_URI=your_mongodb_uri

# M-Pesa
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/order/mpesa/callback

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

---

## Rate Limiting

The application includes built-in rate limiting to prevent abuse and DDoS attacks.

### Rate Limit Presets

```javascript
STRICT:        5 requests per minute   // Login, Payment
MODERATE:      20 requests per minute  // Orders, Address
LENIENT:       60 requests per minute  // General API
VERY_LENIENT:  100 requests per minute // Read-only
```

### How It Works

- Rate limits are tracked per IP address
- Limits reset after the time window expires
- Returns 429 status code when limit is exceeded
- Includes `Retry-After` header in response

### Rate Limit Headers

Responses include these headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 45
```

---

## Security Headers

All API responses include security headers to protect against common attacks:

### Applied Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enable XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS |
| `Permissions-Policy` | `geolocation=()...` | Restrict browser features |

### Global Middleware

The `middleware.js` file applies security headers to ALL routes automatically.

---

## Protected Endpoints

### Critical Endpoints with Full Protection

These endpoints have rate limiting, security checks, and optional Turnstile verification:

1. **POST /api/order/mpesa** - M-Pesa Payment (STRICT rate limit)
2. **POST /api/user/add-address** - Add Address (MODERATE rate limit)
3. **POST /api/order/stripe** - Stripe Payment (STRICT rate limit)
4. **POST /api/blog/create** - Create Blog Post (MODERATE rate limit)

### Security Checks Applied

✅ **Rate Limiting** - Prevents brute force and DDoS
✅ **Authorization Header Validation** - Validates token format
✅ **Suspicious Pattern Detection** - Blocks SQL injection, XSS, etc.
✅ **IP Tracking** - Uses Cloudflare headers for accurate IP
✅ **Security Headers** - Applied to all responses

---

## Usage Examples

### 1. Using Turnstile Widget in Forms

Add Turnstile to your checkout or payment forms:

```jsx
import TurnstileWidget from "@/components/TurnstileWidget";
import { useState } from "react";

function CheckoutForm() {
  const [turnstileToken, setTurnstileToken] = useState(null);

  const handlePayment = async () => {
    const response = await fetch('/api/order/mpesa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        items,
        amount,
        phoneNumber,
        turnstileToken // Include the token
      })
    });
  };

  return (
    <form>
      {/* Your form fields */}

      <TurnstileWidget
        onVerify={(token) => setTurnstileToken(token)}
        onError={() => setTurnstileToken(null)}
        onExpire={() => setTurnstileToken(null)}
      />

      <button onClick={handlePayment} disabled={!turnstileToken}>
        Pay Now
      </button>
    </form>
  );
}
```

### 2. Protecting Custom API Routes

Apply security to your own API routes:

```javascript
import { NextResponse } from "next/server";
import { checkRateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { applySecurityHeaders, performSecurityChecks } from "@/lib/securityHeaders";
import { verifyTurnstileToken, getClientIP } from "@/lib/cloudflare";

export async function POST(request) {
  // 1. Security checks
  const securityCheck = performSecurityChecks(request, {
    checkAuth: true,
    checkSuspicious: true
  });

  if (!securityCheck.passed) {
    return NextResponse.json(
      { success: false, message: securityCheck.message },
      { status: securityCheck.status, headers: applySecurityHeaders() }
    );
  }

  // 2. Rate limiting
  const rateLimitResult = await checkRateLimit(request, RateLimitPresets.MODERATE);

  if (rateLimitResult.error) {
    return NextResponse.json(
      rateLimitResult.response,
      { status: rateLimitResult.status, headers: applySecurityHeaders(rateLimitResult.headers) }
    );
  }

  // 3. Verify Turnstile (optional)
  const { turnstileToken } = await request.json();

  if (turnstileToken) {
    const clientIP = getClientIP(request);
    const verification = await verifyTurnstileToken(turnstileToken, clientIP);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, message: verification.error },
        { status: 403, headers: applySecurityHeaders() }
      );
    }
  }

  // Your API logic here...

  return NextResponse.json(
    { success: true, data: yourData },
    { headers: applySecurityHeaders(rateLimitResult.headers) }
  );
}
```

### 3. Client-Side Error Handling

Handle rate limit errors gracefully:

```javascript
try {
  const response = await fetch('/api/order/mpesa', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    toast.error(`Too many requests. Please wait ${retryAfter} seconds.`);
    return;
  }

  if (response.status === 403) {
    const result = await response.json();
    toast.error(result.message || 'Security verification failed');
    return;
  }

  const result = await response.json();
  // Handle success
} catch (error) {
  console.error('Payment error:', error);
}
```

---

## Testing Security Features

### 1. Test Rate Limiting

Make multiple rapid requests to test rate limits:

```javascript
// This should be blocked after 5 requests
for (let i = 0; i < 10; i++) {
  await fetch('/api/order/mpesa', {
    method: 'POST',
    body: JSON.stringify(testData)
  });
}
```

### 2. Test Turnstile

1. Enable Turnstile on a form
2. Submit without solving CAPTCHA - should be blocked
3. Solve CAPTCHA and submit - should succeed

### 3. Test Security Headers

Check response headers in browser DevTools:

```bash
curl -I https://your-domain.com/api/order/list
```

Should include all security headers.

---

## Production Deployment

### Cloudflare Configuration

If deploying behind Cloudflare:

1. **Enable Bot Fight Mode** in Cloudflare Dashboard
2. **Configure Firewall Rules** for additional protection
3. **Enable DDoS Protection** (automatic)
4. **Set up Rate Limiting** at Cloudflare level (optional, in addition to app-level)

### Recommended Settings

- Use **production** Turnstile keys (not test keys)
- Enable **HTTPS only** mode
- Configure **CORS** properly
- Monitor **rate limit logs**
- Set up **alerts** for suspicious activity

---

## Monitoring & Logs

### Console Logs

Security events are logged to console:

```
[API] POST /api/order/mpesa - IP: 192.168.1.1
Suspicious request blocked: /api/../../../etc/passwd
Turnstile verification failed: ['timeout-or-duplicate']
```

### Recommended Monitoring

1. Track rate limit violations
2. Monitor failed Turnstile verifications
3. Log blocked suspicious requests
4. Set up alerts for unusual patterns

---

## Troubleshooting

### Common Issues

**1. Turnstile not showing**
- Check `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` is set
- Verify domain is allowed in Cloudflare dashboard
- Check browser console for errors

**2. Rate limit too strict**
- Adjust preset in endpoint code
- Clear rate limit cache (restart server)
- Check if IP detection is working

**3. Security checks blocking legitimate requests**
- Review `performSecurityChecks` configuration
- Whitelist specific patterns if needed
- Check authorization header format

**4. CORS errors**
- Ensure `Access-Control-Allow-Origin` is set
- Check if `validateOrigin` needs configuration

---

## Security Best Practices

✅ **Always use HTTPS** in production
✅ **Rotate API keys** regularly
✅ **Monitor logs** for suspicious activity
✅ **Keep dependencies updated**
✅ **Use environment variables** for secrets
✅ **Enable Turnstile** on critical forms
✅ **Test security features** before deployment
✅ **Document security policies**

---

## Support

For security concerns or questions:
- Review this documentation
- Check application logs
- Consult Cloudflare documentation: https://developers.cloudflare.com/turnstile/
- Contact development team

---

**Last Updated**: January 2025
**Version**: 1.0.0
