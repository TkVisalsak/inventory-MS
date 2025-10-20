// Product data
const products = [
    { id: "1", name: "Paracetamol 500mg", price: 2.5, stock: 150, category: "Medicine" },
    { id: "2", name: "Vitamin C Tablets", price: 8.99, stock: 75, category: "Supplements" },
    { id: "3", name: "Hand Sanitizer", price: 3.25, stock: 200, category: "Health" },
    { id: "4", name: "Face Masks (Pack of 10)", price: 12.5, stock: 50, category: "Health" },
    { id: "5", name: "Thermometer", price: 15.99, stock: 25, category: "Equipment" },
    { id: "6", name: "Bandages", price: 4.75, stock: 100, category: "First Aid" },
    { id: "7", name: "Aspirin 325mg", price: 3.99, stock: 80, category: "Medicine" },
    { id: "8", name: "Cough Syrup", price: 7.25, stock: 45, category: "Medicine" }
];

// Global state
let cart = [];
let viewMode = 'list';
let filteredProducts = [...products];

// DOM elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const productsContainer = document.getElementById('productsContainer');
const cartItems = document.getElementById('cartItems');
const checkoutSection = document.getElementById('checkoutSection');
const customerPriority = document.getElementById('customerPriority');
const requestStatus = document.getElementById('requestStatus');
const priorityDisplay = document.getElementById('priorityDisplay');
const priorityBadge = document.getElementById('priorityBadge');
const statusBadge = document.getElementById('statusBadge');
const paymentMethod = document.getElementById('paymentMethod');
const completeSaleBtn = document.getElementById('completeSale');

// Event listeners
searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
customerPriority.addEventListener('change', updatePriorityDisplay);
requestStatus.addEventListener('change', updatePriorityDisplay);
paymentMethod.addEventListener('change', updateCheckoutButton);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCart();
});

// Filter products
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    renderProducts();
}

// Set view mode
function setViewMode(mode) {
    viewMode = mode;
    document.getElementById('gridView').classList.toggle('active', mode === 'grid');
    document.getElementById('listView').classList.toggle('active', mode === 'list');
    renderProducts();
}

// Render products
function renderProducts() {
    if (viewMode === 'grid') {
        renderProductsGrid();
    } else {
        renderProductsList();
    }
}

function renderProductsGrid() {
    const html = `
        <div class="products-grid">
            ${filteredProducts.map(product => `
                <div class="product-card" onclick="addToCart('${product.id}')">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-stock ${product.stock > 10 ? 'stock-good' : 'stock-low'}">
                        ${product.stock} in stock
                    </div>
                    <button class="btn btn-primary btn-sm btn-full" ${product.stock === 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    productsContainer.innerHTML = html;
}

function renderProductsList() {
    const html = `
        <div class="products-list">
            <table class="table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredProducts.map(product => `
                        <tr>
                            <td class="product-name">${product.name}</td>
                            <td>${product.category}</td>
                            <td class="product-price">$${product.price.toFixed(2)}</td>
                            <td>
                                <span class="product-stock ${product.stock > 10 ? 'stock-good' : 'stock-low'}">
                                    ${product.stock}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>
                                    Add to Cart
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    productsContainer.innerHTML = html;
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock
        });
    }
    
    updateCart();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity === 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart empty-icon"></i>
                <p>Cart is empty</p>
            </div>
        `;
        checkoutSection.style.display = 'none';
    } else {
        renderCartItems();
        checkoutSection.style.display = 'block';
        updateTotals();
    }
    updateCheckoutButton();
}

function renderCartItems() {
    const html = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-header">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <button class="btn-icon btn-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})" ${item.quantity >= item.stock ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
    
    cartItems.innerHTML = html;
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    completeSaleBtn.textContent = `Complete Sale - $${total.toFixed(2)}`;
}

// Priority and status functions
function updatePriorityDisplay() {
    const priority = customerPriority.value;
    const status = requestStatus.value;
    
    if (priority || status) {
        priorityDisplay.style.display = 'block';
        
        if (priority) {
            priorityBadge.textContent = priority;
            priorityBadge.className = `badge badge-${priority.toLowerCase()}`;
        }
        
        if (status) {
            statusBadge.textContent = status;
            statusBadge.className = `badge badge-${status.toLowerCase()}`;
        }
    } else {
        priorityDisplay.style.display = 'none';
    }
    
    updateCheckoutButton();
}

function updateCheckoutButton() {
    const hasPayment = paymentMethod.value !== '';
    const hasPriority = customerPriority.value !== '';
    const hasItems = cart.length > 0;
    
    completeSaleBtn.disabled = !hasPayment || !hasPriority || !hasItems;
}

// Complete sale
function completeSale() {
    const priority = customerPriority.value;
    const status = requestStatus.value;
    const payment = paymentMethod.value;
    
    if (!priority || !payment || cart.length === 0) {
        alert('Please fill in all required fields');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    const saleData = {
        items: cart,
        customer: {
            priority: priority,
        },
        request: {
            status: status,
            priority: priority,
        },
        payment: {
            method: payment,
            subtotal: subtotal,
            tax: tax,
            total: total
        },
        timestamp: new Date().toISOString()
    };
    
    console.log('Processing sale:', saleData);
    
    // Reset form
    cart = [];
    customerPriority.value = '';
    requestStatus.value = 'DRAFT';
    paymentMethod.value = '';
    priorityDisplay.style.display = 'none';
    
    updateCart();
    
    alert(`Sale completed successfully!\nPriority: ${priority}\nStatus: ${status}\nTotal: $${total.toFixed(2)}`);
}

// Modal functions
function showInventory() {
    document.getElementById('inventoryModal').style.display = 'block';
}

function closeInventory() {
    document.getElementById('inventoryModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('inventoryModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}