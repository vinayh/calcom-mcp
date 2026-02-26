# Cal.com MCP Server

An MCP server for the [Cal.com](https://cal.com) API v2, enabling LLMs to manage your scheduling data — bookings, event types, schedules, profiles, teams, users, and webhooks.

## Features

- List and inspect event types, bookings, schedules, teams, users, and webhooks
- Create bookings with full attendee and location configuration
- Update schedules (availability, timezone, overrides) and user profiles
- Read-only and write tools are annotated with safety hints

## Install

Download the latest `.mcpb` from [Releases](https://github.com/vinayh/calcom-mcp/releases) and open it in Claude Desktop.

You'll be prompted for your Cal.com API v2 key. Get one from **Cal.com Settings > Developer > API Keys**.

## Configuration

The only required configuration is your Cal.com API v2 key, which is passed as the `CALCOM_API_KEY` environment variable. The key is stored securely by the host application.

## Tools

| Tool | Description | Hint |
|------|-------------|------|
| `get_api_status` | Check if the API key is configured | read-only |
| `list_event_types` | List active event types with duration, location, and owner | read-only |
| `get_bookings` | Fetch bookings with filters (status, date range, event type) | read-only |
| `create_booking` | Create a booking for an event type and attendee | write |
| `list_schedules` | List all schedules for the authenticated user | read-only |
| `get_schedule` | Get a schedule by ID with availability and overrides | read-only |
| `update_schedule` | Update a schedule's name, timezone, or availability | destructive |
| `get_my_profile` | Get the authenticated user's profile | read-only |
| `update_my_profile` | Update profile (name, email, timezone, bio, etc.) | destructive |
| `list_teams` | List all teams | read-only |
| `list_users` | List all users | read-only |
| `list_webhooks` | List all webhooks | read-only |

## Examples

### 1. List upcoming bookings

**Prompt:** "Show me my bookings for next week"

The LLM calls `get_bookings` with a date range:

```json
{
  "date_from": "2025-03-03",
  "date_to": "2025-03-09",
  "status": "ACCEPTED",
  "limit": 20
}
```

Returns a JSON array of bookings with attendee names, times, and event type details.

### 2. Browse available event types

**Prompt:** "What event types do I have set up?"

The LLM calls `list_event_types` with no arguments. Returns a summary of each active event type:

```json
[
  {
    "id": 12345,
    "title": "30 Minute Meeting",
    "slug": "30min",
    "length_minutes": 30,
    "owner_profile_slug": "vinay",
    "location_summary": "Google Meet",
    "requires_confirmation": false,
    "description_preview": "A quick 30-minute call."
  }
]
```

### 3. Create a booking

**Prompt:** "Book a 30-minute meeting with jane@example.com tomorrow at 2pm ET"

The LLM calls `create_booking`:

```json
{
  "event_type_id": 12345,
  "start_time": "2025-03-01T19:00:00Z",
  "attendee_name": "Jane Doe",
  "attendee_email": "jane@example.com",
  "attendee_timezone": "America/New_York"
}
```

Returns the created booking confirmation with a meeting link.

### 4. Update your schedule

**Prompt:** "Change my schedule timezone to Pacific time"

The LLM calls `list_schedules` to find the schedule ID, then `update_schedule`:

```json
{
  "schedule_id": 67890,
  "time_zone": "America/Los_Angeles"
}
```

## Development

```bash
npm install
npm run build
npm start
```

### Building the .mcpb bundle

```bash
npm run build
mcpb pack . calcom-mcp.mcpb
```

## Privacy Policy

This MCP server runs locally on your machine. It connects to the [Cal.com API](https://cal.com/docs/api-reference) using your API key to read and write scheduling data on your behalf.

- **Data collected:** None. The server does not collect, store, or transmit any data beyond what is sent directly to the Cal.com API.
- **Data usage:** Your API key and scheduling data are used solely to fulfill your requests via the Cal.com API.
- **Third parties:** Data is sent only to Cal.com's API (`api.cal.com`). No other third-party services are contacted. See [Cal.com's privacy policy](https://cal.com/privacy) for how Cal.com handles your data.
- **Data retention:** The server stores nothing between sessions. Your API key is managed by the host application (e.g., Claude Desktop).
- **Contact:** [GitHub Issues](https://github.com/vinayh/calcom-mcp/issues)

## Support

File issues at [github.com/vinayh/calcom-mcp/issues](https://github.com/vinayh/calcom-mcp/issues).

## License

[MIT](LICENSE)
