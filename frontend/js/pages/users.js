window.PageModules = window.PageModules || {};

window.PageModules.users = {
  usersData: [],

  render: function () {
    return `
      <div class="dashboard-header">
        <h1>User Management</h1>
        <p>Manage system users and permissions</p>
      </div>

      <div class="page-controls">
        <div class="search-filters">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search users..." id="userSearch">
          </div>
          <div class="filter-group">
            <select class="filter-select" id="roleFilter">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="operator">Operator</option>
            </select>
            <select class="filter-select" id="statusFilter">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="openAddUserModal()">
          <i class="fas fa-plus"></i> Add User
        </button>
      </div>

      <div class="content-section">
        <div class="data-table-container">
          <table class="data-table" id="usersTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              <tr><td colspan="7" style="text-align:center;">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init: async function () {
    const self = window.PageModules.users;

    // Fetch user list
    try {
      const res = await fetch(window.getApiUrl("/api/auth/getAllUsers"));
      if (!res.ok) throw new Error("Failed to fetch users");
      self.usersData = await res.json();
      self.renderTable(self.usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
      document.getElementById("usersTableBody").innerHTML = `
        <tr><td colspan="7" style="text-align:center; color:red;">Failed to load users</td></tr>`;
    }

    // Set up filters
    document.getElementById("userSearch")?.addEventListener("input", self.filterUsers);
    document.getElementById("roleFilter")?.addEventListener("change", self.filterUsers);
    document.getElementById("statusFilter")?.addEventListener("change", self.filterUsers);
  },

  renderTable: function (data) {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(user => `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="role-badge ${user.role}">${user.role}</span></td>
        <td>${user.department || '-'}</td>
        <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
        <td><span class="status-badge ${user.status}">${user.status}</span></td>
        <td>
          <button class="btn-link" onclick="window.PageModules.users.editUser('${user.id}')">Edit</button>
          <button class="btn-link ${user.status === 'inactive' ? 'activate-btn' : ''}" 
                  onclick="window.PageModules.users.viewOrActivate('${user.id}', '${user.name}', '${user.status}')">
            ${user.status === 'inactive' ? 'Activate' : 'View'}
          </button>
        </td>
      </tr>
    `).join("");
  },

  filterUsers: function () {
    const searchTerm = document.getElementById("userSearch").value.toLowerCase();
    const role = document.getElementById("roleFilter").value.toLowerCase();
    const status = document.getElementById("statusFilter").value.toLowerCase();

    const filtered = window.PageModules.users.usersData.filter(user => {
      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const userRole = user.role?.toLowerCase() || "";
      const userStatus = user.status?.toLowerCase() || "";

      return (
        (name.includes(searchTerm) || email.includes(searchTerm)) &&
        (!role || userRole === role) &&
        (!status || userStatus === status)
      );
    });

    window.PageModules.users.renderTable(filtered);
  },

  editUser: function (userId) {
    const user = this.usersData.find(u => u.id == userId);
    if (user) {
      window.utils?.showNotification(`Editing user: ${user.name}`, "info");
      // Add modal or edit logic here
    }
  },

  viewOrActivate: function (userId, name, status) {
    const user = this.usersData.find(u => u.id == userId);
    if (!user) return;

    if (status === "inactive") {
      user.status = "active"; // Fake activation
      this.renderTable(this.usersData);
      window.utils?.showNotification(`User ${name} activated`, "success");
    } else {
      window.utils?.showNotification(`Viewing user: ${name}`, "info");
    }
  }
};
