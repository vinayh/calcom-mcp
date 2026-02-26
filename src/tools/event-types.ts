import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { isConfigured, calGet } from "../cal-client.js";

interface Location {
  type?: string;
}

interface EventType {
  id?: number;
  title?: string;
  slug?: string;
  length?: number;
  hidden?: boolean;
  userId?: number;
  teamId?: number;
  locations?: Location[];
  requiresConfirmation?: boolean;
  description?: string;
}

interface EventTypeGroup {
  id?: number;
  profile?: { slug?: string };
  eventTypes?: EventType[];
}

function formatLocation(loc: Location): string {
  return (loc.type ?? "unknown")
    .replace("integrations:google:meet", "Google Meet")
    .replace("integrations:zoom:zoom_video", "Zoom")
    .replace("integrations:microsoft:teams", "Microsoft Teams")
    .replace("inPerson", "In-person");
}

function summarizeLocations(locations: Location[]): string {
  const types = locations.map(formatLocation);
  if (types.some((t) => t.toLowerCase().includes("daily") || t.toLowerCase().includes("calvideo"))) {
    return "Cal Video";
  }
  return types.join(", ") || "Provider configured";
}

function formatEventType(et: EventType, ownerSlug: string) {
  return {
    id: et.id,
    title: et.title,
    slug: et.slug,
    length_minutes: et.length,
    owner_profile_slug: ownerSlug,
    location_summary: summarizeLocations(et.locations ?? []),
    requires_confirmation: et.requiresConfirmation ?? false,
    description_preview: et.description
      ? et.description.slice(0, 100) + (et.description.length > 100 ? "..." : "")
      : "No description.",
  };
}

export function registerEventTypeTools(server: McpServer) {
  server.tool(
    "list_event_types",
    "Fetch a list of active (non-hidden) event types from Cal.com with simplified details",
    {},
    { readOnlyHint: true, destructiveHint: false },
    async () => {
      if (!isConfigured()) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Cal.com API key not configured." }) }] };
      }

      const raw = (await calGet("/event-types")) as Record<string, unknown>;
      if ("error" in raw) {
        return { content: [{ type: "text", text: JSON.stringify(raw) }] };
      }

      const data = (raw as { data?: { eventTypeGroups?: EventTypeGroup[]; eventTypes?: EventType[] } }).data;
      const groups = data?.eventTypeGroups ?? [];
      const options: ReturnType<typeof formatEventType>[] = [];

      if (groups.length === 0 && data?.eventTypes) {
        for (const et of data.eventTypes) {
          if (!et.hidden) {
            const ownerSlug = et.teamId ? `team_id_${et.teamId}` : `user_id_${et.userId}`;
            options.push(formatEventType(et, ownerSlug));
          }
        }
      } else {
        for (const group of groups) {
          const ownerSlug = group.profile?.slug ?? `group_owner_id_${group.id}`;
          for (const et of group.eventTypes ?? []) {
            if (!et.hidden) {
              options.push(formatEventType(et, ownerSlug));
            }
          }
        }
      }

      if (options.length === 0) {
        return { content: [{ type: "text", text: JSON.stringify({ message: "No active (non-hidden) event types found." }) }] };
      }

      return { content: [{ type: "text", text: JSON.stringify(options, null, 2) }] };
    }
  );
}
