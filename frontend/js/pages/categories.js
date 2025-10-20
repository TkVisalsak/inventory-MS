window.PageModules = window.PageModules || {};

window.PageModules.categories = {
  categoriesData: [],
  selectedCategory: null,
  currentView: "list",

  init: async function () {
    try {
      const response = await fetch(window.getApiUrl("/api/inventory/getcategories"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const rawText = await response.text();
      console.log("📦 Raw category response:", rawText);

      let categories;
      try {
        categories = JSON.parse(rawText);
      } catch (e) {
        console.error("❌ Failed to parse categories JSON:", e.message);
        categories = [];
      }

      if (!Array.isArray(categories)) throw new Error("Categories API did not return array");

      this.categoriesData = categories;
      this.currentView = "list";
      this.render();
    } catch (err) {
      console.error("❌ Error loading categories:", err);
      const container = document.getElementById("pageContent");
      if (container) {
        container.innerHTML = `<div class="error-message">Failed to load categories.</div>`;
      }
    }
  },

  render: function () {
    const container = document.getElementById("pageContent");
    if (!container) {
      console.error("❌ pageContent not found.");
      return;
    }

    if (this.currentView === "list") {
      container.innerHTML = `
        <div class="dashboard-header">
          <h1>Categories</h1>
          <p>Manage product categories and classifications</p>
        </div>

        <div class="page-controls">
          <button class="btn btn-primary" onclick="openAddCategoryModal()">
            <i class="fas fa-plus"></i> Add Category
          </button>
        </div>

        <div class="categories-grid" id="categoriesGrid"></div>
      `;

      this.renderCategoryCards(this.categoriesData);
      this.setupEventListeners();

    } else if (this.currentView === "products" && this.selectedCategory) {
      container.innerHTML = `
        <div class="dashboard-header">
      
          <h1>Products in "${this.selectedCategory.name}"</h1>
          <button class="btn btn-primary" id="backToCategories">
            <i class="fas fa-arrow-left"></i> Back to Categories
          </button>  
        </div>
        <div id="productList" class="grid">Loading products...</div>
      `;

      this.loadProductsByCategory(this.selectedCategory.id);
      this.setupBackButton();
    }
  },

  renderCategoryCards: function (categories) {
    const grid = document.getElementById("categoriesGrid");
    if (!grid) {
      console.error("❌ categoriesGrid not found.");
      return;
    }

    grid.innerHTML = "";

    categories.forEach((category) => {
      const card = document.createElement("div");
      card.className = "category-card";

      const productCount = category.product_count || 0;
      const totalValue = category.total_value || 0;

      card.innerHTML = `
      
        <div class="category-header">
          <h3>${category.name}</h3>
          <div class="category-actions">
            <button class="btn-icon edit-category-btn" data-category-id="${category.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon view-category-btn" data-category-id="${category.id}">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <p class="category-description">${category.description || "No description available."}</p>
        <div class="category-stats">
          <div class="stat">
            <span class="label">Products:</span>
            <span class="value">${productCount}</span>
          </div>
          <div class="stat">
            <span class="label">Total Value:</span>
            <span class="value">$${parseFloat(totalValue).toFixed(2)}</span>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  },

  setupEventListeners: function () {
    const grid = document.getElementById("categoriesGrid");
    if (!grid) {
      console.warn("⚠️ Event listener skipped - grid not found.");
      return;
    }

    grid.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-category-btn");
      const viewBtn = e.target.closest(".view-category-btn");

      if (editBtn) {
        const id = editBtn.getAttribute("data-category-id");
        console.log("🛠 Edit clicked:", id);
        this.editCategory(id);
        return;
      }

      if (viewBtn) {
        const id = viewBtn.getAttribute("data-category-id");
        console.log("👁 View clicked:", id);
        this.viewCategory(id);
      }
    });
  },

  viewCategory: function (id) {
  const category = this.categoriesData.find(c => String(c.id) === String(id));
  if (category) {
    console.log("🔍 Viewing category:", category.name);
    this.selectedCategory = category;
    this.currentView = "products";
    this.render();
  } else {
    console.warn(`❌ Category not found for ID: ${id}`);
  }
},

editCategory: function (id) {
  const category = this.categoriesData.find(c => String(c.id) === String(id));
  if (category) {
    console.log("🖊 Editing category:", category.name);
    window.utils?.showNotification?.(`Editing category: ${category.name}`, "info");
  } else {
    console.warn(`❌ Category not found for editing ID: ${id}`);
  }
},


  setupBackButton: function () {
    const backBtn = document.getElementById("backToCategories");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        console.log("↩️ Back to category list");
        this.currentView = "list";
        this.selectedCategory = null;
        
        this.render();
      });
    }
  },

  loadProductsByCategory: async function (categoryId) {
  const container = document.getElementById("productList");
  if (!container) return;

  try {
    const res = await fetch(window.getApiUrl(`/api/inventory/getproductsbycategoryid?category_id=${categoryId}`));
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = `<p>No products found in this category.</p>`;
      return;
    }
    this.productsData = products;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><i class="fas fa-box"></i><h3>Total Products</h3><div class="stat-number">${products.length}</div></div>
        <div class="stat-card"><i class="fas fa-dollar-sign"></i><h3>Total Stock Value</h3><div class="stat-number" id="statStockValue">...</div></div>
        <div class="stat-card"><i class="fas fa-chart-line"></i><h3>Market Value</h3><div class="stat-number" id="statMarketValue">...</div></div>
        <div class="stat-card"><i class="fas fa-percentage"></i><h3>Profit Margin</h3><div class="stat-number" id="statProfitMargin">...</div></div>
      </div>

      <div class="content-section">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Supplier</th>
                <th>Buy Price</th>
                <th>Market Price</th>
                <th>Stock</th>
                <th>Total Value</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="product-body"></tbody>
          </table>
        </div>
      </div>
    `;

    this.renderTable(products);
    this.updateCategoryStats(products);

  } catch (err) {
    console.error("❌ Failed to load products:", err);
    container.innerHTML = `<p class="error-message">Error loading products for this category.</p>`;
  }
},

updateCategoryStats: function (products) {
const totalStockValue = this.productsData.reduce((sum, p) => {
  return sum + ((Number(p.total_quantity) || 0) * (Number(p.latest_buy_price) || 0));
}, 0);

const totalMarketValue = this.productsData.reduce((sum, p) => {
  return sum + ((Number(p.total_quantity) || 0) * (Number(p.latest_market_price) || 0));
}, 0);

const profitMargin = totalMarketValue - totalStockValue;

document.getElementById("statStockValue").textContent = `$${Number(totalStockValue).toFixed(2)}`;
document.getElementById("statMarketValue").textContent = `$${Number(totalMarketValue).toFixed(2)}`;
document.getElementById("statProfitMargin").textContent = `$${Number(profitMargin).toFixed(2)}`;

},

renderTable: function (products) {
  const tbody = document.getElementById("product-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  products.forEach(p => {
    const statusColor = p.stock_status === "In Stock" ? "#e6ffe6" : "#ffe6e6";
    const statusTextColor = p.stock_status === "In Stock" ? "#006400" : "#940000";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.product_name}</td>
      <td>${p.supplier || "-"}</td>
      <td>$${Number(p.latest_buy_price || 0).toFixed(2)}</td>
      <td>$${Number(p.latest_market_price || 0).toFixed(2)}</td>
      <td>$${Number(p.total_value || 0).toFixed(2)}</td>
      <td>${p.oldest_available_expiration_date ? new Date(p.oldest_available_expiration_date).toLocaleDateString() : "-"}</td>
      <td><span class="status-badge" style="background:${statusColor};color:${statusTextColor};font-weight:bold">${p.stock_status}</span></td>
      <td>
        <button class="btn btn-secoundary view-btn" data-product-id="${p.product_id}">View</button>
        <button class="btn btn-secoundary edit-btn" data-product-id="${p.product_id}">Edit</button>
      </td>
    `;
    tbody.appendChild(row);
  });
},

editCategory: function (id) {
  const category = this.categoriesData.find(c => String(c.id) === String(id));
  if (!category) {
    window.utils?.showNotification("Category not found", "warning");
    return;
  }

  const fields = [
    {
      type: "text",
      name: "name",
      label: "Category Name",
      value: category.name,
      required: true
    },
    {
      type: "textarea",
      name: "description",
      label: "Description",
      value: category.description || ""
    }
  ];

  window.modalManager.showFormModal(
    "Edit Category",
    fields,
    async (data) => {
      if (!data.name.trim()) {
        window.utils?.showNotification("Name is required", "error");
        return false;
      }

      const payload = {
        id: category.id,
        name: data.name.trim(),
        description: data.description?.trim() || ""
      };

      try {
        const res = await fetch(window.getApiUrl("/api/inventory/editCategory"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          window.utils.showNotification(`❌ ${err.error || "Update failed"}`, "error");
          return false;
        }

        window.utils.showNotification(`✅ Category "${data.name}" updated`, "success");
        this.init(); // Reload categories
        return true;

      } catch (err) {
        console.error("❌ Error updating category:", err);
        window.utils.showNotification("Internal error occurred", "error");
        return false;
      }
    },
    {
      width: "500px",
      submitText: "Update Category"
    }
  );
}

};