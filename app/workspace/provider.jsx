'use client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from './_components/AppSideBar'
import AppHeader from './_components/AppHeader'

function WorkspaceProvider({ children, userCredits, userTier }) {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <div className='w-full '>
          <AppHeader userCredits={userCredits} userTier={userTier} />
          <div className='p-6'>
            {children}
          </div>

        </div>

      </SidebarProvider>

    </div>
  )
}

export default WorkspaceProvider
