// Stock Movements page module
window.PageModules = window.PageModules || {}

window.PageModules["stock-movements"] = {
  data: [],

  render: () => `
    <div class="dashboard-header">
      <h1>Stock Movements</h1>
      <p>Track all inventory transactions</p>
    </div>
    
    <div class="page-controls">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search movements..." id="movementSearch">
        </div>
      </div>
      <button class="btn btn-primary" onclick="openRecordMovementModal()">
        <i class="fas fa-plus"></i> Record Movement
      </button>
    </div>

    <div class="content-section">
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
    </div>
  `,

  init: async function () {
    const searchInput = document.getElementById("movementSearch")
    if (searchInput) {
      searchInput.addEventListener("input", () => this.filterMovements())
    }

    await this.loadMovements()
  },

  loadMovements: async function () {
    try {
      const res = await fetch(window.getApiUrl("/api/inventory/getmovement"))
      const data = await res.json()
      this.data = data
      this.renderTable(data)
    } catch (err) {
      console.error("❌ Failed to load movements:", err)
      document.getElementById("movementTableBody").innerHTML = `
        <tr><td colspan="7">Failed to load data.</td></tr>
      `
    }
  },

  renderTable: function (movements) {
    const tbody = document.getElementById("movementTableBody")
    if (!tbody) return

    if (!movements.length) {
      tbody.innerHTML = `<tr><td colspan="7">No movement records found.</td></tr>`
      return
    }

    tbody.innerHTML = movements.map(movement => {
      const date = new Date(movement.movement_date).toLocaleString()
      const typeClass = movement.movement_type === "IN" ? "in" : movement.movement_type === "OUT" ? "out" : "adjust"
      const quantityColor = movement.movement_type === "IN"
        ? "#4caf50"
        : movement.movement_type === "OUT"
        ? "#f44336"
        : "#2196f3"
      const quantityPrefix = movement.movement_type === "IN"
        ? "+"
        : movement.movement_type === "OUT"
        ? "-"
        : ""

      return `
        <tr>
          <td>${date}</td>
          <td>${movement.product_name || "-"}</td>
          <td>${movement.batch_id || "-"}</td>
          <td><span class="movement-badge ${typeClass}">${movement.movement_type}</span></td>
          <td style="color: ${quantityColor};">${quantityPrefix}${movement.quantity.toLocaleString()}</td>
          <td>${movement.reference || ""}</td>
          <td>${movement.note || ""}</td>
        </tr>
      `
    }).join("")
  },

  filterMovements: function () {
    const searchTerm = document.getElementById("movementSearch").value.toLowerCase()
    const filtered = this.data.filter(m => {
      return (
        (m.product_name || "").toLowerCase().includes(searchTerm) ||
        (m.batch_code || "").toLowerCase().includes(searchTerm) ||
        (m.reference || "").toLowerCase().includes(searchTerm)
      )
    })
    this.renderTable(filtered)
  }
}
