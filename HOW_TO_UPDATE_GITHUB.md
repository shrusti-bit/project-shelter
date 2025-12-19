# How to Update Files on GitHub

## Quick Steps to Upload Updated Files

### Step 1: Open Terminal/Command Prompt

Press `Win + R`, type `cmd` or `powershell`, and press Enter.

### Step 2: Navigate to Your Project Folder

```bash
cd C:\Users\Shrusti\Desktop\Web
```

### Step 3: Check Git Status

```bash
git status
```

This shows which files have been modified.

### Step 4: Add Updated Files

Add the specific files you updated:

```bash
git add dist/app.js
git add dist/admin.js
```

Or add all changes in dist folder:

```bash
git add dist/
```

### Step 5: Commit Changes

```bash
git commit -m "Update: Real-time donation updates - amounts update immediately"
```

### Step 6: Push to GitHub

```bash
git push
```

If it's your first time, you might need:

```bash
git push -u origin main
```

## ✅ Automatic Update on GitHub Pages

**YES!** Your GitHub Pages website will **automatically update** after you push!

### How It Works:

1. You push changes to GitHub
2. GitHub automatically rebuilds your site
3. Changes appear on your live website within **1-2 minutes**

### Your Website URL:
```
https://YOUR_USERNAME.github.io/donation-website/
```

## Complete Command Sequence

Copy and paste these commands one by one:

```bash
# Navigate to project
cd C:\Users\Shrusti\Desktop\Web

# Check what changed
git status

# Add updated files
git add dist/app.js dist/admin.js

# Or add all dist files
git add dist/

# Commit
git commit -m "Fix: Real-time donation amount updates"

# Push to GitHub
git push
```

## Verify Update

1. Wait 1-2 minutes after pushing
2. Visit your GitHub Pages URL
3. Hard refresh the page (Ctrl + F5 or Cmd + Shift + R)
4. Test the donation feature - amounts should update immediately!

## Troubleshooting

### If `git push` asks for credentials:
- Use a Personal Access Token instead of password
- Or use GitHub Desktop app (easier)

### If you get "nothing to commit":
- Files might already be committed
- Check `git status` to see what's changed

### If website doesn't update:
- Wait 2-3 minutes (GitHub needs time to rebuild)
- Hard refresh browser (Ctrl + F5)
- Check GitHub repository Settings > Pages to verify deployment

---

**That's it! Your website will update automatically! 🚀**

