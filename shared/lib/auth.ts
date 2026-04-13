// oxlint-disable typescript/no-non-null-assertion

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins";

import { env } from "@/env/server";
import { prisma } from "@/shared/lib/prisma";

const ANONYMOUS_NAMES = [
  "Mysterious Traveler",
  "Curious Cat",
  "Silent Observer",
  "Wandering Star",
  "Night Owl",
  "Hidden Guest",
  "Shadow Walker",
  "Lost in Space",
  "Anonymous Fox",
  "Quiet Panda",
  "Mystic Rabbit",
  "Secret Squirrel",
];

function generateAnonymousName(): string {
  return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  plugins: [
    nextCookies(),
    anonymous({
      disableDeleteAnonymousUser: true,
      generateName() {
        return generateAnonymousName();
      },
      async onLinkAccount({ anonymousUser, newUser }) {
        await prisma.reaction.updateMany({
          data: { userId: newUser.user.id },
          where: { userId: anonymousUser.user.id },
        });
        await prisma.postReaction.updateMany({
          data: { userId: newUser.user.id },
          where: { userId: anonymousUser.user.id },
        });
        await prisma.comment.updateMany({
          data: { authorId: newUser.user.id },
          where: { authorId: anonymousUser.user.id },
        });
      },
    }),
  ],
  secret: env.BETTER_AUTH_SECRET!,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL ?? "", "http://localhost:3000"].filter(
    Boolean
  ),
});
