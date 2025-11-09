---
name: supabase-view-manager
description: Safely modify Supabase database views with verification, minimal changes, and rollback support
---

# Supabase View Manager

Safely modify Supabase database views while preventing breaking changes and preserving existing logic.

## Purpose

This skill addresses a critical workflow issue where recreating views from scratch causes production bugs:
- **The Problem**: Rewriting entire views based on assumptions breaks production features
- **The Solution**: Always fetch current definition, make minimal changes, verify results
- **Real Impact**: Prevented supervisor/group data loss by catching incorrect JOIN assumptions

## Core Workflow - MUST FOLLOW IN ORDER

### Step 1: Fetch Current View Definition (MANDATORY)

**Never skip this step. Always get the actual production view definition first.**

```sql
-- Get the current view definition (formatted for readability)
SELECT pg_get_viewdef('view_name'::regclass, true);
```

**Save this output** - it's your baseline and rollback reference.

### Step 2: Understand Current Structure

Before making ANY changes, analyze:
1. **JOIN conditions** - What tables are joined? On which columns?
2. **Column list** - What columns are currently returned?
3. **Filters** - Are there WHERE clauses?
4. **Dependencies** - What depends on this view? (RLS policies, other views, etc.)

```sql
-- Check what depends on this view
SELECT DISTINCT
    dependent_ns.nspname as dependent_schema,
    dependent_view.relname as dependent_view,
    source_table.relname as source_table
FROM pg_depend
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid
JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid
JOIN pg_namespace dependent_ns ON dependent_ns.oid = dependent_view.relnamespace
WHERE source_table.relname = 'your_view_name'
AND dependent_view.relname != source_table.relname;
```

### Step 3: Test Current View with Sample Data

**Before modifying anything, verify what data it currently returns.**

```sql
-- Get sample data from current view
SELECT * FROM view_name LIMIT 5;

-- Test specific records that should have data
SELECT
  column1,
  column2,
  important_joined_column
FROM view_name
WHERE column1 = 'known_test_value';
```

**Document this output** - you'll compare after changes to verify nothing broke.

### Step 4: Plan Minimal Changes

**Only modify what's necessary. Do not rewrite the entire view.**

Example change types:
- **Add column**: Add to SELECT clause only
- **Modify column**: Change one column definition
- **Add filter**: Add WHERE clause or extend existing one
- **Fix JOIN**: Modify only the JOIN condition causing issues

**Write out your planned change in plain English first:**
```
CHANGE: Add last_activity_date column to view
MODIFIED SECTIONS:
  - SELECT clause (add new column at line X)
  - Keep all existing JOINs unchanged
  - Keep all existing columns unchanged
```

### Step 5: Create Migration with Verification

```sql
-- Migration: [Descriptive title of change]
-- Created: [Date]
-- Modified by: Supabase View Manager Skill
--
-- ORIGINAL VIEW DEFINITION:
-- [Paste full pg_get_viewdef output here for reference]
--
-- CHANGE SUMMARY:
-- [Describe what's being changed and why]
--
-- VERIFICATION QUERIES (run before/after):
-- [Paste the test queries from Step 3]

-- Drop view with CASCADE if RLS policies depend on it
DROP VIEW IF EXISTS view_name CASCADE;

-- Recreate with minimal changes
CREATE VIEW view_name AS
[Paste modified view definition - change ONLY what's documented above]
;

-- Restore permissions
GRANT SELECT ON view_name TO authenticated;
GRANT SELECT ON view_name TO anon;
GRANT SELECT ON view_name TO service_role;

-- Add descriptive comment
COMMENT ON VIEW view_name IS
    '[Updated description explaining the change and when it was made]';
```

### Step 6: Verify After Changes

**Run the same test queries from Step 3 and compare results.**

```sql
-- Should return same structure + your new column/change
SELECT * FROM view_name LIMIT 5;

-- Should still return data for known test cases
SELECT
  column1,
  column2,
  important_joined_column
FROM view_name
WHERE column1 = 'known_test_value';
```

**Check for differences:**
- New column appears? ✅
- Existing columns unchanged? ✅
- JOIN results still match? ✅
- Test records still return expected data? ✅

### Step 7: Document the Change

Update relevant documentation:
1. Migration file has clear before/after
2. CLAUDE.md updated if this affects common workflows
3. Git commit message explains what and why

## Common Mistakes to Avoid

### ❌ DON'T: Recreate View from Scratch
```sql
-- WRONG - This is based on assumptions, not reality
CREATE VIEW my_view AS
SELECT a.id, a.name
FROM table_a a
LEFT JOIN table_b b ON a.name = b.name;  -- Guessed JOIN condition!
```

### ✅ DO: Fetch Current Definition First
```sql
-- RIGHT - Get actual definition
SELECT pg_get_viewdef('my_view'::regclass, true);
-- Output shows it joins on: a.slug = b.legacy_slug
-- Use THAT join condition, not your assumption!
```

### ❌ DON'T: Change Multiple Things at Once
```sql
-- WRONG - Adding column + changing JOINs + reordering columns
CREATE VIEW my_view AS
SELECT
  b.new_field,  -- Reordered
  a.id,
  new_column,  -- Added
FROM table_a a
LEFT JOIN table_b b ON a.different_field = b.other_field;  -- Changed JOIN
```

### ✅ DO: One Change at a Time
```sql
-- RIGHT - Only adding the new column
CREATE VIEW my_view AS
[Exact same SELECT list in same order]
  new_column,  -- Only this is new
FROM table_a a
LEFT JOIN table_b b ON [EXACT SAME JOIN AS BEFORE];
```

## Rollback Procedure

If something goes wrong:

```sql
-- Use the saved original definition from Step 1
DROP VIEW IF EXISTS view_name CASCADE;

CREATE VIEW view_name AS
[Paste the exact pg_get_viewdef output you saved in Step 1]
;

-- Restore permissions
GRANT SELECT ON view_name TO authenticated;
GRANT SELECT ON view_name TO anon;
GRANT SELECT ON view_name TO service_role;
```

## Example: Adding a Column to a View

Following the workflow:

### Step 1: Fetch Current
```sql
SELECT pg_get_viewdef('application_supervision_details_view'::regclass, true);
-- Save output: shows it joins on group_webflow_slug = legacy_group_slug
```

### Step 2: Understand Structure
- Joins applications_new → supervision_groups → users
- Uses group_webflow_slug for JOIN (not group_name!)
- Returns 20 columns including supervisor_full_name

### Step 3: Test Current
```sql
SELECT uuid, first_name, supervisor_full_name, supervision_group_name
FROM application_supervision_details_view
WHERE first_name = 'Robyn'
LIMIT 3;
-- Results: Shows "Lily Seto" for supervisor, "Group K Lily" for group
```

### Step 4: Plan Change
```
CHANGE: Add last_activity_date column
MODIFIED: SELECT clause only (add one column)
UNCHANGED: All JOINs, all existing columns, all filters
```

### Step 5: Create Migration
```sql
DROP VIEW IF EXISTS application_supervision_details_view CASCADE;

CREATE VIEW application_supervision_details_view AS
SELECT
    a.uuid,
    a.first_name,
    -- ... all existing columns ...
    -- NEW COLUMN:
    COALESCE(
      (SELECT MAX(changed_at) FROM application_status_history
       WHERE application_id = a.uuid),
      a.submission_date::timestamptz
    ) as last_activity_date
FROM applications_new a
LEFT JOIN supervision_groups sg ON lower(a.group_webflow_slug) = lower(sg.legacy_group_slug)
LEFT JOIN users u ON sg.supervisor_id = u.id;
```

### Step 6: Verify
```sql
-- Same test query - now includes new column
SELECT uuid, first_name, supervisor_full_name, supervision_group_name, last_activity_date
FROM application_supervision_details_view
WHERE first_name = 'Robyn'
LIMIT 3;
-- Results: Still shows "Lily Seto" and "Group K Lily" ✅
-- Plus new last_activity_date column ✅
```

## Checklist

Before applying any view change:

- [ ] Fetched current definition with `pg_get_viewdef()`
- [ ] Saved original definition for rollback
- [ ] Tested current view with sample data
- [ ] Documented expected results
- [ ] Planned minimal change (not full rewrite)
- [ ] Created migration with original definition in comments
- [ ] Verified same test queries return expected results
- [ ] Checked that dependent objects still work
- [ ] Updated relevant documentation

## When to Use This Skill

**Always use when:**
- Adding columns to existing views
- Modifying JOIN conditions
- Changing filters or WHERE clauses
- Any modification to production views
- Debugging why a view isn't returning expected data

**This skill prevents:**
- Breaking production features by changing JOINs
- Losing data by rewriting view logic
- Lengthy debugging sessions from assumption-based changes
- Having to rollback and start over

## Integration with Other Workflows

This skill works with:
- **Schema Documentation Generator**: Use to verify table structures before modifying joins
- **Supabase MCP**: Use `mcp__supabase__execute_sql` to run verification queries
- **RLS Policy Generator**: Re-apply policies after view changes with CASCADE

## Success Criteria

A successful view modification:
1. ✅ Adds/changes only what was intended
2. ✅ Preserves all existing functionality
3. ✅ Returns same data for test queries (plus new fields)
4. ✅ Has rollback path clearly documented
5. ✅ Includes before/after verification queries
