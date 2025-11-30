// Admin Dashboard JavaScript with Firebase Auth and Enhanced Features

let itemsRef = null;
let donationsRef = null;
let currentDonationFilter = 'all';
let currentTab = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    // Check Firebase Auth
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'admin-login.html';
            return;
        }

        // User is logged in
        document.getElementById('admin-username').textContent = user.email || 'Admin';
        
        // Initialize dashboard
        initializeDashboard();
    });
});

function initializeDashboard() {
    // Setup event listeners
    setupEventListeners();
    setupTabs();
    
    // Load data
    loadItems();
    loadDonations();
    updateStatistics();
    loadSettings();
    loadActivityLog();
    loadAnalytics();
    loadNotifications();
    
    // Update notifications badge periodically
    setInterval(updateNotificationsBadge, 30000); // Every 30 seconds
}

function setupEventListeners() {
    document.getElementById('add-item-form').addEventListener('submit', handleAddItem);
    document.getElementById('edit-item-form').addEventListener('submit', handleUpdateItem);
    document.getElementById('settings-form').addEventListener('submit', handleSaveSettings);
    
    // Donation filters
    document.getElementById('filter-pending').addEventListener('click', () => setDonationFilter('pending'));
    document.getElementById('filter-verified').addEventListener('click', () => setDonationFilter('verified'));
    document.getElementById('filter-all-donations').addEventListener('click', () => setDonationFilter('all'));
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-red-600', 'border-red-600');
        btn.classList.add('text-gray-600');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'text-red-600', 'border-red-600');
        activeBtn.classList.remove('text-gray-600');
    }
    
    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
    
    // Load data for specific tabs
    if (tabName === 'activity') {
        loadActivityLog();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    } else if (tabName === 'notifications') {
        loadNotifications();
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        await logActivity('admin_logout', 'Admin logged out');
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

function setDonationFilter(filter) {
    currentDonationFilter = filter;
    
    // Update button states
    document.querySelectorAll('#donations-list').parentElement.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('opacity-100', 'ring-2', 'ring-offset-2');
    });
    
    const activeBtn = document.getElementById(`filter-${filter === 'all' ? 'all-donations' : filter}`);
    if (activeBtn) {
        activeBtn.classList.add('opacity-100', 'ring-2', 'ring-offset-2');
    }
    
    loadDonations();
}

async function handleAddItem(e) {
    e.preventDefault();

    const name = document.getElementById('item-name').value.trim();
    const description = document.getElementById('item-description').value.trim();
    const total = parseFloat(document.getElementById('item-total').value);

    if (!name || !total || total < 1) {
        alert('Please fill in all required fields correctly');
        return;
    }

    try {
        const itemRef = database.ref('items').push();
        await itemRef.set({
            name: name,
            description: description || '',
            total: total,
            donated: 0,
            status: 'available',
            donors: {},
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });

        // Log activity
        await logActivity('item_added', `Added item: ${name} (₹${formatCurrency(total)})`);

        // Create notification
        await createNotification('item_added', `New item added: ${name}`, itemRef.key);

        // Reset form
        document.getElementById('add-item-form').reset();
        alert('Item added successfully!');
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
    }
}

function loadItems() {
    itemsRef = database.ref('items');
    
    itemsRef.on('value', (snapshot) => {
        const itemsData = snapshot.val();
        const items = itemsData ? Object.keys(itemsData).map(key => ({
            id: key,
            ...itemsData[key]
        })) : [];

        renderItems(items);
        updateStatistics();
    });
}

function renderItems(items) {
    const container = document.getElementById('admin-items-list');
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-gray-600">No items yet. Add your first item above!</p>';
        return;
    }

    container.innerHTML = items.map(item => {
        const donated = item.donated || 0;
        const total = item.total || 0;
        const isFunded = donated >= total;
        const remaining = Math.max(0, total - donated);
        const progressPercent = total > 0 ? Math.min(100, (donated / total) * 100) : 0;

        return `
            <div class="border-2 border-red-200 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900">${escapeHtml(item.name)}</h3>
                        ${item.description ? `<p class="text-sm text-gray-600 mt-1">${escapeHtml(item.description)}</p>` : ''}
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${isFunded ? 'badge-funded' : 'badge-available'}">
                        ${isFunded ? '✅ Funded' : '🎯 Available'}
                    </span>
                </div>
                <div class="mt-3 space-y-1">
                    <div class="flex justify-between text-sm">
                        <span>Total:</span>
                        <span class="font-bold">₹${formatCurrency(total)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span>Donated:</span>
                        <span class="font-bold text-green-600">₹${formatCurrency(donated)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span>Remaining:</span>
                        <span class="font-bold text-blue-600">₹${formatCurrency(remaining)}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div class="progress-christmas h-2 rounded-full" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="mt-3 flex gap-2">
                    <button onclick="editItem('${item.id}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm cursor-pointer flex-1">
                        ✏️ Edit Item
                    </button>
                    <button onclick="deleteItem('${item.id}')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm cursor-pointer">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function editItem(itemId) {
    try {
        const itemSnapshot = await database.ref(`items/${itemId}`).once('value');
        const item = itemSnapshot.val();
        
        if (!item) {
            alert('Item not found');
            return;
        }

        // Populate form
        document.getElementById('edit-item-id').value = itemId;
        document.getElementById('edit-item-name').value = item.name || '';
        document.getElementById('edit-item-description').value = item.description || '';
        document.getElementById('edit-item-total').value = item.total || 0;
        document.getElementById('edit-item-donated').value = item.donated || 0;
        document.getElementById('edit-item-status').value = item.status || 'available';

        // Show modal
        document.getElementById('edit-item-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading item for edit:', error);
        alert('Failed to load item details');
    }
}

function closeEditModal() {
    document.getElementById('edit-item-modal').classList.add('hidden');
    document.getElementById('edit-item-form').reset();
}

async function handleUpdateItem(e) {
    e.preventDefault();

    const itemId = document.getElementById('edit-item-id').value;
    const name = document.getElementById('edit-item-name').value.trim();
    const description = document.getElementById('edit-item-description').value.trim();
    const total = parseFloat(document.getElementById('edit-item-total').value);
    const donated = parseFloat(document.getElementById('edit-item-donated').value);
    const status = document.getElementById('edit-item-status').value;

    if (!name || !total || total < 1 || donated < 0) {
        alert('Please fill in all required fields correctly');
        return;
    }

    if (donated > total) {
        if (!confirm(`Donated amount (₹${formatCurrency(donated)}) is greater than total (₹${formatCurrency(total)}). Continue anyway?`)) {
            return;
        }
    }

    try {
        // Get current item to track changes
        const itemSnapshot = await database.ref(`items/${itemId}`).once('value');
        const oldItem = itemSnapshot.val();
        
        if (!oldItem) {
            alert('Item not found');
            return;
        }

        // Determine status based on amounts
        const finalStatus = donated >= total ? 'funded' : status;

        // Update item
        await database.ref(`items/${itemId}`).update({
            name: name,
            description: description || '',
            total: total,
            donated: donated,
            status: finalStatus,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        // Log activity with change details
        const changes = [];
        if (oldItem.name !== name) changes.push(`name: "${oldItem.name}" → "${name}"`);
        if (oldItem.total !== total) changes.push(`total: ₹${formatCurrency(oldItem.total)} → ₹${formatCurrency(total)}`);
        if (oldItem.donated !== donated) changes.push(`donated: ₹${formatCurrency(oldItem.donated)} → ₹${formatCurrency(donated)}`);
        if (oldItem.status !== finalStatus) changes.push(`status: "${oldItem.status}" → "${finalStatus}"`);

        await logActivity('item_updated', `Updated item: ${name}. Changes: ${changes.join(', ')}`);

        // Create notification if item is now fully funded
        if (oldItem.donated < oldItem.total && donated >= total) {
            await createNotification('item_funded', `Item fully funded: ${name}`, itemId);
        }

        // Close modal
        closeEditModal();
        alert('Item updated successfully!');
    } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item. Please try again.');
    }
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const itemSnapshot = await database.ref(`items/${itemId}`).once('value');
        const item = itemSnapshot.val();
        
        await database.ref(`items/${itemId}`).remove();
        await logActivity('item_deleted', `Deleted item: ${item ? item.name : itemId}`);
        alert('Item deleted successfully');
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
    }
}

function loadDonations() {
    donationsRef = database.ref('donations');
    
    donationsRef.on('value', (snapshot) => {
        const donationsData = snapshot.val();
        const donations = donationsData ? Object.keys(donationsData).map(key => ({
            id: key,
            ...donationsData[key]
        })) : [];

        // Sort by date (newest first)
        donations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        renderDonations(donations);
        updateStatistics();
    });
}

async function renderDonations(donations) {
    const container = document.getElementById('donations-list');
    
    // Filter donations
    let filteredDonations = donations;
    if (currentDonationFilter === 'pending') {
        filteredDonations = donations.filter(d => d.status === 'pending');
    } else if (currentDonationFilter === 'verified') {
        filteredDonations = donations.filter(d => d.status === 'verified');
    }
    
    if (filteredDonations.length === 0) {
        container.innerHTML = '<p class="text-gray-600">No donations found.</p>';
        return;
    }

    // Get item names for display
    const itemsSnapshot = await database.ref('items').once('value');
    const itemsData = itemsSnapshot.val() || {};
    
    container.innerHTML = filteredDonations.map(donation => {
        const item = itemsData[donation.itemId];
        const itemName = item ? item.name : 'Unknown Item';
        const date = donation.createdAt ? formatDate(donation.createdAt) : 'Unknown date';
        const statusBadge = donation.status === 'verified' 
            ? '<span class="px-2 py-1 bg-green-500 text-white rounded text-xs">✅ Verified</span>'
            : '<span class="px-2 py-1 bg-yellow-500 text-white rounded text-xs">⏳ Pending</span>';

        return `
            <div class="border-2 border-red-200 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-900">${escapeHtml(donation.isAnonymous ? 'Anonymous' : donation.donorName)}</h3>
                        <p class="text-sm text-gray-600">${escapeHtml(donation.donorEmail)}</p>
                        <p class="text-sm text-gray-600 mt-1">Item: <span class="font-medium">${escapeHtml(itemName)}</span></p>
                    </div>
                    ${statusBadge}
                </div>
                <div class="mt-2 space-y-1 text-sm">
                    <div class="flex justify-between">
                        <span>Amount:</span>
                        <span class="font-bold text-green-600">₹${formatCurrency(donation.amount)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Transaction Ref:</span>
                        <span class="font-mono text-xs">${escapeHtml(donation.transactionRef)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Submitted:</span>
                        <span class="text-gray-600">${date}</span>
                    </div>
                    ${donation.verifiedAt ? `
                        <div class="flex justify-between">
                            <span>Verified:</span>
                            <span class="text-gray-600">${formatDate(donation.verifiedAt)}</span>
                        </div>
                        ${donation.verifiedBy ? `
                            <div class="flex justify-between">
                                <span>Verified By:</span>
                                <span class="text-gray-600">${escapeHtml(donation.verifiedBy)}</span>
                            </div>
                        ` : ''}
                    ` : ''}
                </div>
                ${donation.status === 'pending' ? `
                    <div class="mt-3 flex gap-2">
                        <button onclick="verifyDonation('${donation.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm cursor-pointer">
                            ✅ Verify Payment
                        </button>
                        <button onclick="rejectDonation('${donation.id}')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm cursor-pointer">
                            ❌ Reject
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function verifyDonation(donationId) {
    if (!confirm('Mark this donation as verified? This will add the amount to the item.')) {
        return;
    }

    try {
        const user = auth.currentUser;
        const donationSnapshot = await database.ref(`donations/${donationId}`).once('value');
        const donation = donationSnapshot.val();
        
        if (!donation) {
            alert('Donation not found');
            return;
        }

        if (donation.status === 'verified') {
            alert('Donation is already verified');
            return;
        }

        // Update item
        const itemRef = database.ref(`items/${donation.itemId}`);
        const itemSnapshot = await itemRef.once('value');
        const itemData = itemSnapshot.val();

        if (!itemData) {
            alert('Item not found');
            return;
        }

        const newDonated = (itemData.donated || 0) + donation.amount;
        const donors = itemData.donors || {};
        const donorKey = `donor_${Date.now()}`;
        
        donors[donorKey] = {
            name: donation.donorName,
            amount: donation.amount,
            isAnonymous: donation.isAnonymous
        };

        const wasFunded = (itemData.donated || 0) >= itemData.total;
        const isNowFunded = newDonated >= itemData.total;

        await itemRef.update({
            donated: newDonated,
            donors: donors,
            status: isNowFunded ? 'funded' : 'available'
        });

        // Update donation status
        await database.ref(`donations/${donationId}`).update({
            status: 'verified',
            verifiedAt: firebase.database.ServerValue.TIMESTAMP,
            verifiedBy: user ? user.email : 'Admin'
        });

        // Log activity
        await logActivity('donation_verified', `Verified donation: ₹${formatCurrency(donation.amount)} for ${itemData.name}`);

        // Create notification if item is now funded
        if (!wasFunded && isNowFunded) {
            await createNotification('item_funded', `Item fully funded: ${itemData.name}`, donation.itemId);
        }

        alert('Donation verified successfully! Amount has been added to the item.');
    } catch (error) {
        console.error('Error verifying donation:', error);
        alert('Failed to verify donation');
    }
}

async function rejectDonation(donationId) {
    if (!confirm('Reject this donation? This action cannot be undone.')) {
        return;
    }

    try {
        const donationSnapshot = await database.ref(`donations/${donationId}`).once('value');
        const donation = donationSnapshot.val();
        
        if (!donation) {
            alert('Donation not found');
            return;
        }

        // Remove donation amount from item if it was already added
        if (donation.status === 'verified') {
            const itemRef = database.ref(`items/${donation.itemId}`);
            const itemSnapshot = await itemRef.once('value');
            const item = itemSnapshot.val();
            
            if (item) {
                const newDonated = Math.max(0, (item.donated || 0) - donation.amount);
                await itemRef.update({
                    donated: newDonated,
                    status: newDonated >= item.total ? 'funded' : 'available'
                });
            }
        }

        // Delete donation
        await database.ref(`donations/${donationId}`).remove();
        await logActivity('donation_rejected', `Rejected donation: ₹${formatCurrency(donation.amount)}`);

        alert('Donation rejected and removed');
    } catch (error) {
        console.error('Error rejecting donation:', error);
        alert('Failed to reject donation');
    }
}

async function updateStatistics() {
    try {
        const itemsSnapshot = await database.ref('items').once('value');
        const itemsData = itemsSnapshot.val() || {};
        const items = Object.values(itemsData);
        
        const donationsSnapshot = await database.ref('donations').once('value');
        const donationsData = donationsSnapshot.val() || {};
        const donations = Object.values(donationsData);
        
        const totalItems = items.length;
        const fundedItems = items.filter(item => (item.donated || 0) >= (item.total || 0)).length;
        const totalDonations = donations.length;
        const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        
        document.getElementById('stat-total-items').textContent = totalItems;
        document.getElementById('stat-funded').textContent = fundedItems;
        document.getElementById('stat-total-donations').textContent = totalDonations;
        document.getElementById('stat-total-amount').textContent = `₹${formatCurrency(totalAmount)}`;
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Settings Management
async function loadSettings() {
    try {
        const settings = await getSettings();
        if (settings) {
            document.getElementById('setting-project-name').value = settings.projectName || '';
            document.getElementById('setting-upi-qr').value = settings.upiQrCode || '';
            document.getElementById('setting-certificate-text').value = settings.certificateText || '';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function handleSaveSettings(e) {
    e.preventDefault();
    
    const settings = {
        projectName: document.getElementById('setting-project-name').value.trim(),
        upiQrCode: document.getElementById('setting-upi-qr').value.trim(),
        certificateText: document.getElementById('setting-certificate-text').value.trim()
    };

    const success = await saveSettings(settings);
    if (success) {
        alert('Settings saved successfully!');
    } else {
        alert('Failed to save settings. Please try again.');
    }
}

// Activity Log
async function loadActivityLog() {
    try {
        const activityRef = database.ref('activity');
        activityRef.on('value', (snapshot) => {
            const activities = snapshot.val() || {};
            const activityList = Object.keys(activities).map(key => ({
                id: key,
                ...activities[key]
            })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            const container = document.getElementById('activity-list');
            if (activityList.length === 0) {
                container.innerHTML = '<p class="text-gray-600">No activity yet.</p>';
                return;
            }

            container.innerHTML = activityList.slice(0, 50).map(activity => `
                <div class="border-l-4 border-red-500 pl-4 py-2 bg-gray-50 rounded">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-medium text-gray-900">${escapeHtml(activity.details)}</div>
                            <div class="text-sm text-gray-600 mt-1">
                                Type: <span class="font-medium">${escapeHtml(activity.type)}</span> | 
                                User: <span class="font-medium">${escapeHtml(activity.user || 'system')}</span>
                            </div>
                        </div>
                        <div class="text-xs text-gray-500">
                            ${formatDate(activity.timestamp)}
                        </div>
                    </div>
                </div>
            `).join('');
        });
    } catch (error) {
        console.error('Error loading activity log:', error);
    }
}

// Analytics
async function loadAnalytics() {
    try {
        const analyticsRef = database.ref('analytics');
        analyticsRef.on('value', (snapshot) => {
            const analytics = snapshot.val() || {};
            
            document.getElementById('analytics-page-views').textContent = analytics.pageViews || 0;
            document.getElementById('analytics-conversion').textContent = 
                analytics.conversionRate ? `${analytics.conversionRate}%` : '0%';

            // Get popular items
            database.ref('items').once('value').then(itemsSnapshot => {
                const items = itemsSnapshot.val() || {};
                const itemsList = Object.values(items).sort((a, b) => 
                    (b.donated || 0) - (a.donated || 0)
                ).slice(0, 5);

                const container = document.getElementById('analytics-popular-items');
                if (itemsList.length === 0) {
                    container.innerHTML = '<p class="text-gray-600">No items yet.</p>';
                    return;
                }

                container.innerHTML = itemsList.map((item, index) => `
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                            <span class="font-bold text-red-600">#${index + 1}</span>
                            <span class="ml-2">${escapeHtml(item.name)}</span>
                        </div>
                        <div class="text-sm text-gray-600">
                            ₹${formatCurrency(item.donated || 0)} / ₹${formatCurrency(item.total || 0)}
                        </div>
                    </div>
                `).join('');
            });
        });
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Notifications
async function loadNotifications() {
    try {
        const notificationsRef = database.ref('notifications');
        notificationsRef.on('value', (snapshot) => {
            const notifications = snapshot.val() || {};
            const notificationList = Object.keys(notifications).map(key => ({
                id: key,
                ...notifications[key]
            })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            const container = document.getElementById('notifications-list');
            if (notificationList.length === 0) {
                container.innerHTML = '<p class="text-gray-600">No notifications yet.</p>';
                return;
            }

            container.innerHTML = notificationList.slice(0, 20).map(notification => `
                <div class="border-2 ${notification.read ? 'border-gray-200' : 'border-red-300'} rounded-lg p-4 ${notification.read ? 'bg-gray-50' : 'bg-white'}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">${escapeHtml(notification.message)}</div>
                            <div class="text-sm text-gray-600 mt-1">
                                ${formatDate(notification.createdAt)}
                            </div>
                        </div>
                        ${!notification.read ? `
                            <button onclick="markNotificationReadHandler('${notification.id}')" 
                                    class="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition">
                                Mark Read
                            </button>
                        ` : '<span class="text-xs text-gray-500 ml-4">✓ Read</span>'}
                    </div>
                </div>
            `).join('');
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function markNotificationReadHandler(notificationId) {
    await markNotificationRead(notificationId);
    await updateNotificationsBadge();
    loadNotifications(); // Reload to update UI
}

async function updateNotificationsBadge() {
    try {
        const count = await getUnreadNotificationsCount();
        const badge = document.getElementById('notification-badge');
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error updating notifications badge:', error);
    }
}

// Utility functions
function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
