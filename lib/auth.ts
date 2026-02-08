import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins";
import { env } from "@/env/server";
import { prisma } from "./prisma";

const ALLOWED_EMAILS = ["bongiovanniivan12@gmail.com"];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  emailAndPassword: {
    enabled: false,
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      // Only allow specific emails
      if (!ALLOWED_EMAILS.includes(user.email)) {
        console.log("Unauthorized");
        throw new Error("Unauthorized");
      }
      console.log("Authorized");
      return session;
    },
  },
  plugins: [nextCookies(), anonymous()],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
