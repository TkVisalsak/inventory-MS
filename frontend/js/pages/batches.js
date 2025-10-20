window.PageModules = window.PageModules || {}

window.PageModules.batches = {
  batchesData: [],

  render: () => `
    <div class="dashboard-header">
      <h1>Product Batches</h1>
      <p>Track inventory by batch with expiration dates</p>
    </div>
    
    <div class="page-controls">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search batches..." id="batchSearch">
        </div>
      </div>
      <button class="btn btn-primary" onclick="openAddBatchModal()">
        <i class="fas fa-plus"></i> Add Batch
      </button>
    </div>

    <div class="content-section">
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
  `,

  init: async function () {
    const searchInput = document.getElementById("batchSearch")
    if (searchInput) {
      searchInput.addEventListener("input", this.filterBatches.bind(this))
    }

    try {
      const response = await fetch(window.getApiUrl("/api/inventory/getbatches"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })

      const batches = await response.json()
      if (!Array.isArray(batches)) throw new Error("API did not return array")
      console.log("Batches loaded:", batches)
      this.batchesData = batches
      this.renderTable(batches)

    } catch (err) {
      console.error("❌ Error loading batches:", err)
      const tbody = document.getElementById("batch-body")
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="9">Failed to load batch data</td></tr>`
      }
    }
  },

  renderTable: function (batches) {
    const tbody = document.getElementById("batch-body")
    if (!tbody) return

    tbody.innerHTML = ""

    batches.forEach((b) => {
      const row = document.createElement("tr")
      const statusClass = (b.status || "unknown").toLowerCase().replace(/\s+/g, "-")

      row.innerHTML = `
        <td>${b.product || "-"}</td>
        <td>${b.batch_number || "-"}</td>
        <td>${b.expiration || "-"}</td>
        <td>$${parseFloat(b.buy_price).toFixed(2)}</td>
        <td>$${parseFloat(b.market_price).toFixed(2)}</td>
        <td>${b.stock ?? 0}</td>
        <td>${b.location || "-"}</td>
        <td><span class="status-badge ${statusClass}">${b.status || "Unknown"}</span></td>
      `

      tbody.appendChild(row)
    })
  },

  filterBatches: function () {
    const searchTerm = document.getElementById("batchSearch")?.value.toLowerCase() || ""

    const filtered = this.batchesData.filter(b =>
      (b.product || "").toLowerCase().includes(searchTerm) ||
      (b.batch_number || "").toLowerCase().includes(searchTerm)
    )

    this.renderTable(filtered)
  }
}
