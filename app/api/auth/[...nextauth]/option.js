
import {NextAuthOptions} from 'next-auth'

import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from 'bcryptjs';

import prisma from '../../../../db/prisma';

export const authOptions  = {

    providers:[
        CredentialsProvider({
             id: "Credentials",
             name: "Credentials",
             credentials: {
                identifier: { label: "Email or Username", type: "text" },
               password: { label: "Password", type: "password" }
    },
    async authorize(credentials){

        try {
          const user = await prisma.user.findFirst({
    where: {
        OR: [
            { email: credentials.identifier },
            { username: credentials.identifier }
        ]
    }
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


        })
    ],
    callbacks:{
        async jwt({ token, user }) {

            if(user){
                token.id = user.id?.toString()
                token.isVerifed = user.isVerifed
                username = user.username
            }

          return token
        },

      async session({ session, token }) {
           if(token){
                session.user.id = token.id?.toString()
                session.user.isVerifed = token.isVerifed
                session.user.username = token.username
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