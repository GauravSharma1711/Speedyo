import ViewLiaisonAgreementUI from '@/components/ViewLiaisonAgreement/ViewLiaisonAgreement'
import React,{Suspense} from 'react'

const page = () => {
  return (
    <div>
              <Suspense fallback={<div>Loading...</div>}>
        <ViewLiaisonAgreementUI/>
              </Suspense>
              
    </div>
  )
}

export default page