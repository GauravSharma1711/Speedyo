import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import prisma from "../../../../db/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "Credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) throw new Error("No user found with this email");
          if (!user.isVerified) throw new Error("Please verify your account before login");

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) throw new Error("Incorrect Password");

          return user;
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : String(error));
        }
      },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        (token as any).id = (user as any).id?.toString();
        (token as any).isVerified = (user as any).isVerified;
        (token as any).full_name = (user as any).full_name;
        (token as any).role = (user as any).role;
        (token as any).email = (user as any).email;
  
        (token as any).location = (user as any).location ?? null;
        (token as any).setup_completed = (user as any).setup_completed ?? false;
        (token as any).user_type = (user as any).user_type ?? "guest";
  
        (token as any).image = (user as any).profile_image ?? (user as any).image ?? undefined;

        (token as any).verification_fee_paid = (user as any).verification_fee_paid ?? false;
(token as any).dealership_verification_status = (user as any).dealership_verification_status ?? "not_submitted";

      }
  
      // if (trigger === "update" && session?.user) {
      //   (token as any).full_name = (session.user as any).full_name ?? (token as any).full_name;
      //   (token as any).image = (session.user as any).image ?? (token as any).image;
  
      //   (token as any).location = (session.user as any).location ?? (token as any).location;
      //   (token as any).setup_completed =
      //     (session.user as any).setup_completed ?? (token as any).setup_completed;
      //   (token as any).user_type = (session.user as any).user_type ?? (token as any).user_type;
      // }
      

       if (trigger === "update" ) {
    const freshUser = await prisma.user.findUnique({
      where: { id: (token as any).id },
    });

    if (freshUser) {
      (token as any).full_name = freshUser.full_name;
      (token as any).image = freshUser.profile_image ?? (token as any).image;
      (token as any).location = freshUser.location ?? null;
      (token as any).setup_completed = freshUser.setup_completed ?? false;
      (token as any).user_type = freshUser.user_type ?? "guest";
      (token as any).role = freshUser.role;
      (token as any).isVerified = freshUser.isVerified;
      (token as any).verification_fee_paid = freshUser.verification_fee_paid ?? false;
       (token as any).dealership_verification_status = freshUser.dealership_verification_status ?? "not_submitted";
    }
  }
  
      return token;
    },

    
  
    async session({ session, token }) {
      session.user.id = ((token as any).id ?? "") as string;
      (session.user as any).isVerified = (token as any).isVerified;
      (session.user as any).full_name = (token as any).full_name;
      (session.user as any).role = (token as any).role;
      session.user.email = ((token as any).email ?? session.user.email ?? "") as string;
  
      (session.user as any).image = (token as any).image ?? (session.user as any).image ?? undefined;

      (session.user as any).location = (token as any).location ?? null;
      (session.user as any).setup_completed = (token as any).setup_completed ?? false;
      (session.user as any).user_type = (token as any).user_type ?? "guest";

      (session.user as any).verification_fee_paid = (token as any).verification_fee_paid ?? false;
(session.user as any).dealership_verification_status = (token as any).dealership_verification_status ?? "not_submitted";
  
      return session;
    },
  },

  pages: {
    signIn: "/signIn",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};