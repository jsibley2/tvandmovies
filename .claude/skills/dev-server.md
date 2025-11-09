# Dev Server Manager

Ensure the Vite dev server is running on the correct port (5173), killing any stray processes on other ports.

## Purpose

Solves the common development workflow issue:
- Vite dev server starts on wrong port (3000, 3001, 5174, etc.) when 5173 is in use
- Multiple dev servers running simultaneously (port conflicts)
- Need to test new functionality but server is on unexpected port
- HMR (Hot Module Replacement) not working due to port mismatch
- Browser tabs pointing to wrong port

## The Problem

**Your notes from CLAUDE.md:**
```bash
# Current dev server: http://localhost:3001/ (port 3000 was in use)
```

This happens when:
1. Previous dev server didn't shut down cleanly
2. Another process is using port 5173
3. Multiple `npm run dev` commands were run
4. Port was already taken, Vite auto-incremented to next available

## What This Skill Does

1. **Check Port 5173** - See what's running there
2. **Find Stray Vite Servers** - Identify processes on other ports (3000, 3001, 5174, etc.)
3. **Kill All Dev Servers** - Clean up all running instances
4. **Start on Correct Port** - Launch fresh server on 5173
5. **Verify & Report** - Confirm server is running correctly
6. **Open Browser** - Optionally open http://localhost:5173

## When to Use

**Run this when:**
- About to test new functionality
- Dev server is on wrong port
- HMR stops working
- Getting port conflict errors
- Starting a new coding session
- After pulling changes from git

**Trigger scenarios:**
- "Let me test this new feature" → Run dev-server skill first
- "The server is on port 3001 again" → Run dev-server skill
- "Hot reload isn't working" → Run dev-server skill
- "Starting development work" → Run dev-server skill

## How It Works

### Step 1: Identify Processes
```bash
# Check what's on port 5173
lsof -i :5173

# Check common alternate ports
lsof -i :3000
lsof -i :3001
lsof -i :5174
lsof -i :5175

# Find all node/vite processes
ps aux | grep -E "(vite|node.*dev)"
```

### Step 2: Kill Stray Servers
```bash
# Kill specific port
lsof -ti :3001 | xargs kill -9

# Kill all Vite dev servers
pkill -f "vite.*--host"

# Nuclear option (all node dev processes)
pkill -f "node.*npm run dev"
```

### Step 3: Clean Start
```bash
# Start on correct port
npm run dev

# Verify it started
sleep 2
lsof -i :5173
```

### Step 4: Report Status
```
✅ Dev server running on http://localhost:5173
🔥 Killed 2 stray processes (ports 3001, 5174)
🌐 Ready to test new functionality
⚡ HMR enabled and working
```

## Safety Features

### Before Killing Processes
- Lists all processes that will be killed
- Shows PIDs and ports
- Confirms these are dev servers (not production)
- Asks for confirmation if unsure

### Smart Detection
```bash
# Only kill if it's actually a Vite/dev server
# Check process command includes "vite" or "npm run dev"
ps -p $PID -o command=
```

### Preserve Important Processes
```bash
# Don't kill:
- Production servers
- Database processes
- Supabase local
- Other important services

# Only kill:
- npm run dev
- vite (development)
- node processes running Vite
```

## Port Priority Order

The skill tries to start server in this order:
1. **5173** (preferred) - Standard Vite port
2. **5174** (fallback) - If 5173 legitimately in use
3. **Any** (last resort) - Let Vite find available port

## What You'll See

### Normal Operation
```
🔍 Checking dev server status...

Port 5173: ❌ Not in use
Port 3001: ✅ Vite dev server found (PID: 12345)

🔥 Killing stray processes...
   └─ Killed PID 12345 on port 3001

🚀 Starting dev server on port 5173...
   ✅ Vite v5.2.0 ready in 342 ms

�� Dev server ready:
   └─ http://localhost:5173

⚡ Status: Running
🔄 HMR: Enabled
📦 Mode: development
```

### When Port 5173 is Legitimately Used
```
🔍 Checking dev server status...

Port 5173: ✅ Unknown process (PID: 99999)
   └─ Command: /usr/bin/python -m http.server 5173

⚠️  Port 5173 is used by non-Vite process.

Options:
1. Kill it anyway (if safe)
2. Use port 5174 instead
3. Manually investigate

Choice?
```

## Integration with Your Workflow

### Before Testing New Features
```bash
# Old workflow (manual):
1. Check what port it's on
2. Kill process if needed
3. Restart server
4. Wait for it to start
5. Open browser to correct URL
6. Test feature

# New workflow (automated):
1. Use dev-server skill
2. Test feature
```

### Configuration in CLAUDE.md
```bash
# Update your CLAUDE.md note:
# Dev server always on: http://localhost:5173 (managed by dev-server skill)
```

## Advanced Features

### Auto-Open Browser
```bash
# After starting server, open in default browser
open http://localhost:5173  # macOS
xdg-open http://localhost:5173  # Linux
```

### Health Check
```bash
# Verify server is actually responding
curl -s http://localhost:5173 | grep -q "<!DOCTYPE html"
# ✅ Server is serving content

# Check HMR WebSocket
curl -s http://localhost:5173/@vite/client
# ✅ HMR client available
```

### Port Conflict Resolution
```bash
# If port is taken by system service:
sudo lsof -i :5173
# Shows if it's nginx, apache, etc.

# Configure Vite to use specific port
# vite.config.ts:
server: {
  port: 5173,
  strictPort: true  // Fail if port unavailable
}
```

## Troubleshooting

### Issue: "Port 5173 still in use after killing"
**Cause:** Process didn't die, or new process started
**Fix:**
```bash
# Force kill
sudo kill -9 $(lsof -ti :5173)

# Wait a moment
sleep 1

# Verify
lsof -i :5173
```

### Issue: "Server won't start"
**Cause:** node_modules issue or config problem
**Fix:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Issue: "HMR not working after restart"
**Cause:** Browser cached old WebSocket connection
**Fix:**
1. Hard refresh: Ctrl+Shift+R / Cmd+Shift+R
2. Clear browser cache
3. Close/reopen dev tools

### Issue: "Permission denied killing process"
**Cause:** Process owned by different user or system
**Fix:**
```bash
# Check process owner
ps -p $PID -o user=

# Use sudo if necessary (be careful!)
sudo kill $PID
```

## npm Scripts Enhancement

You can add convenience scripts to package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:clean": "pkill -f vite; npm run dev",
    "dev:5173": "lsof -ti :5173 | xargs kill -9 2>/dev/null; npm run dev",
    "dev:kill": "pkill -f 'vite|npm run dev'"
  }
}
```

Then use:
```bash
npm run dev:clean  # Kill all, restart clean
npm run dev:5173   # Ensure port 5173
npm run dev:kill   # Stop all dev servers
```

## Environment-Specific Behavior

### Development Branch
```bash
# Allow auto-cleanup
# Kill stray processes automatically
# Assume port 5173 is preferred
```

### Main/Production Branch
```bash
# Be more careful
# Ask before killing processes
# Warn about port changes
```

## Verification Checklist

After running this skill, verify:

- [ ] **Port 5173 confirmed** - `lsof -i :5173` shows Vite
- [ ] **No stray servers** - No other ports running Vite
- [ ] **Browser accessible** - http://localhost:5173 loads
- [ ] **HMR working** - Make a small change, see it update
- [ ] **No errors** - Check console for errors
- [ ] **Correct URL** - Update CLAUDE.md if needed

## Common Port Issues & Solutions

| Port | Likely Cause | Solution |
|------|--------------|----------|
| 3000 | Create React App default | Kill CRA, use Vite |
| 3001 | Port 3000 was taken | Kill process on 3001 |
| 5174 | Port 5173 was taken | Kill process on 5174 |
| 8000 | Python http.server | Kill Python server |
| 8080 | Alternative dev port | Check what's using it |

## Process Identification

### Vite Dev Server Signature
```bash
# Look for these in process list:
- vite --host
- node vite.js
- npm run dev
- node_modules/.bin/vite

# Example full command:
/usr/bin/node /root/csj-dashboard/node_modules/.bin/vite --host
```

### Safe to Kill
✅ `npm run dev`
✅ `vite --host`
✅ `node vite.js`
✅ `vite dev`

### NOT Safe to Kill
❌ `npm start` (different process)
❌ `node server.js` (custom server)
❌ `postgres` (database)
❌ `supabase` (local instance)

## Quick Reference

**Check status:**
```bash
lsof -i :5173
ps aux | grep vite
```

**Kill all Vite servers:**
```bash
pkill -f vite
```

**Kill specific port:**
```bash
lsof -ti :3001 | xargs kill -9
```

**Start clean:**
```bash
npm run dev
```

**Verify running:**
```bash
curl -s http://localhost:5173 | head -5
```

## Integration with Other Skills

**After running other skills, restart server:**
```bash
# After gen-types skill
npm run types:supabase
# Run dev-server skill to restart with new types

# After strict-lint fixes
npm run lint:strict:fix src/file.tsx
# Run dev-server skill to test changes

# After schema changes
# Run schema-docs skill
# Run dev-server skill to test with new schema
```

## Automatic Startup

You can make this automatic with a wrapper:

```bash
# .claude/scripts/dev.sh
#!/bin/bash

echo "🔧 Cleaning up dev servers..."
pkill -f vite 2>/dev/null

echo "🚀 Starting dev server on port 5173..."
npm run dev
```

Then use: `./claude/scripts/dev.sh`

## Summary

This skill ensures:
- ✅ Dev server always on port 5173
- ✅ No stray processes wasting resources
- ✅ Clean startup every time
- ✅ Ready to test immediately
- ✅ HMR working correctly
- ✅ Consistent development environment

**Run this skill whenever you're about to test new functionality!**

---

**Created**: 2025-10-25
**Priority**: Medium-High (7/10)
**Frequency**: Multiple times per day
**Use Case**: Before testing, when port conflicts occur
**Impact**: Saves time, prevents confusion, ensures consistency
