'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const OrderPlaced = () => {
  const { router } = useAppContext()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    // Get payment method from URL if provided
    const method = searchParams.get('method')
    if (method) {
      setPaymentMethod(method)
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/my-orders')
    }, 5000)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(redirectTimer)
    }
  }, [router, searchParams])

  const handleViewOrders = () => {
    router.push('/my-orders')
  }

  const handleContinueShopping = () => {
    router.push('/')
  }

  return (
    <div className='min-h-screen flex flex-col justify-center items-center gap-6 px-4'>
      <div className="flex justify-center items-center relative">
        <Image className="absolute p-5 z-10" src={assets.checkmark} alt='Success' />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-500 border-gray-200"></div>
      </div>

      <div className="text-center space-y-3 max-w-md">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 text-base">
          Thank you for your order. We've received it and will process it shortly.
        </p>
        {paymentMethod && (
          <p className="text-sm text-gray-500">
            Payment Method: <span className="font-medium text-green-600">{paymentMethod}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={handleViewOrders}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          View My Orders
        </button>
        <button
          onClick={handleContinueShopping}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Redirecting to your orders in {countdown} seconds...</p>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500 max-w-md">
        <p>You will receive an email confirmation shortly with your order details and tracking information.</p>
      </div>
    </div>
  )
}

export default OrderPlaced