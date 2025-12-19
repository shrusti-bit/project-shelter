# GitHub Pages Deployment Guide

This guide will help you deploy your static donation website to GitHub Pages for free hosting.

## Prerequisites

- A GitHub account (free)
- Git installed on your computer
- Your website files in the `dist` folder

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Enter a repository name (e.g., `donation-website`)
5. Choose **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we'll add files manually)
7. Click **"Create repository"**

## Step 2: Initialize Git and Push Files

Open your terminal/command prompt in the project root directory and run:

```bash
# Initialize git repository
git init

# Add all files from dist folder
git add dist/

# Commit files
git commit -m "Initial commit: Static donation website"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Alternative**: If you want to push only the `dist` folder contents to the root of your repository:

```bash
# Copy dist contents to a temporary location
# Then initialize git in that location
cd dist
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/` (root) or `/dist` (if you pushed dist folder separately)
5. Click **"Save"**

## Step 4: Access Your Website

1. Wait 1-2 minutes for GitHub Pages to build
2. Your website will be available at:
   - `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
3. You can find the exact URL in the **"Pages"** settings section

## Step 5: Update Firebase Config for Production

**IMPORTANT**: Since your Firebase config is in the JavaScript file, it will be visible to anyone. This is okay for Realtime Database with public read/write rules, but make sure:

1. Your Firebase security rules are set correctly
2. You're comfortable with the database being publicly accessible
3. Consider implementing rate limiting or other security measures

## Step 6: Custom Domain (Optional)

If you want to use a custom domain:

1. In GitHub Pages settings, enter your custom domain
2. Add a `CNAME` file in your repository root with your domain name
3. Configure DNS records with your domain provider:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `YOUR_USERNAME.github.io`

## Updating Your Website

To update your website after making changes:

```bash
# Make your changes to files in dist/
cd dist  # or stay in root if dist is your repo root

# Add changed files
git add .

# Commit changes
git commit -m "Update: description of changes"

# Push to GitHub
git push
```

GitHub Pages will automatically rebuild your site (usually takes 1-2 minutes).

## File Structure for GitHub Pages

Your repository should have this structure:

```
your-repo/
├── index.html
├── admin.html
├── styles.css
├── app.js
├── admin.js
├── firebase-config.js
└── README.md (optional)
```

## Troubleshooting

### 404 Error
- Make sure `index.html` is in the root of your repository
- Check that GitHub Pages is enabled and pointing to the correct branch/folder
- Wait a few minutes for changes to propagate

### Firebase Not Working
- Check browser console for errors
- Verify `firebase-config.js` has correct values
- Make sure Firebase Realtime Database rules allow public access
- Check that your database URL is correct

### Styles Not Loading
- Make sure `styles.css` is in the same directory as `index.html`
- Check file paths in HTML (should be relative: `href="styles.css"`)

### Changes Not Appearing
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait 1-2 minutes for GitHub Pages to rebuild
- Check GitHub Actions tab for build errors

## Security Notes

1. **Firebase Config is Public**: Your Firebase configuration will be visible in the browser. This is normal for client-side apps, but make sure your database rules are appropriate.

2. **Database Rules**: Since this is a public donation site, your database rules allow public read/write. For production, consider:
   - Adding validation rules
   - Implementing rate limiting
   - Adding authentication for admin functions

3. **Sensitive Data**: Don't commit any API keys or secrets that shouldn't be public.

## Alternative: Deploy dist/ Folder Only

If you want to keep your source code private and only deploy the built files:

1. Create a separate branch for deployment:
```bash
git checkout -b gh-pages
git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

2. In GitHub Pages settings, select the `gh-pages` branch

## Next Steps

- Set up Firebase (see `FIREBASE_SETUP.md`)
- Test your website locally before deploying
- Share your GitHub Pages URL with donors!

