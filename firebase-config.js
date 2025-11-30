// Firebase Configuration
// Your Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyAWU7yw-FnBdD-yuS74PqSfYs70QTWGYrg",
    authDomain: "donation-website-55b15.firebaseapp.com",
    databaseURL: "https://donation-website-55b15-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "donation-website-55b15",
    storageBucket: "donation-website-55b15.firebasestorage.app",
    messagingSenderId: "823558688296",
    appId: "1:823558688296:web:9f95c1abb0f5a4a76baf1d",
    measurementId: "G-Y09C512TLP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get reference to Realtime Database
const database = firebase.database();

// Get reference to Firebase Authentication
const auth = firebase.auth();

// Google Drive Upload Configuration
// Replace this with your Google Apps Script Web App URL after setup
// Make it globally accessible
var GOOGLE_DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbzsrKwGGjO4gwZCkd0UZdqbB9vB-_Ntlq0yii-wjhzDy2-Zz_vVZIF-aeObGxvI3C7Z/exec'; // Set this in firebase-config.js after creating the Apps Script

// Also set on window object for compatibility
if (typeof window !== 'undefined') {
    window.GOOGLE_DRIVE_UPLOAD_URL = GOOGLE_DRIVE_UPLOAD_URL;
}

