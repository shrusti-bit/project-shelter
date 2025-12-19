# Firebase Debugging Guide

If donations are not updating in real-time, follow these steps:

## Step 1: Check Browser Console

1. Open your website
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Submit a donation
5. Look for these messages:

### ✅ Success Messages (Should See):
- "🔄 Starting donation submission..."
- "✅ Firebase connection verified"
- "✅ Donation saved to Firebase"
- "✅ Item updated in Firebase successfully!"
- "🔄 Real-time update triggered!"
- "✅ UI updated with latest data"

### ❌ Error Messages (If You See These):

**"Firebase database not initialized"**
- Check `firebase-config.js` is loaded
- Check Firebase SDK scripts are loaded in HTML

**"Permission denied" or "permission-denied"**
- Go to Firebase Console > Realtime Database > Rules
- Make sure rules allow writes:
```json
{
  "rules": {
    "items": {
      ".read": true,
      ".write": true
    },
    "donations": {
      ".read": true,
      ".write": true
    }
  }
}
```

**"Network error" or connection timeout**
- Check internet connection
- Check Firebase database URL is correct
- Try refreshing the page

## Step 2: Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Realtime Database**
4. Check if:
   - Donations are being created under `/donations/`
   - Items are being updated under `/items/`
   - The `donated` amount is increasing

## Step 3: Verify Database Rules

1. In Firebase Console, go to **Realtime Database** > **Rules**
2. Rules should be:
```json
{
  "rules": {
    "items": {
      ".read": true,
      ".write": true
    },
    "donations": {
      ".read": true,
      ".write": true
    }
  }
}
```
3. Click **Publish** if you made changes

## Step 4: Test Firebase Connection

Open browser console and type:
```javascript
// Test if Firebase is loaded
console.log('Firebase:', typeof firebase !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Test if database is accessible
firebase.database().ref('test').set({test: true}).then(() => {
    console.log('✅ Database write works!');
    firebase.database().ref('test').remove();
}).catch(err => {
    console.error('❌ Database write failed:', err);
});
```

## Common Issues

### Issue 1: Modal Not Closing
- **Cause**: JavaScript error preventing code execution
- **Fix**: Check console for errors, fix them

### Issue 2: Real-time Updates Not Working
- **Cause**: Real-time listener not set up or database rules blocking
- **Fix**: 
  - Check console for "Real-time update triggered!" message
  - Verify database rules allow reads
  - Check if `itemsRef.on('value')` is called

### Issue 3: Amount Not Updating
- **Cause**: Firebase write failing silently
- **Fix**: 
  - Check console for error messages
  - Verify item exists in Firebase
  - Check database rules allow writes

## Quick Test

1. Open website
2. Open console (F12)
3. Submit a donation
4. Watch console messages
5. Check Firebase Console for data

If you see errors, share them and we can fix!

