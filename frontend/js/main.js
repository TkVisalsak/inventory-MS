// Main navigation and routing logic
class InventoryApp {
  constructor() {
    this.currentPage = "dashboard"
    this.init()
  }

  init() {
    this.setupNavigation()
    this.setupMobileMenu()
    this.loadPage("dashboard") // Load default page
  }

  setupNavigation() {
    const menuItems = document.querySelectorAll(".menu-item a")

    menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()

        // Get the page from data attribute
        const page = e.target.getAttribute("data-page") || e.target.closest("a").getAttribute("data-page")

        if (page) {
          this.navigateToPage(page)
        }
      })
    })
  }

  // Navigate to a specific page
  navigateToPage(page) {
    // Update active menu item
    this.updateActiveMenuItem(page)

    // Load the page content
    this.loadPage(page)
  }

  // Update active menu item
  updateActiveMenuItem(page) {
    // Remove active class from all items
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.remove("active")
    })

    // Add active class to the selected page
    const targetMenuItem = document.querySelector(`[data-page="${page}"]`)
    if (targetMenuItem) {
      targetMenuItem.closest(".menu-item").classList.add("active")
    }
  }

  // Load page content
  async loadPage(page) {
    this.currentPage = page
    const container = document.getElementById("pageContent")

    // Show loading state
    container.innerHTML = `
      <div class="dashboard-header">
        <h1>Loading...</h1>
        <p>Please wait while we load the ${page} page.</p>
      </div>
    `

    try {
      // Try to load from HTML file first
      const response = await fetch(`pages/${page}.html`)
      if (response.ok) {
        const html = await response.text()
        container.innerHTML = html

        // Load and execute page-specific JavaScript
        await this.loadPageScript(page)
      } else {
        // Fallback to JavaScript-generated content
        this.loadPageFromJS(page, container)
      }
    } catch (error) {
      console.warn(`HTML file not found for ${page}, trying JavaScript fallback`)
      this.loadPageFromJS(page, container)
    }
  }

  // Fallback to JavaScript-generated content
  loadPageFromJS(page, container) {
    // First try to load the script if it's not already loaded
    this.loadPageScript(page).then(() => {
      if (window.PageModules && window.PageModules[page] && typeof window.PageModules[page].render === "function") {
        container.innerHTML = window.PageModules[page].render()

        // Initialize page if it has an init function
        if (typeof window.PageModules[page].init === "function") {
          window.PageModules[page].init()
        }
      } else {
        // Show error if page module not found
        container.innerHTML = `
          <div class="dashboard-header">
            <h1>Page Not Found</h1>
            <p>The page "${page}" could not be loaded. Please check if the page exists.</p>
            <button class="btn btn-primary" onclick="app.navigateToPage('dashboard')">
              <i class="fas fa-home"></i> Go to Dashboard
            </button>
          </div>
        `
      }
    })
  }

  // Load page-specific JavaScript
  async loadPageScript(page) {
    try {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="js/pages/${page}.js"]`)
      if (existingScript) {
        // If script exists, just call the init function
        if (window.PageModules && window.PageModules[page] && typeof window.PageModules[page].init === "function") {
          window.PageModules[page].init()
        }
        return Promise.resolve()
      }

      // Load the script dynamically
      return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = `js/pages/${page}.js`
        script.onload = () => {
          // Initialize the page after script loads
          if (window.PageModules && window.PageModules[page] && typeof window.PageModules[page].init === "function") {
            window.PageModules[page].init()
          }
          resolve()
        }
        script.onerror = () => {
          console.warn(`No JavaScript file found for page: ${page}`)
          resolve() // Don't reject, just continue
        }

        document.head.appendChild(script)
      })
    } catch (error) {
      console.warn(`Error loading script for page ${page}:`, error)
      return Promise.resolve()
    }
  }

  setupMobileMenu() {
    // Add mobile menu toggle functionality
    const sidebar = document.querySelector(".sidebar")

    // Create mobile menu button for small screens
    if (window.innerWidth <= 768) {
      this.createMobileMenuButton(sidebar)
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        this.createMobileMenuButton(sidebar)
      } else {
        this.removeMobileMenuButton()
      }
    })
  }

  createMobileMenuButton(sidebar) {
    // Remove existing button if any
    this.removeMobileMenuButton()

    const menuButton = document.createElement("button")
    menuButton.className = "mobile-menu-btn"
    menuButton.innerHTML = '<i class="fas fa-bars"></i>'
    menuButton.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1001;
      background: #667eea;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `

    document.body.appendChild(menuButton)

    menuButton.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })

    // Close sidebar when clicking outside
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !menuButton.contains(e.target)) {
        sidebar.classList.remove("open")
      }
    })
  }

  removeMobileMenuButton() {
    const existingButton = document.querySelector(".mobile-menu-btn")
    if (existingButton) {
      existingButton.remove()
    }
  }
}

// Initialize the page modules container
window.PageModules = {}

// Global app instance
let app

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  app = new InventoryApp()

  // Make app globally accessible for navigation
  window.app = app
})

// Global navigation function
function navigateToPage(page) {
  if (window.app) {
    window.app.navigateToPage(page)
  }
}
