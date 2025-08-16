import { experimental_createMCPClient } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("I GOT HERE???");
  const { messages } = await req.json();
  console.log("messages", messages);

  const client = await experimental_createMCPClient({
    transport: {
      type: "sse",
      url: "http://localhost:8000/sse",
    },
    // model: anthropic('claude-sonnet-4-20250514'),
    // messages: convertToCoreMessages(messages),
  });
  const tools = await client.tools();
  console.log(tools);

  return {
    hello: "world",
  };
}
