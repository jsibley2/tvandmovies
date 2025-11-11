# MCP Server Setup Guide

Complete guide for setting up Model Context Protocol (MCP) servers in a new project using the `.mcp.json` configuration file.

## Table of Contents
- [What is MCP?](#what-is-mcp)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration File Structure](#configuration-file-structure)
- [Available MCP Servers](#available-mcp-servers)
- [Environment Variables](#environment-variables)
- [Step-by-Step Setup](#step-by-step-setup)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol that allows AI assistants like Claude to interact with external services and tools. MCP servers provide Claude with capabilities like:

- **Database Operations** - Direct interaction with Supabase databases
- **Web Development** - Webflow site management and editing
- **Automation** - Make.com workflow integration
- **Documentation** - Context7 library documentation lookup
- **Browser Tools** - Chrome DevTools for debugging

---

## Prerequisites

### Required Software
- **Node.js** >= 20.0.0 (check with `node --version`)
- **npm** >= 9.0.0 (check with `npm --version`)
- **Claude Code** or **Claude Desktop** (latest version)
- **Git** (for version control)

### Required Accounts & API Keys
Before starting, ensure you have:
- Supabase account with project created
- Webflow account (if using Webflow MCP)
- Make.com account (if using Make MCP)
- Context7 API key (if using Context7 MCP)

---

## Quick Start

### 1. Copy Example Configuration
```bash
# In your project root
cp .mcp.json.example .mcp.json
```

### 2. Set Up Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your actual tokens (see Environment Variables section)
nano .env  # or use your preferred editor
```

### 3. Verify Git Ignore
```bash
# Ensure sensitive files are ignored
cat .gitignore | grep -E "(.mcp.json|.env)"

# If not present, add them:
echo ".mcp.json" >> .gitignore
echo ".env" >> .gitignore
```

### 4. Authenticate MCP Servers from Terminal
```bash
# IMPORTANT: Run Claude from terminal to authenticate
claude

# This will:
# - Trigger authentication for all configured MCP servers
# - Open browser windows for OAuth flows (Webflow, Make.com, etc.)
# - Store credentials for use in both CLI and VSCode
```

**Note**: Some MCP servers require interactive authentication. Running `claude` from the terminal at least once is required before the servers will work in VSCode.

### 5. Restart Claude Code
After configuring `.mcp.json` and authenticating, you **MUST** restart Claude Code/VSCode for changes to take effect.

---

## Configuration File Structure

### File Location
```
your-project/
├── .mcp.json          # Actual config (NEVER commit)
├── .mcp.json.example  # Template (commit this)
├── .env               # Environment variables (NEVER commit)
├── .gitignore         # Must include .mcp.json and .env
└── package.json
```

### Basic `.mcp.json` Structure
```json
{
  "mcpServers": {
    "server-name": {
      "type": "http" | "command",
      // Configuration depends on type
    }
  }
}
```

### Two Configuration Types

#### 1. HTTP Transport (Direct HTTP Connection)
Used for services with HTTP/SSE endpoints:
```json
{
  "server-name": {
    "type": "http",
    "url": "https://api.service.com/mcp",
    "headers": {
      "Authorization": "Bearer ${ENV_VAR_NAME}"
    }
  }
}
```

#### 2. Command Transport (NPX Remote)
Used for services requiring a proxy/bridge:
```json
{
  "server-name": {
    "command": "npx",
    "args": [
      "mcp-remote",
      "https://api.service.com/sse"
    ],
    "env": {
      "API_KEY": "${ENV_VAR_NAME}"
    }
  }
}
```

---

## Available MCP Servers

### 1. Supabase MCP Server
**Purpose**: Direct database operations, migrations, and queries

**Configuration**:
```json
{
  "supabase": {
    "type": "http",
    "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF",
    "headers": {
      "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
    }
  }
}
```

**What You Need**:
- **Project Reference**: Found in Supabase dashboard URL
  - Example: `https://supabase.com/dashboard/project/ncsrlqrvymkmniunnhue`
  - Project ref = `ncsrlqrvymkmniunnhue`
- **Access Token**: Generate from Supabase dashboard
  - Go to: Settings → Access Tokens → Create new token
  - Format: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Environment Variables**:
```bash
SUPABASE_ACCESS_TOKEN=sbp_your_actual_token_here
```

**Capabilities**:
- `mcp__supabase__execute_sql` - Run SELECT queries
- `mcp__supabase__apply_migration` - Run DDL (CREATE, ALTER, DROP)
- `mcp__supabase__list_tables` - List database tables
- `mcp__supabase__generate_typescript_types` - Generate types
- `mcp__supabase__get_logs` - View service logs
- And more (see Supabase MCP documentation)

---

### 2. Webflow MCP Server
**Purpose**: Manage Webflow sites, CMS collections, and content

**Configuration**:
```json
{
  "webflow": {
    "command": "npx",
    "args": [
      "mcp-remote",
      "https://mcp.webflow.com/sse"
    ]
  }
}
```

**What You Need**:
- Webflow account with API access
- Authentication happens via OAuth during first use
- No additional environment variables required for basic setup

**Capabilities**:
- Site management (list, get, publish)
- CMS collections (create, update, list items)
- Page management and content updates
- Component management
- And more (see Webflow MCP documentation)

---

### 3. Make.com MCP Server
**Purpose**: Automate workflows and integrations

**Configuration**:
```json
{
  "make": {
    "command": "npx",
    "args": [
      "mcp-remote",
      "https://YOUR_REGION.make.com/mcp/api/v1/u/${MAKE_MCP_TOKEN}/sse"
    ]
  }
}
```

**What You Need**:
- **Region**: Your Make.com region (e.g., `us1`, `eu1`, `eu2`)
  - Check your Make.com dashboard URL
- **MCP Token**: Generate from Make.com account settings
  - Format: UUID like `ea73f806-537d-4f17-8c11-4746af0719bf`

**Environment Variables**:
```bash
MAKE_MCP_TOKEN=your-make-mcp-token-here
```

**Common Regions**:
- `us1.make.com` - United States
- `eu1.make.com` - Europe (Germany)
- `eu2.make.com` - Europe (Ireland)

---

### 4. Context7 MCP Server
**Purpose**: Access library documentation and code examples

**Configuration**:
```json
{
  "context7": {
    "command": "npx",
    "args": [
      "mcp-remote",
      "https://mcp.context7.com/mcp"
    ],
    "env": {
      "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
    }
  }
}
```

**What You Need**:
- Context7 account and API key
- Sign up at context7.com if you don't have an account

**Environment Variables**:
```bash
CONTEXT7_API_KEY=your_context7_api_key_here
```

---

### 5. Chrome DevTools MCP Server
**Purpose**: Debug web applications using Chrome DevTools Protocol

**Configuration**:
```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-chrome-devtools"
    ]
  }
}
```

**What You Need**:
- Chrome or Chromium browser installed
- No API keys required
- Uses local Chrome instance

---

## Environment Variables

### Creating Your `.env` File

1. **Copy the example**:
```bash
cp .env.example .env
```

2. **Add required variables**:
```bash
# Supabase Configuration
SUPABASE_ACCESS_TOKEN=sbp_your_token_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Make.com Configuration (if using Make MCP)
MAKE_MCP_TOKEN=your-make-token-here

# Context7 Configuration (if using Context7 MCP)
CONTEXT7_API_KEY=your_context7_key_here

# Webflow Configuration (if using Webflow MCP - optional)
# Authentication typically happens via OAuth
WEBFLOW_API_TOKEN=your_webflow_token_here
```

### Variable Substitution

The `.mcp.json` file uses `${VARIABLE_NAME}` syntax to reference environment variables:

```json
{
  "url": "https://api.service.com?token=${MY_TOKEN}"
}
```

This will be replaced with the value from your `.env` file at runtime.

---

## Step-by-Step Setup

### Step 1: Project Initialization

```bash
# Create new project (or navigate to existing)
mkdir my-project
cd my-project

# Initialize npm (if new project)
npm init -y

# Ensure node version is correct
node --version  # Should be >= 20.0.0
```

### Step 2: Create MCP Configuration Files

```bash
# Create .mcp.json.example (commit this to git)
cat > .mcp.json.example << 'EOF'
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
EOF

# Copy to actual config (do NOT commit this)
cp .mcp.json.example .mcp.json
```

### Step 3: Update `.gitignore`

```bash
# Add to .gitignore if not present
cat >> .gitignore << 'EOF'

# MCP Configuration (contains secrets)
.mcp.json

# Environment variables (contains secrets)
.env
.env.local
.env.*.local
EOF
```

### Step 4: Configure Environment Variables

```bash
# Create .env file
cat > .env << 'EOF'
# Supabase MCP Server
SUPABASE_ACCESS_TOKEN=your_token_here

# Add other tokens as needed
EOF

# Edit with your actual tokens
nano .env  # or code .env
```

### Step 5: Update `.mcp.json` with Your Values

Edit `.mcp.json` and replace placeholders:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=ncsrlqrvymkmniunnhue",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

Replace:
- `YOUR_PROJECT_REF` → Your actual Supabase project reference
- `YOUR_REGION` → Your actual Make.com region (if using Make)

### Step 6: Restart Claude Code

**CRITICAL**: MCP configuration is only loaded when Claude Code starts.

```bash
# In VSCode
# 1. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
# 2. Type "Developer: Reload Window"
# 3. Press Enter

# Or fully restart VSCode/Claude Code application
```

### Step 7: Authenticate MCP Servers

**IMPORTANT**: Before MCP servers can be used in VSCode/Claude Code, they must be authenticated at least once from the terminal.

```bash
# Run Claude from terminal to trigger authentication
claude

# This will:
# 1. Load the .mcp.json configuration
# 2. Prompt for authentication/authorization for each MCP server
# 3. Save credentials for future use in both CLI and VSCode
```

Some MCP servers (like Webflow) use OAuth and require browser-based authentication. Running `claude` from the terminal will:
- Open a browser window for OAuth authentication
- Display any authentication prompts in the terminal
- Store the authentication tokens for use in VSCode

**Why is this necessary?**
- MCP servers need to establish secure connections and store authentication tokens
- OAuth flows require interactive browser authentication
- Once authenticated via terminal, the credentials work in VSCode/Claude Code

### Step 8: Verify MCP Servers Are Working

Open Claude Code and test:

```
Claude, can you list all tables in my Supabase database using the MCP server?
```

If successful, you should see a list of your database tables.

---

## Troubleshooting

### Problem: "MCP server not authenticated" or "Authentication required"

**Solutions**:
1. **Run Claude from terminal first**:
```bash
claude
```
This will trigger the authentication flow for all MCP servers in your `.mcp.json`.

2. **Complete OAuth flows** - Some servers (Webflow, Make.com) require browser authentication:
   - A browser window will open automatically
   - Log in and authorize the MCP server
   - Return to terminal to see confirmation

3. **Check authentication status**:
```bash
# Run Claude and ask about MCP servers
claude
# Then type: "What MCP servers are available?"
```

4. **Re-authenticate if needed** - If credentials expire or change:
   - Clear any cached credentials
   - Run `claude` from terminal again
   - Complete authentication flow

### Problem: "MCP server not found" or "Connection failed"

**Solutions**:
1. **Restart Claude Code** - Configuration only loads on startup
2. **Check file location** - `.mcp.json` must be in project root
3. **Verify JSON syntax** - Use a JSON validator (invalid JSON will fail silently)
4. **Check environment variables** - Ensure `.env` file has correct values
5. **Authenticate from terminal** - Run `claude` from terminal at least once

```bash
# Validate JSON syntax
cat .mcp.json | jq .

# If error, fix JSON syntax
# If success, proceed to next check
```

### Problem: "Authentication failed" for Supabase

**Solutions**:
1. **Verify access token**:
```bash
# Check token is set
echo $SUPABASE_ACCESS_TOKEN

# If empty, check .env file
cat .env | grep SUPABASE_ACCESS_TOKEN
```

2. **Regenerate token** from Supabase dashboard
3. **Check project reference** - Must match your Supabase project

### Problem: "Unknown region" for Make.com

**Solutions**:
1. **Check your Make.com dashboard URL**:
   - URL: `https://us1.make.com` → Use `us1`
   - URL: `https://eu1.make.com` → Use `eu1`

2. **Update `.mcp.json`** with correct region:
```json
{
  "args": [
    "mcp-remote",
    "https://us1.make.com/mcp/api/v1/u/${MAKE_MCP_TOKEN}/sse"
  ]
}
```

### Problem: Environment variables not being substituted

**Solutions**:
1. **Check syntax** - Must use `${VARIABLE_NAME}` format
2. **Load environment** - Some systems require explicit loading:
```bash
# In terminal before starting Claude Code
source .env
```

3. **No spaces** - Ensure no spaces in `.env` file:
```bash
# ❌ Wrong
SUPABASE_ACCESS_TOKEN = sbp_token

# ✅ Correct
SUPABASE_ACCESS_TOKEN=sbp_token
```

### Problem: "npx not found" errors

**Solutions**:
1. **Verify npm installation**:
```bash
npm --version
npx --version
```

2. **Update npm**:
```bash
npm install -g npm@latest
```

3. **Check PATH**:
```bash
echo $PATH | grep npm
```

### Problem: MCP server works but commands fail

**Solutions**:
1. **Check permissions** - Ensure API tokens have correct permissions
2. **Review logs** - Some MCP servers log to console
3. **Test API directly** - Verify tokens work outside MCP:

```bash
# Test Supabase token
curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF"
```

### Problem: Changes to `.mcp.json` not taking effect

**Solution**:
**ALWAYS restart Claude Code/VSCode after modifying `.mcp.json`**

The configuration is only loaded once at startup. Changes require a full restart:
1. Close Claude Code/VSCode completely
2. Reopen project
3. Wait for initialization to complete

---

## Security Best Practices

### 1. Never Commit Secrets

**Files to NEVER commit**:
- `.mcp.json` - Contains API configurations
- `.env` - Contains secret tokens
- Any file with actual API keys/tokens

**Files that SHOULD be committed**:
- `.mcp.json.example` - Template with placeholders
- `.env.example` - Template with variable names
- `.gitignore` - Must include `.mcp.json` and `.env`

### 2. Use Environment Variables

```json
// ❌ WRONG - Hardcoded token
{
  "headers": {
    "Authorization": "Bearer sbp_1d999b83ed8e02b9768ed3ccf425f7f32b8f5508"
  }
}

// ✅ CORRECT - Environment variable
{
  "headers": {
    "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
  }
}
```

### 3. Token Rotation

**Best practices**:
- Rotate tokens regularly (every 90 days)
- Immediately rotate if token is exposed
- Use different tokens for dev/staging/production

### 4. Minimal Permissions

**Grant only necessary permissions**:
- Supabase: Use access tokens, not service role keys (when possible)
- Webflow: Limit to specific sites
- Make.com: Restrict to specific scenarios

### 5. Environment-Specific Configurations

```bash
# Development
.mcp.json           # Uses dev tokens
.env                # Dev environment variables

# Production (separate project)
.mcp.json           # Uses prod tokens
.env.production     # Prod environment variables
```

---

## Advanced Configuration

### Multiple MCP Servers

You can configure multiple servers simultaneously:

```json
{
  "mcpServers": {
    "supabase": { /* Supabase config */ },
    "webflow": { /* Webflow config */ },
    "make": { /* Make config */ },
    "context7": { /* Context7 config */ },
    "chrome-devtools": { /* Chrome config */ }
  }
}
```

### Conditional Server Loading

You can create multiple config files for different scenarios:

```bash
# Development configuration
.mcp.json               # All servers enabled

# Production configuration
.mcp.production.json    # Only production servers

# CI/CD configuration
.mcp.ci.json           # Only testing-related servers
```

Then copy the appropriate one:
```bash
# For production
cp .mcp.production.json .mcp.json
```

### Custom Server Timeouts

Some MCP implementations support timeout configuration:

```json
{
  "server-name": {
    "type": "http",
    "url": "https://api.service.com/mcp",
    "timeout": 30000,  // 30 seconds
    "headers": { /* ... */ }
  }
}
```

---

## Example Complete Setup

### Project Structure
```
my-project/
├── .mcp.json              # ← Actual config (NOT in git)
├── .mcp.json.example      # ← Template (IN git)
├── .env                   # ← Secrets (NOT in git)
├── .env.example           # ← Template (IN git)
├── .gitignore             # ← Must include .mcp.json, .env
├── package.json
└── src/
```

### `.mcp.json.example`
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    },
    "webflow": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.webflow.com/sse"
      ]
    },
    "make": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://YOUR_REGION.make.com/mcp/api/v1/u/${MAKE_MCP_TOKEN}/sse"
      ]
    }
  }
}
```

### `.env.example`
```bash
# Supabase Configuration
SUPABASE_ACCESS_TOKEN=your_supabase_access_token_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Make.com Configuration
MAKE_MCP_TOKEN=your_make_mcp_token_here

# Context7 Configuration (if using)
CONTEXT7_API_KEY=your_context7_api_key_here
```

### `.gitignore`
```
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# MCP Configuration
.mcp.json

# Build outputs
dist/
build/
```

### Setup Commands
```bash
# 1. Clone/create project
git clone your-repo.git
cd your-repo

# 2. Install dependencies
npm install

# 3. Copy configuration templates
cp .mcp.json.example .mcp.json
cp .env.example .env

# 4. Edit with your actual values
nano .mcp.json  # Replace YOUR_PROJECT_REF, YOUR_REGION
nano .env       # Add your actual tokens

# 5. Verify gitignore
cat .gitignore | grep -E "(.mcp.json|.env)"

# 6. Authenticate MCP servers from terminal
claude
# Complete any OAuth flows that open in browser

# 7. Restart Claude Code/VSCode
# (Use "Developer: Reload Window" command)
```

---

## Integration with Existing Projects

### Adding MCP to Existing Project

If you already have a project and want to add MCP support:

1. **Create `.mcp.json.example`** in project root
2. **Update `.gitignore`** to exclude `.mcp.json`
3. **Add MCP tokens** to existing `.env` file
4. **Copy example** to create actual config: `cp .mcp.json.example .mcp.json`
5. **Fill in actual values** in `.mcp.json`
6. **Restart Claude Code**

### Version Control Setup

```bash
# Add template files to git
git add .mcp.json.example .env.example .gitignore
git commit -m "Add MCP server configuration templates"

# Verify secrets are NOT tracked
git status  # Should NOT show .mcp.json or .env
```

---

## Getting API Keys & Tokens

### Supabase Access Token
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Settings → Access Tokens**
4. Click **"Create new token"**
5. Give it a name (e.g., "MCP Development")
6. Copy token (starts with `sbp_`)
7. Add to `.env`: `SUPABASE_ACCESS_TOKEN=sbp_xxxxx`

### Make.com MCP Token
1. Go to https://www.make.com
2. Navigate to your account settings
3. Look for **"MCP Integration"** or **"API Tokens"**
4. Generate new MCP token
5. Copy the UUID token
6. Add to `.env`: `MAKE_MCP_TOKEN=your-uuid-token`
7. Note your region from dashboard URL (us1, eu1, etc.)

### Context7 API Key
1. Go to https://context7.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Generate new API key
5. Copy the key
6. Add to `.env`: `CONTEXT7_API_KEY=your-key`

### Webflow API Token
1. Go to https://webflow.com
2. Navigate to **Account Settings → API Access**
3. Create new API token
4. Copy the token
5. Add to `.env`: `WEBFLOW_API_TOKEN=your-token`

---

## Common Use Cases

### 1. Database Development (Supabase MCP)
```
Claude, using the Supabase MCP server:
1. List all tables in the public schema
2. Show me the structure of the 'users' table
3. Create a new migration to add a 'last_login' column
```

### 2. Website Management (Webflow MCP)
```
Claude, using the Webflow MCP server:
1. List all my Webflow sites
2. Show me the CMS collections in site XYZ
3. Update the homepage title to "Welcome to Our Site"
```

### 3. Workflow Automation (Make MCP)
```
Claude, using the Make MCP server:
1. List my active scenarios
2. Show me the details of scenario ABC
3. Trigger the "Process Form Submission" scenario
```

### 4. Library Documentation (Context7 MCP)
```
Claude, using the Context7 MCP server:
1. Find documentation for React hooks
2. Show me examples of useState
3. Get the latest Next.js App Router documentation
```

---

## Testing Your Setup

### Quick Test Script

Create a test file to verify MCP servers are working:

```bash
# test-mcp.sh
#!/bin/bash

echo "Testing MCP Server Configuration..."
echo ""

# Test 1: Check .mcp.json exists
if [ -f ".mcp.json" ]; then
  echo "✅ .mcp.json file exists"
else
  echo "❌ .mcp.json file not found"
  exit 1
fi

# Test 2: Validate JSON syntax
if cat .mcp.json | jq . > /dev/null 2>&1; then
  echo "✅ .mcp.json has valid JSON syntax"
else
  echo "❌ .mcp.json has invalid JSON syntax"
  exit 1
fi

# Test 3: Check environment variables
if [ -f ".env" ]; then
  echo "✅ .env file exists"
  source .env

  # Check Supabase token
  if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "✅ SUPABASE_ACCESS_TOKEN is set"
  else
    echo "⚠️  SUPABASE_ACCESS_TOKEN not set"
  fi
else
  echo "⚠️  .env file not found"
fi

# Test 4: Check gitignore
if grep -q ".mcp.json" .gitignore && grep -q ".env" .gitignore; then
  echo "✅ Secrets are properly ignored in git"
else
  echo "❌ .mcp.json or .env not in .gitignore!"
  exit 1
fi

echo ""
echo "Setup verification complete!"
```

Make executable and run:
```bash
chmod +x test-mcp.sh
./test-mcp.sh
```

---

## Next Steps

After successful setup:

1. **Explore available tools** - Ask Claude what each MCP server can do
2. **Test basic operations** - Try listing, reading, and simple queries
3. **Review documentation** - Each MCP server has specific capabilities
4. **Integrate into workflow** - Start using MCP for database changes, content management, etc.

---

## Resources

### Official Documentation
- **Supabase MCP**: https://mcp.supabase.com
- **Webflow MCP**: https://mcp.webflow.com
- **Make.com MCP**: https://www.make.com/en/help/mcp
- **Context7**: https://context7.com/docs
- **MCP Specification**: https://modelcontextprotocol.io

### Community Resources
- **MCP GitHub**: https://github.com/modelcontextprotocol
- **Claude Code Docs**: https://docs.claude.com/code

### Support
- For Supabase issues: Supabase Discord/GitHub
- For Webflow issues: Webflow Support
- For Make.com issues: Make.com Support
- For Claude Code issues: https://github.com/anthropics/claude-code/issues

---

## Changelog

### Version 1.0 (Initial)
- Complete setup guide for all MCP servers
- Security best practices
- Troubleshooting section
- Example configurations

---

## Contributing

If you find issues or have improvements for this guide:
1. Document the issue/improvement
2. Test the solution
3. Update this guide
4. Share with team

---

**Remember**:
- ✅ `.mcp.json.example` → Commit to git
- ❌ `.mcp.json` → NEVER commit
- ✅ `.env.example` → Commit to git
- ❌ `.env` → NEVER commit
- 🔄 Restart Claude Code after any `.mcp.json` changes
