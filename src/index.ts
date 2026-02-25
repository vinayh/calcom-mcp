#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerStatusTools } from "./tools/status.js";
import { registerEventTypeTools } from "./tools/event-types.js";
import { registerBookingTools } from "./tools/bookings.js";
import { registerScheduleTools } from "./tools/schedules.js";
import { registerProfileTools } from "./tools/profile.js";
import { registerTeamTools } from "./tools/teams.js";
import { registerUserTools } from "./tools/users.js";
import { registerWebhookTools } from "./tools/webhooks.js";

const server = new McpServer({
  name: "Cal.com MCP Server",
  version: "0.2.0",
});

registerStatusTools(server);
registerEventTypeTools(server);
registerBookingTools(server);
registerScheduleTools(server);
registerProfileTools(server);
registerTeamTools(server);
registerUserTools(server);
registerWebhookTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
