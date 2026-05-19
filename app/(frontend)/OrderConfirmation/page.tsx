import React, { Suspense } from 'react'
import OrderConfirmation from '@/components/checkout/OrderConfirmation'


const page = () => {
  return (
    <div>
<Suspense fallback={<div>Loading...</div>}>
        <OrderConfirmation/>
      </Suspense>
    </div>
  )
}

export default page




       
