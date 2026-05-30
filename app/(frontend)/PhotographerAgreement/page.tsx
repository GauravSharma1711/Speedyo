import ViewPhotographerAgreementUI from '@/components/ViewPhotographerAgreement/ViewPhotographerAgreement'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div>
           <Suspense fallback={<div>Loading...</div>}>
        <ViewPhotographerAgreementUI/>
      </Suspense>
    </div>
  )
}

export default page