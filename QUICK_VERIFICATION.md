# Quick Verification Checklist

## ✅ How to Verify Everything is Working

### Step 1: Run Setup Check (Just Did This!)
```bash
npm run verify-wallet-setup
```
**Result:** ✅ All checks passed, but found 12 transactions needing reconciliation

### Step 2: Reconcile Existing Transactions
You have **3 PENDING** and **9 FAILED** transactions. Some of these might actually be paid but not credited:

```bash
npm run verify-wallet
```

This will:
- Check each transaction with Paystack
- Credit wallets for successful payments
- Update statuses correctly

### Step 3: Verify Webhook is Configured (CRITICAL!)

**For Development (localhost):**
1. Go to https://dashboard.paystack.com/
2. Settings → API Keys & Webhooks
3. Add webhook URL: `http://localhost:3000/api/payments/webhook`
4. Select events: `charge.success`, `charge.failed`
5. Test it: Click "Send Test Event" → Select `charge.success`

**For Production:**
1. Same steps but URL must be: `https://marketdotcom.ng/api/payments/webhook`
2. ⚠️ **MUST be HTTPS** (not http)
3. Use **LIVE** Paystack keys (not test keys)

### Step 4: Test a Real Deposit

1. Start your dev server: `npm run dev`
2. Go to Dashboard → Wallet → Add Money
3. Enter ₦100 (minimum)
4. Complete payment
5. Should redirect back and show success

**For bank transfers:** May show "pending" - that's OK! It will credit automatically when Paystack confirms.

### Step 5: Monitor Webhook Delivery

After a payment:
1. Check Paystack Dashboard → Webhooks → Delivery Logs
2. Should see successful delivery for `charge.success` event
3. Check your server logs - should see: `Paystack webhook received: charge.success`

## 🔍 How to Verify Specific Transaction

If a user says they were debited but wallet not credited:

1. **Get the Paystack reference** (from user or Paystack dashboard)

2. **Check transaction status:**
   ```bash
   # In your codebase, you can check the database
   # Or visit: /dashboard?tab=wallet&reference=<reference>
   ```

3. **Manually verify with Paystack:**
   ```bash
   npm run verify-wallet
   # This checks ALL pending/failed transactions
   ```

4. **Or verify specific reference** (if you add this endpoint):
   - Visit: `/dashboard?tab=wallet&reference=<reference>`
   - The page will automatically verify and credit if successful

## 🚨 Common Issues & Fixes

### Issue: Webhook not receiving events
- ✅ Check webhook URL is correct
- ✅ Check webhook is enabled in Paystack
- ✅ Check server logs for incoming requests
- ✅ Verify `PAYSTACK_SECRET_KEY` matches dashboard

### Issue: Users stuck on Paystack page
- ✅ Fixed! The code now prevents localhost URLs in production
- ✅ Ensure `NEXT_PUBLIC_APP_URL` is set to production domain

### Issue: Bank transfers stay pending
- ✅ This is normal - can take minutes to hours
- ✅ System now keeps as PENDING (not FAILED)
- ✅ Will auto-credit when webhook fires

## 📊 Current Status

Based on the verification:
- ✅ Environment variables: OK
- ✅ Database: Connected
- ✅ Paystack API: Working
- ⚠️ **12 transactions need reconciliation** (run `npm run verify-wallet`)
- ⚠️ **Webhook needs to be configured** in Paystack dashboard

## 🎯 Next Actions

1. **Right now:** Run `npm run verify-wallet` to reconcile those 12 transactions
2. **Before production:** Configure webhook in Paystack dashboard
3. **Before production:** Update `.env.local` with production URLs and LIVE keys
4. **Test:** Make a test deposit to verify end-to-end flow
