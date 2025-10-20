document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const productsBody = document.getElementById('productsBody');
    const form = document.getElementById('purchaseForm');
    const saveDraftBtn = document.getElementById('saveDraftBtn');

    // Close modal functionality
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        overlay.style.display = 'none';
    }

    // Add product row functionality
    addProductBtn.addEventListener('click', function() {
        const newRow = document.createElement('div');
        newRow.className = 'table-row';
        newRow.innerHTML = `
            <div class="col-product">
                <select name="product[]">
                    <option value="">Select product</option>
                    <option value="product1">Product 1</option>
                    <option value="product2">Product 2</option>
                    <option value="product3">Product 3</option>
                </select>
            </div>
            <div class="col-quantity">
                <input type="number" name="quantity[]" placeholder="0" min="0" step="1">
            </div>
            <div class="col-price">
                <input type="number" name="unitPrice[]" placeholder="0.00" min="0" step="0.01">
            </div>
            <div class="col-total">
                <input type="text" name="total[]" placeholder="0.00" readonly>
            </div>
        `;
        productsBody.appendChild(newRow);
        
        // Add event listeners for calculation
        addCalculationListeners(newRow);
    });

    // Calculate total for each product row
    function addCalculationListeners(row) {
        const quantityInput = row.querySelector('input[name="quantity[]"]');
        const priceInput = row.querySelector('input[name="unitPrice[]"]');
        const totalInput = row.querySelector('input[name="total[]"]');

        function calculateTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = quantity * price;
            totalInput.value = total.toFixed(2);
        }

        quantityInput.addEventListener('input', calculateTotal);
        priceInput.addEventListener('input', calculateTotal);
    }

    // Add calculation listeners to existing rows
    document.querySelectorAll('.table-row').forEach(addCalculationListeners);

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        console.log('Form submitted:', data);
        alert('Purchase request submitted successfully!');
        closeModal();
    });

    // Save as draft
    saveDraftBtn.addEventListener('click', function() {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        console.log('Draft saved:', data);
        alert('Draft saved successfully!');
    });

    // Show modal on page load (for demo purposes)
    overlay.style.display = 'flex';
});