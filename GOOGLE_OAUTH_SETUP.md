# 🔐 Google OAuth Setup Guide for Supabase

This guide will help you enable Google sign-in for your addiction recovery app.

## 🎯 What You Need to Do

You need to complete **3 simple steps** in **2 different websites**:

### 📍 **STEP 1: Google Cloud Console Setup**

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select Project**
   - Click "Select a project" at the top
   - Either select existing project or click "NEW PROJECT"
   - Name it: `addiction-recovery-app`

3. **Enable Google+ API**
   - In the left sidebar: **APIs & Services** → **Library**
   - Search: `Google+ API`
   - Click on it and press **ENABLE**

4. **Create OAuth Credentials**
   - In the left sidebar: **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Name: `Addiction Recovery App`
   
   **IMPORTANT URLs to add:**
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:5173
     ```
   - **Authorized redirect URIs**: 
     ```
     https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
     ```
     (Replace YOUR-PROJECT-ID with your actual Supabase project ID)

5. **Copy Your Credentials**
   - After creating, you'll see:
     - **Client ID**: `something.apps.googleusercontent.com`
     - **Client Secret**: `random-string`
   - **COPY BOTH** - you'll need them in Step 2

---

### 📍 **STEP 2: Supabase Dashboard Setup**

1. **Open Your Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Left sidebar: **Authentication** → **Providers**

3. **Enable Google Provider**
   - Find **Google** in the list
   - Toggle **"Enable sign in with Google"** to **ON**

4. **Add Your Google Credentials**
   - **Client ID**: Paste from Step 1
   - **Client Secret**: Paste from Step 1
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: `http://localhost:5173/**`
   - Click **Save**

---

### 📍 **STEP 3: Test It Works**

1. **Start your app**: `npm run dev`
2. **Go to**: http://localhost:5173/test-supabase
3. **Click**: "Test Authentication" button
4. **Try**: Google sign-in on your login page

---

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized redirect_uri"
**Solution**: Make sure you added the exact redirect URI in Google Cloud Console:
```
https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
```

### Issue: "Provider not enabled"
**Solution**: Make sure you toggled Google provider to ON in Supabase dashboard

### Issue: "Invalid client"
**Solution**: Double-check your Client ID and Client Secret are copied correctly

---

## 📋 Quick Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 credentials
- [ ] Added correct redirect URIs
- [ ] Copied Client ID and Secret
- [ ] Enabled Google provider in Supabase
- [ ] Added credentials to Supabase
- [ ] Tested Google sign-in

---

## 🆘 Need Help?

If you get stuck on any step, let me know which step number you're on and what error you're seeing!
