# Appwrite MCP Server Troubleshooting Guide

## Current Issue

The Appwrite MCP server is loaded and tools are visible, but API calls fail with:
```
Appwrite Error: Project with the requested ID could not be found. Please check the value of the X-Appwrite-Project header to ensure the correct project ID is being used.
```

## Your Appwrite Configuration

**Current Environment Variables (from `.env`):**
```bash
APPWRITE_PROJECT_ID=Y691236f4002f8b423a70  # ❌ Has "Y" prefix - might be incorrect
APPWRITE_API_KEY=standard_86a0b7e7f7912f43f01e7e670b2e41d0eadeb76083a07014188320561b030353ea3965d939c99365c1ca88328a13cd59e80c0b34ee86de33353b6e837db3225e9befb9bb8e952760049460c673be31cc3da88571d9f7b62be54198be21a70ba7227eef12993ae234d33d70a2e3ba77596aa239d5fa2e9b095dba55e5612d6961
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
```

**Actual Project Information (verified via API):**
- **Project ID**: `691236f4002f8b423a70` (without "Y" prefix)
- **Database ID**: `6912370f00317ce52077`
- **Database Name**: `tvandmovies`

## Root Cause

The `.env` file has `APPWRITE_PROJECT_ID=Y691236f4002f8b423a70` but the correct project ID is `691236f4002f8b423a70` (without the "Y" prefix).

The MCP server configuration needs to:
1. Use the correct project ID
2. Properly pass it to the Appwrite API

---

## Next Steps to Fix

### Step 1: Verify Your Actual Project ID

1. Go to **Appwrite Console**: https://cloud.appwrite.io/console
2. Click on your project
3. Go to **Settings** → **Project ID**
4. Copy the exact Project ID shown (should be `691236f4002f8b423a70`)

### Step 2: Update .env File

Edit `.env` and fix the `APPWRITE_PROJECT_ID`:

```bash
# Before:
APPWRITE_PROJECT_ID=Y691236f4002f8b423a70

# After:
APPWRITE_PROJECT_ID=691236f4002f8b423a70
```

### Step 3: Check .mcp.json Configuration

The `.mcp.json` file needs to properly configure the Appwrite MCP server. Check if it exists and has the correct format:

```bash
cat .mcp.json
```

**Expected format for Appwrite MCP server:**

```json
{
  "mcpServers": {
    "appwrite": {
      "command": "npx",
      "args": [
        "-y",
        "@appwrite.io/mcp-server-appwrite"
      ],
      "env": {
        "APPWRITE_ENDPOINT": "${APPWRITE_ENDPOINT}",
        "APPWRITE_PROJECT_ID": "${APPWRITE_PROJECT_ID}",
        "APPWRITE_API_KEY": "${APPWRITE_API_KEY}"
      }
    }
  }
}
```

**Alternative HTTP transport format:**

```json
{
  "mcpServers": {
    "appwrite": {
      "type": "http",
      "url": "https://mcp.appwrite.io/v1",
      "headers": {
        "X-Appwrite-Project": "${APPWRITE_PROJECT_ID}",
        "X-Appwrite-Key": "${APPWRITE_API_KEY}",
        "X-Appwrite-Endpoint": "${APPWRITE_ENDPOINT}"
      }
    }
  }
}
```

### Step 4: Verify Environment Variable Substitution

Check that the `.mcp.json` is using `${VARIABLE_NAME}` syntax to reference environment variables, NOT hardcoded values.

❌ **Wrong** (hardcoded):
```json
"APPWRITE_PROJECT_ID": "Y691236f4002f8b423a70"
```

✅ **Correct** (environment variable):
```json
"APPWRITE_PROJECT_ID": "${APPWRITE_PROJECT_ID}"
```

### Step 5: Authenticate MCP Server from Terminal

After fixing the configuration:

```bash
# Run Claude from terminal to trigger authentication
claude
```

This will:
- Load the updated `.mcp.json` configuration
- Use the corrected environment variables from `.env`
- Establish the connection with Appwrite

### Step 6: Restart Claude Code/VSCode

**CRITICAL**: MCP configuration is only loaded at startup.

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Developer: Reload Window"
3. Press Enter

OR fully restart VSCode/Claude Code application.

### Step 7: Test the MCP Server

Once restarted, test if the Appwrite MCP server is working:

```bash
# In Claude Code chat
Claude, list all databases in my Appwrite project using the MCP server
```

Expected result: Should show your `tvandmovies` database.

---

## Additional Troubleshooting

### If MCP Server Still Fails

1. **Check if .mcp.json loads environment variables:**
   ```bash
   # Test if environment variables are accessible
   echo $APPWRITE_PROJECT_ID
   ```

2. **Verify API key has correct permissions:**
   - Go to Appwrite Console → **Settings** → **API Keys**
   - Check that your API key has:
     - ✅ Databases (Read, Write)
     - ✅ Tables (Read, Write)
     - ✅ Documents (Read, Write)

3. **Try installing the Appwrite MCP server manually:**
   ```bash
   npx -y @appwrite.io/mcp-server-appwrite
   ```

4. **Check MCP server logs:**
   - Look for errors in the VSCode Output panel
   - Select "Claude Code" from the dropdown
   - Look for Appwrite MCP connection errors

### If Project ID is Still Wrong

Double-check the project ID in Appwrite Console:

1. Go to https://cloud.appwrite.io/console
2. Your project URL will look like:
   ```
   https://cloud.appwrite.io/console/project-691236f4002f8b423a70
   ```
3. The part after `project-` is your Project ID
4. It should match exactly what's in your `.env` file

---

## Once Fixed: Create Columns via MCP Server

After the MCP server is working, you can create all the columns using these commands:

### Database and Table IDs
- **Database ID**: `6912370f00317ce52077`
- **Table ID**: `tv_and_movies` (needs to be confirmed)

### Columns to Create

1. **String columns**: title, officialTitle, originalLanguage, media_type
2. **Integer columns**: latestSeason, episodeCount, criticScore, season
3. **Float column**: userRating
4. **DateTime columns**: seasonStartDate, seasonEndDate
5. **String array columns**: streamingSources, genreNames
6. **Boolean column**: watched

---

## Quick Reference Commands

```bash
# 1. Fix .env file
# Edit APPWRITE_PROJECT_ID to remove "Y" prefix

# 2. Check .mcp.json exists and is valid
cat .mcp.json

# 3. Authenticate from terminal
claude

# 4. Reload VSCode
# Cmd+Shift+P → "Developer: Reload Window"

# 5. Test MCP server
# Ask Claude to list databases
```

---

## Contact Points

If issues persist:
- Appwrite Discord: https://appwrite.io/discord
- Appwrite Docs: https://appwrite.io/docs
- Claude Code Issues: https://github.com/anthropics/claude-code/issues
- MCP Documentation: https://modelcontextprotocol.io

---

## Summary

**Immediate Actions:**
1. ✅ Verify Project ID in Appwrite Console
2. ✅ Update `.env` file with correct Project ID (remove "Y" prefix)
3. ✅ Check `.mcp.json` configuration format
4. ✅ Run `claude` from terminal to authenticate
5. ✅ Restart VSCode/Claude Code
6. ✅ Test MCP server with a simple query

**Expected Result:**
MCP server should connect successfully and allow database/table/column operations through Claude Code.
