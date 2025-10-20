window.PageModules = window.PageModules || {};

window.PageModules.companies = {
  companiesData: [],
  selectedCompany: null,
  currentView: "list",
  productsData: [],

  render: function () {
    const container = document.getElementById("pageContent");
    if (!container) return;

    if (this.currentView === "list") {
      container.innerHTML = `
        <div class="dashboard-header">
          <h1>Suppliers</h1>
          <p>Manage your product suppliers</p>
        </div>

        <div class="page-controls">
          <button class="btn btn-primary" onclick="openAddCompanyModal()">
            <i class="fas fa-plus"></i> Add Supplier
          </button>
        </div>

        <div id="companiesGrid" class="companies-grid"></div>
      `;

      this.renderCompanyCards(this.companiesData);

    } else if (this.currentView === "products" && this.selectedCompany) {
      container.innerHTML = `
        <div class="dashboard-header">
          <h1>Products from "${this.selectedCompany.name}"</h1>
          <button class="btn btn-primary" id="backToSuppliers">
            <i class="fas fa-arrow-left"></i> Back to Suppliers
          </button>
        </div>
        <div id="productList" class="grid">Loading products...</div>
      `;

      this.loadProductsByCompany(this.selectedCompany.id);
      this.setupBackButton();
    }
  },

  init: async function () {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getsupplier"));
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const suppliers = await res.json();
      if (!Array.isArray(suppliers)) throw new Error("Invalid supplier format");

      this.companiesData = suppliers.map(s => ({
        id: s.id,
        name: s.name,
        contact: s.contact_info,
        address: s.address,
        product_count: 0 // Optional
      }));

      this.currentView = "list";
      this.render();
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      const grid = document.getElementById("companiesGrid");
      if (grid) {
        grid.innerHTML = `<div class="error-message">Failed to load suppliers. Please try again later.</div>`;
      }
    }
  },

  renderCompanyCards: function (companies) {
    const grid = document.getElementById("companiesGrid");
    if (!grid) return;

    grid.innerHTML = "";

    companies.forEach(company => {
      const card = document.createElement("div");
      card.className = "company-card";
      card.innerHTML = `
        <div class="company-header">
          <div class="company-info">
            <h3>${this.escapeHTML(company.name)}</h3>
            <span class="company-type">${company.product_count || 0} products</span>
          </div>
          <div class="company-actions">
            <button class="btn-icon" data-id="${company.id}" data-action="edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" data-id="${company.id}" data-action="view">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <div class="company-details">
          <p><strong>Contact:</strong> ${this.escapeHTML(company.contact || "N/A")}</p>
          <p><strong>Address:</strong> ${this.escapeHTML(company.address || "N/A")}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll(".btn-icon").forEach(button => {
      button.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const action = e.currentTarget.getAttribute("data-action");
        const company = this.companiesData.find(c => c.id == id);
        if (!company) return;

        if (action === "edit") {
          this.editCompany(company.id);
        } else if (action === "view") {
          this.viewCompany(company.id);
        }
      });
    });
  },

  viewCompany: function (id) {
    const company = this.companiesData.find(c => String(c.id) === String(id));
    if (!company) {
      window.utils?.showNotification("Supplier not found", "warning");
      return;
    }

    this.selectedCompany = company;
    this.currentView = "products";
    this.render();
  },

  editCompany: function (id) {
    const company = this.companiesData.find(c => String(c.id) === String(id));
    if (!company) {
      window.utils?.showNotification("Supplier not found", "warning");
      return;
    }

    const fields = [
      { type: "text", name: "name", label: "Name", value: company.name, required: true },
      { type: "text", name: "contact", label: "Contact", value: company.contact },
      { type: "textarea", name: "address", label: "Address", value: company.address }
    ];

    window.modalManager.showFormModal(
      "Edit Supplier",
      fields,
      async (data) => {
        const payload = {
          id: company.id,
          name: data.name,
          contact_info: data.contact,
          address: data.address
        };

        const res = await fetch(window.getApiUrl("/api/inventory/editsupplier"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          window.utils.showNotification(`❌ ${err.error || "Update failed"}`, "error");
          return false;
        }

        window.utils.showNotification(`✅ Supplier "${data.name}" updated`, "success");
        this.init(); // reload
        return true;
      },
      {
        width: "500px",
        submitText: "Update Supplier"
      }
    );
  },

  loadProductsByCompany: async function (companyId) {
    const container = document.getElementById("productList");
    if (!container) return;

    try {
      const res = await fetch(window.getApiUrl(`/api/inventory/getproductsbysupplierid?supplier_id=${companyId}`));
      const products = await res.json();
      if (!Array.isArray(products)) {
        container.innerHTML = `<p>No products found for this supplier.</p>`;
        return;
      }

      this.productsData = products;

      container.innerHTML = `
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Buy Price</th>
                <th>Market Price</th>
                <th>Quantity</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody id="supplier-products-body"></tbody>
          </table>
        </div>
      `;

      const tbody = document.getElementById("supplier-products-body");
      tbody.innerHTML = products.map(p => `
        <tr>
          <td>${p.product_name}</td>
          <td>${p.category || "-"}</td>
          <td>$${Number(p.latest_buy_price || 0).toFixed(2)}</td>
          <td>$${Number(p.latest_market_price || 0).toFixed(2)}</td>
          <td>${p.total_quantity || 0}</td>
          <td>$${Number((p.total_quantity || 0) * (p.latest_buy_price || 0)).toFixed(2)}</td>
        </tr>
      `).join("");

    } catch (err) {
      console.error("❌ Error loading supplier products:", err);
      container.innerHTML = `<p class="error-message">Failed to load products.</p>`;
    }
  },

  setupBackButton: function () {
    const backBtn = document.getElementById("backToSuppliers");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.currentView = "list";
        this.selectedCompany = null;
        this.render();
      });
    }
  },

  escapeHTML: function (str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m];
    });
  }
};
