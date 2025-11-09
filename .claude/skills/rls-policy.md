# RLS Policy Generator

Generate safe Row Level Security (RLS) policies for a single table at a time without breaking existing functionality.

## Purpose

Safely add or update RLS policies by:
- Working on ONE table at a time (prevents cascading failures)
- Analyzing existing policies before making changes
- Preserving existing functionality
- Following your project's established patterns
- Including service role bypass (for edge functions)
- Testing policies before applying to production

## Critical Understanding: RLS vs Service Role

### Edge Functions (Service Role) ✅
```typescript
// Edge functions use service role key - BYPASSES RLS
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Service role - no RLS
)

// This works regardless of RLS policies
const { data } = await supabaseAdmin
  .from('applications_new')
  .select('*') // ✅ Gets all rows
```

### Frontend (Anon Key) 🔒
```typescript
// Frontend uses anon key - SUBJECT TO RLS
import { supabase } from '@/supabase/client'

// This respects RLS policies
const { data } = await supabase
  .from('applications_new')
  .select('*') // ❓ Gets only rows allowed by RLS
```

**Key Point:** RLS policies protect **direct database access from the frontend**, not edge function operations.

## What This Skill Does

1. **Analyze Current State**
   - Check if RLS is enabled on the table
   - List existing policies
   - Identify affected user roles
   - Detect potential breaking changes

2. **Generate Policy Template**
   - Service role bypass (for edge functions)
   - Admin full access
   - Supervisor access (if applicable)
   - User access to own records
   - Reviewer read-only access (if applicable)

3. **Create Migration**
   - Drops existing policies (if replacing)
   - Creates new policies safely
   - Includes rollback SQL in comments
   - Names policies consistently

4. **Validation Checks**
   - Ensures service role always has access
   - Verifies no existing functionality breaks
   - Tests policy with sample queries
   - Provides testing checklist

## Your Project's RLS Patterns

### Pattern 1: Service Role Bypass (Critical for Edge Functions)
```sql
-- ALWAYS include this for tables accessed by edge functions
CREATE POLICY "service_role_bypass_rls_[table_name]"
  ON [table_name]
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Pattern 2: Admin Full Access
```sql
-- Admins can do everything
CREATE POLICY "admin_full_access_[table_name]"
  ON [table_name]
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### Pattern 3: Users Access Own Records
```sql
-- Users can read/update their own records
CREATE POLICY "users_access_own_[table_name]"
  ON [table_name]
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Pattern 4: Supervisor Access to Assigned Records
```sql
-- Supervisors can access records assigned to them
CREATE POLICY "supervisor_access_assigned_[table_name]"
  ON [table_name]
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'supervisor'
    )
    AND (
      supervisor_id = auth.uid()
      OR supervision_group_id IN (
        SELECT id FROM supervision_groups
        WHERE supervisor_id = auth.uid()
      )
    )
  );
```

## Policy Naming Convention

Follow your existing pattern:
```
[action]_[role]_[permission]_[table_name]

Examples:
- service_role_bypass_rls_applications_new
- admin_full_access_applications_new
- users_read_own_stripe_payments
- supervisor_access_assigned_applications_new
```

## Step-by-Step Process

### Step 1: Analyze Current Policies
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'YOUR_TABLE';

-- List existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'YOUR_TABLE';
```

### Step 2: Identify Table Requirements

Ask these questions:
1. **Is this table accessed by edge functions?** → Add service role bypass
2. **Do admins need full access?** → Add admin policy
3. **Do users have "owned" records?** → Add user_id-based policy
4. **Are there supervisor assignments?** → Add supervisor policy
5. **Is there read-only access?** → Add reviewer/public policy

### Step 3: Generate Migration

```sql
-- Migration: add_rls_[table_name].sql
-- Description: Add RLS policies to [table_name]
-- Rollback: Included in comments below

BEGIN;

-- Enable RLS if not already enabled
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if replacing)
-- Uncomment if you're replacing existing policies:
-- DROP POLICY IF EXISTS "old_policy_name" ON [table_name];

-- CRITICAL: Service role bypass (for edge functions)
CREATE POLICY "service_role_bypass_rls_[table_name]"
  ON [table_name]
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin full access
CREATE POLICY "admin_full_access_[table_name]"
  ON [table_name]
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Users access their own records
CREATE POLICY "users_access_own_[table_name]"
  ON [table_name]
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMIT;

/*
ROLLBACK SQL:
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_bypass_rls_[table_name]" ON [table_name];
DROP POLICY IF EXISTS "admin_full_access_[table_name]" ON [table_name];
DROP POLICY IF EXISTS "users_access_own_[table_name]" ON [table_name];
*/
```

### Step 4: Test Before Applying

```sql
-- Test 1: Service role can access everything
SET ROLE service_role;
SELECT * FROM [table_name]; -- Should return all rows
RESET ROLE;

-- Test 2: Admin can access everything
-- (Manually test in frontend as admin user)

-- Test 3: User can access only their records
-- (Manually test in frontend as regular user)

-- Test 4: Edge functions still work
-- (Call edge function that uses this table)
```

## Safety Checklist

Before applying RLS policies, verify:

- [ ] **Edge functions identified** - Listed all edge functions that access this table
- [ ] **Service role bypass added** - CRITICAL: Service role policy included
- [ ] **Existing access preserved** - Current user permissions maintained
- [ ] **Migration has rollback** - Can revert if something breaks
- [ ] **Testing plan created** - Know how to verify each policy
- [ ] **One table only** - Not modifying multiple tables at once
- [ ] **Production backup** - Database snapshot taken (if production)

## Common Tables & Recommended Policies

### applications_new
```sql
-- Users: Can view/edit their own applications
-- Supervisors: Can view assigned applications
-- Admins: Can view/edit all applications
-- Service role: Full access (for edge functions)
```

### user_roles
```sql
-- Users: Can read their own roles
-- Admins: Can manage all roles
-- Service role: Full access (for edge functions)
-- NO UPDATE for regular users (security)
```

### stripe_payments
```sql
-- Users: Can view their own payments only
-- Admins: Can view all payments
-- Service role: Full access (for webhooks)
-- NO INSERT/UPDATE from frontend (use edge functions)
```

### supervision_groups
```sql
-- Users: Can view groups they're assigned to
-- Supervisors: Can view/edit their own groups
-- Admins: Can manage all groups
-- Service role: Full access
```

### first_time_tokens
```sql
-- Users: Can read their own tokens
-- Service role: Full access (for password setup)
-- NO public access (security tokens)
```

## Breaking Change Prevention

### Before Adding RLS to a Table

1. **Check current access patterns**
```sql
-- See who's accessing the table
SELECT DISTINCT usename
FROM pg_stat_activity
WHERE query LIKE '%YOUR_TABLE%'
AND datname = current_database();
```

2. **Review edge functions**
```bash
# Find edge functions that query this table
grep -r "from('YOUR_TABLE')" supabase/functions/
```

3. **Test in development first**
```bash
# Apply to local database
supabase db reset

# Run migration
supabase migration up

# Test functionality
npm run dev
# Test each feature that uses this table
```

## Policy Testing Guide

### Test as Different Roles

```sql
-- Test as specific user (in SQL editor)
SELECT
  auth.uid() as current_user,
  (SELECT role FROM user_roles WHERE user_id = auth.uid()) as current_role;

-- Then test queries
SELECT * FROM [table_name]; -- What can this user see?
```

### Test in Frontend

```typescript
// Test as admin
const { data: adminData } = await supabase
  .from('table_name')
  .select('*');
console.log('Admin sees:', adminData.length, 'rows');

// Test as regular user
// (Log in as different user)
const { data: userData } = await supabase
  .from('table_name')
  .select('*');
console.log('User sees:', userData.length, 'rows');
```

### Test Edge Functions

```bash
# Call edge function that uses this table
supabase functions invoke function-name --data '{"test": true}'

# Check logs
supabase functions logs function-name
```

## Troubleshooting

### Issue: Edge function returns empty results after adding RLS
**Cause:** Missing service role bypass policy
**Fix:**
```sql
CREATE POLICY "service_role_bypass_rls_[table]"
  ON [table]
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Issue: Users can't access their own records
**Cause:** Wrong column name for user_id check
**Fix:** Verify column name in schema docs
```sql
-- Check actual column name
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'YOUR_TABLE'
AND column_name LIKE '%user%';
```

### Issue: Policy too complex, performance issues
**Cause:** Multiple JOINs in USING clause
**Fix:** Create database function or materialized view
```sql
-- Instead of complex JOIN in policy
CREATE OR REPLACE FUNCTION user_can_access_application(app_id UUID)
RETURNS BOOLEAN AS $$
  -- Complex logic here
$$ LANGUAGE sql SECURITY DEFINER;

-- Use in policy
USING (user_can_access_application(id))
```

### Issue: Can't drop old policy
**Cause:** Policy doesn't exist or name mismatch
**Fix:**
```sql
-- List all policies first
SELECT policyname FROM pg_policies WHERE tablename = 'YOUR_TABLE';

-- Drop with exact name
DROP POLICY IF EXISTS "exact_policy_name" ON your_table;
```

## Migration Template

```sql
-- supabase/migrations/YYYYMMDD_add_rls_[table_name].sql
-- Add RLS policies to [table_name]
--
-- What this does:
-- 1. Enables RLS on [table_name]
-- 2. Adds service role bypass (for edge functions)
-- 3. Adds admin full access
-- 4. Adds user access to own records
--
-- Edge functions affected:
-- - [function-1]
-- - [function-2]
--
-- Tables affected:
-- - [table_name] only

BEGIN;

-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Service role bypass (CRITICAL)
DROP POLICY IF EXISTS "service_role_bypass_rls_[table_name]" ON [table_name];
CREATE POLICY "service_role_bypass_rls_[table_name]"
  ON [table_name]
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin access
DROP POLICY IF EXISTS "admin_full_access_[table_name]" ON [table_name];
CREATE POLICY "admin_full_access_[table_name]"
  ON [table_name]
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- User access to own records
DROP POLICY IF EXISTS "users_access_own_[table_name]" ON [table_name];
CREATE POLICY "users_access_own_[table_name]"
  ON [table_name]
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMIT;

/*
===============================================
ROLLBACK INSTRUCTIONS
===============================================

If this migration causes issues:

1. Run this SQL to rollback:

ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_bypass_rls_[table_name]" ON [table_name];
DROP POLICY IF EXISTS "admin_full_access_[table_name]" ON [table_name];
DROP POLICY IF EXISTS "users_access_own_[table_name]" ON [table_name];

2. Or revert the migration:

supabase db reset --version <previous_version>

===============================================
TESTING CHECKLIST
===============================================

[ ] Service role can access all rows (edge functions work)
[ ] Admin users can access all rows
[ ] Regular users can only access their own rows
[ ] Existing features still work
[ ] No console errors in frontend
[ ] Edge functions returning expected data

===============================================
*/
```

## Usage Example

```bash
# 1. Generate policy for a table
# Use this skill to create migration for 'applications_new'

# 2. Review generated migration
cat supabase/migrations/YYYYMMDD_add_rls_applications_new.sql

# 3. Apply to local database
supabase db reset

# 4. Test thoroughly
npm run dev
# Test as different users
# Test edge functions

# 5. If all good, push to production
supabase db push
```

## Related Files

- `supabase/migrations/` - Where RLS migrations go
- `SERVICE_ROLE_BEST_PRACTICES.md` - Service role usage guide
- `supabase/functions/_shared/supabase-service-client.ts` - Service role client
- `.claude/skills/schema-docs.md` - Check table structure first

## Quick Reference

**Always include for tables accessed by edge functions:**
```sql
CREATE POLICY "service_role_bypass_rls_[table]"
  ON [table] FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

**Standard admin policy:**
```sql
CREATE POLICY "admin_full_access_[table]"
  ON [table] FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```

**User owns record:**
```sql
CREATE POLICY "users_access_own_[table]"
  ON [table] FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

**Created**: 2025-10-25
**Priority**: High (8/10) - Security critical
**Frequency**: When adding RLS to new tables
**Safety**: One table at a time, always includes service role bypass
**Testing**: Required before production deployment
