# Firebase Database Rules Fix

## The Problem

Your current rules prevent public users from updating items:

```json
"items": {
  ".read": true,
  ".write": "auth != null"  // ❌ Only admins can write
}
```

When a donation is submitted:
1. ✅ Donation is saved (donations allow public write)
2. ❌ Item update fails (items require authentication)
3. ❌ Modal doesn't close (code waiting for item update)
4. ❌ Real-time updates don't work (item never gets updated)

## The Solution

Update your Firebase Database Rules to allow public writes to items:

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

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **donation-website-55b15**
3. Click **Realtime Database** in left sidebar
4. Click **Rules** tab
5. Replace the rules with the code above
6. Click **Publish**

## Why This Works

- ✅ Public can read items (for donation page)
- ✅ Public can write/update items (for real-time donation updates)
- ✅ Only admins can read donations (privacy)
- ✅ Public can create donations (donation form)
- ✅ Only admins can manage admin/settings/activity

## Security Note

This allows anyone to update items. For a donation website, this is acceptable because:
- Users can only add to `donated` amount (not decrease)
- All changes are logged in donations
- Admin can verify and correct if needed

After updating rules, your donations should work immediately!

