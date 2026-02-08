# Wallet Funding Setup Verification Guide

This guide helps you verify that wallet funding is properly configured and working.

## Quick Verification Steps

### 1. Run the Setup Verification Script

```bash
npm run verify-wallet-setup
```

This will check:
- ✅ Environment variables are set correctly
- ✅ Database connection works
- ✅ Paystack API is accessible
- ✅ Recent transactions status
- ✅ Webhook configuration instructions

### 2. Verify Paystack Webhook is Configured

**Critical:** The webhook is what automatically credits wallets when Paystack confirms payment.

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings → API Keys & Webhooks**
3. Check if webhook URL is set to:
   ```
   https://YOUR_DOMAIN/api/payments/webhook
   ```
   (Replace `YOUR_DOMAIN` with your actual domain, e.g., `https://marketdotcom.ng`)

4. Ensure these events are selected:
   - ✅ `charge.success`
   - ✅ `charge.failed`

5. **Test the webhook:**
   - Click "Send Test Event" next to your webhook
   - Select `charge.success`
   - Check your server logs to confirm it was received

### 3. Check Environment Variables

**For Production**, ensure these are set correctly:

```bash
# Production domain (NOT localhost!)
NEXT_PUBLIC_APP_URL="https://marketdotcom.ng"
NEXTAUTH_URL="https://marketdotcom.ng"

# Paystack keys (use LIVE keys in production)
PAYSTACK_SECRET_KEY="sk_live_..."  # Not sk_test_...
PAYSTACK_PUBLIC_KEY="pk_live_..."  # Not pk_test_...

# Database
DATABASE_URL="mongodb+srv://..."
```

**⚠️ Important:** 
- Never use `localhost` URLs in production
- Use **LIVE** Paystack keys in production (not test keys)

### 4. Reconcile Existing Transactions

If you have transactions that were debited but not credited:

```bash
npm run verify-wallet
```

This script will:
- Find all PENDING and FAILED wallet transactions
- Verify each with Paystack API
- Credit wallets for successful payments
- Update transaction statuses

### 5. Test the Full Flow

1. **Initiate a test deposit:**
   - Go to Dashboard → Wallet tab
   - Click "Add Money"
   - Enter amount (minimum ₦100)
   - Select payment method
   - Complete payment on Paystack

2. **For card payments:** Should redirect back immediately and credit wallet

3. **For bank transfers:** 
   - May show "pending confirmation" message
   - Wallet will be credited automatically when Paystack confirms (via webhook)
   - Can take a few minutes to hours depending on bank

4. **Check transaction status:**
   - Go to Wallet tab → Recent Transactions
   - Should show transaction with status

### 6. Monitor Webhook Delivery

In Paystack Dashboard → Webhooks:
- Check "Delivery Logs" to see if webhooks are being delivered successfully
- Failed deliveries will show retry attempts
- If webhooks consistently fail, check:
  - Webhook URL is correct and accessible
  - Server is running and can receive POST requests
  - `PAYSTACK_SECRET_KEY` matches the one in Paystack dashboard

## Troubleshooting

### Issue: User was debited but wallet not credited

**Solution:**
1. Get the Paystack reference from the transaction
2. Run: `npm run verify-wallet` (will find and process it)
3. Or manually verify: Visit `/dashboard?tab=wallet&reference=<reference>`

### Issue: Webhook not receiving events

**Check:**
1. Webhook URL is correct and accessible (test with curl/Postman)
2. Webhook is enabled in Paystack dashboard
3. Server logs show webhook attempts (even failed ones)
4. `PAYSTACK_SECRET_KEY` matches dashboard

**Test webhook manually:**
```bash
curl -X POST https://YOUR_DOMAIN/api/payments/webhook \
  -H "x-paystack-signature: test" \
  -H "Content-Type: application/json" \
  -d '{"event":"charge.success","data":{"reference":"test_ref","amount":10000,"status":"success"}}'
```

### Issue: Users stuck on Paystack success page

**Cause:** Callback URL is set to localhost in production

**Solution:**
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Redeploy application
- The fix in `src/app/api/wallet/fund/route.ts` now prevents this

### Issue: Bank transfers stay pending forever

**This is normal** - Bank transfers can take time. The system now:
- ✅ Keeps transactions as PENDING (not FAILED) while Paystack processes
- ✅ Automatically credits when webhook receives `charge.success`
- ✅ Shows "pending confirmation" message to users

## Verification Checklist

Before going live, ensure:

- [ ] `NEXT_PUBLIC_APP_URL` points to production domain (not localhost)
- [ ] `PAYSTACK_SECRET_KEY` is LIVE key (not test key)
- [ ] Webhook is configured in Paystack dashboard
- [ ] Webhook URL is accessible (test with curl)
- [ ] Test deposit works end-to-end
- [ ] Webhook logs show successful deliveries
- [ ] `npm run verify-wallet-setup` passes all checks

## Support

If issues persist:
1. Check server logs for errors
2. Check Paystack dashboard webhook logs
3. Run `npm run verify-wallet` to reconcile transactions
4. Verify environment variables match production setup
