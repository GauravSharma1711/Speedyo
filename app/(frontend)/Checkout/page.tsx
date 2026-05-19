import Checkout from '@/components/checkout/Checkout'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Checkout />
      </Suspense>
    </div>
  )
}

export default page