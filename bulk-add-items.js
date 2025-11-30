// All items to add to the database
const itemsToAdd = [
    {
        name: "Kitchen cabinets and storage with slab",
        description: "Kitchen storage solution with slab",
        total: 32000
    },
    {
        name: "Aluminum wardrobe (200cms x 206cms, Sliding)",
        description: "Large sliding aluminum wardrobe",
        total: 37000
    },
    {
        name: "Diwan cot / Sofa-cum-bed (basic)",
        description: "Basic sofa that converts to bed",
        total: 7000
    },
    {
        name: "Single cot / Metal folding cot",
        description: "Metal folding single cot",
        total: 4500,
        quantity: 2
    },
    {
        name: "Mattress (single) 3ft - foam",
        description: "Single foam mattress 3ft",
        total: 4500,
        quantity: 2
    },
    {
        name: "Cot bed sheets set (2) + pillow covers",
        description: "Bed sheets and pillow covers set",
        total: 800,
        quantity: 2
    },
    {
        name: "Blankets",
        description: "Warm blankets",
        total: 1000,
        quantity: 2
    },
    {
        name: "Pillows",
        description: "Comfortable pillows",
        total: 500,
        quantity: 2
    },
    {
        name: "Daily-wear clothes (5 items/person)",
        description: "Daily wear clothing set",
        total: 1500,
        quantity: 2
    },
    {
        name: "Outside-wear (2 sets each) - better quality",
        description: "Quality outside wear clothing",
        total: 1500,
        quantity: 2
    },
    {
        name: "Mixer Grinder (basic 750W - 1000W)",
        description: "Basic mixer grinder for kitchen",
        total: 3000
    },
    {
        name: "Gas Stove (2-burner, ISI certified)",
        description: "2-burner ISI certified gas stove",
        total: 2500
    },
    {
        name: "Cooking utensils set (5-7 pcs) - stainless/non-stick",
        description: "Complete cooking utensils set",
        total: 1800
    },
    {
        name: "Small pressure cooker (3-5L)",
        description: "Small pressure cooker for cooking",
        total: 1400
    },
    {
        name: "Foldable dining table (2-4 seater)",
        description: "Foldable dining table",
        total: 7500
    },
    {
        name: "Basic kitchen set (plates, glasses, spoons)",
        description: "Basic kitchenware set",
        total: 1200
    },
    {
        name: "Cleaning kit (broom, mop, bucket, dustbin)",
        description: "Essential cleaning supplies",
        total: 800
    },
    {
        name: "Towels",
        description: "Bath towels",
        total: 250,
        quantity: 2
    },
    {
        name: "LED tube / Lamp + small electric kettle",
        description: "LED lighting and electric kettle",
        total: 1800
    },
    {
        name: "Mosquito net / basic safety items",
        description: "Mosquito net and safety items",
        total: 800
    },
    {
        name: "Transport & minor furnishing (curtains, mats)",
        description: "Transportation and furnishing items",
        total: 4000
    },
    {
        name: "Contingency / local purchase buffer",
        description: "Contingency fund for local purchases",
        total: 5000
    },
    {
        name: "Chairs",
        description: "Comfortable chairs",
        total: 3750,
        quantity: 2
    },
    {
        name: "32 inches TV",
        description: "32 inch television",
        total: 17000
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Display items list
    const itemsListEl = document.getElementById('items-list');
    itemsListEl.innerHTML = itemsToAdd.map((item, index) => {
        const qty = item.quantity || 1;
        const totalPrice = item.total * qty;
        return `
            <div class="flex justify-between items-center p-2 border-b border-red-100">
                <div>
                    <span class="font-medium">${index + 1}. ${escapeHtml(item.name)}</span>
                    ${qty > 1 ? `<span class="text-gray-600 text-xs ml-2">(Qty: ${qty})</span>` : ''}
                </div>
                <span class="font-bold text-red-600">₹${formatCurrency(totalPrice)}</span>
            </div>
        `;
    }).join('');

    // Add total
    const grandTotal = itemsToAdd.reduce((sum, item) => {
        return sum + (item.total * (item.quantity || 1));
    }, 0);
    itemsListEl.innerHTML += `
        <div class="flex justify-between items-center p-2 mt-4 pt-4 border-t-2 border-red-300">
            <span class="font-bold text-lg">Total:</span>
            <span class="font-bold text-xl text-red-600">₹${formatCurrency(grandTotal)}</span>
        </div>
    `;

    // Add button handler
    document.getElementById('add-all-items').addEventListener('click', addAllItems);
});

async function addAllItems() {
    const button = document.getElementById('add-all-items');
    const statusEl = document.getElementById('status');
    
    button.disabled = true;
    button.textContent = '⏳ Adding items...';
    statusEl.innerHTML = '<p class="text-blue-600">Starting to add items...</p>';

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
        for (let i = 0; i < itemsToAdd.length; i++) {
            const item = itemsToAdd[i];
            const qty = item.quantity || 1;
            const totalPrice = item.total * qty;

            try {
                // Create single item with total price (quantity * unit price)
                const itemName = qty > 1 ? `${item.name} (Qty: ${qty})` : item.name;
                const itemRef = database.ref('items').push();
                await itemRef.set({
                    name: itemName,
                    description: item.description,
                    total: totalPrice, // Total price for all quantities
                    donated: 0,
                    status: 'available',
                    donors: {},
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
                successCount++;

                statusEl.innerHTML = `
                    <p class="text-green-600">✅ Added: ${item.name} (${i + 1}/${itemsToAdd.length})</p>
                `;
            } catch (error) {
                console.error(`Error adding ${item.name}:`, error);
                errors.push(`${item.name}: ${error.message}`);
                errorCount++;
            }
        }

        // Final status
        if (errorCount === 0) {
            statusEl.innerHTML = `
                <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <p class="text-green-800 font-bold text-lg">🎉 Success!</p>
                    <p class="text-green-700">All ${successCount} items added successfully!</p>
                    <p class="text-sm text-green-600 mt-2">Go to <a href="index.html" class="underline">Home</a> or <a href="admin.html" class="underline">Admin Dashboard</a> to see them.</p>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                    <p class="text-yellow-800 font-bold">⚠️ Partial Success</p>
                    <p class="text-yellow-700">Added ${successCount} items, ${errorCount} errors</p>
                    <details class="mt-2">
                        <summary class="cursor-pointer text-sm text-yellow-600">View errors</summary>
                        <ul class="list-disc list-inside mt-2 text-sm text-yellow-700">
                            ${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
                        </ul>
                    </details>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        statusEl.innerHTML = `
            <div class="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p class="text-red-800 font-bold">❌ Error</p>
                <p class="text-red-700">${escapeHtml(error.message)}</p>
            </div>
        `;
    } finally {
        button.disabled = false;
        button.textContent = '➕ Add All Items to Database';
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

