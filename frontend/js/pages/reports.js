// Reports page module
window.PageModules = window.PageModules || {}

window.PageModules.reports = {
  render: () => `
    <div class="dashboard-header">
      <h1>Reports & Analytics</h1>
      <p>Comprehensive reporting and audit trails</p>
    </div>

    <div class="reports-grid">
      <!-- Inventory Reports -->
      <div class="report-section">
        <div class="section-header">
          <h2>Inventory Reports</h2>
          <p>Stock and inventory analysis</p>
        </div>
        <div class="report-items">
          <div class="report-item">
            <i class="fas fa-file-alt"></i>
            <span>Current Stock Report</span>
          </div>
          <div class="report-item">
            <i class="fas fa-exchange-alt"></i>
            <span>Stock Movement History</span>
          </div>
          <div class="report-item">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Expired/Expiring Items</span>
          </div>
          <div class="report-item">
            <i class="fas fa-chart-bar"></i>
            <span>Low Stock Items</span>
          </div>
        </div>
      </div>

      <!-- Sales Reports -->
      <div class="report-section">
        <div class="section-header">
          <h2>Sales Reports</h2>
          <p>Sales performance and analytics</p>
        </div>
        <div class="report-items">
          <div class="report-item">
            <i class="fas fa-calendar-day"></i>
            <span>Daily Sales Report</span>
          </div>
          <div class="report-item">
            <i class="fas fa-chart-line"></i>
            <span>Weekly Sales Summary</span>
          </div>
          <div class="report-item">
            <i class="fas fa-dollar-sign"></i>
            <span>Monthly Revenue Report</span>
          </div>
          <div class="report-item">
            <i class="fas fa-trophy"></i>
            <span>Top-Selling Products</span>
          </div>
        </div>
      </div>

      <!-- Audit & Logs -->
      <div class="report-section">
        <div class="section-header">
          <h2>Audit & Logs</h2>
          <p>System activity and changes</p>
        </div>
        <div class="report-items">
          <div class="report-item">
            <i class="fas fa-user"></i>
            <span>User Activity Log</span>
          </div>
          <div class="report-item">
            <i class="fas fa-eye"></i>
            <span>System Changes Log</span>
          </div>
          <div class="report-item">
            <i class="fas fa-undo"></i>
            <span>Return Goods Report</span>
          </div>
          <div class="report-item">
            <i class="fas fa-building"></i>
            <span>Supplier Performance</span>
          </div>
        </div>
      </div>
    </div>
  `,

  init: () => {
    // Initialize report item click events
    const reportItems = document.querySelectorAll(".report-item")

    reportItems.forEach((item) => {
      item.style.cursor = "pointer"
      item.addEventListener("click", () => {
        const reportName = item.querySelector("span").textContent
        window.utils.showNotification(`Generating report: ${reportName}`, "info")
      })
    })
  },
}
