import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import { useClerk } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const Navbar = () => {

  const { router } = useAppContext()
  const { signOut } = useClerk()

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: '/' }) // Sign out the user and redirect
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b'>
      <Image onClick={()=>router.push('/')} className='w-28 lg:w-32 cursor-pointer' src={assets.logo} alt="" />
      <button onClick={handleLogout}className='bg-green-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar