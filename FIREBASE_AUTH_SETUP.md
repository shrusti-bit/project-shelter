# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for secure admin login.

## Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **donation-website-55b15**
3. Click **"Authentication"** in the left sidebar
4. Click **"Get Started"** (if you haven't enabled it yet)
5. Click on the **"Sign-in method"** tab
6. Click on **"Email/Password"**
7. Enable **"Email/Password"** (toggle ON)
8. Click **"Save"**

## Step 2: Create Admin User

1. In Firebase Console, go to **Authentication** > **Users**
2. Click **"Add user"**
3. Enter:
   - **Email**: `admin@project.com` (or your preferred admin email)
   - **Password**: `admin123` (or your preferred password)
4. Click **"Add user"**

## Step 3: Update Firebase Database Rules

1. In Firebase Console, go to **Realtime Database** > **Rules**
2. Replace the rules with:

```json
{
  "rules": {
    "items": {
      ".read": true,
      ".write": true
    },
    "donations": {
      ".read": "auth != null",
      ".write": true
    },
    "admin": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "settings": {
      ".read": true,
      ".write": "auth != null"
    },
    "activity": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "analytics": {
      ".read": true,
      ".write": true
    },
    "notifications": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

3. Click **"Publish"**

## Step 4: Test Login

1. Open `admin-login.html` in your browser
2. Enter:
   - **Email**: `admin@project.com`
   - **Password**: `admin123`
3. Click **"Login to Dashboard"**
4. You should be redirected to the admin dashboard

## Step 5: Change Admin Password (Optional)

1. In Firebase Console, go to **Authentication** > **Users**
2. Find your admin user
3. Click the **three dots** (⋮) next to the user
4. Click **"Reset password"** or **"Change password"**
5. Follow the prompts

## Security Notes

- ✅ **Firebase Auth** is more secure than base64 encoding
- ✅ Passwords are hashed and stored securely by Firebase
- ✅ Session management is handled by Firebase
- ✅ Rate limiting is built-in to prevent brute force attacks
- ⚠️ **Database Rules** protect admin-only data
- ⚠️ **Public data** (items) is readable by everyone (for the donation page)

## Troubleshooting

### "User not found" error
- Make sure you've created the admin user in Firebase Console
- Check that Email/Password authentication is enabled

### "Invalid email" error
- Make sure you're using a valid email format
- Check that the email matches the one in Firebase Console

### "Too many requests" error
- Wait a few minutes before trying again
- Firebase has rate limiting to prevent abuse

### Can't access admin dashboard
- Make sure you're logged in with Firebase Auth
- Check browser console for errors
- Verify database rules allow authenticated users

## Multiple Admin Users

To add more admin users:

1. Go to Firebase Console > Authentication > Users
2. Click **"Add user"**
3. Enter email and password
4. All users with Firebase Auth accounts can access the admin dashboard

## Password Reset

If you forget your password:

1. Go to Firebase Console > Authentication > Users
2. Find your user
3. Click **"Reset password"**
4. Or implement a password reset flow in your app (advanced)

---

**Your admin login is now secure with Firebase Authentication!** 🔒

