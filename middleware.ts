import { NextRequest, NextResponse } from "next/server";

// export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"

export async function middleware(request:NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const url = request.nextUrl

    if(token &&  (
        url.pathname.startsWith('/signIn')||
        url.pathname.startsWith('/signUp')||
           url.pathname.startsWith('/verify')
         
    )){
        // If already authenticated, send user to the app dashboard.
        return NextResponse.redirect(new URL('/Dashboard', request.url))
    }

     if (!token && (
        url.pathname.startsWith('/Dashboard') ||
        url.pathname.startsWith('/Feed') ||
        url.pathname.startsWith('/Messages') ||
        url.pathname.startsWith('/Managed-Sales')   
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
                              