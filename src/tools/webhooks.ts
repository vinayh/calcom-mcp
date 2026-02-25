import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { isConfigured, calGet } from "../cal-client.js";

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerWebhookTools(server: McpServer) {
  server.tool(
    "list_webhooks",
    "List all webhooks configured for the authenticated account",
    {
      limit: z.number().default(20).describe("Max results to return"),
    },
    async ({ limit }) => {
      if (!isConfigured()) return text({ error: "Cal.com API key not configured." });
      return text(await calGet("/webhooks", { take: String(limit) }));
    }
  );
}
