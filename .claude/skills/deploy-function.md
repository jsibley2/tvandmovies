# Edge Function Deploy & Test

Deploy Supabase Edge Functions and run automatic health checks to verify successful deployment.

## Purpose

Streamlines the Edge Function deployment workflow by:
- Deploying functions with a single command
- Running automatic health checks post-deployment
- Showing recent logs for debugging
- Verifying CORS configuration
- Testing with sample payloads when available
- Reducing manual testing overhead

## What This Skill Does

1. Deploys the specified Edge Function to Supabase
2. Waits for deployment to complete
3. Runs automatic health/connectivity checks
4. Displays recent function logs (last 20 entries)
5. Tests CORS headers if applicable
6. Optionally tests with sample payload
7. Reports deployment success/failure with details

## When to Use

**Run this after:**
- Making changes to Edge Function code
- Updating function dependencies
- Modifying function configuration
- Adding new environment variables
- Changing CORS settings

**Run this before:**
- Testing function integration in frontend
- Updating production code that depends on the function
- Pushing changes to git (verify deployment works)

## Project Edge Functions

Your project has 20+ Edge Functions:

**Common Functions:**
- `admin-create-user` - Create new user accounts
- `application-approved-webhook` - Handle application approvals
- `complete-first-time-setup` - First-time user setup
- `create-application` - Create new applications
- `get-user-details` - Fetch user information
- `reassign-application-group` - Move applications between groups
- `stripe-webhook` - Handle Stripe payment events
- `table-update-webhook` - Generic table update handler

**Test/Debug Functions:**
- `diagnose-env` - Environment variable diagnostics
- `insert-tempo-test-service-role` - Service role testing
- `query-jsibley-roles` - Role verification

## Usage Patterns

### Deploy Single Function
```bash
supabase functions deploy function-name
```

### Deploy All Functions
```bash
supabase functions deploy
```

### Deploy with No Verify JWT (webhooks)
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

## What You'll Get

The skill will show:

1. **Deployment Status**
   ```
   ✅ Function deployed: stripe-webhook
   📦 Size: 45.3 KB
   ⏱️  Duration: 8.2s
   🔗 URL: https://[project].supabase.co/functions/v1/stripe-webhook
   ```

2. **Health Check Results**
   ```
   🏥 Running health checks...
   ✅ Function is reachable
   ✅ Returns HTTP 200/400 (not 500)
   ✅ CORS headers present
   ⚠️  No OPTIONS handler (webhook mode)
   ```

3. **Recent Logs** (last 20 entries)
   ```
   📋 Recent logs:
   [2025-10-25 17:45:32] INFO: Webhook received
   [2025-10-25 17:45:33] INFO: Signature verified
   [2025-10-25 17:45:34] INFO: Payment processed
   ```

4. **Test Results** (if sample payload available)
   ```
   🧪 Testing with sample payload...
   ✅ Function returned 200 OK
   📤 Response: {"success": true, "data": {...}}
   ```

## Health Check Details

The skill performs these checks:

### 1. Connectivity Check
- Sends GET/POST request to function URL
- Expects 200-400 status (not 500 server error)
- Verifies function is deployed and responding

### 2. CORS Validation
Checks for required headers:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Headers`
- `Access-Control-Allow-Methods`

**Expected CORS headers:**
```typescript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}
```

### 3. Error Detection
Common deployment issues detected:
- ❌ Function not found (404) - Not deployed
- ❌ Internal error (500) - Function crashed
- ❌ Timeout - Function taking too long
- ❌ CORS error - Missing/incorrect headers
- ⚠️  Auth error (401/403) - Expected for protected endpoints

## Sample Payloads

For functions with known test payloads, the skill can automatically test:

### stripe-webhook
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_test_123",
      "amount": 10000,
      "currency": "usd"
    }
  }
}
```

### complete-first-time-setup
```json
{
  "userId": "test-user-id",
  "firstName": "Test",
  "lastName": "User"
}
```

## Common Deployment Issues

### Issue: "Function not found" (404)
**Cause:** Deployment failed or function name mismatch
**Solution:**
```bash
# Check function exists
ls supabase/functions/
# Verify function name matches directory
supabase functions list
```

### Issue: CORS errors in browser
**Cause:** Missing or incorrect CORS headers
**Solution:** Ensure function includes:
```typescript
import { corsHeaders } from '../_shared/cors.ts';

return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

### Issue: "Service role key not found"
**Cause:** Missing environment variables in Supabase dashboard
**Solution:**
1. Go to Supabase Dashboard → Settings → Edge Functions
2. Add `SUPABASE_SERVICE_ROLE_KEY` environment variable
3. Redeploy function

### Issue: Function times out
**Cause:** Function takes >60 seconds or has infinite loop
**Solution:**
- Add timeout handling
- Optimize database queries
- Use background jobs for long-running tasks

### Issue: Deployment succeeds but function crashes
**Cause:** Runtime errors not caught during deployment
**Check:**
```bash
# View function logs
supabase functions logs function-name --tail

# Look for error messages
supabase functions logs function-name | grep -i error
```

## Logs Integration

The skill automatically fetches recent logs using:
```bash
supabase functions logs function-name --tail 20
```

**Log types to look for:**
- `INFO` - Normal operation
- `WARN` - Warnings, non-critical issues
- `ERROR` - Errors, function failures
- `DEBUG` - Detailed debugging info (if enabled)

## Environment Variables

Edge Functions have access to these env vars:

**Auto-provided by Supabase:**
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin service role key

**Custom (set in dashboard):**
- `STRIPE_SECRET_KEY` - Stripe API key
- `RESEND_API_KEY` - Email service key
- `MAKE_WEBHOOK_URL` - Make.com webhook URL

**Verify env vars:**
```bash
# Deploy diagnose-env function
supabase functions deploy diagnose-env

# Call it to see available env vars
supabase functions invoke diagnose-env
```

## Best Practices

### 1. Test Locally First
```bash
# Serve function locally
supabase functions serve function-name

# Test in another terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'
```

### 2. Use Shared Utilities
Leverage `supabase/functions/_shared/`:
- `cors.ts` - CORS headers
- `supabase-service-client.ts` - Service role client
- `supabase-admin.ts` - Admin operations
- `environment.ts` - Environment validation

### 3. Include Error Handling
```typescript
try {
  // Function logic
} catch (error) {
  console.error('Function error:', error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: corsHeaders }
  );
}
```

### 4. Always Return CORS Headers
Even on errors:
```typescript
if (error) {
  return new Response(
    JSON.stringify({ error: 'Bad request' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

## Integration with Workflow

**Recommended workflow:**
```bash
1. Make changes to edge function code
2. Test locally: supabase functions serve function-name
3. Verify locally with curl/Postman
4. Use this skill to deploy and test
5. Check health checks pass
6. Review logs for any issues
7. Test integration with frontend
8. Commit changes
```

## Related Files

- `supabase/functions/` - All edge function directories
- `supabase/functions/_shared/` - Shared utilities
- `supabase/config.toml` - Supabase configuration
- `SUPABASE_EDGE_FUNCTION_BEST_PRACTICES.md` - Edge function guidelines
- `SERVICE_ROLE_BEST_PRACTICES.md` - Service role patterns

## Command Reference

```bash
# Deploy single function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy

# Deploy without JWT verification (webhooks)
supabase functions deploy function-name --no-verify-jwt

# View logs
supabase functions logs function-name

# Tail logs (live)
supabase functions logs function-name --tail

# List all functions
supabase functions list

# Delete function
supabase functions delete function-name

# Serve locally
supabase functions serve function-name
```

## Monitoring After Deployment

### Check Function Status
```bash
# List deployed functions
supabase functions list

# Check specific function
curl -I https://[project].supabase.co/functions/v1/function-name
```

### Monitor Errors
```bash
# Live error monitoring
supabase functions logs function-name --tail | grep ERROR

# Count errors in last hour
supabase functions logs function-name --tail 1000 | grep ERROR | wc -l
```

### Performance Metrics
Available in Supabase Dashboard:
- Function invocations per hour
- Average execution time
- Error rate percentage
- Memory usage

## Testing Webhooks

For webhook functions (Stripe, Make.com):

### Stripe Webhook Testing
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

### Make.com Webhook Testing
```bash
# Use curl with sample payload
curl -X POST https://[project].supabase.co/functions/v1/table-update-webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "table": "applications_new",
    "record_id": "test-uuid",
    "operation": "INSERT"
  }'
```

## Rollback Strategy

If deployment causes issues:

### Option 1: Redeploy Previous Version
```bash
# Check git history
git log --oneline supabase/functions/function-name/

# Checkout previous version
git checkout <commit-hash> -- supabase/functions/function-name/

# Redeploy
supabase functions deploy function-name
```

### Option 2: Delete Function
```bash
# Delete problematic function
supabase functions delete function-name

# Redeploy from stable commit
git checkout stable-branch
supabase functions deploy function-name
```

---

**Created**: 2025-10-25
**Priority**: High (8/10)
**Frequency**: After edge function changes
**Dependencies**: Supabase CLI authentication, deployed Supabase project
