import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      full_name?: string
      role?: string
      user_type?: string
      isVerified?: boolean
      image?: string
    }
  }

  interface User {
    id: string
    full_name?: string
    role?: string
    user_type?: string
    isVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    full_name?: string
    role?: string
    user_type?: string
    isVerified?: boolean
  }
}