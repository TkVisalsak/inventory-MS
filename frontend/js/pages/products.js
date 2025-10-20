window.PageModules = window.PageModules || {};

window.PageModules.products = {
  productsData: [],
  selectedProduct: null,
  currentView: "list",

  init: async function () {

    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getproducts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const products = await res.json();
      if (!Array.isArray(products)) throw new Error("Invalid product data");

      this.productsData = products;
      this.currentView = "list";
      
      this.render();
      await this.loadcategories()
      await this.loadSuppliers();
    } catch (err) {
      console.error("❌ Failed to load products:", err.message);
      const container = document.getElementById("pageContent");
      if (container) {
        container.innerHTML = `<div class="error-message">Failed to load product list.</div>`;
      }
    }
  },
    loadBatches: async function (productId) {
      try {
        const res = await fetch(window.getApiUrl(`/api/inventory/getbatchesbyid?product_id=${productId}`), {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        const batches = await res.json();
        if (!Array.isArray(batches)) throw new Error("Invalid batch data");
        this.batchesData = batches;
        this.currentView = "list";
        this.renderBatches(batches);  // You need to implement renderBatches()
      } catch (err) {
        console.error("❌ Failed to load batches:", err.message);
        document.getElementById("batch-body").innerHTML = `
          <tr><td colspan="9">Failed to load batches.</td></tr>
        `;
      }
    },
    loadMovements: async function (productId) {
      try {
        const res = await fetch(window.getApiUrl(`/api/inventory/getMovementsByProductId?product_id=${productId}`), {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        const movement = await res.json();
        if (!Array.isArray(movement)) throw new Error("Invalid movement data");
        this.movementData = movement;
        this.currentView = "list";
        this.renderMovement(movement);
        console.log("Movement data loaded:", movement);
      } catch (err) {
        console.error("❌ Failed to load movement:", err.message);
        document.getElementById("movementTableBody").innerHTML = `
          <tr><td colspan="9">Failed to load movement.</td></tr>
        `;
      }
    },
loadcategories: async function () {
  try {
    const res = await fetch(window.getApiUrl(`/api/inventory/getcategories`), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const categories = await res.json();
    if (!Array.isArray(categories)) throw new Error("Invalid categories data");
    this.categoriesData = categories;

    // Inject category options into filter dropdown
    const filterSelect = document.getElementById("categoryFilter");
    if (filterSelect) {
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.name;
        option.textContent = cat.name;
        filterSelect.appendChild(option);
      });
    }

    console.log("📦 Categories loaded:", categories);
  } catch (err) {
    console.error("❌ Failed to load categories:", err.message);
    const body = document.getElementById("categories-body");
    if (body) {
      body.innerHTML = `<tr><td colspan="9">Failed to load categories.</td></tr>`;
    }
  }

},
loadSuppliers: async function () {
  try {
    const res = await fetch(window.getApiUrl(`/api/inventory/getsuppliers`), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const suppliers = await res.json();
    if (!Array.isArray(suppliers)) throw new Error("Invalid suppliers data");

    this.suppliersData = suppliers;
    this.populateSupplierFilter();
    console.log("🚚 Suppliers loaded:", suppliers);

  } catch (err) {
    console.error("❌ Failed to load suppliers:", err.message);
  }
},





  render: function () {
    const container = document.getElementById("pageContent");
    if (!container) return;

    if (this.currentView === "list") {
      container.innerHTML = `
      
        <div class="dashboard-header">
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>

        <div class="page-controls">
          <div class="search-filters">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search products..." id="productSearch">
            </div>
              <div class="filter-group">
                  <select id="categoryFilter" class="filter-select">
                    <option value="">All Categories</option>
                    <!-- options will be injected dynamically -->
                  </select>
                  <select id="supplierFilter" class="filter-select">
                    <option value="">All Companies</option>
                    <!-- options will be injected dynamically -->
                  </select>

                </div>
          </div>
  
          <button class="btn btn-primary" onclick="openAddProductModal()">
            <i class="fas fa-plus"></i> Add Product
          </button>
        </div>

        <div class="content-section">
          <div class="data-table-container">
            <table class="data-table" id="productsTable">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      `;
      
        Promise.all([
          this.loadcategories(),
          this.loadSuppliers()
        ]).then(() => {
          this.setupEventListeners();
          this.applyFilters(); // ✅ re-applies filters after dropdowns are filled
        });


    } else if (this.currentView === "details" && this.selectedProduct) {
      const p = this.selectedProduct;
      container.innerHTML = `
             <div class="dashboard-header">
          <h1>Product: ${p.name}</h1>
          <button class="btn btn-secondary" id="backToProductList">
            <i class="fas fa-arrow-left"></i> Back to List
          </button>
        </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
          <div class="stat-content">
            <h3>Total Quantity</h3>
            <div class="stat-number" id="totalRequests">0</div>
            <p>Currently</p>
          </div>
        </div>
        <div class="stat-card ">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-content">
            <h3>Total Value</h3>
            <div class="stat-number" id="pendingApproval">$0.00</div>
            <p>Buy In Price</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
          <div class="stat-content">
            <h3>Expiring Alert</h3>
            <div class="stat-number" id="totalValue">1</div>
            <p>Expire Within 1 month</p>
          </div>
        </div>
        <div class="stat-card ">
          <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-content">
            <h3>Expired Alert</h3>
            <div class="stat-number" id="urgentRequests">0</div>
            <p>Expired</p>
          </div>
        </div>
      </div>
 

 <div class="content-section">
  <h2>Product Information</h2> <br>
  <div class="data-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Supplier</th>
          <th>Category</th>
          <th>Unit</th>
          <th>Status</th>
          <th>Buy-In Price</th>
          <th>Market Price</th>
          <th>Stock</th>
          <th>Total Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${p.barcode || "-"}</td>
          <td>${p.supplier}</td>
          <td>${p.category}</td>
          <td>${p.unit}</td>
          <td><span class="status-badge ${String(p.availability).toLowerCase()}">${p.availability}</span></td>
          <td>$${Number(p.buy_price).toLocaleString()}</td>
          <td>$${Number(p.market_price).toLocaleString()}</td>
          <td>${Number(p.stock).toLocaleString()}</td>
          <td>$${(p.stock * p.market_price).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

    <div class="dashboard-header">

    </div>
    <div class="content-section">       <h2>Product Batches</h2> <br>
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Batch Number</th>
              <th>Expiration Date</th>
              <th>Buy Price</th>
              <th>Market Price</th>
              <th>Current Stock</th>
              <th>Location</th>
              <th>Scheme</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="batch-body">
            <!-- Dynamic rows will be inserted here -->
          </tbody>
        </table>
      </div>
    </div>
    <div class="dashboard-header">

    </div>
      <div class="content-section">      <h2>Product Movement</h2>  <br>
        <div class="data-table-container">
          <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Batch</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reference</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody id="movementTableBody">
            <tr><td colspan="7">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    


      `;

      this.setupBackButton();
    }
  },

  renderTable: function (products) {
    const tbody = document.querySelector("#productsTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    products.forEach((p) => {
      const row = document.createElement("tr");
      const availabilityStatus = p.availability ? "Available" : "Unavailable";
      const badgeColor = p.availability ? "#dcffdeff" : "rgba(255, 196, 192, 1)"; // light green or light red
      const textColor = p.availability ? "#006400" : "#940000ff"; // dark green or dark red
      const availabilityLabel = p.availability ? "Available" : "Unavailable";



        


      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.barcode || "-"}</td>
        <td>${p.supplier}</td>
        <td>${p.category}</td>
        <td>${p.unit}</td>
<td>
  <span class="status-badge" style="background-color: ${badgeColor}; color: ${textColor}; font-weight: 600;">
    ${availabilityLabel}
  </span>
</td>

        <td><button class=" btn btn-secoundary view-btn " data-product-id="${p.id}">View</button>
        <button class=" btn btn-secoundary edit-btn " data-product-id="${p.id}">Edit</button></td>

      `;

      tbody.appendChild(row);
    });
    this.attachViewButtonListeners();
    this.attachEditButtonListeners();

  },
attachViewButtonListeners: function() {
  const buttons = document.querySelectorAll(".view-btn");
  buttons.forEach((btn) => {
    btn.onclick = (e) => {
      const id = btn.getAttribute("data-product-id");
      this.viewProduct(id);
    };
  });
},
attachEditButtonListeners: function () {
  const buttons = document.querySelectorAll(".edit-btn");
  buttons.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-product-id");
      this.editProduct(id);
    };
  });
},

renderBatches: function (batches) {
  const tbody = document.querySelector("#batch-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (batches.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">No batches found.</td></tr>`;
    return;
  }

  batches.forEach((b) => {
    const row = document.createElement("tr");
    const status = String(b.status || "Unknown").toLowerCase();

    row.innerHTML = `
      <td>${b.product_name || "-"}</td>
      <td>${b.batch_number || "-"}</td>
      <td>${b.expiration_date ? new Date(b.expiration_date).toLocaleDateString() : "-"}</td>
      <td>$${Number(b.buy_price || 0).toLocaleString()}</td>
      <td>$${Number(b.market_price || 0).toLocaleString()}</td>
      <td>${Number(b.current_stock || 0).toLocaleString()}</td>
      <td>${b.location || "-"}</td>
      <td>${b.scheme || "-"}</td>
      <td><span class="status-badge ${status}">${b.status}</span></td>
    `;

    tbody.appendChild(row);
  });
},
renderMovement: function (movements) {
  const tbody = document.querySelector("#movementTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (movements.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No stock movement records found.</td></tr>`;
    return;
  }

  movements.forEach((m) => {
    const row = document.createElement("tr");
    const movementType = String(m.movement_type || "UNKNOWN").toUpperCase();

    let badgeColor = "#ccc";
    let label = movementType;
 
    if (movementType === "IN") {
      badgeColor = "#dcffdeff";
      textColor =  "#006400" ; 
      label = "In";
    } else if (movementType === "OUT") {
      badgeColor = "rgba(255, 196, 192, 1)"; 
      textColor =  "#940000ff" ; 
      label = "Out";
    }

    row.innerHTML = `
      <td>${new Date(m.movement_date).toLocaleString()}</td>
      <td>${m.product_name || "-"}</td>
      <td>${m.batch_number || "-"}</td>
      <td>
        <span class="status-badge" style="background-color: ${badgeColor}; color: ${textColor};">
          ${label}
        </span>
      </td>
      <td>${Number(m.quantity || 0).toLocaleString()}</td>
      <td>${m.reference || "-"}</td>
      <td>${m.note || "-"}</td>
    `;

    tbody.appendChild(row);
  });

},

populateSupplierFilter: function () {
  const filterSelect = document.getElementById("supplierFilter");
  if (!filterSelect || !this.suppliersData) return;

  filterSelect.innerHTML = `<option value="">All Suppliers</option>`;

  this.suppliersData.forEach(s => {
    const option = document.createElement("option");
    option.value = s.name;
    option.textContent = s.name;
    filterSelect.appendChild(option);
  });
},


  setupEventListeners: function () {
     const searchInput = document.getElementById("productSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const supplierFilter = document.getElementById("supplierFilter");

  if (searchInput) {
    searchInput.addEventListener("input", () => this.applyFilters());
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => this.applyFilters());
  }

  if (supplierFilter) {
    supplierFilter.addEventListener("change", () => this.applyFilters());
  }

  },


  setupBackButton: function () {
    const backBtn = document.getElementById("backToProductList");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.currentView = "list";
        this.selectedProduct = null;
        this.render();
      });
    }
  },

viewProduct: function (id) {
  const product = this.productsData.find(p => String(p.id) === String(id));
  if (product) {
    this.selectedProduct = product;
    this.currentView = "details";
    this.render();
    this.loadBatches(id); 
    this.loadMovements(id);
  } else {
    window.utils?.showNotification?.("Product not found", "warning");
  }
},


applyFilters: function () {
  const searchTerm = (document.getElementById("productSearch")?.value || "").toLowerCase();
  const selectedCategory = document.getElementById("categoryFilter")?.value || "";
  const selectedSupplier = document.getElementById("supplierFilter")?.value || "";

  const filtered = this.productsData.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm)) ||
      (p.supplier && p.supplier.toLowerCase().includes(searchTerm));

    const matchesCategory = selectedCategory === "" || p.category === selectedCategory;
    const matchesSupplier = selectedSupplier === "" || p.supplier === selectedSupplier;

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  this.renderTable(filtered);
},

editProduct: async function (id) {
  const product = this.productsData.find(p => String(p.id) === String(id));
  if (!product) {
    window.utils?.showNotification("Product not found", "warning");
    return;
  }

  const categories = this.categoriesData || [];
  const suppliers = this.suppliersData || [];

  const fields = [
    { type: "text", name: "name", label: "Product Name", value: product.name, required: true },
    { type: "text", name: "sku", label: "SKU", value: product.barcode, required: true },
    {
      type: "select", name: "company", label: "Company", required: true,
      value: product.supplier,
      options: suppliers.map(s => ({ value: s.name, label: s.name }))
    },
    {
      type: "select", name: "category", label: "Category", required: true,
      value: product.category,
      options: categories.map(c => ({ value: c.name, label: c.name }))
    },
    { type: "text", name: "unit", label: "Unit", value: product.unit, required: true },
    { type: "textarea", name: "description", label: "Description", value: product.description || "" }
  ];

  window.modalManager.showFormModal(
    "Edit Product",
    fields,
    async (data) => {
      const supplier = suppliers.find(s => s.name === data.company);
      const category = categories.find(c => c.name === data.category);

      if (!supplier || !category) {
        window.utils?.showNotification("Invalid category or supplier", "error");
        return false;
      }

      const payload = {
        id: product.id,
        name: data.name,
        barcode: data.sku,
        unit: data.unit,
        description: data.description,
        availability: product.availability,
        category_id: category.id,
        supplier_id: supplier.id
      };

      const res = await fetch(window.getApiUrl("/api/inventory/editProduct"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        window.utils.showNotification(`❌ ${err.error || "Update failed"}`, "error");
        return false;
      }

      window.utils.showNotification(`✅ Product "${data.name}" updated successfully`, "success");
      this.init(); // Refresh
      return true;
    },
    { width: "600px", submitText: "Update Product" }
  );
}
};

async function openAddProductModal() {
  try {
    // Load category & supplier data
    const [catRes, supRes] = await Promise.all([
      fetch(window.getApiUrl("/api/inventory/getcategories")),
      fetch(window.getApiUrl("/api/inventory/getsuppliers"))
    ]);

    const categories = await catRes.json();
    const suppliers = await supRes.json();

    if (!Array.isArray(categories) || !Array.isArray(suppliers)) {
      throw new Error("Invalid category or supplier data");
    }

    // Store them for later ID mapping
    window.PageModules.products.categoriesData = categories;
    window.PageModules.products.suppliersData = suppliers;

    const fields = [
      { type: "text", name: "name", label: "Product Name", placeholder: "Enter product name", required: true },
      { type: "text", name: "sku", label: "SKU", placeholder: "Enter SKU code", required: true },
      {
        type: "select",
        name: "company",
        label: "Company",
        placeholder: "Select supplier",
        required: true,
        options: suppliers.map(s => ({ value: s.name, label: s.name }))
      },
      {
        type: "select",
        name: "category",
        label: "Category",
        placeholder: "Select category",
        required: true,
        options: categories.map(c => ({ value: c.name, label: c.name }))
      },
      { type: "text", name: "unit", label: "Unit", placeholder: "e.g., tablet, kg, piece", required: true },
      { type: "number", name: "buyPrice", label: "Buy Price ($)", placeholder: "0.00", required: true },
      { type: "number", name: "marketPrice", label: "Market Price ($)", placeholder: "0.00", required: true },
      { type: "textarea", name: "description", label: "Description", placeholder: "Product description (optional)" }
    ];

    window.modalManager.showFormModal(
      "Add New Product",
      fields,
      async (data) => {
        try {
          // Map names to IDs
          const supplier = suppliers.find(s => s.name === data.company);
          const category = categories.find(c => c.name === data.category);

          if (!supplier || !category) {
            window.utils.showNotification("Invalid category or supplier selected", "error");
            return false;
          }

          const payload = {
            products: [
              {
                supplier_id: supplier.id,
                category_id: category.id,
                name: data.name,
                description: data.description || "",
                availability: true,
                unit: data.unit,
                barcode: data.sku
              }
            ]
          };

          const res = await fetch(window.getApiUrl("/api/inventory/addproduct"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const errData = await res.json();
            window.utils.showNotification(`❌ ${errData.error || "Insert failed"}`, "error");
            return false;
          }

          window.utils.showNotification(`✅ Product "${data.name}" added successfully`, "success");
          window.PageModules.products.init(); // Refresh view
          return true;
        } catch (err) {
          console.error("Insert error:", err);
          window.utils.showNotification("❌ Network error", "error");
          return false;
        }
      },
      { width: "600px", submitText: "Add Product" }
    );

  } catch (err) {
    console.error("❌ Failed to open Add Product Modal:", err);
    window.utils?.showNotification?.("Failed to load categories or suppliers", "error");
  }
}


