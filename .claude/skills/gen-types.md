# TypeScript Types Generator

Generate TypeScript types from Supabase database schema for type safety and IDE autocomplete.

## Purpose

Keeps your TypeScript definitions in sync with your actual database schema, providing:
- Type-safe database queries
- IDE autocomplete for table/column names
- Compile-time error detection
- Prevention of runtime database errors

## What This Skill Does

1. Generates TypeScript types from your Supabase database
2. Consolidates output to `src/types/database-types.ts`
3. Validates the types were generated successfully
4. Runs TypeScript type checking to catch breaking changes
5. Reports file size and summary statistics

## When to Use

**Run this after:**
- Creating new database migrations
- Modifying table schemas
- Adding/removing columns
- Changing column types
- Type definitions feel stale or out of sync

**Run this before:**
- Building for production
- After pulling schema changes from teammates
- When you see TypeScript errors related to database queries

## Relationship with Schema Docs Skill

These two skills serve **different purposes**:

| Schema Docs | TypeScript Types |
|------------|------------------|
| Human-readable JSON | Machine-readable TypeScript |
| Verify field names exist | Type-safe code compilation |
| Run before EVERY db operation | Run after migrations |
| 10x per day | 1-2x per week |
| Prevents wrong field names | Prevents type errors |

**Best practice:** Run schema-docs BEFORE writing queries, run gen-types AFTER schema changes.

## Output Location

**Primary output:** `src/types/database-types.ts`

This consolidates the previously scattered type files:
- ~~`src/lib/database.types.ts`~~ (deprecated, 192KB)
- ~~`src/types/supabase.ts`~~ (npm script target, unused)
- `src/types/database-types.ts` ✅ (consolidated location)

## What You'll Get

The skill will:
1. Connect to your Supabase project
2. Generate TypeScript types for the `public` schema
3. Save to `src/types/database-types.ts`
4. Show file size and line count
5. Run `tsc --noEmit` to validate types
6. Report any breaking changes found

## Usage in Your Code

After running this skill, use the types like this:

```typescript
import type { Database, Tables } from '@/types/database-types';

// Type-safe table access
type Application = Tables<'applications_new'>;
type User = Tables<'users'>;

// Type-safe queries
const { data, error } = await supabase
  .from('applications_new')
  .select('*')
  .returns<Application[]>();

// Full database type for client creation
import { createClient } from '@supabase/supabase-js';
const supabase = createClient<Database>(url, key);
```

## Breaking Change Detection

The skill runs TypeScript type checking after generation to catch:
- Removed columns still referenced in code
- Changed column types causing type mismatches
- New required fields not handled in inserts
- View changes affecting query results

If breaking changes are found, you'll see:
```
⚠️ Type Check Failed! Found X errors:
[Error details...]

Action required: Fix these type errors before proceeding.
```

## Project Configuration

**Supabase Project ID:** `ncsrlqrvymkmniunnhue`
**Schema:** `public`
**Command:** `supabase gen types typescript --project-id ncsrlqrvymkmniunnhue --schema public`

## Cleanup Needed

After running this skill, you should:
1. ✅ Use `src/types/database-types.ts` as the single source of truth
2. 🗑️ Delete `src/lib/database.types.ts` (old location)
3. 🗑️ Remove unused npm script target for `src/types/supabase.ts`
4. 🔄 Update any imports from old locations

## Common Issues

### Issue: "Permission denied" or "Not authenticated"
**Solution:** Ensure you're logged into Supabase CLI:
```bash
supabase login
```

### Issue: "Project not found"
**Solution:** Verify project ID in command matches your Supabase dashboard

### Issue: Types seem outdated
**Solution:**
1. Run schema-docs skill first to verify current schema
2. Ensure migrations are pushed: `supabase db push`
3. Then run this skill

### Issue: Large number of type errors after generation
**Solution:** This is expected after schema changes. Address them systematically:
1. Fix removed column references
2. Update type annotations
3. Handle new required fields
4. Update tests

## Integration with Workflow

**Recommended workflow:**
```bash
1. Make schema changes (write migration)
2. Apply migration: supabase db push
3. Run schema-docs skill (update JSON docs)
4. Run gen-types skill (update TypeScript types)
5. Fix any type errors reported
6. Test changes locally
7. Commit both migration + updated types
```

## File Size Reference

Typical `database-types.ts` size: ~50-200KB depending on schema complexity
- 50KB = Small project (10-20 tables)
- 100KB = Medium project (20-40 tables)
- 200KB+ = Large project (40+ tables, many views)

Your current size: ~48KB (manageable)

## Related Files

- `package.json` - npm script: `npm run types:supabase`
- `.claude/commands/gen-types.md` - Slash command version
- `src/types/database-types.ts` - Output file
- `tsconfig.json` - TypeScript configuration with path aliases

## Why Separate from Schema Docs?

1. **Different cadence** - Types updated weekly, schema checked daily
2. **Different consumers** - Types for compiler, schema for humans
3. **Different triggers** - Types after migrations, schema before queries
4. **Different validation** - Types check compilation, schema checks existence
5. **Can be independent** - Schema docs don't require type generation

---

**Created**: 2025-10-25
**Priority**: High (9/10)
**Frequency**: After migrations, before production builds
**Dependencies**: Requires Supabase CLI authentication
