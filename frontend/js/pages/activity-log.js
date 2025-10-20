// Activity Log Page Module
window.PageModules = window.PageModules || {};

window.PageModules["activity-log"] = {
  render: () => `
    <div class="dashboard-header">
      <h1>Activity Log</h1>
      <p>System activity and user action tracking</p>
    </div>

    <div class="page-controls">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search activities..." id="activitySearch">
        </div>
        <div class="filter-group">
          <select class="filter-select" id="userFilter">
            <option value="">All Users</option>
          </select>
          <select class="filter-select" id="actionFilter">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>
          <input type="date" class="filter-select" id="dateFilter">
        </div>
      </div>
      <button class="btn btn-primary" onclick="exportActivityLog()">
        <i class="fas fa-download"></i> Export Log
      </button>
    </div>

    <div class="content-section">
      <div class="data-table-container">
        <table class="data-table" id="activityTable">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `,

  init: async function () {
    const searchInput = document.getElementById("activitySearch");
    const userFilter = document.getElementById("userFilter");
    const actionFilter = document.getElementById("actionFilter");
    const dateFilter = document.getElementById("dateFilter");

    if (searchInput) searchInput.addEventListener("input", this.filterActivities);
    if (userFilter) userFilter.addEventListener("change", this.filterActivities);
    if (actionFilter) actionFilter.addEventListener("change", this.filterActivities);
    if (dateFilter) dateFilter.addEventListener("change", this.filterActivities);

    await this.loadData();
  },

loadData: async function () {
  try {
    const res = await fetch(window.getApiUrl("/api/auth/getUserActivityLogs"));
    const { data } = await res.json();

    const tbody = document.querySelector("#activityTable tbody");
    tbody.innerHTML = "";

    const usersSet = new Set();

    data.forEach((log) => {
      const {
        created_at,
        user_id,
        activity_type,
        description,
        entity_type,
        ip_address,
        status,
      } = log;

      const safeUser = user_id || "Unknown";
      const safeAction = activity_type ? activity_type.toLowerCase() : "unknown";
      const safeActionText = activity_type ? activity_type.toUpperCase() : "UNKNOWN";
      const safeStatus = (status || "Unknown").toLowerCase();
      const safeStatusBadge = safeStatus === "success" ? "good" : "danger";

      usersSet.add(safeUser);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${created_at ? new Date(created_at).toLocaleString() : "-"}</td>
        <td>${safeUser}</td>
        <td><span class="action-badge ${safeAction}">${safeActionText}</span></td>
        <td>${entity_type || "-"}</td>
        <td>${description || "-"}</td>
        <td>${ip_address || "-"}</td>
        <td><span class="status-badge ${safeStatusBadge}">${status || "Unknown"}</span></td>
      `;
      tbody.appendChild(row);
    });

    // Populate user filter dynamically
    const userFilter = document.getElementById("userFilter");
    usersSet.forEach((user) => {
      const opt = document.createElement("option");
      opt.value = user;
      opt.textContent = user;
      userFilter.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ Failed to load activity logs:", err);
  }
},


  filterActivities: () => {
    const searchTerm = document.getElementById("activitySearch")?.value.toLowerCase() || "";
    const userFilter = document.getElementById("userFilter")?.value.toLowerCase() || "";
    const actionFilter = document.getElementById("actionFilter")?.value.toLowerCase() || "";
    const dateFilter = document.getElementById("dateFilter")?.value || "";

    const rows = document.querySelectorAll("#activityTable tbody tr");

    rows.forEach((row) => {
      const timestamp = row.cells[0].textContent;
      const user = row.cells[1].textContent.toLowerCase();
      const action = row.cells[2].textContent.toLowerCase();
      const resource = row.cells[3].textContent.toLowerCase();
      const details = row.cells[4].textContent.toLowerCase();

      const matchesSearch =
        details.includes(searchTerm) || resource.includes(searchTerm) || user.includes(searchTerm);
      const matchesUser = !userFilter || user.includes(userFilter);
      const matchesAction = !actionFilter || action.includes(actionFilter);
      const matchesDate = !dateFilter || timestamp.includes(dateFilter);

      if (matchesSearch && matchesUser && matchesAction && matchesDate) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  },
};

// Dummy export function placeholder
function exportActivityLog() {
  alert("Export feature not yet implemented.");
}
