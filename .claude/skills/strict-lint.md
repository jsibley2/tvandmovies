# Strict Lint - Progressive Code Quality Enhancement

Enforce stricter ESLint standards for new code without breaking existing files.

## Purpose

Improve code quality progressively by:
- Enforcing strict TypeScript rules for NEW/MODIFIED files
- Preventing common React bugs (hooks, dependencies)
- Catching type safety issues early
- Establishing team standards for future work
- **NOT breaking existing code** (zero breaking changes)

## The Problem This Solves

**Current state:**
- ESLint is very lenient (`eslint:recommended` only)
- `@typescript-eslint/no-explicit-any` is just a **warning**
- No React-specific rules despite being a React project
- Missing strict TypeScript checks
- Easy to introduce bugs that TypeScript could catch

**The dilemma:**
- ✅ Want stricter rules for better code quality
- ❌ Can't break existing code (100+ files)
- ❌ Don't want to spend weeks fixing old code
- ✅ Need to prevent new technical debt

## The Solution: Two-Tier Linting

### Tier 1: Normal Lint (Existing Code)
Uses current `.eslintrc.json` - lenient, won't break builds

### Tier 2: Strict Lint (New Code)
Uses `.eslintrc-strict.json` - enforces high standards

## What This Skill Does

1. Creates `.eslintrc-strict.json` with enhanced rules
2. Adds new npm scripts for both lint modes
3. Configures strict mode for specific directories
4. Provides migration path for existing code
5. Sets up optional pre-commit hooks
6. Generates compliance report

## New ESLint Configuration

### .eslintrc-strict.json

Extends your current config and adds:

**Strict TypeScript Rules:**
```json
{
  "@typescript-eslint/no-explicit-any": "error",           // Ban 'any' types
  "@typescript-eslint/no-unsafe-assignment": "error",     // Prevent unsafe assignments
  "@typescript-eslint/no-unsafe-call": "error",           // Prevent unsafe function calls
  "@typescript-eslint/no-unsafe-member-access": "error",  // Prevent unsafe property access
  "@typescript-eslint/no-unsafe-return": "error",         // Prevent unsafe returns
  "@typescript-eslint/explicit-function-return-type": "warn", // Encourage return types
  "@typescript-eslint/strict-boolean-expressions": "warn" // Prevent truthy/falsy bugs
}
```

**React Best Practices:**
```json
{
  "react-hooks/rules-of-hooks": "error",        // Enforce hooks rules
  "react-hooks/exhaustive-deps": "error",       // Prevent stale closures
  "react/jsx-no-leaked-render": "error",        // Prevent {count && <Component/>}
  "react/no-unstable-nested-components": "error" // Prevent performance issues
}
```

**Code Quality:**
```json
{
  "no-console": ["warn", { "allow": ["warn", "error"] }], // Allow console.error
  "no-debugger": "error",                                  // Block debugger statements
  "no-restricted-imports": ["error", {                     // Prevent bad imports
    "patterns": ["../*/*"]  // Max one level up
  }],
  "prefer-const": "error",
  "no-var": "error"
}
```

**Import/Export:**
```json
{
  "import/no-duplicates": "error",              // Consolidate imports
  "import/order": ["warn", {                    // Organize imports
    "groups": ["builtin", "external", "internal"],
    "alphabetize": { "order": "asc" }
  }]
}
```

## New NPM Scripts

After running this skill, you'll have:

```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx --max-warnings 0",           // Current (lenient)
    "lint:strict": "eslint . --ext ts,tsx --config .eslintrc-strict.json", // New (strict)
    "lint:fix": "eslint . --ext ts,tsx --fix",                  // Auto-fix current
    "lint:strict:fix": "eslint . --ext ts,tsx --config .eslintrc-strict.json --fix", // Auto-fix strict
    "lint:changed": "eslint $(git diff --name-only --diff-filter=ACMRTUXB main | grep -E '\\.(ts|tsx)$' | xargs)",
    "lint:report": "eslint . --ext ts,tsx --config .eslintrc-strict.json -f html -o eslint-report.html"
  }
}
```

## Usage Patterns

### For New Files
```bash
# Before committing new files
npm run lint:strict:fix

# Check strict compliance
npm run lint:strict
```

### For Modified Files
```bash
# Lint only changed files (safe for existing code)
npm run lint:changed

# Apply strict rules to changed files
npm run lint:strict:fix src/components/NewComponent.tsx
```

### Compliance Report
```bash
# Generate HTML report showing all strict violations
npm run lint:report

# Opens in browser
open eslint-report.html
```

### Pre-commit Check (Recommended)
```bash
# Automatically run on git commit
# Only checks files you're committing
```

## Directory-Based Enforcement

You can enforce strict rules for specific directories:

### Option 1: Override in .eslintrc-strict.json
```json
{
  "overrides": [
    {
      "files": ["src/components/**/*.tsx"],  // New components only
      "rules": {
        "@typescript-eslint/no-explicit-any": "error"
      }
    }
  ]
}
```

### Option 2: Date-based (files created after today)
The skill can configure rules to only apply to files newer than a specific date.

## Migration Strategy for Existing Code

### Phase 1: Awareness (Week 1)
- Run `npm run lint:report` weekly
- See what would fail in strict mode
- No action required yet

### Phase 2: Touch and Fix (Ongoing)
When you modify an existing file:
```bash
# Before committing changes
npm run lint:strict:fix src/path/to/modified-file.tsx
```

### Phase 3: Gradual Cleanup (Optional)
Fix one directory at a time:
```bash
# Fix all files in one directory
npm run lint:strict:fix src/components/dashboard/*.tsx

# Commit
git add src/components/dashboard/
git commit -m "chore: apply strict lint to dashboard components"
```

### Phase 4: Full Adoption (Future)
When most code is compliant:
```bash
# Replace .eslintrc.json with .eslintrc-strict.json
mv .eslintrc.json .eslintrc-legacy.json
mv .eslintrc-strict.json .eslintrc.json
```

## Common Issues and Auto-Fixes

### Issue: `any` types
**Before:**
```typescript
const data: any = await response.json();
```

**After (auto-fixable):**
```typescript
const data: unknown = await response.json();
// Then add proper type assertion
const typedData = data as MyExpectedType;
```

### Issue: Missing useEffect dependencies
**Before:**
```typescript
useEffect(() => {
  fetchData(userId);
}, []); // ❌ Missing 'userId' dependency
```

**After:**
```typescript
useEffect(() => {
  fetchData(userId);
}, [userId]); // ✅ All dependencies included
```

### Issue: Leaked renders
**Before:**
```typescript
{count && <Component />} // ❌ Shows "0" when count is 0
```

**After:**
```typescript
{count > 0 && <Component />} // ✅ Explicit boolean
// or
{count ? <Component /> : null}
```

### Issue: Nested components
**Before:**
```typescript
function Parent() {
  const Child = () => <div>Bad</div>; // ❌ Recreated every render
  return <Child />;
}
```

**After:**
```typescript
const Child = () => <div>Good</div>; // ✅ Defined outside

function Parent() {
  return <Child />;
}
```

## Rules Reference

### Critical Rules (Prevent Bugs)

| Rule | What It Prevents |
|------|-----------------|
| `react-hooks/exhaustive-deps` | Stale closures, infinite loops |
| `@typescript-eslint/no-unsafe-assignment` | Type safety violations |
| `react/no-unstable-nested-components` | Performance issues, lost state |
| `react/jsx-no-leaked-render` | Rendering "0" or "NaN" |

### Code Quality Rules

| Rule | What It Improves |
|------|-----------------|
| `@typescript-eslint/no-explicit-any` | Type safety, autocomplete |
| `prefer-const` | Immutability, clarity |
| `import/order` | Code organization |
| `no-console` | Production code cleanliness |

### Warning Rules (Soft Enforcement)

| Rule | Purpose |
|------|---------|
| `@typescript-eslint/explicit-function-return-type` | Documentation, clarity |
| `@typescript-eslint/strict-boolean-expressions` | Prevent truthy/falsy bugs |
| `complexity` | Flag overly complex functions |

## Pre-commit Hook Setup (Optional)

The skill can create a pre-commit hook that:
- Only checks files you're committing
- Uses strict rules for new files
- Uses normal rules for existing files
- Blocks commit if strict violations found

### Using Husky (Recommended)
```bash
npm install --save-dev husky lint-staged

# .husky/pre-commit
npx lint-staged
```

### Using Git Hooks Directly
```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run lint:changed
```

## Integration with Your Workflow

### Before Starting New Work
```bash
# 1. Check current compliance
npm run lint:report

# 2. Understand what strict mode requires
cat .eslintrc-strict.json
```

### While Developing
```bash
# 3. Run strict lint frequently
npm run lint:strict src/components/MyNewComponent.tsx

# 4. Auto-fix when possible
npm run lint:strict:fix src/components/MyNewComponent.tsx
```

### Before Committing
```bash
# 5. Lint only what you changed
npm run lint:changed

# 6. Or use pre-commit hook (automatic)
git commit -m "feat: add new component"
```

### During Code Review
```bash
# 7. Review strict compliance
npm run lint:strict src/components/ChangedFile.tsx

# 8. Generate report for PR
npm run lint:report
```

## Benefits Over Time

### Week 1
- ✅ Strict config created
- ✅ New components follow best practices
- ❌ Existing code unchanged

### Month 1
- ✅ 20-30% of files strict-compliant
- ✅ Fewer bugs in new code
- ✅ Better type safety

### Month 3
- ✅ 50-60% of files strict-compliant
- ✅ Team knows strict patterns
- ✅ Can gradually migrate old code

### Month 6
- ✅ 80%+ files strict-compliant
- ✅ Ready to make strict the default
- ✅ Significantly better code quality

## Comparison: Normal vs Strict

### Normal Lint (Current)
```bash
npm run lint
# ✅ Passes with 0 errors
# ⚠️  15 warnings (ignored)
```

### Strict Lint (New)
```bash
npm run lint:strict
# ❌ 127 errors across 45 files
# ⚠️  203 warnings
#
# But NEW files:
# ✅ 0 errors in src/components/NewComponent.tsx
```

## Quick Start

After running this skill:

```bash
# 1. Create a new component with strict rules
npm run lint:strict:fix src/components/MyComponent.tsx

# 2. See what existing code would need
npm run lint:report
open eslint-report.html

# 3. Optionally set up pre-commit hook
npm install --save-dev husky lint-staged
npx husky init
```

## Example: Before and After

### Before (Current .eslintrc.json)
```typescript
// This passes lint ✅ but is poor quality
const data: any = await fetch(url).then(r => r.json());
const [state, setState] = useState();

useEffect(() => {
  fetchData(userId);
}, []); // Missing dependency

{count && <Component />} // Leaked render
```

### After (.eslintrc-strict.json)
```typescript
// This is required ✅ and high quality
const data: UserData = await fetch(url)
  .then(r => r.json() as Promise<UserData>);

const [state, setState] = useState<StateType | null>(null);

useEffect(() => {
  fetchData(userId);
}, [userId]); // ✅ All dependencies

{count > 0 && <Component />} // ✅ Explicit boolean
```

## Related Files

- `.eslintrc.json` - Current (lenient) config
- `.eslintrc-strict.json` - New (strict) config (created by skill)
- `package.json` - npm scripts (updated by skill)
- `.husky/pre-commit` - Git hook (optional, created by skill)
- `eslint-report.html` - Compliance report (generated on demand)

## Dependencies Required

The skill will install these if missing:

```json
{
  "devDependencies": {
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-import": "^2.29.0"
  }
}
```

## Customization

You can adjust rules in `.eslintrc-strict.json`:

```json
{
  "rules": {
    // Make a rule less strict
    "@typescript-eslint/no-explicit-any": "warn", // error → warn

    // Disable a rule
    "import/order": "off",

    // Add project-specific rules
    "no-restricted-imports": ["error", {
      "patterns": ["**/legacy/**"] // Block legacy imports
    }]
  }
}
```

## Troubleshooting

### Issue: Too many errors to fix
**Solution:** Use gradual migration
```bash
# Fix one directory at a time
npm run lint:strict:fix src/components/auth/*.tsx
```

### Issue: Auto-fix breaks code
**Solution:** Review changes carefully
```bash
# See what would change before applying
npm run lint:strict --fix-dry-run src/file.tsx
```

### Issue: Rule conflicts with team preferences
**Solution:** Adjust in `.eslintrc-strict.json`
```json
{
  "rules": {
    "prefer-arrow-callback": "off" // If team prefers function declarations
  }
}
```

### Issue: CI/CD pipeline failing
**Solution:** Keep using normal lint in CI for now
```yaml
# .github/workflows/ci.yml
- run: npm run lint        # Not lint:strict
```

---

**Created**: 2025-10-25
**Priority**: Medium-High (7/10)
**Frequency**: Run on new files, gradually migrate existing
**Impact**: High - Prevents bugs, improves code quality, establishes standards
**Breaking Changes**: None - fully backward compatible
