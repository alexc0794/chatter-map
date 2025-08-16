import { anthropic } from "@ai-sdk/anthropic";
import { experimental_createMCPClient, generateText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("I GOT HERE???");
  const { messages } = await req.json();
  const { content: message } = messages[0];
  console.log("messages", messages, message);

  const client = await experimental_createMCPClient({
    transport: {
      type: "sse",
      url: "http://localhost:8000/sse", // ElevenLabs
    },
  });
  const elevenLabsTools = await client.tools();

  const response = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    tools: elevenLabsTools,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Generate speech from the given text: "${message}"`,
          },
        ],
      },
    ],
  });

  console.log(response.text);

  return Response.json({
    hello: "world",
  });
}
