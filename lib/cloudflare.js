import axios from "axios";

/**
 * Verify Cloudflare Turnstile token
 * @param {string} token - The Turnstile token from the client
 * @param {string} remoteip - The user's IP address (optional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyTurnstileToken(token, remoteip = null) {
  try {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error("CLOUDFLARE_TURNSTILE_SECRET_KEY is not set");
      return { success: false, error: "Server configuration error" };
    }

    if (!token) {
      return { success: false, error: "No verification token provided" };
    }

    // Verify with Cloudflare
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.data.success) {
      return { success: true };
    } else {
      console.error('Turnstile verification failed:', response.data['error-codes']);
      return {
        success: false,
        error: 'Verification failed. Please try again.',
        codes: response.data['error-codes']
      };
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return {
      success: false,
      error: 'Verification service unavailable'
    };
  }
}

/**
 * Extract client IP from request headers
 * Handles various proxy headers including Cloudflare
 */
export function getClientIP(request) {
  // Check Cloudflare header first
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // Check other common proxy headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  // Fallback
  return request.headers.get('x-forwarded-for') || 'unknown';
}
