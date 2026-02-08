import { APIError, betterAuth } from "better-auth";
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
    },
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [nextCookies(), anonymous()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!ALLOWED_EMAILS.includes(user.email)) {
            throw new APIError("BAD_REQUEST", {
              message: "Email not allowed",
            });
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
