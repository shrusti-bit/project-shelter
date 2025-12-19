# What to Upload to GitHub - Simple Guide

## ✅ Upload ONLY the `dist/` folder

Since we migrated from Next.js to static HTML/CSS/JS, you only need to upload the `dist/` folder to GitHub.

## What to Upload

### ✅ Upload These (from `dist/` folder):
```
dist/
├── index.html              ✅
├── admin.html              ✅
├── admin-login.html        ✅
├── add-items.html          ✅
├── styles.css              ✅
├── app.js                  ✅
├── admin.js                ✅
├── admin-login.js          ✅
├── utils.js                ✅
├── firebase-config.js      ✅
├── bulk-add-items.js       ✅
├── README.md               ✅
└── (all other .md files)   ✅
```

### ❌ DO NOT Upload These (old Next.js files):
```
app/                        ❌ Old Next.js app folder
lib/                        ❌ Old Next.js lib folder
components/                 ❌ Old Next.js components
scripts/                    ❌ Old Next.js scripts
public/                      ❌ Old Next.js public folder
node_modules/               ❌ Dependencies (not needed)
package.json                ❌ Not needed for static site
tsconfig.json               ❌ Not needed for static site
next.config.js              ❌ Not needed for static site
```

## Quick Upload Steps

### Option 1: Upload Only dist/ Folder (Recommended)

```bash
# Navigate to your project
cd C:\Users\Shrusti\Desktop\Web

# Initialize git (if not done)
git init

# Add ONLY the dist folder
git add dist/

# Commit
git commit -m "Initial commit - Static donation website"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/donation-website.git

# Push
git branch -M main
git push -u origin main
```

### Option 2: Create New Repository with Only dist/

1. Create a new folder: `donation-website-github`
2. Copy ONLY the `dist/` folder contents into it
3. Initialize git in that folder
4. Push to GitHub

## GitHub Pages Setup

1. Go to repository Settings > Pages
2. Source: **Branch: main, Folder: /dist**
3. Save

Your site will be at: `https://YOUR_USERNAME.github.io/donation-website/`

## Why Only dist/?

- ✅ **Static HTML/CSS/JS** - No build process needed
- ✅ **No Node.js** - No package.json or dependencies
- ✅ **No Next.js** - No app/, lib/, components/ folders
- ✅ **Firebase** - Works directly from browser (no server needed)
- ✅ **Smaller repository** - Only essential files

## File Size Comparison

- **With old folders**: ~50-100 MB (includes node_modules, old files)
- **With only dist/**: ~500 KB - 2 MB (just HTML, CSS, JS)

## What About Other Files?

### README.md (root)
- You can upload it if you want, but it's not needed for the website
- The `dist/README.md` is more relevant

### .gitignore
- Upload it to ignore unnecessary files
- Already configured to ignore old Next.js folders

### Documentation Files
- All setup guides are in `dist/` folder
- They'll be available on GitHub

## Verification

After uploading, check:
- ✅ Only `dist/` folder is in repository
- ✅ No `app/`, `lib/`, `components/` folders
- ✅ No `node_modules/` folder
- ✅ GitHub Pages works correctly

---

**Summary: Upload ONLY the `dist/` folder to GitHub!** 🚀

