import { CREDITS_PER_COURSE, SUBSCRIPTION_PLANS } from '@/config/subscriptions'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

function AppHeader({ userCredits = 0, userTier = 'Free' }) {
  const plan = SUBSCRIPTION_PLANS.find(p => p.name === userTier) || SUBSCRIPTION_PLANS[0];
  const maxCredits = plan.credits;
  const coursesLeft = Math.floor(userCredits / CREDITS_PER_COURSE);
  const creditPercentage = Math.round((userCredits / maxCredits) * 100);

  return (
    <div className='w-full p-4 flex items-center justify-between shadow-sm bg-background border-b'>
      <div className='flex items-center gap-4'>
        <SidebarTrigger />
        <div className='ml-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wider'>
          {userTier} Plan
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <div className='flex flex-col items-end mr-4'>
          <span className='text-sm font-medium'>Credits: {userCredits} / {maxCredits}</span>
          <div className='flex items-center gap-2'>
            <div className='w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block'>
              <div
                className={`h-full transition-all duration-500 ${creditPercentage > 50 ? 'bg-green-500' : creditPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
            <span className='text-xs text-muted-foreground font-medium'>{creditPercentage}% remaining</span>
          </div>
        </div>
        <UserButton />
      </div>
    </div>
  )
}

export default AppHeader
