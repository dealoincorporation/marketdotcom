# Google Sign-In Setup Guide

This guide shows how to enable:
- **Login with Google** on `/auth/login`
- **Register with Google** on `/auth/register`

The implementation in this project uses:
- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`

---

## 1) Create Google OAuth credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or use an existing one).
3. Go to **APIs & Services** -> **OAuth consent screen**.
4. Configure the consent screen:
   - App name
   - Support email
   - Authorized domains (for production)
   - Developer contact email
5. Add scopes:
   - `openid`
   - `email`
   - `profile`
6. If your app is still in testing mode, add your test users.
7. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
8. Choose **Web application**.
9. Add **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://YOUR_DOMAIN/api/auth/google/callback`
10. Save and copy:
   - **Client ID**
   - **Client Secret**

---

## 2) Add environment variables

Update your `.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:
- `GOOGLE_REDIRECT_URI` must be `https://YOUR_DOMAIN/api/auth/google/callback`
- `NEXT_PUBLIC_APP_URL` should be `https://YOUR_DOMAIN`

Then restart your dev server.

---

## 3) How UI buttons are linked

Google buttons are rendered by:
- `src/components/auth/GoogleAuthButton.tsx`

Used in:
- `src/app/auth/login/page.tsx` (mode = `login`)
- `src/app/auth/register/page.tsx` (mode = `register`)

Button click flow:
1. Button navigates to `/api/auth/google/start?...`
2. User is redirected to Google consent screen
3. Google returns to `/api/auth/google/callback`
4. Backend verifies token, signs in/creates user
5. Session is stored in localStorage and user is redirected to dashboard (or requested redirect path)

---

## 4) Registration behavior with Google

- If user does not exist:
  - Account is created
  - Email is treated as verified
  - Password remains empty (Google-only account unless password is later set)
- If user already exists:
  - Existing account is signed in
  - Missing profile fields may be updated from Google (name/image)
- On register page, referral code (if provided) is included in Google registration flow
- If profile data is missing (name/phone), user is redirected to `/auth/complete-profile` after Google sign-in
- Checkout is hard-gated for missing phone number and redirects users to complete profile

---

## 5) Quick test checklist

1. Open `/auth/register`
2. Click **Continue with Google**
3. Complete consent and verify redirect to dashboard
4. Logout
5. Open `/auth/login`
6. Click **Sign in with Google**
7. Confirm sign-in works for the same account

---

## 6) Troubleshooting

- **"Google auth is not configured correctly."**
  - Missing `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`
- **"Invalid Google auth session. Please try again."**
  - OAuth state cookie expired; retry login
- **Redirect mismatch error in Google**
  - `GOOGLE_REDIRECT_URI` must exactly match Google Console redirect URI
- **Works locally, fails in production**
  - Add your production domain redirect URI in Google Console
  - Set production env vars correctly on hosting platform
