# 🛡️ Security Features

M-Shop E-Commerce includes comprehensive security protection against DDoS attacks, brute force attempts, and unauthorized access.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Cloudflare Turnstile

1. Visit [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile)
2. Create a new site
3. Copy your Site Key and Secret Key
4. Add to `.env.local`:

```env
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key
```

### 3. Test Security

Start your application and try making multiple rapid API requests - you'll see rate limiting in action!

---

## 🔒 Security Features Implemented

### ✅ Rate Limiting
- **Protection**: Prevents DDoS and brute force attacks
- **Implementation**: In-memory rate limiter with configurable limits
- **Presets**:
  - STRICT (5/min) - Payments, Login
  - MODERATE (20/min) - Orders, Addresses
  - LENIENT (60/min) - General API
  - VERY_LENIENT (100/min) - Read-only

### ✅ Cloudflare Turnstile CAPTCHA
- **Protection**: Bot and automated attack prevention
- **Implementation**: Modern, privacy-friendly CAPTCHA
- **Usage**: Optional on critical endpoints, can be enforced

### ✅ Security Headers
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables XSS filtering
- **Strict-Transport-Security**: Forces HTTPS
- **Content-Security-Policy**: Restricts resource loading
- And more...

### ✅ Authorization Protection
- **Token Validation**: Validates Bearer token format
- **Header Sanitization**: Prevents header injection
- **Token Length Checks**: Ensures valid Clerk tokens

### ✅ Attack Pattern Detection
- **SQL Injection**: Detects and blocks SQL injection attempts
- **XSS**: Prevents cross-site scripting attacks
- **Path Traversal**: Blocks directory traversal attempts
- **NoSQL Injection**: Protects MongoDB queries

### ✅ IP Tracking
- **Cloudflare Integration**: Uses CF-Connecting-IP header
- **Proxy Support**: Handles X-Forwarded-For and X-Real-IP
- **Accurate Tracking**: Proper IP detection behind proxies

---

## 📁 Security Files Structure

```
lib/
├── cloudflare.js          # Turnstile verification
├── rateLimit.js           # Rate limiting logic
└── securityHeaders.js     # Security headers & validation

components/
└── TurnstileWidget.jsx    # CAPTCHA component

middleware.js              # Global security middleware

Protected API Endpoints:
├── /api/order/mpesa       # M-Pesa payments (STRICT)
├── /api/order/stripe      # Stripe payments (STRICT)
└── /api/user/add-address  # Address management (MODERATE)
```

---

## 🎯 Protected Endpoints

### Critical Endpoints (STRICT Rate Limit)
- `POST /api/order/mpesa` - M-Pesa Payment (5 req/min)
- `POST /api/order/stripe` - Stripe Payment (5 req/min)

### Moderate Endpoints (MODERATE Rate Limit)
- `POST /api/user/add-address` - Add Address (20 req/min)
- `POST /api/blog/create` - Create Blog (20 req/min)

### All Endpoints
- Global security headers via `middleware.js`
- Automatic suspicious pattern detection
- IP logging for API requests

---

## 💻 Usage Example

### Adding CAPTCHA to Forms

```jsx
import TurnstileWidget from "@/components/TurnstileWidget";

function PaymentForm() {
  const [turnstileToken, setTurnstileToken] = useState(null);

  return (
    <form>
      {/* Your form fields */}

      <TurnstileWidget onVerify={setTurnstileToken} />

      <button disabled={!turnstileToken}>
        Submit Payment
      </button>
    </form>
  );
}
```

### Making Protected API Request

```javascript
const response = await fetch('/api/order/mpesa', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000,
    phoneNumber: '0712345678',
    turnstileToken // Include CAPTCHA token
  })
});

if (response.status === 429) {
  // Rate limited - show error
}
```

---

## 🔧 Configuration

### Rate Limit Presets

Customize in your API routes:

```javascript
import { RateLimitPresets } from "@/lib/rateLimit";

// Use preset
await checkRateLimit(request, RateLimitPresets.STRICT);

// Or custom
await checkRateLimit(request, {
  windowMs: 60 * 1000,  // 1 minute
  max: 10                // 10 requests
});
```

### Security Checks

Configure security validation:

```javascript
const securityCheck = performSecurityChecks(request, {
  checkAuth: true,        // Validate authorization header
  checkSuspicious: true,  // Detect attack patterns
  checkOrigin: false,     // Validate request origin
  checkCSRF: false        // CSRF token validation
});
```

---

## 📊 Monitoring

### Console Logs

```bash
[API] POST /api/order/mpesa - IP: 192.168.1.1
Suspicious request blocked: /api/../../../etc/passwd
Rate limit exceeded for IP: 203.0.113.5
```

### Rate Limit Headers

Check responses for rate limit info:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 2025-01-15T10:30:00Z
Retry-After: 45
```

---

## ⚠️ Important Notes

### Development
- Turnstile works on `localhost` without additional configuration
- Rate limits are stored in memory (resets on server restart)
- All logs visible in console

### Production
- Use **production** Turnstile keys from Cloudflare
- Enable HTTPS (Strict-Transport-Security enforced)
- Consider persistent rate limit storage (Redis/Database)
- Monitor logs for security events
- Set up alerts for unusual activity

---

## 🐛 Troubleshooting

### "Rate limit exceeded"
- Wait for the time window to expire
- Check `Retry-After` header
- Review rate limit preset in code

### "Security verification failed"
- Ensure Turnstile keys are correct
- Check if domain is whitelisted in Cloudflare
- Verify internet connection

### "Invalid authorization"
- Check Bearer token format
- Ensure Clerk authentication is working
- Verify token hasn't expired

---

## 📚 Documentation

- **Full Setup Guide**: [SECURITY_SETUP.md](./SECURITY_SETUP.md)
- **Environment Variables**: [.env.example](./.env.example)
- **Cloudflare Turnstile**: https://developers.cloudflare.com/turnstile/

---

## 🎉 Benefits

✅ **DDoS Protection** - Rate limiting prevents service overload
✅ **Bot Prevention** - Turnstile blocks automated attacks
✅ **Attack Detection** - Pattern matching catches common exploits
✅ **Secure Headers** - Industry-standard security headers
✅ **Token Protection** - Authorization validation prevents abuse
✅ **Easy Integration** - Simple API for protecting endpoints
✅ **Production Ready** - Battle-tested security patterns

---

**Need Help?** Check the full [SECURITY_SETUP.md](./SECURITY_SETUP.md) guide for detailed information.
