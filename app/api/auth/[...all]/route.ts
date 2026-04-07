import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/shared/lib/auth";

export const { POST, GET } = toNextJsHandler(auth);
