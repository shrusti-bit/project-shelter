// Utility Functions for Firebase Operations

// Activity Logging
async function logActivity(type, details, userId = null) {
    try {
        const user = auth.currentUser;
        const activityRef = database.ref('activity').push();
        await activityRef.set({
            type: type,
            details: details,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: user ? user.email : (userId || 'system')
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Analytics Tracking
async function trackPageView() {
    try {
        const analyticsRef = database.ref('analytics');
        const snapshot = await analyticsRef.once('value');
        const current = snapshot.val() || { pageViews: 0 };
        
        await analyticsRef.update({
            pageViews: (current.pageViews || 0) + 1,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Error tracking page view:', error);
    }
}

async function trackDonation() {
    try {
        const analyticsRef = database.ref('analytics');
        const snapshot = await analyticsRef.once('value');
        const current = snapshot.val() || { totalDonations: 0, pageViews: 0 };
        
        const totalDonations = (current.totalDonations || 0) + 1;
        const pageViews = current.pageViews || 1;
        const conversionRate = ((totalDonations / pageViews) * 100).toFixed(2);
        
        await analyticsRef.update({
            totalDonations: totalDonations,
            conversionRate: conversionRate,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Error tracking donation:', error);
    }
}

// Settings Management
async function getSettings() {
    try {
        const settingsRef = database.ref('settings');
        const snapshot = await settingsRef.once('value');
        return snapshot.val() || {
            projectName: 'Project Shelter',
            upiQrCode: '',
            certificateText: 'Thank you for your generous donation!'
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return null;
    }
}

async function saveSettings(settings) {
    try {
        const settingsRef = database.ref('settings');
        await settingsRef.update({
            ...settings,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
        await logActivity('settings_updated', 'Settings updated');
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Notifications
async function createNotification(type, message, itemId = null) {
    try {
        const notificationRef = database.ref('notifications').push();
        await notificationRef.set({
            type: type,
            message: message,
            read: false,
            itemId: itemId,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

async function markNotificationRead(notificationId) {
    try {
        await database.ref(`notifications/${notificationId}`).update({
            read: true,
            readAt: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function getUnreadNotificationsCount() {
    try {
        const notificationsRef = database.ref('notifications');
        const snapshot = await notificationsRef.once('value');
        const notifications = snapshot.val() || {};
        
        return Object.values(notifications).filter(n => !n.read).length;
    } catch (error) {
        console.error('Error getting notifications count:', error);
        return 0;
    }
}

// Format currency
function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

