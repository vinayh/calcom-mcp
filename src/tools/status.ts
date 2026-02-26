import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { isConfigured } from "../cal-client.js";

export function registerStatusTools(server: McpServer) {
  server.tool(
    "get_api_status",
    "Check if the Cal.com API key is configured in the environment",
    {},
    { readOnlyHint: true, destructiveHint: false },
    async () => {
      const msg = isConfigured()
        ? "Cal.com API key is configured."
        : "Cal.com API key is NOT configured. Please set the CALCOM_API_KEY environment variable.";
      return { content: [{ type: "text", text: msg }] };
    }
  );
}
