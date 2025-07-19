import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

function AppHeader() {
  return (
    <div className='w-full p-4 flex items-center justify-between shadow-sm'>
      <SidebarTrigger/>
       <UserButton/>
    </div>
  )
}

export default AppHeader
