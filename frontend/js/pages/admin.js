// Admin page module
window.PageModules = window.PageModules || {}

window.PageModules.admin = {
  render: () => `
    <div class="dashboard-header">
      <h1>Admin Panel</h1>
      <p>System administration and configuration</p>
    </div>

    <div class="admin-grid">
      <!-- System Settings -->
      <div class="admin-section">
        <div class="section-header">
          <h2>System Settings</h2>
          <p>Configure system parameters</p>
        </div>
        <div class="admin-items">
          <div class="admin-item">
            <i class="fas fa-cog"></i>
            <div class="item-content">
              <h4>General Settings</h4>
              <p>Company info, timezone, currency</p>
            </div>
            <button class="btn-link">Configure</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-bell"></i>
            <div class="item-content">
              <h4>Notifications</h4>
              <p>Email alerts and system notifications</p>
            </div>
            <button class="btn-link">Configure</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-shield-alt"></i>
            <div class="item-content">
              <h4>Security Settings</h4>
              <p>Password policies, session timeout</p>
            </div>
            <button class="btn-link">Configure</button>
          </div>
        </div>
      </div>

      <!-- User Management -->
      <div class="admin-section">
        <div class="section-header">
          <h2>User Management</h2>
          <p>Manage users and permissions</p>
        </div>
        <div class="admin-items">
          <div class="admin-item">
            <i class="fas fa-users"></i>
            <div class="item-content">
              <h4>User Accounts</h4>
              <p>Create and manage user accounts</p>
            </div>
            <button class="btn-link">Manage</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-user-shield"></i>
            <div class="item-content">
              <h4>Roles & Permissions</h4>
              <p>Define user roles and access levels</p>
            </div>
            <button class="btn-link">Configure</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-history"></i>
            <div class="item-content">
              <h4>User Activity</h4>
              <p>Monitor user login and activities</p>
            </div>
            <button class="btn-link">View Logs</button>
          </div>
        </div>
      </div>

      <!-- System Maintenance -->
      <div class="admin-section">
        <div class="section-header">
          <h2>System Maintenance</h2>
          <p>Database and system maintenance</p>
        </div>
        <div class="admin-items">
          <div class="admin-item">
            <i class="fas fa-database"></i>
            <div class="item-content">
              <h4>Database Backup</h4>
              <p>Create and restore database backups</p>
            </div>
            <button class="btn-link">Backup Now</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-broom"></i>
            <div class="item-content">
              <h4>System Cleanup</h4>
              <p>Clean temporary files and logs</p>
            </div>
            <button class="btn-link">Clean Up</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-chart-line"></i>
            <div class="item-content">
              <h4>System Performance</h4>
              <p>Monitor system performance metrics</p>
            </div>
            <button class="btn-link">View Stats</button>
          </div>
        </div>
      </div>

      <!-- Integration Settings -->
      <div class="admin-section">
        <div class="section-header">
          <h2>Integration Settings</h2>
          <p>Third-party integrations</p>
        </div>
        <div class="admin-items">
          <div class="admin-item">
            <i class="fas fa-envelope"></i>
            <div class="item-content">
              <h4>Email Configuration</h4>
              <p>SMTP settings for email notifications</p>
            </div>
            <button class="btn-link">Configure</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-cloud"></i>
            <div class="item-content">
              <h4>Cloud Storage</h4>
              <p>Configure cloud backup storage</p>
            </div>
            <button class="btn-link">Setup</button>
          </div>
          <div class="admin-item">
            <i class="fas fa-plug"></i>
            <div class="item-content">
              <h4>API Settings</h4>
              <p>Manage API keys and endpoints</p>
            </div>
            <button class="btn-link">Manage</button>
          </div>
        </div>
      </div>
    </div>
  `,

  init: () => {
    // Initialize admin item buttons
    const configButtons = document.querySelectorAll(".btn-link")

    configButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemName = e.target.closest(".admin-item").querySelector("h4").textContent
        const action = button.textContent

        if (action === "Backup Now") {
          window.utils.showNotification(`Database backup started`, "info")
          setTimeout(() => {
            window.utils.showNotification(`Database backup completed successfully`, "success")
          }, 2000)
        } else if (action === "Clean Up") {
          window.utils.showNotification(`System cleanup started`, "info")
          setTimeout(() => {
            window.utils.showNotification(`System cleanup completed successfully`, "success")
          }, 2000)
        } else {
          window.utils.showNotification(`${action} ${itemName}`, "info")
        }
      })
    })
  },
}
