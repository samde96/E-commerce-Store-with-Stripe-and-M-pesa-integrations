'use client'
import { useAppContext } from '@/context/AppContext'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const PaymentFailed = () => {
  const { router } = useAppContext()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    // Get error details from URL params
    const message = searchParams.get('message') || 'Payment was not completed'
    const method = searchParams.get('method') || 'payment'
    setErrorMessage(message)
    setPaymentMethod(method)
  }, [searchParams])

  const handleRetry = () => {
    router.push('/cart')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className='min-h-screen flex flex-col justify-center items-center gap-5 px-4'>
      <div className="flex justify-center items-center relative">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-3 max-w-md">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Payment Failed
        </h1>
        <p className="text-gray-600 text-base">
          {errorMessage}
        </p>
        {paymentMethod && (
          <p className="text-sm text-gray-500">
            Payment Method: <span className="font-medium">{paymentMethod}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Need help? Contact our support team</p>
      </div>
    </div>
  )
}

export default PaymentFailed
