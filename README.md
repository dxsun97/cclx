# CCLens

A dashboard for visualizing Claude Code session data. Browse sessions, view conversation timelines, analyze token usage, inspect tool calls, and stream live sessions.

## Quick Start

```
npx cclens
```

Or install globally:

```
npm install -g cclens
cclens
```

Opens at http://localhost:3179 automatically.

## Features

- **Dashboard** - session count, daily activity chart, token usage overview
- **Session Browser** - browse all projects and sessions
- **Conversation Timeline** - full message history with tool call details
- **Token Analytics** - input/output/cache token breakdowns
- **Tool Call Analysis** - every tool invocation with inputs and outputs
- **Live Streaming** - watch active sessions update in real-time
- **Subagent Viewer** - inspect agent-spawned sub-conversations

## CLI Usage

### `cclens` / `cclens serve`

Start the dashboard server (default command).

```
cclens                   # Start with defaults
cclens --port 8080       # Custom port (default: 3179)
cclens --no-open         # Don't auto-open browser
```

### `cclens sessions` / `cclens ls`

List recent sessions.

```
cclens sessions
```

### `cclens stats`

Show token usage summary.

```
cclens stats
```

### `cclens config`

Manage configuration.

```
cclens config            # Show current config
cclens config --path     # Print config file path
cclens config --reset    # Reset config to defaults
```

### General

```
cclens --help            # Show help
cclens --version         # Show version
```

## Configuration

Data sources are configured through the Settings page in the UI, or by editing `~/.claude-flow.json`.

By default, sessions are read from `~/.claude/projects/` (the standard Claude Code session directory).

```json
{
  "dataSources": [
    {
      "id": "claude-code",
      "label": "Claude Code",
      "path": "~/.claude/projects",
      "enabled": true
    }
  ]
}
```

## Development

```
git clone https://github.com/dxsun97/claude-flow.git
cd claude-flow
pnpm install
pnpm run dev
```

Starts the Vite dev server on port 3210 and the API server on port 3211.

### Build

```
pnpm run build
pnpm start
```

## Project Structure

```
claude-flow/
  packages/
    shared/    @cclens/shared   - Shared types and utilities
    server/    @cclens/server   - Node.js HTTP server + CLI
    web/       @cclens/web      - React frontend (Vite)
```

## Tech Stack

- **Frontend** - React 19, React Router 7, Zustand, Tailwind CSS 4, Recharts
- **Backend** - Node.js native HTTP server, Server-Sent Events for live streaming
- **Build** - pnpm workspaces, Vite, TypeScript

## License

[MIT](LICENSE)
