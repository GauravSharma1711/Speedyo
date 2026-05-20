import { NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt"

export async function middleware(request:NextRequest) {

      const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production" 
      ? "__Secure-next-auth.session-token" 
      : "next-auth.session-token",
  });
  
    const url = request.nextUrl

    if(token &&  (
        url.pathname.startsWith('/signIn')||
        url.pathname.startsWith('/signUp')||
           url.pathname.startsWith('/verify')
         
    )){
        return NextResponse.redirect(new URL('/Dashboard', request.url))
    }

     if (!token && (
        url.pathname.startsWith('/Dashboard') ||
        url.pathname.startsWith('/Feed') ||
        url.pathname.startsWith('/Messages') ||
        url.pathname.startsWith('/Managed-Sales')  ||
        url.pathname.startsWith('/Admin-Panel') ||
        url.pathname.startsWith('/Checkout') ||
        url.pathname.startsWith('/Profile') 
    )) {
        return NextResponse.redirect(new URL('/signIn', request.url))
    }

     return NextResponse.next()
}

export const config = {
    matcher: [
        '/signIn',
        '/signUp',
        '/:path*'

    ]  
}                          
                              