import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { isConfigured, calGet, calPost } from "../cal-client.js";

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function notConfigured() {
  return text({ error: "Cal.com API key not configured." });
}

export function registerBookingTools(server: McpServer) {
  server.tool(
    "get_bookings",
    "Fetch bookings from Cal.com with optional filters (event type, user, status, date range)",
    {
      event_type_id: z.number().optional().describe("Filter by event type ID"),
      user_id: z.number().optional().describe("Filter by user ID"),
      status: z.enum(["ACCEPTED", "PENDING", "CANCELLED", "REJECTED"]).optional().describe("Filter by booking status"),
      date_from: z.string().optional().describe("Filter from date (ISO 8601)"),
      date_to: z.string().optional().describe("Filter to date (ISO 8601)"),
      limit: z.number().default(20).describe("Max results to return"),
    },
    { readOnlyHint: true, destructiveHint: false },
    async ({ event_type_id, user_id, status, date_from, date_to, limit }) => {
      if (!isConfigured()) return notConfigured();

      const params: Record<string, string> = {};
      if (event_type_id !== undefined) params.eventTypeId = String(event_type_id);
      if (user_id !== undefined) params.userId = String(user_id);
      if (status) params.status = status;
      if (date_from) params.dateFrom = date_from;
      if (date_to) params.dateTo = date_to;
      params.take = String(limit);

      return text(await calGet("/bookings", params));
    }
  );

  server.tool(
    "create_booking",
    "Create a new booking in Cal.com for a specific event type and attendee. This creates a real booking that notifies attendees.",
    {
      start_time: z.string().describe("Start time in ISO 8601 UTC (e.g., '2024-08-13T09:00:00Z')"),
      attendee_name: z.string().describe("Name of the primary attendee"),
      attendee_email: z.string().describe("Email of the primary attendee"),
      attendee_timezone: z.string().describe("IANA timezone of the attendee (e.g., 'America/New_York')"),
      event_type_id: z.number().optional().describe("Event type ID (or use event_type_slug + username/team_slug)"),
      event_type_slug: z.string().optional().describe("Event type slug (used with username or team_slug)"),
      username: z.string().optional().describe("Username of event owner (used with event_type_slug)"),
      team_slug: z.string().optional().describe("Team slug (used with event_type_slug)"),
      organization_slug: z.string().optional().describe("Organization slug"),
      attendee_phone_number: z.string().optional().describe("Attendee phone number"),
      attendee_language: z.string().optional().describe("Preferred language (e.g., 'en')"),
      guests: z.array(z.string()).optional().describe("Additional guest email addresses"),
      location_input: z.string().optional().describe("Meeting location"),
      metadata: z.record(z.unknown()).optional().describe("Custom key-value metadata"),
      length_in_minutes: z.number().optional().describe("Duration if event type allows variable lengths"),
      booking_fields_responses: z.record(z.unknown()).optional().describe("Custom booking field responses"),
    },
    { readOnlyHint: false, destructiveHint: false },
    async (args) => {
      if (!isConfigured()) return notConfigured();

      if (!args.event_type_id && !(args.event_type_slug && (args.username || args.team_slug))) {
        return text({ error: "Either 'event_type_id' or ('event_type_slug' and 'username'/'team_slug') must be provided." });
      }

      const payload: Record<string, unknown> = {
        start: args.start_time,
        attendee: {
          name: args.attendee_name,
          email: args.attendee_email,
          timeZone: args.attendee_timezone,
          ...(args.attendee_phone_number && { phoneNumber: args.attendee_phone_number }),
          ...(args.attendee_language && { language: args.attendee_language }),
        },
      };

      if (args.event_type_id) {
        payload.eventTypeId = args.event_type_id;
      } else {
        payload.eventTypeSlug = args.event_type_slug;
        if (args.username) payload.username = args.username;
        else if (args.team_slug) payload.teamSlug = args.team_slug;
        if (args.organization_slug) payload.organizationSlug = args.organization_slug;
      }

      if (args.guests) payload.guests = args.guests;
      if (args.location_input) payload.location = args.location_input;
      if (args.metadata) payload.metadata = args.metadata;
      if (args.length_in_minutes) payload.lengthInMinutes = args.length_in_minutes;
      if (args.booking_fields_responses) payload.bookingFieldsResponses = args.booking_fields_responses;

      return text(await calPost("/bookings", payload, "2024-08-13"));
    }
  );
}
