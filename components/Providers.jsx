'use client'

import { AppContextProvider } from "@/context/AppContext";
import { CartProvider } from "@/context/CartContext";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <>
      <Toaster position="top-center" />
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-sm',
            card: 'shadow-xl',
            headerTitle: 'text-green-600',
            headerSubtitle: 'text-gray-600',
            socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
            formFieldInput: 'border-gray-300 focus:border-green-600',
            footerActionLink: 'text-green-600 hover:text-green-700'
          }
        }}
      >
        <AppContextProvider>
          <CartProvider>
          {children}
          </CartProvider>
        </AppContextProvider>
      </ClerkProvider>
    </>
  );
}
