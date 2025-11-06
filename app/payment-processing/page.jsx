'use client'
import { useAppContext } from '@/context/AppContext'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'

const PaymentProcessingContent = () => {
  const { router } = useAppContext()
  const searchParams = useSearchParams()
  const { getToken } = useAuth()
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [status, setStatus] = useState('processing') // processing, success, failed, timeout
  const [message, setMessage] = useState('Processing your payment...')
  const [pollCount, setPollCount] = useState(0)
  const maxPolls = 60 // Poll for up to 60 seconds (60 * 1 second)

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    const methodParam = searchParams.get('method') || 'M-Pesa'

    if (!orderIdParam) {
      toast.error('No order ID provided')
      router.push('/cart')
      return
    }

    setOrderId(orderIdParam)
    setPaymentMethod(methodParam)

    // Start polling for payment status
    const pollInterval = setInterval(async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get(
          `/api/order/status/${orderIdParam}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (data.success) {
          const order = data.order

          if (order.isPaid && order.status === 'Order Placed') {
            // Payment successful
            clearInterval(pollInterval)
            setStatus('success')
            setMessage('Payment confirmed! Redirecting to your orders...')
            toast.success('Payment successful!')

            setTimeout(() => {
              router.push('/my-orders')
            }, 2000)
          } else if (order.status === 'Payment Failed') {
            // Payment failed
            clearInterval(pollInterval)
            setStatus('failed')
            const failureReason = order.paymentFailureReason || 'Payment was not completed'
            setMessage(failureReason)
            toast.error(failureReason)

            setTimeout(() => {
              const errorMessage = encodeURIComponent(failureReason)
              router.push(`/payment-failed?message=${errorMessage}&method=${methodParam}`)
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }

      setPollCount(prev => {
        const newCount = prev + 1
        if (newCount >= maxPolls) {
          clearInterval(pollInterval)
          setStatus('timeout')
          setMessage('Payment verification timed out. Please check your orders or contact support.')
          toast.error('Payment verification timed out')

          setTimeout(() => {
            router.push('/my-orders')
          }, 5000)
        }
        return newCount
      })
    }, 1000) // Poll every second

    return () => clearInterval(pollInterval)
  }, [searchParams, router, getToken])

  const handleCheckOrders = () => {
    router.push('/my-orders')
  }

  const handleRetry = () => {
    router.push('/cart')
  }

  const handleManualVerify = async () => {
    try {
      toast.loading('Verifying payment manually...', { id: 'manual-verify' })
      const token = await getToken()

      const { data } = await axios.post(
        '/api/order/mpesa/manual-verify',
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.dismiss('manual-verify')

      if (data.success) {
        toast.success('Payment verified successfully!')
        setStatus('success')
        setMessage('Payment confirmed! Redirecting to your orders...')
        setTimeout(() => {
          router.push('/my-orders')
        }, 2000)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.dismiss('manual-verify')
      toast.error('Verification failed: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className='min-h-screen flex flex-col justify-center items-center gap-6 px-4'>
      {/* Status Icon */}
      <div className="flex justify-center items-center relative">
        {status === 'processing' && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-blue-500 border-gray-200"></div>
            <div className="absolute">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {(status === 'failed' || status === 'timeout') && (
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
        )}
      </div>

      {/* Status Message */}
      <div className="text-center space-y-3 max-w-md">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {status === 'processing' && 'Processing Payment'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'failed' && 'Payment Failed'}
          {status === 'timeout' && 'Verification Timeout'}
        </h1>
        <p className="text-gray-600 text-base">
          {message}
        </p>
        {paymentMethod && (
          <p className="text-sm text-gray-500">
            Payment Method: <span className="font-medium">{paymentMethod}</span>
          </p>
        )}
        {status === 'processing' && (
          <p className="text-xs text-gray-400 mt-2">
            {pollCount < 30
              ? 'Please complete the payment on your phone...'
              : 'Still waiting for confirmation...'}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(status === 'failed' || status === 'timeout') && (
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {status === 'timeout' && (
            <button
              onClick={handleManualVerify}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              I Have Paid - Verify Now
            </button>
          )}
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleCheckOrders}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Check My Orders
          </button>
        </div>
      )}

      {status === 'processing' && pollCount > 30 && (
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={handleManualVerify}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            I Have Paid - Verify Now
          </button>
          <button
            onClick={handleCheckOrders}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Check orders manually
          </button>
        </div>
      )}

      {/* Order ID */}
      {orderId && (
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Order ID: {orderId.slice(-8).toUpperCase()}</p>
        </div>
      )}
    </div>
  )
}

const PaymentProcessing = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentProcessingContent />
    </Suspense>
  )
}

export default PaymentProcessing
