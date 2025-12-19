# Deploy to GitHub Pages with Firebase

This guide will help you deploy your donation website to GitHub Pages while keeping Firebase connected.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right
3. Click **"New repository"**
4. Enter repository name: `donation-website` (or your preferred name)
5. Choose **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

## Step 2: Prepare Your Files

1. Make sure all your files are in the `dist/` folder:
   ```
   dist/
   ├── index.html
   ├── admin.html
   ├── admin-login.html
   ├── add-items.html
   ├── styles.css
   ├── app.js
   ├── admin.js
   ├── admin-login.js
   ├── utils.js
   ├── firebase-config.js
   ├── bulk-add-items.js
   └── (other files)
   ```

2. **Important**: Your `firebase-config.js` is already configured and will work on GitHub Pages!

## Step 3: Initialize Git and Push

**IMPORTANT: Only upload the `dist/` folder!** The old Next.js folders (`app/`, `lib/`, `components/`, etc.) are not needed.

Open terminal/command prompt in your project folder:

```bash
# Navigate to your project folder
cd C:\Users\Shrusti\Desktop\Web

# Initialize git (if not already done)
git init

# Add ONLY the dist folder (not app/, lib/, components/, etc.)
git add dist/

# Add .gitignore to ignore old files
git add .gitignore

# Commit
git commit -m "Initial commit - Donation website with Firebase"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/donation-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Only the `dist/` folder will be uploaded. Old Next.js folders (`app/`, `lib/`, `components/`, `scripts/`, `public/`) are ignored and not needed for the static website.

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** section
4. Under **"Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/dist`
5. Click **"Save"**
6. Wait 1-2 minutes for GitHub to build your site
7. Your site will be available at:
   ```
   https://YOUR_USERNAME.github.io/donation-website/
   ```

## Step 5: Verify Firebase Connection

1. Visit your GitHub Pages URL
2. Open browser console (F12)
3. Check for Firebase errors
4. Test the donation flow:
   - View items
   - Submit a test donation
   - Check Firebase Console to see if data appears

## Step 6: Test Admin Login

1. Go to: `https://YOUR_USERNAME.github.io/donation-website/admin-login.html`
2. Login with your Firebase Auth credentials
3. Verify admin dashboard works
4. Test all features:
   - Add items
   - View donations
   - Verify donations
   - Check settings, activity log, analytics, notifications

## Firebase Configuration on GitHub Pages

✅ **Your Firebase config is already set up!**

- `firebase-config.js` contains your Firebase credentials
- These credentials are **public** (visible in browser) - this is **normal** and **safe**
- Firebase security is handled by **Database Rules**, not by hiding credentials
- Your database rules protect admin-only data

## Important Notes

### 1. Firebase Config is Public
- Your Firebase API keys are visible in the browser
- This is **normal** for client-side Firebase apps
- Security comes from **Database Rules**, not hidden keys

### 2. Database Rules
Make sure your Firebase Database Rules are set correctly:
- Public can read items (for donation page)
- Only authenticated admins can write items
- Only authenticated admins can read donations
- Public can create donations (for donation form)

### 3. CORS and Domains
- Firebase works with any domain
- No CORS configuration needed
- GitHub Pages domain is automatically allowed

### 4. HTTPS
- GitHub Pages provides HTTPS automatically
- Firebase requires HTTPS for production (GitHub Pages has this!)

## Updating Your Site

To update your site after making changes:

```bash
# Navigate to your project folder
cd C:\Users\Shrusti\Desktop\Web

# Add updated files
git add dist/app.js dist/admin.js
# Or add all files: git add dist/

# Commit changes
git commit -m "Update: description of changes"

# Push to GitHub
git push
```

**✅ GitHub Pages will automatically update within 1-2 minutes!**

Your live website will reflect the changes automatically - no manual deployment needed!

## Custom Domain (Optional)

If you want a custom domain:

1. In your repository Settings > Pages
2. Enter your custom domain
3. Follow GitHub's instructions for DNS setup

## Troubleshooting

### Site not loading
- Check repository Settings > Pages
- Verify `/dist` folder is selected
- Wait 2-3 minutes for build to complete

### Firebase errors
- Check browser console for specific errors
- Verify Firebase config is correct
- Check Firebase Database Rules
- Make sure Firebase Authentication is enabled

### Admin login not working
- Verify Firebase Auth is set up (see `FIREBASE_AUTH_SETUP.md`)
- Check that admin user exists in Firebase Console
- Verify database rules allow authenticated access

### Donations not saving
- Check Firebase Database Rules
- Verify donations path has write access
- Check browser console for errors

## File Structure on GitHub

Your repository should look like:

```
donation-website/
├── dist/
│   ├── index.html
│   ├── admin.html
│   ├── admin-login.html
│   ├── styles.css
│   ├── app.js
│   ├── admin.js
│   ├── firebase-config.js
│   └── (other files)
├── README.md
└── .gitignore
```

## Security Checklist

- ✅ Firebase Authentication enabled
- ✅ Database Rules configured
- ✅ Admin-only paths protected
- ✅ Public donation form works
- ✅ HTTPS enabled (GitHub Pages)

---

**Your website is now live on GitHub Pages with Firebase!** 🚀

Visit: `https://YOUR_USERNAME.github.io/donation-website/`

