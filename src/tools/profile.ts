import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { isConfigured, calGet, calPatch } from "../cal-client.js";

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function notConfigured() {
  return text({ error: "Cal.com API key not configured." });
}

export function registerProfileTools(server: McpServer) {
  server.tool(
    "get_my_profile",
    "Get the profile of the currently authenticated Cal.com user",
    {},
    async () => {
      if (!isConfigured()) return notConfigured();
      return text(await calGet("/me"));
    }
  );

  server.tool(
    "update_my_profile",
    "Update the profile of the currently authenticated Cal.com user (name, email, timezone, bio, etc.)",
    {
      email: z.string().optional().describe("New email (requires verification)"),
      name: z.string().optional().describe("Display name"),
      time_format: z.union([z.literal(12), z.literal(24)]).optional().describe("Time format (12 or 24)"),
      default_schedule_id: z.number().optional().describe("Default schedule ID"),
      week_start: z.string().optional().describe("Week start day (e.g., 'Monday')"),
      time_zone: z.string().optional().describe("IANA timezone (e.g., 'America/New_York')"),
      locale: z.string().optional().describe("Language/locale code (e.g., 'en')"),
      avatar_url: z.string().optional().describe("Avatar image URL"),
      bio: z.string().optional().describe("User biography"),
      metadata: z.record(z.unknown()).optional().describe("Custom key-value metadata"),
    },
    async ({ email, name, time_format, default_schedule_id, week_start, time_zone, locale, avatar_url, bio, metadata }) => {
      if (!isConfigured()) return notConfigured();

      const payload: Record<string, unknown> = {};
      if (email !== undefined) payload.email = email;
      if (name !== undefined) payload.name = name;
      if (time_format !== undefined) payload.timeFormat = time_format;
      if (default_schedule_id !== undefined) payload.defaultScheduleId = default_schedule_id;
      if (week_start !== undefined) payload.weekStart = week_start;
      if (time_zone !== undefined) payload.timeZone = time_zone;
      if (locale !== undefined) payload.locale = locale;
      if (avatar_url !== undefined) payload.avatarUrl = avatar_url;
      if (bio !== undefined) payload.bio = bio;
      if (metadata !== undefined) payload.metadata = metadata;

      if (Object.keys(payload).length === 0) {
        return text({ error: "No fields provided to update." });
      }

      return text(await calPatch("/me", payload));
    }
  );
}
