// Admin Login JavaScript with Firebase Authentication

document.addEventListener('DOMContentLoaded', () => {
    // Clear any stale session data first
    const wasLoggedOut = sessionStorage.getItem('loggedOut');
    if (wasLoggedOut === 'true') {
        // User explicitly logged out, don't auto-login
        sessionStorage.removeItem('loggedOut');
        auth.signOut().catch(() => {}); // Sign out silently if needed
        return;
    }
    
    // Check if already logged in (only if not explicitly logged out)
    auth.onAuthStateChanged((user) => {
        if (user && !sessionStorage.getItem('loggedOut')) {
            // Check if sessionStorage has admin data (additional check)
            const adminEmail = sessionStorage.getItem('adminEmail');
            if (adminEmail) {
                window.location.href = 'admin.html';
                return;
            }
        }
    });

    // Setup login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');

    errorEl.classList.add('hidden');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '⏳ Logging in...';

    try {
        // Sign in with Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Clear loggedOut flag
        sessionStorage.removeItem('loggedOut');

        // Log activity
        await logActivity('admin_login', `Admin logged in: ${email}`);

        // Store user info
        sessionStorage.setItem('adminEmail', user.email);
        sessionStorage.setItem('adminUid', user.uid);

        // Redirect to admin dashboard
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMsg = 'Login failed. Please try again.';
        
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/user-not-found') {
            // First time setup - create default admin account
            if (email === 'admin@project.com' && password === 'admin123') {
                try {
                    await createDefaultAdmin();
                    // Try login again
                    const userCredential = await auth.signInWithEmailAndPassword(email, password);
                    
                    // Clear loggedOut flag
                    sessionStorage.removeItem('loggedOut');
                    
                    await logActivity('admin_login', `Admin logged in (first time): ${email}`);
                    sessionStorage.setItem('adminEmail', userCredential.user.email);
                    sessionStorage.setItem('adminUid', userCredential.user.uid);
                    window.location.href = 'admin.html';
                    return;
                } catch (createError) {
                    errorMsg = 'Failed to create admin account. Please check Firebase Console.';
                }
            } else {
                errorMsg = 'Invalid email or password. Default: admin@project.com / admin123';
            }
        } else if (error.code === 'auth/wrong-password') {
            errorMsg = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMsg = 'Too many failed attempts. Please try again later.';
        } else {
            errorMsg = error.message || 'Login failed. Please try again.';
        }

        errorMessage.textContent = errorMsg;
        errorEl.classList.remove('hidden');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '🔓 Login to Dashboard';
    }
}

async function createDefaultAdmin() {
    // Create admin user in Firebase Authentication
    // Note: This requires Firebase Admin SDK on server-side or manual creation in Firebase Console
    // For now, we'll create the user account manually or use a workaround
    
    // Check if admin exists in database
    const adminRef = database.ref('admin');
    const snapshot = await adminRef.once('value');
    
    if (!snapshot.exists()) {
        // Store admin info in database
        await adminRef.set({
            email: 'admin@project.com',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            note: 'Create this user in Firebase Console > Authentication > Users'
        });
    }
    
    // User must be created in Firebase Console first
    // Instructions will be shown in error message
    throw new Error('Please create admin user in Firebase Console first. See FIREBASE_AUTH_SETUP.md');
}

async function logActivity(type, details) {
    try {
        const activityRef = database.ref('activity').push();
        await activityRef.set({
            type: type,
            details: details,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: auth.currentUser ? auth.currentUser.email : 'system'
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}
