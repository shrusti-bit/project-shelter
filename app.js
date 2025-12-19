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

    // Confirm button
    document.getElementById('confirm-donation').addEventListener('click', handleConfirmDonation);
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
        itemsRef.on('value', async (snapshot) => {
            console.log('🔄 Real-time update triggered!');
            const itemsData = snapshot.val();
            const items = itemsData ? Object.keys(itemsData).map(key => ({
                id: key,
                ...itemsData[key]
            })) : [];

            console.log('📦 Items received:', items.length);
            
            // Load pending donations to check item status and calculate verified amounts
            try {
                const donationsSnapshot = await database.ref('donations').once('value');
                const donationsData = donationsSnapshot.val() || {};
                const pendingDonations = Object.values(donationsData).filter(d => d.status === 'pending');
                const verifiedDonations = Object.values(donationsData).filter(d => d.status === 'verified');
                
                // Add pending status and calculate verified donated amount for items
                items.forEach(item => {
                    const itemPendingDonations = pendingDonations.filter(d => d.itemId === item.id);
                    item.hasPendingDonations = itemPendingDonations.length > 0;
                    
                    // Calculate verified donated amount (total donated minus pending amounts)
                    const pendingAmount = itemPendingDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
                    const totalDonated = item.donated || 0;
                    item.verifiedDonated = Math.max(0, Math.round((totalDonated - pendingAmount) * 100) / 100);
                });
            } catch (err) {
                console.warn('Could not load pending donations:', err);
                items.forEach(item => {
                    item.hasPendingDonations = false;
                    item.verifiedDonated = item.donated || 0; // Fallback to donated if we can't calculate
                });
            }
            
            if (items.length > 0) {
                console.log('📊 Sample item:', {
                    id: items[0].id,
                    name: items[0].name,
                    donated: items[0].donated,
                    total: items[0].total,
                    hasPendingDonations: items[0].hasPendingDonations
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
        const verifiedDonated = item.verifiedDonated !== undefined ? item.verifiedDonated : (item.donated || 0);
        const donated = item.donated || 0;
        const total = item.total || 0;
        const isFunded = verifiedDonated >= total; // Use verified amount for funding check
        const isFullyFundedWithPending = donated >= total; // Total including pending
        const hasPendingDonations = item.hasPendingDonations || false;
        const isFullyFunded = isFunded && !hasPendingDonations;
        const isPending = (isFullyFundedWithPending && verifiedDonated < total) || (isFunded && hasPendingDonations);
        
        if (currentFilter === 'available') {
            return !isFunded && !isPending; // Show only items that can accept donations
        }
        if (currentFilter === 'funded') {
            return isFullyFunded; // Only show truly funded items (verified and no pending)
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

    // Add event listeners to donate buttons (only buttons that are rendered can accept donations)
    filteredItems.forEach(item => {
        const btn = document.getElementById(`donate-btn-${item.id}`);
        if (btn) {
            btn.addEventListener('click', () => openDonationModal(item));
        }
    });
}

// Create item card HTML
function createItemCard(item) {
    const donated = item.donated || 0; // Total donated (including pending)
    const verifiedDonated = item.verifiedDonated !== undefined ? item.verifiedDonated : donated; // Only verified donations
    const total = item.total || 0;
    const isFunded = verifiedDonated >= total; // Use verified amount for funding check
    const hasPendingDonations = item.hasPendingDonations || false;
    const remaining = Math.max(0, total - donated); // Remaining based on total donated (to match Collected display)
    const progressPercent = total > 0 ? Math.min(100, (verifiedDonated / total) * 100) : 0; // Progress based on verified amount
    
    // Determine status: 
    // - "Funded" only if fully funded with verified donations AND no pending donations
    // - "Pending" if fully funded (including pending) but not fully verified
    // - "Available" otherwise
    const isFullyFundedWithPending = donated >= total; // Total including pending donations
    let status, statusBadge, badgeClass, canDonate;
    if (isFunded && !hasPendingDonations) {
        status = 'funded';
        statusBadge = '✅ Funded';
        badgeClass = 'badge-funded';
        canDonate = false;
    } else if (isFullyFundedWithPending && verifiedDonated < total) {
        // Fully funded including pending, but not fully verified
        status = 'pending';
        statusBadge = '⏳ Pending';
        badgeClass = 'badge-awaiting';
        canDonate = false;
    } else if (isFunded && hasPendingDonations) {
        // Verified amount reaches target but has pending donations
        status = 'pending';
        statusBadge = '⏳ Pending';
        badgeClass = 'badge-awaiting';
        canDonate = false;
    } else {
        status = 'available';
        statusBadge = '🎯 Available';
        badgeClass = 'badge-available';
        canDonate = true;
    }

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


            ${canDonate ? `
                <button id="donate-btn-${item.id}" class="w-full btn-christmas py-3 px-4 rounded-lg font-bold text-lg mt-auto">
                    🎁 Donate Now
                </button>
            ` : isFullyFundedWithPending && verifiedDonated < total ? `
                <div class="w-full bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 mt-auto text-center">
                    <p class="text-sm text-yellow-800 font-medium">⏳ Pending admin verification</p>
                    <p class="text-xs text-yellow-700 mt-1">Donations are disabled until verification is complete</p>
                </div>
            ` : isFunded && hasPendingDonations ? `
                <div class="w-full bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 mt-auto text-center">
                    <p class="text-sm text-yellow-800 font-medium">⏳ Pending admin verification</p>
                </div>
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
    const verifiedDonated = item.verifiedDonated !== undefined ? item.verifiedDonated : (item.donated || 0);
    const isFullyFunded = verifiedDonated >= (item.total || 0);
    
    // Filter out anonymous donors and get names
    const namedDonors = donors.filter(d => !d.isAnonymous);
    const anonymousCount = donors.length - namedDonors.length;
    
    // Single donor case
    if (donors.length === 1) {
        const donor = donors[0];
        if (donor.isAnonymous) {
            return '🎁 Donated by Anonymous';
        }
        return `🎁 Donated by ${escapeHtml(donor.name)}`;
    }
    
    // Multiple donors case
    if (namedDonors.length === 0) {
        // All anonymous
        return `🎁 Donated by ${donors.length} Anonymous Donor${donors.length > 1 ? 's' : ''}`;
    }
    
    // Mix of named and anonymous
    const donorNames = namedDonors.map(d => escapeHtml(d.name));
    let displayText = '🎁 Donated by: ';
    
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

    // Use total donated amount for remaining calculation (to match main page display)
    const donated = item.donated || 0;
    const remaining = Math.max(0, item.total - donated);

    itemNameEl.textContent = `Donate to ${item.name}`;
    amountInput.max = remaining;
    amountHint.textContent = `Max: ₹${formatCurrency(remaining)}`;
    formError.classList.add('hidden');
    
    // Update summary card
    const summaryItemName = document.getElementById('summary-item-name');
    const summaryRemaining = document.getElementById('summary-remaining');
    if (summaryItemName) summaryItemName.textContent = item.name;
    if (summaryRemaining) summaryRemaining.textContent = `₹${formatCurrency(remaining)}`;

    // Reset form
    document.getElementById('donation-form').reset();
    amountInput.value = '';
    
    // Re-enable confirm button (in case it was disabled from previous attempt)
    const confirmBtn = document.getElementById('confirm-donation');
    if (confirmBtn) {
        confirmBtn.disabled = false;
    }

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

// Handle Confirm button - Save to admin and update amounts
async function handleConfirmDonation(e) {
    e.preventDefault();
    
    const formError = document.getElementById('form-error');
    const confirmBtn = document.getElementById('confirm-donation');
    formError.classList.add('hidden');

    if (!currentItem) {
        showFormError('No item selected');
        return;
    }

    const donorName = document.getElementById('donor-name').value.trim();
    const donorEmail = document.getElementById('donor-email').value.trim();
    const donorPhone = document.getElementById('donor-phone').value.trim();
    const amount = Math.round(parseFloat(document.getElementById('donation-amount').value) * 100) / 100;

    // Validation
    if (!donorName || donorName.length < 2) {
        showFormError('Name must be at least 2 characters');
        return;
    }

    if (!donorEmail || !isValidEmail(donorEmail)) {
        showFormError('Please enter a valid email address');
        return;
    }

    if (!donorPhone || donorPhone.length < 10) {
        showFormError('Please enter a valid phone number (minimum 10 digits)');
        return;
    }
    
    // Validate phone number format (allows +, spaces, hyphens, parentheses, and digits)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(donorPhone)) {
        showFormError('Please enter a valid phone number');
        return;
    }

    if (!amount || amount < 1) {
        showFormError('Amount must be at least ₹1');
        return;
    }

    // Use total donated amount for remaining calculation (to match main page display)
    const donated = currentItem.donated || 0;
    const remaining = currentItem.total - donated;
    if (amount > remaining) {
        showFormError(`Amount cannot exceed remaining amount of ₹${formatCurrency(remaining)}`);
        return;
    }

    // Disable button
    confirmBtn.disabled = true;

    try {
        // Check Firebase connection
        if (!database) {
            throw new Error('Firebase connection error. Please check firebase-config.js');
        }

        // Save donation to admin
        const donationId = database.ref('donations').push().key;
        const donation = {
            itemId: currentItem.id,
            donorName,
            donorEmail,
            donorPhone,
            amount,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            verified: false
        };

        console.log('💾 Saving donation to admin...');
        await database.ref(`donations/${donationId}`).set(donation);
        console.log('✅ Donation saved to admin:', donationId);

        // Update item: add amount and donor immediately (reflects on main page)
        const currentDonated = Math.round((currentItem.donated || 0) * 100) / 100;
        const newDonated = Math.round((currentDonated + amount) * 100) / 100;
        
        // Get or initialize donors object
        const donors = currentItem.donors || {};
        const donorKey = database.ref('donors').push().key;
        donors[donorKey] = {
            name: donorName,
            amount: amount,
            donationId: donationId,
            createdAt: new Date().toISOString()
        };
        
        // Update item with new donated amount and donor
        const itemUpdate = {
            donated: newDonated,
            donors: donors
        };
        
        console.log('💾 Updating item amounts (Collected/Remaining)...');
        await database.ref(`items/${currentItem.id}`).update(itemUpdate);
        console.log('✅ Item amounts updated - will reflect on main page');
        console.log('💰 Collected:', newDonated);

        // Store donation ID for reference
        window.pendingDonation = {
            donationId,
            donorName,
            donorEmail,
            donorPhone,
            amount,
            itemId: currentItem.id
        };

        // Create notification for admin
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

        // Re-enable button before closing modal
        confirmBtn.disabled = false;
        
        // Close donation form modal
        closeDonationModal();
        
        // Show payment instructions modal
        setTimeout(() => {
            showPaymentInstructionsModal();
        }, 200);

    } catch (error) {
        console.error('❌ Error saving donation:', error);
        showFormError(error.message || 'Failed to save donation. Please try again.');
        confirmBtn.disabled = false;
    }
}

// Handle Submit Donation button (from payment instructions modal) - Save to admin and update amounts again
async function handleSubmitDonation(e) {
    e.preventDefault();
    
    if (!window.pendingDonation) {
        alert('No donation data found. Please fill the form again.');
        closePaymentInstructionsModal();
        return;
    }

    const submitBtn = document.getElementById('submit-donation-final');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting...';

    try {
        const { donationId, donorName, donorEmail, donorPhone, amount, itemId } = window.pendingDonation;
        
        // Check Firebase connection
        if (!database) {
            throw new Error('Firebase connection error. Please check firebase-config.js');
        }

        // Get current item
        const itemSnapshot = await database.ref(`items/${itemId}`).once('value');
        const itemData = itemSnapshot.val();
        if (!itemData) {
            throw new Error('Item not found. Please try again.');
        }
        
        // Save/update donation to admin
        const donation = {
            itemId: itemId,
            donorName,
            donorEmail,
            donorPhone,
            amount,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            paymentCompleted: true,
            verified: false
        };

        console.log('💾 Saving donation to admin (after payment)...');
        await database.ref(`donations/${donationId}`).set(donation);
        console.log('✅ Donation saved to admin:', donationId);

        // Update item: add amount and donor (reflects on main page)
        // Check if this donation was already added (from Confirm button)
        const currentDonated = Math.round((itemData.donated || 0) * 100) / 100;
        
        // Check if donor already exists in the item's donors list
        const existingDonors = itemData.donors || {};
        let donorExists = false;
        for (const key in existingDonors) {
            const donor = existingDonors[key];
            if (donor.name === donorName && Math.round(donor.amount * 100) / 100 === amount) {
                donorExists = true;
                break;
            }
        }
        
        let newDonated = currentDonated;
        const donors = { ...existingDonors };
        
        if (!donorExists) {
            // Add amount and donor only if not already added
            newDonated = Math.round((currentDonated + amount) * 100) / 100;
            const donorKey = database.ref('donors').push().key;
            donors[donorKey] = {
                name: donorName,
                amount: amount
            };
        }
        
        // Update item with donated amount and donors
        const itemUpdate = {
            donated: newDonated,
            donors: donors
        };
        
        console.log('💾 Updating item amounts (Collected/Remaining)...');
        await database.ref(`items/${itemId}`).update(itemUpdate);
        console.log('✅ Item amounts updated - will reflect on main page');
        console.log('💰 Collected:', newDonated);

        // Track donation for analytics
        try {
            if (typeof trackDonation === 'function') {
                await trackDonation();
            }
        } catch (err) {
            console.warn('Analytics tracking failed:', err);
        }

        // Create notification for admin
        try {
            if (typeof createNotification === 'function') {
                const itemName = itemData.name || 'Unknown Item';
                await createNotification('new_donation', 
                    `New donation: ₹${amount.toLocaleString('en-IN')} for ${itemName}`, 
                    itemId);
            }
        } catch (err) {
            console.warn('Notification creation failed:', err);
        }

        console.log('✅ Donation submitted successfully!');
        console.log('✅ Donation saved to admin and amounts updated on main page');
        
        // Close payment instructions modal
        closePaymentInstructionsModal();
        console.log('✅ Payment instructions modal closed');
        
        // Show success message
        setTimeout(() => {
            alert('✅ Thank you! Your donation has been submitted successfully. The amounts (Collected/Remaining) have been updated on the main page. Your donation will be verified by admin.');
        }, 200);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = '🎁 Submit Donation';
        
        // Clear pending donation data
        window.pendingDonation = null;

    } catch (error) {
        console.error('❌ Error submitting donation:', error);
        alert(error.message || 'An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = '🎁 Submit Donation';
    }
}

// Show form error
function showFormError(message) {
    const formError = document.getElementById('form-error');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    formError.classList.remove('hidden');
}

// Show payment instructions modal
function showPaymentInstructionsModal() {
    console.log('🔄 Attempting to show payment instructions modal...');
    const modal = document.getElementById('payment-instructions-modal');
    if (!modal) {
        console.error('❌ Payment instructions modal not found in DOM');
        alert('✅ Thank you! Your donation has been submitted. Please complete the payment. Amount will be added after admin verification.');
        return;
    }
    
    console.log('✅ Modal found, removing hidden class...');
    // Show modal
    modal.classList.remove('hidden');
    console.log('✅ Modal should now be visible');
    
    // Hide UPI button initially
    const upiButton = document.getElementById('upi-app-button');
    if (upiButton) {
        upiButton.classList.add('hidden');
    }
    
    // Mobile UPI auto-open functionality
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && window.pendingDonation && window.pendingDonation.amount) {
        const donationAmount = window.pendingDonation.amount;
        const upiLink = `upi://pay?pa=qr.project@sib&pn=Project+Shelter&cu=INR&am=${donationAmount}`;
        
        console.log('📱 Mobile device detected, attempting to open UPI app...');
        console.log('🔗 UPI Link:', upiLink);
        
        // Create a temporary anchor element to open UPI intent
        const tempLink = document.createElement('a');
        tempLink.href = upiLink;
        tempLink.style.display = 'none';
        document.body.appendChild(tempLink);
        
        // Try to open UPI app
        try {
            tempLink.click();
            console.log('✅ UPI intent triggered');
        } catch (error) {
            console.warn('⚠️ Error opening UPI app:', error);
        }
        
        // Clean up temporary element
        setTimeout(() => {
            document.body.removeChild(tempLink);
        }, 100);
        
        // Fallback: Show button after 2.5 seconds if UPI app didn't open
        setTimeout(() => {
            if (upiButton) {
                upiButton.classList.remove('hidden');
                console.log('📱 Showing UPI fallback button');
                
                // Add click handler to UPI button
                upiButton.onclick = function(e) {
                    e.preventDefault();
                    const fallbackLink = document.createElement('a');
                    fallbackLink.href = upiLink;
                    fallbackLink.style.display = 'none';
                    document.body.appendChild(fallbackLink);
                    try {
                        fallbackLink.click();
                    } catch (error) {
                        console.warn('⚠️ Error opening UPI app from button:', error);
                    }
                    setTimeout(() => {
                        document.body.removeChild(fallbackLink);
                    }, 100);
                };
            }
        }, 2500);
    }
    
    // Also allow clicking outside to close (remove old listeners first)
    const oldHandler = modal._closeHandler;
    if (oldHandler) {
        modal.removeEventListener('click', oldHandler);
    }
    
    const closeOnClick = function(e) {
        if (e.target === modal) {
            closePaymentInstructionsModal();
        }
    };
    modal._closeHandler = closeOnClick;
    modal.addEventListener('click', closeOnClick);
}

function closePaymentInstructionsModal() {
    const modal = document.getElementById('payment-instructions-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('✅ Payment instructions modal closed');
    }
}

// Make function globally accessible for onclick handlers
window.closePaymentInstructionsModal = closePaymentInstructionsModal;

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

