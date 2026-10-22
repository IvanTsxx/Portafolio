import { getNotes } from "@/lib/content/notes";
import { experiments } from "@/lib/lab/experiments";
import { buildLlmsTxt, llmsSections } from "@/lib/markdown/llms";
import { plainTextResponse } from "@/lib/markdown/response";
import { registryItems } from "@/lib/registry/registry";
import { skills } from "@/lib/skills/skills";

export const GET = async () =>
  plainTextResponse(
    buildLlmsTxt(
      llmsSections({
        experiments,
        notes: await getNotes(),
        registryItems,
        skills,
      })
    )
  );
