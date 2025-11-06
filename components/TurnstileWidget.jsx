"use client";
import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";

/**
 * Cloudflare Turnstile CAPTCHA Widget
 * Add this to forms that need bot protection
 */
const TurnstileWidget = ({ onVerify, onError, onExpire, theme = "light", size = "normal" }) => {
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.warn("Turnstile site key not configured");
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={(error) => {
          console.error("Turnstile error:", error);
          if (onError) onError(error);
        }}
        onExpire={() => {
          console.log("Turnstile token expired");
          if (onExpire) onExpire();
        }}
        options={{
          theme,
          size,
          action: 'submit',
          cData: 'mshop-security'
        }}
      />
    </div>
  );
};

export default TurnstileWidget;
