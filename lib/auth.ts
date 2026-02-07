
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";



const ALLOWED_EMAILS = [
  "bongiovanniivan12@gmail.com",
  
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
    },
  },
  emailAndPassword: {
    enabled: false,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  callbacks: {
    async session({ session, user }) {
      // Only allow specific emails
      if (!ALLOWED_EMAILS.includes(user.email)) {
        throw new Error("Unauthorized");
      }
      return session;
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
