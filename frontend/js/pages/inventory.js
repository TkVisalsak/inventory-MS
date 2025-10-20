window.PageModules = window.PageModules || {};

window.PageModules.inventory = {
  inventoryData: [],
  categoriesData: [],
  suppliersData: [],

  init: async function () {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getProductStockSummary"));
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid inventory data");

      this.inventoryData = data;
      await this.loadCategories();
      await this.loadSuppliers();
      this.render();
      this.setupEventListeners();
      this.applyFilters();
    } catch (err) {
      console.error("❌ Failed to load inventory data:", err.message);
      document.getElementById("inventoryTableBody").innerHTML = `
        <tr><td colspan="7">Failed to load inventory data.</td></tr>
      `;
    }
  },

  loadCategories: async function () {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getcategories"));
      const categories = await res.json();
      if (!Array.isArray(categories)) throw new Error("Invalid category data");

      this.categoriesData = categories;
      const filter = document.getElementById("categoryFilter");
      if (filter) {
        categories.forEach(c => {
          const opt = document.createElement("option");
          opt.value = c.name;
          opt.textContent = c.name;
          filter.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("❌ Failed to load categories:", err.message);
    }
  },

  loadSuppliers: async function () {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getsuppliers"));
      const suppliers = await res.json();
      if (!Array.isArray(suppliers)) throw new Error("Invalid supplier data");

      this.suppliersData = suppliers;
      const filter = document.getElementById("companyFilter");
      if (filter) {
        suppliers.forEach(s => {
          const opt = document.createElement("option");
          opt.value = s.name;
          opt.textContent = s.name;
          filter.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("❌ Failed to load suppliers:", err.message);
    }
  },

render: function () {
  const totalProducts = this.inventoryData.length;

  const totalStockValue = this.inventoryData.reduce((sum, p) => {
    return sum + ((p.total_quantity || 0) * (p.latest_buy_price || 0));
  }, 0);

  const totalMarketValue = this.inventoryData.reduce((sum, p) => {
    return sum + (p.total_quantity || 0) * (p.latest_market_price || 0);
  }, 0);

  const profitMargin = totalMarketValue - totalStockValue;

  document.getElementById("statTotalProducts").textContent = totalProducts.toLocaleString();
  document.getElementById("statStockValue").textContent = `$${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  document.getElementById("statMarketValue").textContent = `$${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  document.getElementById("statProfitMargin").textContent = `$${profitMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  this.renderTable(this.inventoryData);
},


  renderTable: function (products) {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">No inventory data available.</td></tr>`;
    return;
  }

  products.forEach(p => {
    const latestExpire = p.latest_expiration_date
      ? new Date(p.latest_expiration_date).toLocaleDateString()
      : "-";

    const oldestAvailableExpire = p.oldest_available_expiration_date
      ? new Date(p.oldest_available_expiration_date).toLocaleDateString()
      : "-";

    const badgeColor = p.stock_status === "In Stock" ? "#dcffdeff" : "rgba(255, 196, 192, 1)";
    const textColor = p.stock_status === "In Stock" ? "#006400" : "#940000";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.product_name}</td>
      <td>${Number(p.total_quantity).toLocaleString()}</td>
      <td>$${Number(p.latest_buy_price || 0).toLocaleString()}</td>
      <td>$${Number(p.latest_market_price || 0).toLocaleString()}</td>
      <td>$${Number(p.total_value || 0).toLocaleString()}</td>
      <td>${oldestAvailableExpire}</td>
      <td>${latestExpire}</td>
      <td>
        <span class="status-badge" style="background-color: ${badgeColor}; color: ${textColor}; font-weight: 600;">
          ${p.stock_status}
        </span>
      </td>
      <td>
        <button class="btn btn-secoundary view-btn" data-id="${p.product_id}" style="margin-right: 4px;">View</button>
      </td>
    `;
    tbody.appendChild(row);
  });
},

  setupEventListeners: function () {
    const searchInput = document.getElementById("productSearch");
    const sortCategory = document.getElementById("categoryFilter");
    const sortSupplier = document.getElementById("companyFilter");

    if (searchInput) {
      searchInput.addEventListener("input", () => this.applyFilters());
    }

    if (sortCategory) {
      sortCategory.addEventListener("change", () => this.applyFilters());
    }

    if (sortSupplier) {
      sortSupplier.addEventListener("change", () => this.applyFilters());
    }
  },

  applyFilters: function () {
  const searchTerm = (document.getElementById("productSearch")?.value || "").toLowerCase();
  const selectedCategory = document.getElementById("categoryFilter")?.value || "";
  const selectedSupplier = document.getElementById("companyFilter")?.value || "";

  const sortCategory = document.getElementById("sortCategory")?.value || "";
  const sortSupplier = document.getElementById("sortSupplier")?.value || "";

  let filtered = this.inventoryData.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm);
    const categoryMatch = !selectedCategory || (p.category === selectedCategory);
    const supplierMatch = !selectedSupplier || (p.supplier === selectedSupplier);
    return matchesSearch && categoryMatch && supplierMatch;
  });

  // Sort by Category if requested
  if (sortCategory) {
    filtered.sort((a, b) => {
      const catA = (a.category || "").toLowerCase();
      const catB = (b.category || "").toLowerCase();
      if (catA < catB) return sortCategory === "asc" ? -1 : 1;
      if (catA > catB) return sortCategory === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Then sort by Supplier if requested
  if (sortSupplier) {
    filtered.sort((a, b) => {
      const supA = (a.supplier || "").toLowerCase();
      const supB = (b.supplier || "").toLowerCase();
      if (supA < supB) return sortSupplier === "asc" ? -1 : 1;
      if (supA > supB) return sortSupplier === "asc" ? 1 : -1;
      return 0;
    });
  }

  this.renderTable(filtered);
}

};
