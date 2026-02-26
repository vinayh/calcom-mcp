import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { isConfigured, calGet, calPatch } from "../cal-client.js";

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function notConfigured() {
  return text({ error: "Cal.com API key not configured." });
}

export function registerScheduleTools(server: McpServer) {
  server.tool(
    "list_schedules",
    "List all schedules available to the authenticated user or for a specific user/team",
    {
      user_id: z.number().optional().describe("Filter by user ID"),
      team_id: z.number().optional().describe("Filter by team ID"),
      limit: z.number().default(20).describe("Max results to return"),
    },
    { readOnlyHint: true, destructiveHint: false },
    async ({ user_id, team_id, limit }) => {
      if (!isConfigured()) return notConfigured();

      const params: Record<string, string> = { take: String(limit) };
      if (user_id !== undefined) params.userId = String(user_id);
      if (team_id !== undefined) params.teamId = String(team_id);

      return text(await calGet("/schedules", params));
    }
  );

  server.tool(
    "get_schedule",
    "Get a specific schedule by ID with availability and overrides",
    {
      schedule_id: z.number().describe("The ID of the schedule to retrieve"),
    },
    { readOnlyHint: true, destructiveHint: false },
    async ({ schedule_id }) => {
      if (!isConfigured()) return notConfigured();
      return text(await calGet(`/schedules/${schedule_id}`, undefined, "2024-06-11"));
    }
  );

  server.tool(
    "update_schedule",
    "Update an existing schedule's name, timezone, availability blocks, or date overrides",
    {
      schedule_id: z.number().describe("The ID of the schedule to update"),
      name: z.string().optional().describe("New display name"),
      time_zone: z.string().optional().describe("IANA timezone (e.g., 'Europe/Rome')"),
      is_default: z.boolean().optional().describe("Set as default schedule"),
      availability: z
        .array(
          z.object({
            days: z.array(z.string()),
            startTime: z.string(),
            endTime: z.string(),
          })
        )
        .optional()
        .describe("Recurring availability blocks"),
      overrides: z
        .array(
          z.object({
            date: z.string(),
            startTime: z.string(),
            endTime: z.string(),
          })
        )
        .optional()
        .describe("Date-specific overrides"),
    },
    { readOnlyHint: false, destructiveHint: true },
    async ({ schedule_id, name, time_zone, is_default, availability, overrides }) => {
      if (!isConfigured()) return notConfigured();

      const payload: Record<string, unknown> = {};
      if (name !== undefined) payload.name = name;
      if (time_zone !== undefined) payload.timeZone = time_zone;
      if (is_default !== undefined) payload.isDefault = is_default;
      if (availability !== undefined) payload.availability = availability;
      if (overrides !== undefined) payload.overrides = overrides;

      if (Object.keys(payload).length === 0) {
        return text({ error: "No fields provided to update." });
      }

      return text(await calPatch(`/schedules/${schedule_id}`, payload, "2024-06-11"));
    }
  );
}
