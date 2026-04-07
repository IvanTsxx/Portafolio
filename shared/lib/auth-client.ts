"use client";

import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/env/client";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL ?? "https://portafolio.localhost",
  plugins: [anonymousClient()],
});

export const { signIn, signOut, useSession } = authClient;
