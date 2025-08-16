import { anthropic } from "@ai-sdk/anthropic";
import { experimental_createMCPClient, generateText } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("I GOT HERE???");
  const { messages } = await req.json();
  const { content: message } = messages[0];
  console.log("messages", messages, message);

  const elevenLabsClient = await experimental_createMCPClient({
    transport: {
      type: "sse",
      url: "http://localhost:8000/sse", // ElevenLabs
    },
  });
  const elevenLabsTools = await elevenLabsClient.tools();

  const exaTransport = new Experimental_StdioMCPTransport({
    command: "npx",
    args: [
      "-y",
      "@smithery/cli@latest",
      "run",
      "exa",
      "--key",
      "4e6b8680-e2d8-48e6-989a-2c1e47c7cc3f",
      "--profile",
      "muddy-chameleon-CMJ5HY",
    ],
  });
  const exaClient = await experimental_createMCPClient({
    transport: exaTransport,
  });
  const exaTools = await exaClient.tools();

  const response = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    tools: { ...elevenLabsTools, ...exaTools },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Find top news in "${message}"`,
          },
        ],
      },
    ],
  });

  const toolResult = response.content.find((c) => {
    return c.type === "tool-result";
  });

  const content = toolResult?.output?.content ?? [];
  const text = content.map((c) => JSON.stringify(c.text)).join();
  // console.log(text);

  const summaryResponse = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    // tools: elevenLabsTools, // no need for tools
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Summarize this and write a report like a news reporter would say "${text}"`,
          },
        ],
      },
    ],
  });

  console.log("summary", summaryResponse.content);

  const summaryText = summaryResponse.content.map((c) => c.text).join();

  const speechResponse = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    tools: elevenLabsTools,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Generate speech from the given text: "${summaryText}"`,
          },
        ],
      },
    ],
  });
  console.log(speechResponse);

  return Response.json({
    hello: speechResponse.content.text ?? "no response",
  });
}
