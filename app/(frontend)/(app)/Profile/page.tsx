import ProfilePage from '@/components/profile/ProfilePage'
import React,{Suspense} from 'react'

const page = () => {
  return (
    <div>
           <Suspense fallback={<div>Loading...</div>}>
        <ProfilePage/>
      </Suspense>
     
    </div>
  )
}

export default page