# Claude Flow

A dashboard for visualizing Claude Code session data. Browse sessions, view conversation timelines, analyze token usage, inspect tool calls, and stream live sessions.

## Quick Start

```
npx ccflow
```

Or install globally:

```
npm install -g ccflow
ccflow
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

### `ccflow` / `ccflow serve`

Start the dashboard server (default command).

```
ccflow                   # Start with defaults
ccflow --port 8080       # Custom port (default: 3179)
ccflow --no-open         # Don't auto-open browser
```

### `ccflow sessions` / `ccflow ls`

List recent sessions.

```
ccflow sessions
```

### `ccflow stats`

Show token usage summary.

```
ccflow stats
```

### `ccflow config`

Manage configuration.

```
ccflow config            # Show current config
ccflow config --path     # Print config file path
ccflow config --reset    # Reset config to defaults
```

### General

```
ccflow --help            # Show help
ccflow --version         # Show version
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
    shared/    @ccflow/shared   - Shared types and utilities
    server/    @ccflow/server   - Node.js HTTP server + CLI
    web/       @ccflow/web      - React frontend (Vite)
```

## Tech Stack

- **Frontend** - React 19, React Router 7, Zustand, Tailwind CSS 4, Recharts
- **Backend** - Node.js native HTTP server, Server-Sent Events for live streaming
- **Build** - pnpm workspaces, Vite, TypeScript

## License

[MIT](LICENSE)
