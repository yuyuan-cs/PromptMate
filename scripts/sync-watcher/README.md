# PromptMate Sync Watcher (Plan A)

A minimal Node.js watcher that monitors the browser-exported file and merges it into your desktop app data.

- Watches: Downloads/PromptMate/promptmate-sync.json (by default)
- Writes: App data JSON at a path you choose (env)
- Backups: Timestamped backup on every successful merge

## Prerequisites
- Node.js 16+
- No extra dependencies

## Paths (env vars)
- PM_WATCH_FILE: Path to the exported file from the extension
  - Default: <HOME>/Downloads/PromptMate/promptmate-sync.json
- PM_APP_DATA_FILE: Path to your desktop app data JSON (required)
  - Example: C:/Users/<you>/AppData/Roaming/PromptMate/app-data.json
- PM_BACKUP_DIR: Directory to store backups (optional)
  - Default: same directory as PM_APP_DATA_FILE under backups/

## Start
```bash
# Windows PowerShell example
$env:PM_APP_DATA_FILE = "$env:USERPROFILE\\AppData\\Roaming\\PromptMate\\app-data.json"
node watch-sync.js
```

## How it works
- Debounced fs.watch on PM_WATCH_FILE
- Reads JSON, validates shape, merges with existing app data using merge.js
- Writes merged result to PM_APP_DATA_FILE, creates a backup with ISO timestamp

## Merge rules (short)
- prompts (by id):
  - Pick newer by updatedAt when available; otherwise prefer incoming
  - usageCount: max(existing, incoming)
  - lastUsed: most recent timestamp
- categories (by id):
  - If names differ, prefer incoming
- settings:
  - Prefer existing, but fill missing fields from incoming

Adjust merge.js to match your exact semantics if needed.
