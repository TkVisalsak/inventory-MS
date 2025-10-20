window.PageModules = window.PageModules || {};

window.PageModules.customers = {
  customersData: [],
  selectedCustomer: null,
  currentView: "list",

  init: async function () {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getAllCustomers"));
      const customers = await res.json();
      if (!Array.isArray(customers)) throw new Error("Invalid customer data");

      this.customersData = customers;
      this.currentView = "list";
      this.render();
    } catch (err) {
      console.error("❌ Failed to load customers:", err.message);
      const container = document.getElementById("pageContent");
      if (container) {
        container.innerHTML = `<div class="error-message">Failed to load customer list.</div>`;
      }
    }
  },

  render: function () {
    const container = document.getElementById("pageContent");
    if (!container) return;

    if (this.currentView === "list") {
      container.innerHTML = `
        <div class="dashboard-header">
          <h1>Customers</h1>
          <p>Manage customer accounts and relationships</p>
        </div>

        <div class="page-controls">
          <div class="search-filters">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search customers..." id="customerSearch">
            </div>
          </div>
          <button class="btn btn-primary" onclick="openAddCustomerModal()">
            <i class="fas fa-plus"></i> Add Customer
          </button>
        </div>

        <div class="content-section">
          <div class="data-table-container">
            <table class="data-table" id="customersTable">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Credit Limit</th>
                  <th>Outstanding</th>
                  <th>Available Credit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      `;

      this.renderTable(this.customersData);
      this.setupEventListeners();

    } else if (this.currentView === "details" && this.selectedCustomer) {
      const c = this.selectedCustomer;

      container.innerHTML = `

      <div class="dashboard-header">
        <h1>Customer: ${c.name}</h1>
        <button class="btn btn-secondary" id="backToCustomerList">
          <i class="fas fa-arrow-left"></i> Back to List
        </button>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
          <div class="stat-content">
            <h3>Total Requests</h3>
            <div class="stat-number" id="totalRequests">0</div>
            <p>This month</p>
          </div>
        </div>
        <div class="stat-card ">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-content">
            <h3>Pending Approval</h3>
            <div class="stat-number" id="pendingApproval">0</div>
            <p>Awaiting approval</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
          <div class="stat-content">
            <h3>Total Value</h3>
            <div class="stat-number" id="totalValue">$0.00</div>
            <p>All requests</p>
          </div>
        </div>
        <div class="stat-card ">
          <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-content">
            <h3>Urgent Requests</h3>
            <div class="stat-number" id="urgentRequests">0</div>
            <p>High priority</p>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
          <div class="stat-content">
            <h3>Total Requests</h3>
            <div class="stat-number" id="totalRequests">0</div>
            <p>This month</p>
          </div>
        </div>
        <div class="stat-card ">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-content">
            <h3>Pending Approval</h3>
            <div class="stat-number" id="pendingApproval">0</div>
            <p>Awaiting approval</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
          <div class="stat-content">
            <h3>Total Value</h3>
            <div class="stat-number" id="totalValue">$0.00</div>
            <p>All requests</p>
          </div>
        </div>
        <div class="stat-card ">
          <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-content">
            <h3>Urgent Requests</h3>
            <div class="stat-number" id="urgentRequests">0</div>
            <p>High priority</p>
          </div>
        </div>
      </div>

        <div class="content-section customer-detail">
          <h3>Customer Information</h3>
          <p><strong>Type:</strong> ${c.customer_type}</p>
          <p><strong>Email:</strong> ${c.email}</p>
          <p><strong>Phone:</strong> ${c.phone}</p>
          <p><strong>Credit Limit:</strong> $${Number(c.credit_limit).toLocaleString()}</p>
          <p><strong>Outstanding:</strong> $${Number(c.outstanding || 0).toLocaleString()}</p>
          <p><strong>Available Credit:</strong> $${Number(c.available_credit).toLocaleString()}</p>
          <p><strong>Status:</strong> <span class="status-badge ${c.status === "Good" ? "good" : "bad"}">${c.status}</span></p>
        </div>
      `;

      this.setupBackButton();
    }
  },

  renderTable: function (customers) {
    const tbody = document.querySelector("#customersTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    customers.forEach((c) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.name}</td>
        <td>${c.customer_type}</td>
        <td>
          ${c.email}<br>
          <small style="color: #999;">${c.phone}</small>
        </td>
        <td>$${Number(c.credit_limit).toLocaleString()}</td>
        <td>$${Number(c.outstanding || 0).toLocaleString()}</td>
        <td>$${Number(c.available_credit).toLocaleString()}</td>
        <td><span class="status-badge ${c.status === "Good" ? "good" : "bad"}">${c.status}</span></td>
        <td>
          <button class="btn-link view-btn" data-customer-id="${c.id}">View</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  },

  setupEventListeners: function () {
    const searchInput = document.getElementById("customerSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.filterCustomers(e.target.value));
    }

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-customer-id");
        this.viewCustomer(id);
      });
    });
  },

  setupBackButton: function () {
    const backBtn = document.getElementById("backToCustomerList");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.currentView = "list";
        this.selectedCustomer = null;
        this.render();
      });
    }
  },

  viewCustomer: function (id) {
    const customer = this.customersData.find(c => String(c.id) === String(id));
    if (customer) {
      console.log("👁 Viewing customer:", customer.name);
      this.selectedCustomer = customer;
      this.currentView = "details";
      this.render();
    } else {
      window.utils?.showNotification?.("Customer not found", "warning");
    }
  },

  filterCustomers: function (query) {
    const term = query.toLowerCase();
    const filtered = this.customersData.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
    this.renderTable(filtered);
  },
};
