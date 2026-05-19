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
      // Set on initial login
      if (user) {
        let dbUser: any = user;

        // For OAuth (Facebook), find or create user in DB by email
        if (user.email) {
          dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              full_name: (user as any).name ?? undefined,
              profile_image: (user as any).image ?? undefined,
            },
            create: {
              email: user.email,
              full_name: (user as any).name ?? null,
              profile_image: (user as any).image ?? null,
              password: (await import("crypto")).randomBytes(32).toString("hex"),
              verificationCode: "",
              verificationCodeExpiry: new Date(0),
              isVerified: true,
              user_type: "guest",
            },
          });
        }

        (token as any).id = dbUser.id?.toString();
        (token as any).isVerified = dbUser.isVerified;
        (token as any).full_name = dbUser.full_name;
        (token as any).role = dbUser.role;
        (token as any).email = dbUser.email;
        (token as any).location = dbUser.location ?? null;
        (token as any).setup_completed = dbUser.setup_completed ?? false;
        (token as any).user_type = dbUser.user_type ?? "guest";
        (token as any).image = dbUser.profile_image ?? (user as any).image ?? undefined;
        (token as any).dealership_selected_tier = dbUser.dealership_selected_tier ?? null;
        (token as any).verification_fee_paid = dbUser.verification_fee_paid ?? false;
        (token as any).dealership_verification_status = dbUser.dealership_verification_status ?? "not_submitted";
      }

      // Always refresh from DB
      if ((token as any).id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: (token as any).id },
          select: {
            full_name: true,
            profile_image: true,
            location: true,
            setup_completed: true,
            user_type: true,
            role: true,
            isVerified: true,
            verification_fee_paid: true,
            dealership_verification_status: true,
            dealership_selected_tier: true,
          }
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
          (token as any).dealership_selected_tier = freshUser.dealership_selected_tier ?? null;
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
      (session.user as any).dealership_selected_tier = (token as any).dealership_selected_tier ?? null;
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