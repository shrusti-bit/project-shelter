# Firebase Setup Guide

This guide will help you set up Firebase Realtime Database for your donation website.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "donation-website")
4. Click **Continue**
5. (Optional) Enable Google Analytics if you want
6. Click **Create project**
7. Wait for project creation, then click **Continue**

## Step 2: Create Realtime Database

1. In your Firebase project, click **"Realtime Database"** in the left sidebar
2. Click **"Create Database"**
3. Choose a location (select closest to your users)
4. Click **Next**
5. **IMPORTANT**: Choose **"Start in test mode"** (we'll configure security rules later)
6. Click **Enable**

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` to add a web app
5. Register your app with a nickname (e.g., "Donation Website")
6. Click **Register app**
7. You'll see your Firebase configuration object. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Update firebase-config.js

1. Open `dist/firebase-config.js` in your code editor
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Save the file

## Step 5: Configure Database Security Rules

1. In Firebase Console, go to **Realtime Database**
2. Click on the **"Rules"** tab
3. Replace the rules with the following (for public read, authenticated write):

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

**⚠️ WARNING**: These rules allow anyone to read and write. For production, you should implement proper authentication. For now, this is fine for a simple donation website.

4. Click **"Publish"**

## Step 6: Test Your Setup

1. Open `dist/index.html` in your browser (or use a local server)
2. Open browser console (F12)
3. You should see no Firebase errors
4. Try adding an item from the admin page
5. Check Firebase Console > Realtime Database to see if data appears

## Database Structure

Your Firebase Realtime Database will have this structure:

```
{
  "items": {
    "itemId1": {
      "name": "Kitchen Cabinet",
      "description": "Wooden kitchen cabinet",
      "total": 50000,
      "donated": 0,
      "status": "available",
      "donors": {},
      "createdAt": 1234567890
    },
    "itemId2": { ... }
  },
  "donations": {
    "donationId1": {
      "itemId": "itemId1",
      "donorName": "John Doe",
      "donorEmail": "john@example.com",
      "amount": 5000,
      "isAnonymous": false,
      "transactionRef": "UPI123456",
      "status": "pending",
      "createdAt": 1234567890
    },
    "donationId2": { ... }
  }
}
```

## Troubleshooting

### Error: "Firebase not configured"
- Make sure you've updated `firebase-config.js` with your actual Firebase config
- Check that all values are correct (no extra spaces, quotes are correct)

### Error: "Permission denied"
- Check your Realtime Database Rules in Firebase Console
- Make sure rules allow read/write access

### Data not appearing
- Check browser console for errors
- Verify Firebase config is correct
- Check Firebase Console > Realtime Database to see if data is being written

### Database URL format
- Your database URL should be: `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com`
- Replace `YOUR_PROJECT_ID` with your actual project ID from Firebase Console

## Next Steps

Once Firebase is set up:
1. Test adding items from admin page
2. Test making donations from main page
3. Verify data appears in Firebase Console
4. Deploy to GitHub Pages (see `GITHUB_PAGES_DEPLOY.md`)

