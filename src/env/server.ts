import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().min(1),
  LASTFM_USERNAME: z.string().min(1),
  LASTFM_API_KEY: z.string().min(1),
});

export const env = envSchema.parse({
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  LASTFM_USERNAME: process.env.LASTFM_USERNAME,
  LASTFM_API_KEY: process.env.LASTFM_API_KEY,
});
