window.PageModules = window.PageModules || {};
window.PageModules["return-goods"] = {
  render: () => `
    <div class="dashboard-header">
      <h1>Return Goods</h1>
      <p>Manage product returns and refunds</p>
    </div>

    <div class="page-controls">
      <button class="btn btn-primary" onclick="openProcessReturnModal()">
        <i class="fas fa-plus"></i> Process Return
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid" id="return-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-undo"></i>
        </div>
        <div class="stat-content">
          <h3>Total Returns</h3>
          <div class="stat-number" id="stat-total">0</div>
          <p>This month</p>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>Pending Returns</h3>
          <div class="stat-number" id="stat-pending">0</div>
          <p>Awaiting approval</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>Refund Amount</h3>
          <div class="stat-number" id="stat-refund">$0.00</div>
          <p>Total refunds</p>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="section-header">
        <h2>Return History</h2>
        <p>All product returns and their status</p>
      </div>
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Refund Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="return-table-body">
            <tr><td colspan="8">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  init: async () => {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getAllReturns"));
      const returns = await res.json();

      if (!Array.isArray(returns)) throw new Error("Invalid return data");

      const tbody = document.getElementById("return-table-body");
      tbody.innerHTML = "";

      let totalReturns = 0;
      let pendingReturns = 0;
      let totalRefund = 0;

      returns.forEach((r) => {
        totalReturns += 1;
        if (r.status === "Pending") pendingReturns += 1;
        totalRefund += Number(r.refund_amount || 0);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${new Date(r.created_at).toLocaleDateString()}</td>
          <td>${r.customer_name}</td>
          <td>${r.product_name}</td>
          <td>${r.quantity}</td>
          <td>${r.reason}</td>
          <td>$${Number(r.refund_amount).toFixed(2)}</td>
          <td><span class="status-badge ${r.status === 'Approved' ? 'good' : 'warning'}">${r.status}</span></td>
          <td>
            <button class="btn-link btn-return-action" data-id="${r.id}" data-status="${r.status}">
              ${r.status === "Pending" ? "Approve" : "View"}
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // ✅ Fixed: Ensure values are passed as strings
      window.utils.animateNumber(document.getElementById("stat-total"), totalReturns.toString());
      window.utils.animateNumber(document.getElementById("stat-pending"), pendingReturns.toString());
      window.utils.animateNumber(document.getElementById("stat-refund"), `$${totalRefund.toFixed(2)}`);

      // Handle approve/view button actions
      document.querySelectorAll(".btn-return-action").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = btn.dataset.id;
          const row = btn.closest("tr");
          const customer = row.cells[1].textContent;
          const product = row.cells[2].textContent;

          if (btn.textContent === "View") {
            window.utils.showNotification(`Viewing return for ${product} from ${customer}`, "info");
          } else if (btn.textContent === "Approve") {
            try {
              const res = await fetch(window.getApiUrl(`/api/inventory/getAllReturns/${id}/approve`), {
                method: "POST",
              });

              if (!res.ok) throw new Error("Approval failed");

              window.utils.showNotification(`Return for ${product} from ${customer} approved`, "success");
              row.cells[6].innerHTML = `<span class="status-badge good">Approved</span>`;
              btn.textContent = "View";
            } catch (err) {
              window.utils.showNotification(`Error: ${err.message}`, "error");
            }
          }
        });
      });

    } catch (err) {
      console.error("❌ Failed to load return data:", err);
      document.getElementById("return-table-body").innerHTML = `<tr><td colspan="8">Failed to load returns</td></tr>`;
    }
  }
};
