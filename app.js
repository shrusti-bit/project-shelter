// Global state
let currentFilter = 'all';
let currentItem = null;
let itemsRef = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    createSnowflakes();
    setupEventListeners();
    loadItems();
}

// Create animated snowflakes
function createSnowflakes() {
    const snowflakes = ['❄️', '❅', '❆', '❄'];
    const container = document.getElementById('snowflakes');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 30; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        snowflake.style.animationDelay = Math.random() * 2 + 's';
        snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        container.appendChild(snowflake);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.getElementById('filter-all').addEventListener('click', () => setFilter('all'));
    document.getElementById('filter-available').addEventListener('click', () => setFilter('available'));
    document.getElementById('filter-funded').addEventListener('click', () => setFilter('funded'));

    // Modal controls
    document.getElementById('close-modal').addEventListener('click', closeDonationModal);
    document.getElementById('cancel-donation').addEventListener('click', closeDonationModal);
    
    // Close modal when clicking outside
    document.getElementById('donation-modal').addEventListener('click', (e) => {
        if (e.target.id === 'donation-modal') {
            closeDonationModal();
        }
    });

    // Donation form
    document.getElementById('donation-form').addEventListener('submit', handleDonationSubmit);
}

// Set filter and update UI
function setFilter(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'text-white');
        btn.classList.add('bg-white/90', 'text-gray-700');
    });

    const activeBtn = document.getElementById(`filter-${filter}`);
    activeBtn.classList.add('active', 'text-white');
    activeBtn.classList.remove('bg-white/90', 'text-gray-700');

    // Filter items (will be handled by realtime listener)
    loadItems();
}

// Track page view on load
if (typeof trackPageView === 'function') {
    trackPageView();
}

// Load items from Firebase
function loadItems() {
    const loadingEl = document.getElementById('loading');
    const emptyStateEl = document.getElementById('empty-state');
    const itemsGridEl = document.getElementById('items-grid');

    loadingEl.classList.remove('hidden');
    emptyStateEl.classList.add('hidden');
    itemsGridEl.classList.add('hidden');

    try {
        // Get reference to items in Firebase
        itemsRef = database.ref('items');

        // Listen for realtime updates - automatically updates UI when any item changes
        // This includes when donations are added (amount updates immediately)
        itemsRef.on('value', (snapshot) => {
            console.log('🔄 Real-time update triggered!');
            const itemsData = snapshot.val();
            const items = itemsData ? Object.keys(itemsData).map(key => ({
                id: key,
                ...itemsData[key]
            })) : [];

            console.log('📦 Items received:', items.length);
            if (items.length > 0) {
                console.log('📊 Sample item:', {
                    id: items[0].id,
                    name: items[0].name,
                    donated: items[0].donated,
                    total: items[0].total
                });
            }
            console.log('🔄 Re-rendering items with updated data...');

            loadingEl.classList.add('hidden');
            renderItems(items); // Re-render with updated amounts
            
            console.log('✅ UI updated with latest data');
        }, (error) => {
            console.error('❌ Error in real-time listener:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            loadingEl.classList.add('hidden');
            showError('Failed to load items. Please refresh the page.');
        });
    } catch (error) {
        console.error('Firebase error:', error);
        loadingEl.classList.add('hidden');
        showError('Firebase not configured. Please check firebase-config.js');
    }
}

// Render items to the page
function renderItems(items) {
    const emptyStateEl = document.getElementById('empty-state');
    const itemsGridEl = document.getElementById('items-grid');
    const loadingEl = document.getElementById('loading');

    // Always hide loading first
    if (loadingEl) loadingEl.classList.add('hidden');

    // Filter items based on current filter
    const filteredItems = items.filter(item => {
        const donated = item.donated || 0;
        const total = item.total || 0;
        const isFunded = donated >= total;
        
        if (currentFilter === 'available') {
            return !isFunded;
        }
        if (currentFilter === 'funded') {
            return isFunded;
        }
        return true; // 'all' filter
    });

    // Clear previous content completely
    itemsGridEl.innerHTML = '';

    if (filteredItems.length === 0) {
        emptyStateEl.classList.remove('hidden');
        itemsGridEl.classList.add('hidden');
        return;
    }

    // Show grid and hide empty state
    emptyStateEl.classList.add('hidden');
    itemsGridEl.classList.remove('hidden');

    // Render only filtered items
    itemsGridEl.innerHTML = filteredItems.map(item => createItemCard(item)).join('');

    // Add event listeners to donate buttons
    filteredItems.forEach(item => {
        const btn = document.getElementById(`donate-btn-${item.id}`);
        if (btn) {
            btn.addEventListener('click', () => openDonationModal(item));
        }
    });
}

// Create item card HTML
function createItemCard(item) {
    const donated = item.donated || 0;
    const total = item.total || 0;
    const isFunded = donated >= total;
    const remaining = Math.max(0, total - donated);
    const progressPercent = total > 0 ? Math.min(100, (donated / total) * 100) : 0;
    const status = isFunded ? 'funded' : 'available';
    const statusBadge = isFunded ? '✅ Funded' : '🎯 Available';
    const badgeClass = isFunded ? 'badge-funded' : 'badge-available';

    return `
        <div class="christmas-card rounded-lg p-6 transition ${isFunded ? 'opacity-90' : ''} card-container" style="min-width: 0; display: flex; flex-direction: column; height: 100%;">
            <div class="flex justify-between items-start mb-4 gap-2" style="min-width: 0;">
                <h3 class="text-xl font-bold text-gray-900 flex-1" style="min-width: 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item.name)}</h3>
                <span class="px-3 py-1 rounded-full text-sm font-medium ${badgeClass} flex-shrink-0">
                    ${statusBadge}
                </span>
            </div>

            ${item.description ? `<p class="text-gray-700 mb-4 text-sm" style="word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item.description)}</p>` : ''}

            <div class="mb-4 flex-grow">
                <div class="flex justify-between text-sm mb-2" style="min-width: 0;">
                    <span class="text-gray-600 font-medium flex-shrink-0">Total Required:</span>
                    <span class="font-bold text-red-600 flex-shrink-0 ml-2">₹${formatCurrency(item.total)}</span>
                </div>
                <div class="flex justify-between text-sm mb-2" style="min-width: 0;">
                    <span class="text-gray-600 font-medium flex-shrink-0">Collected:</span>
                    <span class="font-bold text-green-600 flex-shrink-0 ml-2">₹${formatCurrency(item.donated || 0)}</span>
                </div>
                <div class="flex justify-between text-sm mb-2" style="min-width: 0;">
                    <span class="text-gray-600 font-medium flex-shrink-0">Remaining:</span>
                    <span class="font-bold text-blue-600 flex-shrink-0 ml-2">₹${formatCurrency(remaining)}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
                    <div class="progress-christmas h-3 rounded-full transition-all" style="width: ${progressPercent}%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-1 text-center">
                    ${Math.round(progressPercent)}% Complete
                </p>
            </div>

            ${getDonorDisplay(item) ? `
                <div class="mb-4 p-3 ${isFunded ? 'bg-green-50 border-2 border-green-300' : 'bg-blue-50 border-2 border-blue-300'} rounded-lg">
                    <p class="text-sm ${isFunded ? 'text-green-800' : 'text-blue-800'} font-medium text-center">
                        ${getDonorDisplay(item)}
                    </p>
                </div>
            ` : ''}

            ${!isFunded ? `
                <button id="donate-btn-${item.id}" class="w-full btn-christmas py-3 px-4 rounded-lg font-bold text-lg mt-auto">
                    🎁 Donate Now
                </button>
            ` : ''}
        </div>
    `;
}

// Get donor display text
function getDonorDisplay(item) {
    if (!item.donors || Object.keys(item.donors).length === 0) {
        return '';
    }
    
    const donors = Object.values(item.donors);
    const isFullyFunded = (item.donated || 0) >= (item.total || 0);
    
    // Filter out anonymous donors and get names
    const namedDonors = donors.filter(d => !d.isAnonymous);
    const anonymousCount = donors.length - namedDonors.length;
    
    // Single donor case
    if (donors.length === 1) {
        const donor = donors[0];
        if (donor.isAnonymous) {
            return isFullyFunded ? '🎁 Donated by Anonymous' : '💝 Partially donated by Anonymous';
        }
        return isFullyFunded 
            ? `🎁 Donated by ${escapeHtml(donor.name)}` 
            : `💝 Partially donated by ${escapeHtml(donor.name)}`;
    }
    
    // Multiple donors case
    if (namedDonors.length === 0) {
        // All anonymous
        return isFullyFunded 
            ? `🎁 Donated by ${donors.length} Anonymous Donor${donors.length > 1 ? 's' : ''}`
            : `💝 Partially donated by ${donors.length} Anonymous Donor${donors.length > 1 ? 's' : ''}`;
    }
    
    // Mix of named and anonymous
    const donorNames = namedDonors.map(d => escapeHtml(d.name));
    let displayText = '';
    
    if (isFullyFunded) {
        displayText = '🎁 Donated by: ';
    } else {
        displayText = '💝 Partially donated by: ';
    }
    
    if (donorNames.length > 0) {
        displayText += donorNames.join(', ');
    }
    
    if (anonymousCount > 0) {
        if (donorNames.length > 0) {
            displayText += ` and ${anonymousCount} anonymous donor${anonymousCount > 1 ? 's' : ''}`;
        } else {
            displayText += `${anonymousCount} anonymous donor${anonymousCount > 1 ? 's' : ''}`;
        }
    }
    
    return displayText;
}

// Open donation modal
function openDonationModal(item) {
    currentItem = item;
    const modal = document.getElementById('donation-modal');
    const itemNameEl = document.getElementById('modal-item-name');
    const amountInput = document.getElementById('donation-amount');
    const amountHint = document.getElementById('amount-hint');
    const formError = document.getElementById('form-error');

    itemNameEl.textContent = `Donate to ${item.name}`;
    amountInput.max = Math.max(0, item.total - (item.donated || 0));
    amountHint.textContent = `Max: ₹${formatCurrency(amountInput.max)}`;
    formError.classList.add('hidden');
    
    // Update summary card
    const summaryItemName = document.getElementById('summary-item-name');
    const summaryRemaining = document.getElementById('summary-remaining');
    if (summaryItemName) summaryItemName.textContent = item.name;
    if (summaryRemaining) summaryRemaining.textContent = `₹${formatCurrency(amountInput.max)}`;

    // Reset form
    document.getElementById('donation-form').reset();
    amountInput.value = '';

    modal.classList.remove('hidden');
    
    // Scroll to top of modal
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
}

// Close donation modal
function closeDonationModal() {
    console.log('🔄 Closing donation modal...');
    const modal = document.getElementById('donation-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('✅ Modal hidden class added');
    } else {
        console.warn('⚠️ Modal element not found!');
    }
    currentItem = null;
    
    // Reset form
    const form = document.getElementById('donation-form');
    if (form) {
        form.reset();
        console.log('✅ Form reset');
    }
    console.log('✅ Donation modal closed');
}

// Handle donation form submission
async function handleDonationSubmit(e) {
    e.preventDefault();
    
    const formError = document.getElementById('form-error');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-donation');

    formError.classList.add('hidden');

    if (!currentItem) {
        showFormError('No item selected');
        return;
    }

    const donorName = document.getElementById('donor-name').value.trim();
    const donorEmail = document.getElementById('donor-email').value.trim();
    const amount = Math.round(parseFloat(document.getElementById('donation-amount').value) * 100) / 100; // Round to 2 decimal places
    const isAnonymous = document.getElementById('is-anonymous').checked;
    const paymentConfirmed = document.getElementById('payment-confirmed').checked;

    // Validation
    if (!donorName || donorName.length < 2) {
        showFormError('Name must be at least 2 characters');
        return;
    }

    if (!donorEmail || !isValidEmail(donorEmail)) {
        showFormError('Please enter a valid email address');
        return;
    }

    if (!amount || amount < 1) {
        showFormError('Amount must be at least ₹1');
        return;
    }

    const remaining = currentItem.total - (currentItem.donated || 0);
    if (amount > remaining) {
        showFormError(`Amount cannot exceed remaining amount of ₹${formatCurrency(remaining)}`);
        return;
    }

    if (!paymentConfirmed) {
        showFormError('Please confirm payment');
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting...';

    // Check Firebase connection first
    if (!database) {
        console.error('❌ Firebase database not initialized!');
        showFormError('Firebase connection error. Please check firebase-config.js');
        submitBtn.disabled = false;
        submitBtn.textContent = '🎁 Submit Donation';
        return;
    }

    try {
        console.log('🔄 Starting donation submission...');
        console.log('📦 Current item:', currentItem);
        console.log('💰 Donation amount:', amount);
        
        // Test Firebase connection by trying to read
        const testRef = database.ref('items');
        await testRef.once('value');
        console.log('✅ Firebase connection verified');
        
        // Create donation record
        const donationId = database.ref('donations').push().key;
        console.log('📝 Donation ID generated:', donationId);
        
        const donation = {
            itemId: currentItem.id,
            donorName,
            donorEmail,
            amount,
            isAnonymous,
            status: 'pending', // Admin can verify later if needed
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };

        // Save donation first
        console.log('💾 Saving donation to Firebase...');
        await database.ref(`donations/${donationId}`).set(donation);
        console.log('✅ Donation saved to Firebase:', donationId);

        // IMMEDIATELY update item with donation amount (real-time update)
        console.log('🔄 Updating item in Firebase...');
        const itemRef = database.ref(`items/${currentItem.id}`);
        console.log('📦 Item reference:', currentItem.id);
        
        const itemSnapshot = await itemRef.once('value');
        const itemData = itemSnapshot.val();
        console.log('📊 Current item data:', itemData);

        if (!itemData) {
            throw new Error(`Item not found in database: ${currentItem.id}`);
        }

        const currentDonated = Math.round((itemData.donated || 0) * 100) / 100; // Round to 2 decimal places
        const newDonated = Math.round((currentDonated + amount) * 100) / 100; // Round to 2 decimal places
        const donors = itemData.donors || {};
        const donorKey = `donor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        donors[donorKey] = {
            name: donorName,
            amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
            isAnonymous: isAnonymous,
            donationId: donationId,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };

        // Update item: add donated amount and update status
        // This will trigger the real-time listener automatically
        console.log('💾 Updating item with new amount...');
        console.log('   Previous donated:', currentDonated);
        console.log('   New donated:', newDonated);
        console.log('   Donation amount:', amount);
        
        await itemRef.update({
            donated: newDonated,
            donors: donors,
            status: newDonated >= itemData.total ? 'funded' : 'available',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        console.log('✅ Item updated in Firebase successfully!');
        console.log('✅ Real-time listener should update UI automatically');
        console.log('⏳ Waiting for real-time update...');
        
        // Force a small delay to ensure Firebase processes the update
        await new Promise(resolve => setTimeout(resolve, 100));

        // Track donation for analytics (don't block on errors)
        try {
            if (typeof trackDonation === 'function') {
                await trackDonation();
            }
        } catch (err) {
            console.warn('Analytics tracking failed:', err);
        }

        // Create notification for admin (don't block on errors)
        try {
            if (typeof createNotification === 'function') {
                const itemName = currentItem.name || 'Unknown Item';
                await createNotification('new_donation', 
                    `New donation: ₹${amount.toLocaleString('en-IN')} for ${itemName}`, 
                    currentItem.id);
            }
        } catch (err) {
            console.warn('Notification creation failed:', err);
        }

        console.log('✅ Donation submitted successfully!');
        console.log('✅ Item updated with amount:', amount);
        console.log('✅ Real-time listener should update UI automatically');
        console.log('🔄 Closing modal and showing success...');
        
        // Close donation modal immediately
        closeDonationModal();
        console.log('✅ Modal closed');
        
        // Show success modal after brief delay
        setTimeout(() => {
            showSuccessModal();
            console.log('✅ Success modal shown');
        }, 200);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = '🎁 Submit Donation';

    } catch (error) {
        console.error('❌ Error submitting donation:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        if (error.stack) console.error('Stack:', error.stack);
        
        // Check for specific Firebase errors
        let errorMessage = 'Failed to submit donation. ';
        if (error.code === 'PERMISSION_DENIED' || error.message.includes('permission')) {
            errorMessage += 'Permission denied. Please check Firebase database rules allow writes.';
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
            errorMessage += 'Network error. Please check your internet connection.';
        } else if (error.message.includes('Item not found')) {
            errorMessage += 'Item not found in database. Please refresh the page and try again.';
        } else {
            errorMessage += 'Error: ' + (error.message || 'Unknown error') + '. Check console (F12) for details.';
        }
        
        showFormError(errorMessage);
        submitBtn.disabled = false;
        submitBtn.textContent = '🎁 Submit Donation';
        // Modal stays open so user can see error and retry
    }
}

// Show form error
function showFormError(message) {
    const formError = document.getElementById('form-error');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    formError.classList.remove('hidden');
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) {
        console.error('Success modal not found');
        alert('✅ Thank you! Your donation has been submitted successfully!');
        return;
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 5000);
    
    // Also allow clicking outside to close
    modal.addEventListener('click', function closeOnClick(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.removeEventListener('click', closeOnClick);
        }
    });
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

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    alert(message); // Simple error display - can be enhanced
}

