# Schema Documentation Generator

Generate comprehensive Supabase database schema documentation to prevent bugs and ensure accurate field names.

## Purpose

This skill addresses a critical workflow issue documented in CLAUDE.md:
- **The Problem**: Assuming field names exist without verification leads to complex workarounds
- **The Solution**: Always check current schema documentation BEFORE any database work
- **Real Impact**: Prevented 80+ lines of unnecessary code by verifying actual field names

## What This Skill Does

1. Regenerates `supabase_documentation/schema_documentation_public.json`
2. Updates comprehensive table/view/column listings
3. Shows RLS (Row Level Security) status
4. Validates current database state
5. Provides fallback to historical schema if needed

## When to Use

**ALWAYS use this before:**
- Writing Supabase queries
- Creating database migrations
- Assuming a field exists in a table/view
- Debugging data access issues
- Creating new components that query the database

## What You'll Get

The skill will:
1. Run the schema documentation script
2. Show you a summary of what was documented:
   - Number of tables documented
   - Number of views documented
   - Number of columns catalogued
   - RLS policy status
3. Confirm the documentation files are up-to-date
4. Remind you to check the docs before proceeding

## Output Files

- `supabase_documentation/schema_documentation_public.json` - Primary schema reference
- `supabase_documentation/tables_views_columns_250920.json` - Fallback/historical reference

## Usage Tips

### Quick Field Lookup After Running
```bash
# Check if a field exists in a table/view
grep -A 50 '"table_name": "user_details_view"' supabase_documentation/tables_views_columns_250920.json

# List all columns in a table
grep -A 100 '"table_name": "applications_new"' supabase_documentation/tables_views_columns_250920.json | grep "column_name"
```

### Common Verification Patterns
```bash
# Check RLS status
jq '.statistics.rls_status' supabase_documentation/schema_documentation_public.json

# Find all views
jq '.views[].table_name' supabase_documentation/schema_documentation_public.json

# Find tables with specific column
grep -r "column_name.*email" supabase_documentation/
```

## Critical Reminder from CLAUDE.md

> **🚨 CRITICAL: Supabase Schema Reference Protocol**
>
> **BEFORE ANY database/Supabase work, you MUST follow this exact order:**
>
> ### Step 1: Check Current Schema Documentation
> 1. **First**: Read `supabase_documentation/schema_documentation_public.json`
> 2. **If empty/outdated**: Run `./supabase_documentation/document_schema.sh` to regenerate
> 3. **Fallback**: Check `supabase_documentation/tables_views_columns_250920.json` for field names
>
> ### Step 2: Verify Field Names
> - **NEVER assume field names exist** - always verify against schema documentation
> - Use grep to search for specific fields
> - Example: `user_details_view` has `user_status` (not `current_status`)
>
> ### Step 3: What NOT to Do
> ❌ **NEVER look at migrations first** - they show history, not current state
> ❌ **NEVER assume** - a field in table X doesn't mean it exists in view Y
> ❌ **NEVER create workarounds** without checking actual schema first

## Example Scenario

**Bad Workflow (Don't do this):**
```typescript
// ❌ Assuming field exists without checking
const { data } = await supabase
  .from('user_details_view')
  .select('current_status') // Field doesn't exist!
```

**Good Workflow (Do this):**
1. Run this skill to regenerate schema docs
2. Check the schema: `grep -A 50 '"table_name": "user_details_view"'`
3. Find actual field name: `user_status`
4. Write correct code:
```typescript
// ✅ Using verified field name
const { data } = await supabase
  .from('user_details_view')
  .select('user_status') // Correct field name
```

## Script Location

The skill runs: `./supabase_documentation/document_schema.sh`

This script:
- Connects to your Supabase project
- Queries the information_schema
- Extracts all table/view/column metadata
- Generates JSON documentation files
- Reports statistics and RLS status

## Why This Matters

**Real Example from Project History:**
- Developer assumed `current_status` existed in `user_details_view`
- Created 80+ lines of complex workaround code
- Actual field name was `user_status` (found in old schema docs)
- Simple 3-line solution replaced entire workaround

**The Lesson:** Migrations show what WAS done. Documentation shows what currently EXISTS.

---

**Created**: 2025-10-25
**Priority**: Critical (10/10)
**Frequency**: Before every database operation
