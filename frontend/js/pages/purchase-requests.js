window.PageModules = window.PageModules || {};

window.PageModules["purchase-requests"] = {
  purchaseRequests: [],

  render: function () {
    return `
      <div class="dashboard-header">
        <h1>Purchase Requests</h1>
        <p>Manage purchase orders and supplier requests</p>
      </div>

      <div class="page-controls">
        <div class="search-filters">
          <div class="filter-group">
            <select class="filter-select" id="statusFilter">
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
            </select>
            <select class="filter-select" id="priorityFilter">
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" id="newRequestBtn">
          <i class="fas fa-plus"></i> New Purchase Request
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
        <div class="stat-card warning">
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
        <div class="stat-card danger">
          <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-content">
            <h3>Urgent Requests</h3>
            <div class="stat-number" id="urgentRequests">0</div>
            <p>High priority</p>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2>Purchase Requests</h2>
          <p>Track and manage all purchase requests</p>
        </div>
        <div class="data-table-container">
          <table class="data-table" id="purchaseRequestsTable">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Supplier</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Expected Delivery</th>
                <th>Priority</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="purchaseRequestsBody"></tbody>
          </table>
        </div>
      </div>
    `;
  },

  init: async function () {
    const container = document.getElementById("purchaseRequestsApp");
    if (!container) return;

    container.innerHTML = this.render();
    await this.loadPurchaseRequests();

    document.getElementById("statusFilter").addEventListener("change", this.filterRequests.bind(this));
    document.getElementById("priorityFilter").addEventListener("change", this.filterRequests.bind(this));
    document.getElementById("newRequestBtn").addEventListener("click", window.openCreatePurchaseRequestModal);
  },

  loadPurchaseRequests: async function () {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getPurchaseRequests"));
      const data = await res.json();
      this.purchaseRequests = data;
    } catch (err) {
      console.error("Failed to fetch data, using fallback");
      this.purchaseRequests = this.getDemoData();
    }
    this.updateStats();
    this.renderTableRows();
  },

  getDemoData: function () {
    return [
      {
        request_number: "PR-001",
        supplier_name: "Supplier 1",
        requested_by: "John Doe",
        request_date: "2024-01-15",
        expected_delivery: "2024-01-25",
        priority: "High",
        amount: 1500,
        status: "Pending"
      }
    ];
  },

  updateStats: function () {
    const total = this.purchaseRequests.length;
    const pending = this.purchaseRequests.filter(r => r.status.toLowerCase() === "pending").length;
    const urgent = this.purchaseRequests.filter(r => r.priority.toLowerCase() === "high").length;
    const totalValue = this.purchaseRequests.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    document.getElementById("totalRequests").textContent = total;
    document.getElementById("pendingApproval").textContent = pending;
    document.getElementById("urgentRequests").textContent = urgent;
    document.getElementById("totalValue").textContent = `$${totalValue.toFixed(2)}`;
  },

  renderTableRows: function () {
    const tbody = document.getElementById("purchaseRequestsBody");
    tbody.innerHTML = "";

    this.purchaseRequests.forEach(req => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${req.request_number}</td>
        <td>${req.supplier_name || req.supplier_id}</td>
        <td>${req.requested_by}</td>
        <td>${req.request_date}</td>
        <td>${req.expected_delivery}</td>
        <td><span class="priority-badge ${req.priority.toLowerCase()}">${req.priority}</span></td>
        <td>$${Number(req.amount).toFixed(2)}</td>
        <td><span class="status-badge ${this.statusClass(req.status)}">${req.status}</span></td>
        <td>${this.renderActionButtons(req)}</td>
      `;

      tr.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", e => this.handleActionClick(e, req));
      });

      tbody.appendChild(tr);
    });
  },

  statusClass: function (status) {
    switch (status.toLowerCase()) {
      case "approved": return "good";
      case "pending": return "warning";
      case "draft": return "draft";
      case "sent": return "sent";
      default: return "";
    }
  },

  renderActionButtons: function (req) {
    const action = req.status.toLowerCase();
    if (action === "pending") return `<button class="btn-link">Approve</button>`;
    if (action === "draft") return `<button class="btn-link">Edit</button>`;
    return `<button class="btn-link">View</button>`;
  },

  handleActionClick: function (event, req) {
    const action = event.target.textContent.trim();
    const id = req.request_number;
    if (action === "View") alert(`Viewing request ${id}`);
    else if (action === "Approve") {
      req.status = "Approved";
      this.renderTableRows();
      this.updateStats();
    } else if (action === "Edit") {
      alert(`Editing request ${id}`);
    }
  },

  filterRequests: function () {
    const status = document.getElementById("statusFilter").value.toLowerCase();
    const priority = document.getElementById("priorityFilter").value.toLowerCase();
    const rows = document.getElementById("purchaseRequestsBody").querySelectorAll("tr");

    rows.forEach(row => {
      const priorityText = row.cells[5].textContent.toLowerCase();
      const statusText = row.cells[7].textContent.toLowerCase();
      row.style.display = (!status || statusText.includes(status)) && (!priority || priorityText.includes(priority)) ? "" : "none";
    });
  },

  refreshData: async function () {
    await this.loadPurchaseRequests();
  }
};
