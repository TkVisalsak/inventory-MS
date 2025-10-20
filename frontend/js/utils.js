// Utility functions
window.utils = {
  formatCurrency: (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  },

  formatDate: (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  },

  showNotification: (message, type = "info") => {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `

    switch (type) {
      case "success":
        notification.style.backgroundColor = "#10b981"
        break
      case "error":
        notification.style.backgroundColor = "#ef4444"
        break
      case "warning":
        notification.style.backgroundColor = "#f59e0b"
        break
      default:
        notification.style.backgroundColor = "#3b82f6"
    }

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  },

  animateNumber: (element, finalValue) => {
    if (!element) return

    const isPrice = finalValue.includes("$")
    const isPercentage = finalValue.includes("%")
    const numericValue = Number.parseFloat(finalValue.replace(/[$,%]/g, ""))

    if (isNaN(numericValue)) {
      element.textContent = finalValue
      return
    }

    const duration = 1000
    const steps = 60
    const increment = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment

      if (current >= numericValue) {
        current = numericValue
        clearInterval(timer)
      }

      if (isPrice) {
        element.textContent = `$${current.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      } else if (isPercentage) {
        element.textContent = `${current.toFixed(1)}%`
      } else {
        element.textContent = Math.floor(current).toLocaleString()
      }
    }, duration / steps)
  },

  // Debounce function for search inputs
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },

  // Generate random ID
  generateId: () => {
    return Math.random().toString(36).substr(2, 9)
  },
}

// Global function for activity log export
function exportActivityLog() {
  window.utils.showNotification("Activity log exported successfully!", "success")
}

// Enhanced modal functions with actual forms

function opendeductstock() {
  const fields = [
    { type: "text", name: "name", label: "Product Name", placeholder: "Enter product name", required: true },
    { type: "text", name: "sku", label: "SKU", placeholder: "Enter SKU code", required: true },
    {
      type: "select",
      name: "company",
      label: "Company",
      placeholder: "Select company",
      required: true,
      options: [
        { value: "PharmaCorp Ltd", label: "PharmaCorp Ltd" },
        { value: "FoodTech Industries", label: "FoodTech Industries" },
        { value: "MediSupply Co", label: "MediSupply Co" },
      ],
    },
    {
      type: "select",
      name: "category",
      label: "Category",
      placeholder: "Select category",
      required: true,
      options: [
        { value: "Medicines", label: "Medicines" },
        { value: "Food Items", label: "Food Items" },
        { value: "Medical Equipment", label: "Medical Equipment" },
        { value: "Supplements", label: "Supplements" },
      ],
    },
    { type: "text", name: "unit", label: "Unit", placeholder: "e.g., tablet, kg, piece", required: true },
    { type: "number", name: "buyPrice", label: "Buy Price ($)", placeholder: "0.00", required: true },
    { type: "number", name: "marketPrice", label: "Market Price ($)", placeholder: "0.00", required: true },
    { type: "textarea", name: "description", label: "Description", placeholder: "Product description (optional)" },
  ];

  window.modalManager.showFormModal(
    "Add New Product",
    fields,
    async (data) => {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          window.utils.showNotification(`Error: ${errorData.message || 'Failed to add product.'}`, 'error');
          return false; // keep modal open on error
        }

        window.utils.showNotification(`Product "${data.name}" added successfully!`, "success");
        return true; // close modal on success
      } catch (error) {
        window.utils.showNotification(`Network error: ${error.message}`, "error");
        return false; // keep modal open on network error
      }
    },
    { width: "600px", submitText: "Add Product" }
  );
}


function openAddCategoryModal() {
  const fields = [
    { type: "text", name: "name", label: "Category Name", placeholder: "Enter category name", required: true },
    { type: "textarea", name: "description", label: "Description", placeholder: "Enter description", required: true },
  ];

  window.modalManager.showFormModal("Add New Category", fields, async (data) => {
    console.log("Submitting category:", data); // ✅ Debug log
    try {
      const response = await fetch(window.getApiUrl("/api/inventory/addcategory"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        window.utils.showNotification(`❌ ${result.message}`, "error");
        return false;
      }

      window.utils.showNotification(`✅ Category "${data.name}" added successfully!`, "success");
      return true;
    } catch (err) {
      window.utils.showNotification(`❌ Network error: ${err.message}`, "error");
      return false;
    }
  });
}

function openAddCompanyModal() {
  const fields = [
    { type: "text", name: "name", label: "Company Name", placeholder: "Enter company name", required: true },
    // { type: "email", name: "email", label: "Contact Email", placeholder: "contact@company.com", required: true },
    { type: "tel", name: "contact_info", label: "Phone", placeholder: "+1-555-0000" },
    { type: "textarea", name: "address", label: "Address", placeholder: "Company address", required: true },
    // { type: "text", name: "website", label: "Website", placeholder: "https://company.com" },
    // { type: "textarea", name: "notes", label: "Notes", placeholder: "Additional information" },
  ];
window.modalManager.showFormModal("Add New supplier", fields, async (data) => {
    console.log("Company data:", data); // ✅ Debug log
    try {
      const response = await fetch(window.getApiUrl("/api/inventory/addsupplier"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        window.utils.showNotification(`❌ ${result.message}`, "error");
        return false;
      }

      window.utils.showNotification(`✅ Category "${data.name}" added successfully!`, "success");
      return true;
    } catch (err) {
      window.utils.showNotification(`❌ Network error: ${err.message}`, "error");
      return false;
    }
  });inventory
}


window.PageModules = window.PageModules || {}
window.PageModules.productMap = {}

async function openAddBatchModal() {
  let productOptions = []

  try {
    const res = await fetch(window.getApiUrl("/api/inventory/getproducts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })

    if (!res.ok) throw new Error("Failed to fetch products")

    const products = await res.json()

    productOptions = products.map(p => ({
      value: p.id,
      label: p.name,
    }))
    // console.log("Product options:", productOptions)

    // Store productMap globally
    window.PageModules.productMap = {}
    products.forEach(p => {
      window.PageModules.productMap[p.name] = p.id
    })

  } catch (err) {
    console.error("Error loading products for batch form:", err)
    productOptions = []
  }

  const fields = [
    {
      type: "select",
      name: "product",
      label: "Product",
      placeholder: "Select product",
      required: true,
      options: productOptions,
    },
    { type: "text", name: "batchNumber", label: "Batch Number", placeholder: "Enter batch number", required: true },
    { type: "date", name: "expirationDate", label: "Expiration Date", required: true },
    { type: "number", name: "quantity", label: "Quantity", placeholder: "0", required: true },
    { type: "number", name: "buyPrice", label: "Buy Price ($)", placeholder: "0.00", required: true },
    { type: "number", name: "marketPrice", label: "Market Price ($)", placeholder: "0.00", required: true },
    { type: "text", name: "location", label: "Storage Location", placeholder: "e.g., A1-B2" },
  ]

  window.modalManager.showFormModal(
    "Add New Batch",
    fields,
    async (data) => {
      // console.log("Form data submitted:", data);
      // console.log("Selected product:", data.product);

      try {
        const productId = window.PageModules.productMap[data.product] ?? data.product;

          const parsedProductId = Number(productId);
          if (!parsedProductId || isNaN(parsedProductId)) {
            window.utils.showNotification(`Invalid product selected`, "error");
  

  return false;
}

const postData = {
  product_id: parsedProductId,
  batch_number: data.batchNumber,
  expiration_date: data.expirationDate,
  current_quantity: parseInt(data.quantity, 10),
  buy_price: parseFloat(data.buyPrice),
  market_price: parseFloat(data.marketPrice),
  warehouse_location: data.location || null,
};



        const response = await fetch(window.getApiUrl("/api/inventory/addbatch"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(postData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to add batch")
        }

        window.utils.showNotification(`Batch "${data.batchNumber}" added successfully!`, "success")

        if (window.PageModules.batches) {
          await window.PageModules.batches.init()
        }

        return true
      } catch (err) {
        window.utils.showNotification(`Error: ${err.message}`, "error")
        return false
      }
    },
    { width: "600px" }
  )
}

function openAddCustomerModal() {
  const fields = [
    { type: "text", name: "name", label: "Customer Name", placeholder: "Enter customer name", required: true },
    {
      type: "text",
      name: "type",
      label: "Customer Type",
      placeholder: "Enter customer type",
      required: true,
    },
    { type: "email", name: "email", label: "Email", placeholder: "customer@example.com", required: true },
    { type: "tel", name: "phone", label: "Phone", placeholder: "+1-555-0000", required: true },
    { type: "number", name: "creditLimit", label: "Credit Limit ($)", placeholder: "0.00", required: true },
    { type: "textarea", name: "address", label: "Address", placeholder: "Customer address" },
  ];

  window.modalManager.showFormModal(
    "Add New Customer",
    fields,
    async (data) => {
      try {
        const payload = {
          name: data.name,
          customer_type: data.type,  // Now free text
          email: data.email,
          phone: data.phone,
          credit_limit: parseFloat(data.creditLimit),
          address: data.address || null,
        };

        const response = await fetch(window.getApiUrl("/api/inventory/addCustomer"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add customer");
        }

        const result = await response.json();
        window.utils.showNotification(`✅ Customer "${result.name}" added successfully!`, "success");
         if (window.PageModules.customers?.init) {
          await window.PageModules.customers.init();
        }
        return true; // Close modal
      } catch (err) {
        console.error("❌ Error adding customer:", err.message);
        window.utils.showNotification(`❌ ${err.message}`, "error");
        return false; // Keep modal open
      }
    },
    { width: "600px" }
  );
}



async function openRecordMovementModal() {
  let productOptions = [];

  try {
    const res = await fetch(window.getApiUrl("/api/inventory/getproducts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error("Failed to fetch products");

    const products = await res.json();

    productOptions = products.map((p) => ({
      value: p.id,
      label: p.name,
    }));

    // Store for mapping later
    window.PageModules.productMap = {};
    products.forEach((p) => {
      window.PageModules.productMap[p.name] = p.id;
    });

  } catch (err) {
    console.error("Error loading products for movement form:", err);
    productOptions = [];
  }

  const fields = [
    {
      type: "select",
      name: "product",
      label: "Product",
      placeholder: "Select product",
      required: true,
      options: productOptions,
    },
    {
      type: "select",
      name: "type",
      label: "Movement Type",
      placeholder: "Select type",
      required: true,
      options: [
        { value: "IN", label: "Stock In" },
        { value: "OUT", label: "Stock Out" },
        { value: "ADJUSTMENT", label: "Adjustment" },
      ],
    },
    { type: "number", name: "quantity", label: "Quantity", placeholder: "0", required: true },
    { type: "text", name: "reference", label: "Reference", placeholder: "e.g., PO-2024-001", required: true },
    { type: "textarea", name: "note", label: "Note", placeholder: "Movement description" },
  ];

  window.modalManager.showFormModal(
    "Record Stock Movement",
    fields,
    async (data) => {
      try {
        const productId = window.PageModules.productMap[data.product] ?? data.product;
        const parsedProductId = Number(productId);

        if (!parsedProductId || isNaN(parsedProductId)) {
          window.utils.showNotification(`Invalid product selected`, "error");
          return false;
        }

        // 🔄 Fetch latest batch for this product
        const batchRes = await fetch(window.getApiUrl(`/api/inventory/getLatestBatchByProductId?product_id=${parsedProductId}`));
        if (!batchRes.ok) throw new Error("Failed to fetch latest batch");

        const batchData = await batchRes.json();
        if (!batchData.batch_id) {
          window.utils.showNotification(`No batch found for selected product`, "error");
          return false;
        }

        const postData = {
          batch_id: batchData.batch_id,
          movement_type: data.type,
          quantity: parseInt(data.quantity, 10),
          reference: data.reference,
          note: data.note || "",
        };

        const response = await fetch(window.getApiUrl("/api/inventory/addmovement"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to record movement");
        }

        window.utils.showNotification(`Stock movement recorded successfully!`, "success");

        // Optionally refresh table if module exists
if (window.PageModules.movements && typeof window.PageModules.movements.init === "function") {
  await window.PageModules.movements.init();
}



        return true;
      } catch (err) {
        window.utils.showNotification(`Error: ${err.message}`, "error");
        return false;
      }
    },
    { width: "600px" }
  );
}


window.PageModules = window.PageModules || {}
window.PageModules.productMap = {}
window.PageModules.customerMap = {}

async function openProcessReturnModal() {
  let productOptions = [];
  let customerOptions = [];

  try {
    // Fetch products
    const productRes = await fetch(window.getApiUrl("/api/inventory/getproducts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    if (!productRes.ok) throw new Error("Failed to fetch products");
    const products = await productRes.json();

    productOptions = products.map(p => ({
      value: p.name,
      label: p.name
    }));

    window.PageModules.productMap = {};
    products.forEach(p => {
      window.PageModules.productMap[p.name] = p.id;
    });

    // Fetch customers
    const customerRes = await fetch(window.getApiUrl("/api/inventory/getAllCustomers"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    if (!customerRes.ok) throw new Error("Failed to fetch customers");
    const customers = await customerRes.json();

    customerOptions = customers.map(c => ({
      value: c.name,
      label: c.name
    }));

    window.PageModules.customerMap = {};
    customers.forEach(c => {
      window.PageModules.customerMap[c.name] = c.id;
    });

  } catch (err) {
    console.error("❌ Error loading return modal data:", err);
    window.utils.showNotification("Failed to load products or customers", "error");
    return;
  }

  const fields = [
    {
      type: "select",
      name: "customer",
      label: "Customer",
      placeholder: "Select customer",
      required: true,
      options: customerOptions,
      attributes: { "data-tom-select": "true" }
    },
    {
      type: "select",
      name: "product",
      label: "Product",
      placeholder: "Select product",
      required: true,
      options: productOptions,
      attributes: { "data-tom-select": "true" }
    },
    { type: "number", name: "quantity", label: "Quantity", placeholder: "0", required: true },
    {
      type: "select",
      name: "reason",
      label: "Return Reason",
      placeholder: "Select reason",
      required: true,
      options: [
        { value: "Damaged packaging", label: "Damaged packaging" },
        { value: "Wrong product delivered", label: "Wrong product delivered" },
        { value: "Expired product", label: "Expired product" },
        { value: "Quality issue", label: "Quality issue" },
        { value: "Other", label: "Other" }
      ],
      attributes: { "data-tom-select": "true" }
    },
    { type: "number", name: "refundAmount", label: "Refund Amount ($)", placeholder: "0.00", required: true },
    { type: "textarea", name: "notes", label: "Additional Notes", placeholder: "Return details" }
  ];

  window.modalManager.showFormModal(
    "Process Return",
    fields,
    async (data) => {
      try {
        const customerId = window.PageModules.customerMap[data.customer] ?? data.customer;
        const productId = window.PageModules.productMap[data.product] ?? data.product;

        const parsedCustomerId = Number(customerId);
        const parsedProductId = Number(productId);

        if (!parsedCustomerId || isNaN(parsedCustomerId) || !parsedProductId || isNaN(parsedProductId)) {
          window.utils.showNotification("Invalid customer or product selected", "error");
          return false;
        }

        const postData = {
          customer_id: parsedCustomerId,
          product_id: parsedProductId,
          quantity: parseInt(data.quantity, 10),
          reason: data.reason,
          refund_amount: parseFloat(data.refundAmount),
          notes: data.notes || null
        };

        const res = await fetch(window.getApiUrl("/api/inventory/returnGood"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to process return");
        }

        const result = await res.json();
        window.utils.showNotification(`Return processed successfully! ID: ${result.return_id}`, "success");

        if (window.PageModules["return-goods"] && typeof window.PageModules["return-goods"].init === "function") {
          await window.PageModules["return-goods"].init();
        }

        return true;

      } catch (err) {
        window.utils.showNotification(`Error: ${err.message}`, "error");
        return false;
      }
    },
    { width: "600px" }
  );

  // Apply Tom Select enhancement after DOM is rendered
  setTimeout(() => {
    document.querySelectorAll('select[data-tom-select="true"]').forEach(el => {
      new TomSelect(el, {
        create: false,
        sortField: {
          field: "text",
          direction: "asc"
        },
        maxOptions: 1000,
        placeholder: el.getAttribute("placeholder") || "Select an option"
      });
    });
  }, 50);
}

// purchase request module





// 👇 Global binding for onclick usage
// window.openCreatePurchaseRequestModal = openCreatePurchaseRequestModal;


function openAddUserModal() {
  const fields = [
     { type: "text", name: "username", label: "Username", placeholder: "Enter username", required: true },
    { type: "text", name: "full_name", label: "Full Name", placeholder: "Enter full name", required: true },
    { type: "email", name: "email", label: "Email", placeholder: "user@company.com", required: true },
    {
      type: "select",
      name: "role",
      label: "Role",
      placeholder: "Select role",
      required: true,
      options: [
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "operator", label: "Operator" },
      ],
    },
    { type: "text", name: "department", label: "Department", placeholder: "e.g., IT, Operations", required: true },
    { type: "password", name: "password", label: "Password", placeholder: "Enter password", required: true },
    {
      type: "password",
      name: "confirmPassword",
      label: "Confirm Password",
      placeholder: "Confirm password",
      required: true,
    },
  ];

  window.modalManager.showFormModal("Add New User", fields, async (data) => {
    if (data.password !== data.confirmPassword) {
      window.utils.showNotification("Passwords do not match!", "error");
      return false;
    }

    try {
      const res = await fetch(window.getApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          full_name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          department: data.department,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Signup failed");
      }

      window.utils.showNotification(`User "${data.name}" added successfully!`, "success");
      if (window.PageModules?.users?.init) window.PageModules.users.init();
      return true;
    } catch (err) {
      window.utils.showNotification(err.message || "Request failed", "error");
      return false;
    }
  });
}


