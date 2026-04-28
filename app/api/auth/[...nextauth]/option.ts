
import {NextAuthOptions} from 'next-auth'

import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook"

import bcrypt from 'bcryptjs';

import prisma from '../../../../db/prisma';

export const authOptions:NextAuthOptions  = {

    providers:[
        CredentialsProvider({
             id: "Credentials",
             name: "Credentials",
             credentials: {
                email: { label: "Email", type: "text" },
               password: { label: "Password", type: "password" }
    },
    async authorize(credentials:any):Promise<any>{

        try {
          const user = await prisma.user.findUnique({
  where: { email: credentials.email }
})

              if(!user){
                throw new Error("No user found with this email")
              }

              if(!user.isVerified){
                throw new Error("Please verify your account before login")
              }

              const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password)

              if(isPasswordCorrect){
                return user
              }else{
                 throw new Error("Incorrect Password")
              }



        } catch (error) {
             throw new Error(error instanceof Error ? error.message : String(error))
        }


    }


        }),
         FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  }),
    ],
    callbacks:{
        async jwt({ token, user }) {

            if(user){
                token.id = user.id?.toString();
                token.isVerified = user.isVerified;
                token.full_name = user.full_name
            }

          return token
        },

      async session({ session, token }) {
           if(token){
                session.user.id = token.id?.toString()
                session.user.isVerified = token.isVerified
                session.user.full_name = token.full_name
            }
      return session
    }

    },


      
    pages:{
        signIn:'/signIn'
    },
 session:{
    strategy:'jwt'
 },

    secret:process.env.NEXTAUTH_SECRET,

     


}