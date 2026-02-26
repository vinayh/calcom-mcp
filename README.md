# Cal.com MCP Server

An MCP server for the [Cal.com](https://cal.com) API v2, enabling LLMs to manage your scheduling data — bookings, event types, schedules, profiles, teams, users, and webhooks.

## Install

Download the latest `.mcpb` from [Releases](https://github.com/vinayh/calcom-mcp/releases) and open it in Claude Desktop.

You'll be prompted for your Cal.com API v2 key. Get one from **Cal.com Settings > Developer > API Keys**.

## Tools

| Tool | Description |
|------|-------------|
| `get_api_status` | Check if the API key is configured |
| `list_event_types` | List active event types with duration, location, and owner |
| `get_bookings` | Fetch bookings with filters (status, date range, event type) |
| `create_booking` | Create a booking for an event type and attendee |
| `list_schedules` | List all schedules for the authenticated user |
| `get_schedule` | Get a schedule by ID with availability and overrides |
| `update_schedule` | Update a schedule's name, timezone, or availability |
| `get_my_profile` | Get the authenticated user's profile |
| `update_my_profile` | Update profile (name, email, timezone, bio, etc.) |
| `list_teams` | List all teams |
| `list_users` | List all users |
| `list_webhooks` | List all webhooks |

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

## License

MIT
