# 🎅 Donation Website - Static Version

A beautiful, static donation website for collecting household item donations, powered by Firebase Realtime Database and hosted on GitHub Pages.

## ✨ Features

- 🎄 **Christmas-themed UI** with animated background and snowflakes
- 💝 **Real-time donation tracking** using Firebase Realtime Database
- 📱 **Fully responsive** design for mobile and desktop
- 🎁 **Item management** with progress bars and status indicators
- 👤 **Admin dashboard** for managing items and donations
- 🔄 **Auto-updating UI** when donations are made
- 💳 **UPI payment integration** with transaction reference tracking

## 🚀 Quick Start

### 1. Set Up Firebase

1. Follow the instructions in [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)
2. Get your Firebase configuration
3. Update `firebase-config.js` with your Firebase credentials

### 2. Test Locally

1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```
3. Visit `http://localhost:8000`

### 3. Deploy to GitHub Pages

Follow the instructions in [`GITHUB_PAGES_DEPLOY.md`](GITHUB_PAGES_DEPLOY.md)

## 📁 File Structure

```
dist/
├── index.html          # Main donation page
├── admin.html          # Admin dashboard
├── styles.css          # All CSS styles
├── app.js              # Main application logic
├── admin.js            # Admin dashboard logic
├── firebase-config.js  # Firebase configuration
├── FIREBASE_SETUP.md   # Firebase setup guide
├── GITHUB_PAGES_DEPLOY.md  # Deployment guide
└── README.md           # This file
```

## 🗄️ Database Structure

### Items Collection
```javascript
items: {
  "itemId": {
    name: "Kitchen Cabinet",
    description: "Wooden kitchen cabinet",
    total: 50000,
    donated: 0,
    status: "available", // or "funded"
    donors: {
      "donorKey": {
        name: "John Doe",
        amount: 5000,
        isAnonymous: false
      }
    },
    createdAt: 1234567890
  }
}
```

### Donations Collection
```javascript
donations: {
  "donationId": {
    itemId: "itemId",
    donorName: "John Doe",
    donorEmail: "john@example.com",
    amount: 5000,
    isAnonymous: false,
    transactionRef: "UPI123456",
    status: "pending", // or "verified"
    createdAt: 1234567890
  }
}
```

## 🎨 Customization

### Change Colors
Edit `styles.css` to customize the Christmas theme colors:
- Red: `#dc143c` (primary)
- Green: `#228b22` (progress bars)
- Blue: `#1e90ff` (available badges)

### Add UPI QR Code
1. Replace the placeholder in `index.html` (line ~211)
2. Add your UPI QR code image:
   ```html
   <img src="your-qr-code.png" alt="UPI QR Code" />
   ```

### Modify Content
Edit `index.html` to change:
- Page title
- Hero section text
- Project description

## 🔧 Configuration

### Firebase Configuration
Update `firebase-config.js` with your Firebase project credentials.

### Database Rules
In Firebase Console > Realtime Database > Rules:
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

## 📱 Usage

### For Donors
1. Visit the website
2. Browse available items
3. Click "Donate Now" on an item
4. Fill in donation form
5. Scan UPI QR code and make payment
6. Enter transaction reference
7. Submit donation

### For Admins
1. Visit `/admin.html`
2. Add new items with name, description, and total amount
3. View all donations
4. Verify pending donations

## 🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with animations
- **JavaScript (Vanilla)** - Application logic
- **Firebase Realtime Database** - Backend data storage
- **GitHub Pages** - Free hosting

## 📝 Notes

- This is a **static website** - no server required
- All data is stored in **Firebase Realtime Database** (free tier available)
- **No authentication** - admin page is public (consider adding auth for production)
- Firebase config is **public** (visible in browser) - this is normal for client-side apps

## 🐛 Troubleshooting

### Firebase Not Working
- Check `firebase-config.js` has correct values
- Verify database rules allow read/write
- Check browser console for errors

### Styles Not Loading
- Ensure `styles.css` is in the same directory
- Check file paths are correct

### Donations Not Saving
- Check Firebase database rules
- Verify Firebase config is correct
- Check browser console for errors

## 📄 License

This project is open source and available for use.

## 🙏 Support

For issues or questions:
1. Check the setup guides (`FIREBASE_SETUP.md`, `GITHUB_PAGES_DEPLOY.md`)
2. Review browser console for errors
3. Verify Firebase configuration

---

**Made with ❤️ for a good cause 🎅**

