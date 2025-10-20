// Enhanced Modal functionality with proper overlays
class ModalManager {
  constructor() {
    this.activeModal = null
    this.init()
  }

  init() {
    // Create modal container if it doesn't exist
    if (!document.getElementById("modal-container")) {
      const container = document.createElement("div")
      container.id = "modal-container"
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        backdrop-filter: blur(2px);
      `
      document.body.appendChild(container)

      // Close modal when clicking outside
      container.addEventListener("click", (e) => {
        if (e.target === container) {
          this.closeModal()
        }
      })

      // Close modal with Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.activeModal) {
          this.closeModal()
        }
      })
    }
  }

  showModal(title, content, actions = [], options = {}) {
    const container = document.getElementById("modal-container")

    const modal = document.createElement("div")
    modal.className = "modal"
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 0;
      max-width: ${options.width || "500px"};
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: modalSlideIn 0.3s ease;
    `

    // Add animation keyframes
    if (!document.getElementById("modal-styles")) {
      const style = document.createElement("style")
      style.id = "modal-styles"
      style.textContent = `
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `
      document.head.appendChild(style)
    }

    const header = document.createElement("div")
    header.style.cssText = `
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    const titleElement = document.createElement("h3")
    titleElement.textContent = title
    titleElement.style.cssText = `
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    `

    const closeButton = document.createElement("button")
    closeButton.innerHTML = '<i class="fas fa-times"></i>'
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    `
    closeButton.addEventListener("mouseenter", () => {
      closeButton.style.backgroundColor = "#f3f4f6"
      closeButton.style.color = "#374151"
    })
    closeButton.addEventListener("mouseleave", () => {
      closeButton.style.backgroundColor = "transparent"
      closeButton.style.color = "#6b7280"
    })
    closeButton.addEventListener("click", () => this.closeModal())

    header.appendChild(titleElement)
    header.appendChild(closeButton)

    const body = document.createElement("div")
    body.style.cssText = `padding: 1.5rem;`
    body.innerHTML = content

    const footer = document.createElement("div")
    footer.style.cssText = `
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background-color: #f9fafb;
    `

    actions.forEach((action) => {
      const button = document.createElement("button")
      button.textContent = action.text
      button.className = `btn ${action.type || "btn-primary"}`
      button.addEventListener("click", action.handler)
      footer.appendChild(button)
    })

    modal.appendChild(header)
    modal.appendChild(body)
    if (actions.length > 0) {
      modal.appendChild(footer)
    }

    container.innerHTML = ""
    container.appendChild(modal)
    container.style.display = "flex"
    this.activeModal = modal

    // Focus trap
    const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }

  closeModal() {
    const container = document.getElementById("modal-container")
    if (container && this.activeModal) {
      // Add fade out animation
      this.activeModal.style.animation = "modalSlideOut 0.2s ease"
      container.style.opacity = "0"

      setTimeout(() => {
        container.style.display = "none"
        container.style.opacity = "1"
        container.innerHTML = ""
        this.activeModal = null
      }, 200)
    }
  }

  confirm(title, message, onConfirm) {
    this.showModal(title, `<p style="margin: 0; line-height: 1.6;">${message}</p>`, [
      {
        text: "Cancel",
        type: "btn-secondary",
        handler: () => this.closeModal(),
      },
      {
        text: "Confirm",
        type: "btn-primary",
        handler: () => {
          onConfirm()
          this.closeModal()
        },
      },
    ])
  }

  // Form modal helper
  showFormModal(title, fields, onSubmit, options = {}) {
    const formHTML = `
      <form id="modal-form" style="display: flex; flex-direction: column; gap: 1rem;">
        ${fields.map((field) => this.generateFormField(field)).join("")}
      </form>
    `

    this.showModal(
      title,
      formHTML,
      [
        {
          text: "Cancel",
          type: "btn-secondary",
          handler: () => this.closeModal(),
        },
        {
          text: options.submitText || "Save",
          type: "btn-primary",
          handler: () => {
            const form = document.getElementById("modal-form")
            const formData = new FormData(form)
            const data = Object.fromEntries(formData.entries())

            if (onSubmit(data)) {
              this.closeModal()
            }
          },
        },
      ],
      options,
    )
  }

  generateFormField(field) {
    const { type, name, label, placeholder, required, options, value } = field

    let inputHTML = ""

    switch (type) {
      case "select":
        inputHTML = `
          <select name="${name}" ${required ? "required" : ""} style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
            <option value="">${placeholder || "Select..."}</option>
            ${options.map((opt) => `<option value="${opt.value}" ${value === opt.value ? "selected" : ""}>${opt.label}</option>`).join("")}
          </select>
        `
        break
      case "textarea":
        inputHTML = `
          <textarea name="${name}" placeholder="${placeholder || ""}" ${required ? "required" : ""} 
            style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; min-height: 80px; resize: vertical;">${value || ""}</textarea>
        `
        break
      default:
        inputHTML = `
          <input type="${type || "text"}" name="${name}" placeholder="${placeholder || ""}" 
            value="${value || ""}" ${required ? "required" : ""} 
            style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
        `
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="font-weight: 500; color: #374151; font-size: 0.875rem;">
          ${label} ${required ? '<span style="color: #ef4444;">*</span>' : ""}
        </label>
        ${inputHTML}
      </div>
    `
  }
}

// Initialize modal manager
const modalManager = new ModalManager()

// Export for global use
window.modalManager = modalManager

console.log("Enhanced modal system initialized and ready")
