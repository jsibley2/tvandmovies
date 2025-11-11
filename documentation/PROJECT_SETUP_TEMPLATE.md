# Project Setup Template for Claude Code

Use this template when setting up a new project with Claude Code assistance.

## 1. Initial Context Document (CLAUDE.md)

Create `.../CLAUDE.md` in project root with these sections:

### Essential Sections

```markdown
# [PROJECT_NAME]

## 🚨 CRITICAL: Development Environment Setup

**Project Location**: `/path/to/project`
**Development User**: `[username]` (NOT root)

### Always Verify Before Starting Work:
```bash
whoami  # Should return: [username]
pwd     # Should return: /path/to/project
```

### Why This Matters:
- Security: Never develop as root user
- Permissions: Root-created files cause permission issues
- Environment: User-specific tools and configurations
- Git: Commits should be from correct user

## Project Overview

[Brief description of what this project does]

**Stack:**
- Frontend: [technology + version]
- Backend: [technology + version]
- Database: [type + version]
- Key Services: [list integrations]

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Lint code
npm run test             # Run tests

# Database
[database-specific commands]

# Deployment
[deployment commands]
```

## 🚨 CRITICAL: [Technology-Specific] Guidelines

### [Database] Best Practices

1. **Schema Changes**
   - Always fetch current schema first
   - Never assume field names exist
   - Use provided skills/tools for modifications

2. **Common Mistakes**
   - ❌ [Common mistake 1]
   - ✅ [Correct approach 1]

### [Framework] Patterns

1. **Component Structure**
   - [Pattern description]

2. **State Management**
   - [Approach description]

## Development Patterns

### Authentication & Authorization
- [How auth works in this project]

### Data Fetching
- [Data fetching patterns]

### Error Handling
- [Error handling approach]

## Architecture

```
src/
├── [directory structure]
```

### Key Files
- `[important file 1]` - [description]
- `[important file 2]` - [description]

## Configuration

### Environment Variables
```bash
# Required
VAR_1=value
VAR_2=value

# Optional
VAR_3=value
```

### [Service] Configuration
- Location: [path]
- Purpose: [what it configures]

## Common Issues & Solutions

### Issue 1: [Description]
**Symptoms:**
- [symptom 1]
- [symptom 2]

**Solution:**
```bash
[solution commands]
```

### Issue 2: [Description]
[Same format]

## Deployment

### [Environment] Deployment
- Platform: [platform]
- Build command: `[command]`
- Deploy command: `[command]`

## Key References
- [Important doc 1]
- [Important doc 2]
```

## 2. Essential Skills to Create

### Skill Priority Matrix

**Must-Have Skills (Week 1):**
1. **Schema/Database Manager** - Prevent breaking changes
2. **Dev Server Manager** - Handle server lifecycle
3. **Type Generator** - Keep types in sync

**High-Value Skills (Month 1):**
4. **Deployment Helper** - Streamline deployments
5. **Test Runner** - Easy test execution
6. **Lint Fixer** - Auto-fix common issues

**Nice-to-Have Skills (As Needed):**
7. **Documentation Generator**
8. **Migration Helper**
9. **Performance Analyzer**

### Skill Template Structure

```
.claude/
├── skills/
│   ├── [database]-manager.md
│   ├── dev-server.md
│   └── type-generator.md
└── commands/
    ├── deploy.md
    └── test.md
```

## 3. Skill Creation Checklist

For each skill, ensure it has:

```markdown
---
name: skill-name
description: Clear description of what this skill does and when to use it
---

# Skill Name

## Purpose
[Why this skill exists - include real pain point it solves]

## Core Workflow - MUST FOLLOW IN ORDER

### Step 1: [Action]
[Detailed instructions]

### Step 2: [Action]
[Detailed instructions]

## Common Mistakes to Avoid

### ❌ DON'T: [Bad practice]
```code example of what not to do```

### ✅ DO: [Good practice]
```code example of correct approach```

## Checklist

- [ ] [Verification step 1]
- [ ] [Verification step 2]

## When to Use This Skill

- [Trigger condition 1]
- [Trigger condition 2]

## Success Criteria

1. ✅ [Expected outcome 1]
2. ✅ [Expected outcome 2]
```

## 4. Development Environment Verification Script

Create `.scripts/verify-setup.sh`:

```bash
#!/bin/bash
# Verify development environment is correctly configured

echo "🔍 Verifying Development Environment..."

# Check user
CURRENT_USER=$(whoami)
EXPECTED_USER="your-username"
if [ "$CURRENT_USER" != "$EXPECTED_USER" ]; then
    echo "❌ Wrong user: $CURRENT_USER (expected: $EXPECTED_USER)"
    exit 1
fi

# Check directory
CURRENT_DIR=$(pwd)
EXPECTED_DIR="/path/to/project"
if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
    echo "❌ Wrong directory: $CURRENT_DIR (expected: $EXPECTED_DIR)"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version)
echo "✅ Node version: $NODE_VERSION"

# Check required tools
command -v npm >/dev/null 2>&1 || { echo "❌ npm not installed"; exit 1; }
echo "✅ npm installed"

# Check environment file
if [ ! -f ".env" ]; then
    echo "❌ .env file missing"
    exit 1
fi
echo "✅ .env file exists"

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found - run: npm install"
else
    echo "✅ node_modules exists"
fi

echo ""
echo "✅ Environment verification complete!"
```

## 5. Initial Setup Checklist for Claude

When starting a new project, ask Claude to:

```
1. Read the tech stack and understand the architecture
2. Review existing CLAUDE.md (if any) or create from template
3. Identify top 3 repetitive tasks → create skills for them
4. Identify top 3 breaking changes that could happen → create safeguards
5. Create verification script for environment setup
6. Document common mistakes specific to this project
7. Set up git hooks if needed (pre-commit, pre-push)
```

## 6. Project-Specific Pain Points Document

Create `documentation/LESSONS_LEARNED.md`:

```markdown
# Lessons Learned - [Project Name]

## Breaking Changes We've Encountered

### [Date]: [Brief Description]

**What Happened:**
[Detailed explanation]

**Root Cause:**
[Why it happened]

**Fix:**
[How it was resolved]

**Prevention:**
[What we created/changed to prevent recurrence]
- Skill: [skill name if applicable]
- CLAUDE.md section: [section added]
- Checklist: [checklist created]

---

## Common Gotchas

### 1. [Gotcha Name]
**Symptom:** [What you'll see]
**Cause:** [Why it happens]
**Solution:** [How to fix]

---

## Project-Specific Conventions

### Naming Conventions
- [Convention 1]
- [Convention 2]

### File Organization
- [Organization rule 1]
- [Organization rule 2]

### Code Patterns
- [Pattern 1]
- [Pattern 2]
```

## 7. Prompt for Claude: "Learn This Project"

Use this prompt when onboarding Claude to a new project:

```markdown
I need you to learn about this project so you can assist effectively.

Please:

1. **Read and understand:**
   - CLAUDE.md (project instructions)
   - package.json / requirements.txt (dependencies)
   - README.md (overview)
   - Any existing skills in .claude/skills/

2. **Explore the codebase:**
   - Key directories and their purposes
   - Common patterns and conventions
   - Technology stack and versions

3. **Identify and document:**
   - Top 3 most frequent tasks (suggest skills for these)
   - Top 3 risky operations (suggest safeguards)
   - Any missing documentation

4. **Verify:**
   - Development environment is correct
   - Required tools are installed
   - Configuration files exist

5. **Create:**
   - Any missing critical skills
   - Verification checklist for common operations
   - Quick reference guide for this specific project

After you've done this, summarize:
- What you learned about the project
- What skills you recommend creating
- What documentation is missing
- Any potential issues you spotted
```

## 8. Regular Maintenance Prompts

### Monthly Review Prompt
```
Review the project and identify:
1. Skills that were created but never used (consider removing)
2. Repeated mistakes despite existing skills (improve those skills)
3. New patterns that have emerged (create new skills)
4. Documentation that's out of date (update CLAUDE.md)
```

### After Major Issue Prompt
```
We just encountered [issue]. Please:
1. Document this in LESSONS_LEARNED.md
2. Create/update relevant skill to prevent recurrence
3. Update CLAUDE.md with new warning/checklist
4. Suggest any verification scripts needed
```

## 9. Example: Complete Setup Flow

```bash
# 1. Clone/create project
cd /path/to/project

# 2. Initial Claude prompt
"I'm setting up this [tech stack] project. Please help me create:
- Comprehensive CLAUDE.md
- Essential skills for [database] management and [common task]
- Environment verification script"

# 3. Let Claude create files
[Claude creates CLAUDE.md, skills, scripts]

# 4. Verify setup
./scripts/verify-setup.sh

# 5. Test a skill
"Use the [skill-name] skill to [do something]"

# 6. Iterate
"That skill worked but we should also check [X]. Please update it."

# 7. Document lesson
"Add this to LESSONS_LEARNED.md for future reference"
```

## 10. Red Flags to Watch For

When working with Claude on any project:

**🚩 Claude is making assumptions without verification**
→ Check: Does CLAUDE.md have "always verify" instructions?
→ Fix: Add verification steps to relevant skill

**🚩 Same mistake happening repeatedly**
→ Check: Is there a skill for this operation?
→ Fix: Create skill with mandatory workflow

**🚩 Claude recreating things from scratch**
→ Check: Does skill say "fetch current definition first"?
→ Fix: Add fetching step as Step 1 (mandatory)

**🚩 Breaking changes going unnoticed**
→ Check: Are there before/after verification queries?
→ Fix: Add verification step to skill

**🚩 Documentation is vague or outdated**
→ Check: When was CLAUDE.md last updated?
→ Fix: Update with specific examples and dates

---

## Summary

**Minimum Viable Setup:**
1. CLAUDE.md with critical warnings
2. 1-3 skills for most dangerous operations
3. Environment verification script

**Complete Setup:**
- All sections from template
- Skills for all common tasks
- Lessons learned document
- Regular review schedule
- Git hooks for common checks

**Success Metrics:**
- ✅ No repeated mistakes
- ✅ Claude knows project conventions
- ✅ Safe operations have safeguards
- ✅ New team members can onboard quickly
