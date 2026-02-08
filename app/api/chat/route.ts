import { type GoogleGenerativeAIProviderOptions, google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { PORTFOLIO_CONTEXT } from "@/lib/ai-context";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: PORTFOLIO_CONTEXT,
    messages: await convertToModelMessages(messages),
    providerOptions: {
      google: {
        thinkingConfig: {
          includeThoughts: true,
          thinkingLevel: "minimal",
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  });

  return result.toUIMessageStreamResponse();
}
