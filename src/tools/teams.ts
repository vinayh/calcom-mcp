import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { isConfigured, calGet } from "../cal-client.js";

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerTeamTools(server: McpServer) {
  server.tool(
    "list_teams",
    "List all teams available to the authenticated user",
    {
      limit: z.number().default(20).describe("Max results to return"),
    },
    { readOnlyHint: true, destructiveHint: false },
    async ({ limit }) => {
      if (!isConfigured()) return text({ error: "Cal.com API key not configured." });
      return text(await calGet("/teams", { take: String(limit) }));
    }
  );
}
