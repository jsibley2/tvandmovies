# Webflow Router - API vs Designer Bridge

Intelligently route Webflow operations to the correct tool: Data API (MCP Server) for content or Designer Bridge for design.

## Purpose

Webflow provides two distinct APIs with different use cases:
- **Data API (MCP Server)** - Content management, CMS, collections, publishing
- **Designer API (Bridge)** - Real-time design manipulation, styles, components, canvas

This skill helps you:
- Choose the correct API for your task
- Understand capability differences
- Route operations appropriately
- Avoid using the wrong tool for the job

## ⚠️ CRITICAL: Designer Bridge Connection Check

**BEFORE using ANY Designer tools (element_tool, de_page_tool, style_tool, etc.):**

1. **First attempt the operation** to check connection status
2. **If you get "No active Designer app connection" error:**
   - Stop immediately
   - Remind the user: "Please press 'E' in Webflow Designer and launch 'Webflow Design Bridge'"
   - Wait for user confirmation before retrying

**If connection WAS working but NOW fails:**
- Ask user: "Are you still on the same page in Webflow Designer?"
- Remind: "If you navigated away or changed pages, please press 'E' and relaunch the bridge"
- The bridge connection is page-specific!

**Example Flow - First Connection:**
```
User: "Show me the page structure"
Claude: [Tries de_page_tool]
Error: "No active Designer app connection"
Claude: "The Designer Bridge isn't connected yet. Please:
        1. Make sure you're on the page in Webflow Designer
        2. Press 'E' key
        3. Click 'Webflow Design Bridge'
        Then let me know and I'll try again!"
```

**Example Flow - Lost Connection:**
```
Claude: [Operation fails after previously working]
Error: "No active Designer app connection"
Claude: "It looks like the Designer Bridge connection was lost.
        Have you navigated to a different page or closed the Designer?
        If so, please:
        1. Go back to the page we were working on
        2. Press 'E' key
        3. Relaunch 'Webflow Design Bridge'
        Then I can continue!"
```

## The Two APIs

### Data API (via MCP Server) ✅ Available
**What it does:** Server-side content and site management
**Access via:** `mcp__webflow__*` tools in Claude
**Authentication:** OAuth token (already configured)

**Use for:**
- CMS collections (create, read, update, delete)
- Collection items and field data
- Site configuration
- Publishing content
- Page metadata
- Asset management
- Webhooks

**Available MCP Tools:**
```
mcp__webflow__webflow_guide_tool
mcp__webflow__sites_list
mcp__webflow__collections_list
mcp__webflow__collections_get
mcp__webflow__collections_create
mcp__webflow__collection_fields_create_static
mcp__webflow__collection_fields_create_option
mcp__webflow__collection_fields_create_reference
mcp__webflow__collections_items_create_item_live
mcp__webflow__collections_items_update_items_live
mcp__webflow__collections_items_list_items
mcp__webflow__pages_list
mcp__webflow__pages_get_metadata
mcp__webflow__sites_publish
... and more
```

### Designer API (Designer Bridge) ✅ Available with Setup
**What it does:** Real-time design manipulation in Webflow Designer
**Access via:** Designer Extensions (needs Webflow Designer open)
**Authentication:** Designer session

**Use for:**
- Creating/modifying elements on canvas
- Managing design variables (colors, fonts, spacing)
- Component creation and editing
- Style manipulation
- Page structure changes
- Real-time design updates

**HOW TO CONNECT THE DESIGNER BRIDGE:**
1. Open your Webflow page in the Designer (edit mode)
2. Navigate to the specific page you want to work on
3. Press **"E"** key to open the Extensions menu
4. Launch **"Webflow Design Bridge"** from the extensions
5. The bridge will connect to http://localhost:1347
6. Keep the Designer tab open while working

**IMPORTANT:** Always remind the user to connect the Designer Bridge using the "E" key method when attempting to use any Designer tools (element_tool, de_page_tool, style_tool, etc.).

## Decision Tree: Which API?

### Ask Yourself:

**Question 1: Are you working with CONTENT or DESIGN?**
- **Content** (blog posts, products, data) → Use Data API (MCP)
- **Design** (colors, layout, components) → Use Designer Bridge

**Question 2: Does it involve the Webflow Designer canvas?**
- **Yes** (need Designer open) → Use Designer Bridge
- **No** (can work without Designer) → Use Data API (MCP)

**Question 3: Is it about CMS collections/items?**
- **Yes** → Use Data API (MCP)
- **No** → Check if it's design work

## Common Tasks & Correct API

### Use Data API (MCP Server) ✅

| Task | MCP Tool | Example |
|------|----------|---------|
| List all sites | `sites_list` | Get site IDs |
| Get CMS collections | `collections_list` | See all collections |
| Create collection | `collections_create` | New "Blog Posts" collection |
| Add collection field | `collection_fields_create_static` | Add "Author" field |
| Create CMS item | `collections_items_create_item_live` | New blog post |
| Update CMS item | `collections_items_update_items_live` | Edit post content |
| List pages | `pages_list` | Get all site pages |
| Publish site | `sites_publish` | Deploy changes |
| Get page metadata | `pages_get_metadata` | SEO settings |

### Use Designer Bridge (Available - Requires Connection) ✅

| Task | Requires | Status |
|------|----------|--------|
| Add div to page | Press "E" → Launch Bridge | ✅ Available |
| Change button color | Press "E" → Launch Bridge | ✅ Available |
| Create component | Press "E" → Launch Bridge | ✅ Available |
| Update style variable | Press "E" → Launch Bridge | ✅ Available |
| Modify page layout | Press "E" → Launch Bridge | ✅ Available |
| View page structure | Press "E" → Launch Bridge | ✅ Available |

**Remember:** Always check if Designer Bridge is connected before attempting these operations. If you get "No active Designer app connection", remind the user to press "E" and launch the bridge.

## Current Limitations

### What You CAN Do (Data API via MCP)
✅ Manage CMS content programmatically
✅ Create and update collections
✅ Publish changes to live site
✅ Update page metadata (SEO, OG tags)
✅ Manage collection fields
✅ Query and filter CMS items
✅ Automate content workflows

### What You CANNOT Do Without Designer Bridge Connection
⚠️ Add elements to pages (need to press "E" → launch bridge)
⚠️ Change design styles/colors (need to press "E" → launch bridge)
⚠️ Create/edit components (need to press "E" → launch bridge)
⚠️ Modify page layout structure (need to press "E" → launch bridge)
⚠️ Manage design variables/tokens (need to press "E" → launch bridge)
⚠️ View page element structure (need to press "E" → launch bridge)

**All of these ARE available once you connect the Designer Bridge!**

## Example Workflows

### Workflow 1: Sync Supabase Sessions to Webflow CMS ✅ Data API
```typescript
// This uses Data API (MCP) - fully supported

1. Get Webflow site ID
   → Use: mcp__webflow__sites_list

2. Get "Sessions" collection
   → Use: mcp__webflow__collections_list

3. Fetch sessions from Supabase
   → Query: supabase.from('sessions').select('*')

4. Create CMS items in Webflow
   → Use: mcp__webflow__collections_items_create_item_live
   → Map Supabase data to Webflow fields

5. Publish changes
   → Use: mcp__webflow__sites_publish
```

### Workflow 2: Update Design Tokens ❌ Designer Bridge Required
```typescript
// This needs Designer Bridge - NOT available via MCP

1. Open Webflow Designer
2. Connect Designer Bridge
3. Use Designer API to:
   - Update color variables
   - Change typography scales
   - Modify spacing tokens

// Alternative with Data API:
- Cannot directly change design tokens
- Can update CMS-driven content that affects design
- Can update component properties (limited)
```

### Workflow 3: Create Dynamic Collection Template ⚠️ Hybrid
```typescript
// Content structure: Data API (MCP) ✅
1. Create collection
   → Use: mcp__webflow__collections_create

2. Add fields
   → Use: mcp__webflow__collection_fields_create_*

3. Add items
   → Use: mcp__webflow__collections_items_create_item_live

// Template design: Designer Bridge ❌
4. Design collection template
   → Requires: Designer open + Bridge
   → Bind CMS fields to elements
```

## Authentication Status

### Data API (MCP) ✅
```bash
# Already authenticated
# Token stored in MCP config
# Ready to use

# To re-authenticate:
claude mcp webflow
```

### Designer Bridge ⚠️
```bash
# Not yet set up
# Requires:
1. Webflow Designer open in browser
2. Designer Extension/App installed
3. Connection to Designer session
4. Additional MCP bridge setup
```

## Routing Logic

### Automatic Routing (This Skill's Job)

**When user asks to:**

**"Create a CMS collection for blog posts"**
→ Route to: Data API (MCP)
→ Use: `mcp__webflow__collections_create`
→ Reason: CMS content management

**"Add a hero section to the homepage"**
→ Route to: Designer Bridge
→ Status: ⚠️ Not available yet
→ Reason: Design/layout modification

**"Update product prices in Webflow"**
→ Route to: Data API (MCP)
→ Use: `mcp__webflow__collections_items_update_items_live`
→ Reason: CMS data update

**"Change the primary color to blue"**
→ Route to: Designer Bridge
→ Status: ⚠️ Not available yet
→ Reason: Design variable change

**"List all pages on my site"**
→ Route to: Data API (MCP)
→ Use: `mcp__webflow__pages_list`
→ Reason: Metadata query

**"Create a reusable button component"**
→ Route to: Designer Bridge
→ Status: ⚠️ Not available yet
→ Reason: Component creation

## Capabilities Matrix

| Feature | Data API (MCP) | Designer Bridge |
|---------|----------------|-----------------|
| CMS Collections | ✅ Full | ❌ No |
| CMS Items | ✅ Full | ❌ No |
| Publishing | ✅ Yes | ❌ No |
| Page Metadata | ✅ Yes | ⚠️ Limited |
| Element Creation | ❌ No | ✅ Yes |
| Style Management | ❌ No | ✅ Yes |
| Components | ⚠️ Metadata only | ✅ Full |
| Variables/Tokens | ❌ No | ✅ Yes |
| Real-time Preview | ❌ No | ✅ Yes |
| Interactions | ❌ No | ✅ Yes |
| Asset Upload | ✅ Yes | ⚠️ Limited |
| Site Settings | ✅ Yes | ❌ No |

## Setting Up Designer Bridge (Current Process)

### Quick Start (3 Steps)

**Step 1: Ensure MCP Server is Running**
```bash
# The Webflow MCP server should already be running
# Verify at: http://localhost:1347 (should show "Webflow MCP is running")
```

**Step 2: Open Webflow Designer**
```
1. Go to your Webflow site in edit mode
2. Navigate to the page you want to work on
3. Ensure you're in the Designer view (not Pages panel)
```

**Step 3: Launch the Bridge**
```
1. Press "E" key in Webflow Designer
2. Click "Webflow Design Bridge" from the extensions menu
3. The bridge will auto-connect to localhost:1347
4. Keep the Designer tab open while working with Claude
```

### Verify Connection
```typescript
// Test that Designer Bridge is connected
// Claude will use: mcp__webflow__de_page_tool with get_current_page
// If successful, you'll see page info
// If failed, you'll see "No active Designer app connection"
```

### Troubleshooting

**Issue: "No active Designer app connection"**
- Solution: Press "E" in Webflow Designer and launch the bridge
- Make sure you're on the correct page
- Verify localhost:1347 is accessible

**Issue: Bridge was working but now shows "No active Designer app connection"**
- Common cause: User navigated away from the page or closed Designer
- Solution: Ask user to:
  1. Check they're still on the same page in Webflow Designer
  2. If they changed pages, press "E" and relaunch the bridge
  3. If Designer was closed, reopen it and reconnect

**Issue: Extension not showing**
- Solution: Make sure you're in Webflow Designer (edit mode)
- Try refreshing the Designer page
- Check that MCP server is running on localhost:1347

**Issue: Operations fail intermittently**
- Likely cause: User switched pages or tabs
- Solution: Confirm user is still on the correct page with Designer Bridge active

## Error Messages & Routing

### When User Tries Design Work with Data API
```
❌ Error: Cannot modify page layout with Data API

This requires Designer Bridge access.

What you tried: Add element to page
Available option: Use Webflow Designer manually
Required tool: Designer Bridge (not yet available)

Alternative:
- Open Webflow Designer
- Make design changes manually
- Use Data API to add content after design is ready
```

### When User Tries Content Work Without Auth
```
❌ Error: Webflow MCP not authenticated

Run: /webflow-auth
Or: claude mcp webflow

Then retry your request.
```

## Best Practices

### Do: Use Data API for Content Automation
```typescript
// ✅ Good: Automate content publishing
async function syncSupabaseToWebflow() {
  const sessions = await supabase.from('sessions').select('*')

  for (const session of sessions) {
    await webflow.collections_items_create_item_live({
      collection_id: 'sessions_collection_id',
      item: {
        name: session.title,
        slug: session.slug,
        'session-date': session.date,
        // ... more fields
      }
    })
  }
}
```

### Don't: Try to Design with Data API
```typescript
// ❌ Bad: Cannot create elements with Data API
// This will fail:
await webflow.createDiv({ className: 'hero' }) // Not possible

// ✅ Instead: Design in Designer, populate with Data API
// 1. Create design in Webflow Designer
// 2. Bind CMS fields to elements
// 3. Use Data API to populate CMS content
```

### Do: Know Your Limitations
```typescript
// ✅ Good: Check capabilities before starting
if (needsDesignChanges) {
  console.log('This requires Designer Bridge - not available yet')
  // Suggest manual alternative
} else if (needsContentChanges) {
  // Proceed with Data API (MCP)
  await webflow.collections_items_update(...)
}
```

## Practical Examples

### Example 1: Syncing Supabase Sessions ✅
**Task:** Keep Webflow CMS in sync with Supabase sessions table
**API:** Data API (MCP)
**Status:** ✅ Fully supported

```typescript
1. Get sessions from Supabase
2. Use: mcp__webflow__collections_items_list_items
3. Compare & identify changes
4. Use: mcp__webflow__collections_items_create_item_live (new)
5. Use: mcp__webflow__collections_items_update_items_live (existing)
6. Use: mcp__webflow__sites_publish
```

### Example 2: Updating Site Colors ❌
**Task:** Change primary brand color across site
**API:** Designer Bridge
**Status:** ❌ Not available

```typescript
// Cannot do this with Data API
// Requires Designer Bridge

Alternative:
1. Open Webflow Designer
2. Update color variables manually
3. Publish changes
```

### Example 3: Managing Blog Posts ✅
**Task:** Create, update, publish blog posts
**API:** Data API (MCP)
**Status:** ✅ Fully supported

```typescript
1. Use: mcp__webflow__collections_list (find blog collection)
2. Use: mcp__webflow__collections_items_create_item_live
3. Set fields: title, slug, content, author, date
4. Use: mcp__webflow__sites_publish
```

## Quick Reference

**For CMS/Content:**
→ Use Data API (MCP) ✅
→ Available now
→ Full automation support

**For Design/Layout:**
→ Use Designer Bridge ⚠️
→ Not available yet
→ Manual design in Designer

**For Hybrid:**
→ Design in Designer manually
→ Populate content with Data API
→ Best of both worlds

## Integration with Other Skills

**After schema-docs skill:**
```bash
# Check Supabase schema
# Then sync to Webflow CMS
# Use: webflow-router skill to create collections
```

**Before deploy-function skill:**
```bash
# Webflow webhook edge function
# Use Data API to verify webhook setup
# Deploy function to handle Webflow events
```

## Summary

**This skill helps you:**
- ✅ Understand Data API vs Designer Bridge
- ✅ Route tasks to correct API
- ✅ Know what's currently possible
- ✅ Plan for future Designer Bridge features
- ✅ Avoid attempting impossible operations

**Current status:**
- Data API (MCP): ✅ Fully functional (always available)
- Designer Bridge: ✅ Available (requires pressing "E" in Designer to launch)
- Hybrid workflows: ✅ Design manipulation + automated content

---

**Created**: 2025-10-25
**Priority**: Medium (6/10) - Useful when working with Webflow
**Frequency**: When building Webflow integrations
**Scope**: Routes between two distinct Webflow APIs
**Status**: Data API ready, Designer Bridge pending
