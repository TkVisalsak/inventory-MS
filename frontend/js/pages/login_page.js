document.addEventListener('DOMContentLoaded', function () {
  // Get login form elements
  const loginForm = document.getElementById('login-form');
  const loginPassword = document.getElementById('login-password');

  // Password toggle logic
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function () {
      const passwordInput = this.parentElement.querySelector('input');
      const eyeIcon = this.querySelector('.eye-icon');
      const eyeOffIcon = this.querySelector('.eye-off-icon');

      const isVisible = passwordInput.type === 'text';
      passwordInput.type = isVisible ? 'password' : 'text';
      eyeIcon.classList.toggle('hidden', isVisible);
      eyeOffIcon.classList.toggle('hidden', !isVisible);
    });
  });

  // Form submit handler (LOGIN)
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAllErrors();

    const data = {
      email: document.getElementById("login-email").value,
      password: document.getElementById("login-password").value,
    };

    // Basic client-side validation
    if (!data.email.trim()) {
      showError("login-email", "Email is required");
      return;
    }

    if (!isValidEmail(data.email)) {
      showError("login-email", "Invalid email format");
      return;
    }

    if (!data.password.trim()) {
      showError("login-password", "Password is required");
      return;
    }

    try {
      const response = await fetch(window.getApiUrl(`/api/auth/login`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess("login-email");
        showSuccess("login-password");
        setTimeout(() => {
          window.location.href = '/frontend/index.html';
        }, 1000);
      } else {
        showLoginError();
      }
    } catch (error) {
      console.error("Request failed:", error);
      showLoginError();
    }
  });
});

// === Utilities ===

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  return minLength && hasUppercase && hasNumber && hasSpecial;
}

export function clearError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const formGroup = input.closest(".form-group");
  const errorElement = document.getElementById(inputId + "-error");

  formGroup?.classList.remove("error");
  if (errorElement) {
    errorElement.classList.remove("show");
    errorElement.textContent = "";
  }
}

export function clearAllErrors() {
  document.querySelectorAll(".error-message").forEach(el => {
    el.classList.remove("show");
    el.textContent = "";
  });
  document.querySelectorAll(".form-group").forEach(group => {
    group.classList.remove("error", "success");
  });
}

export function showError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const formGroup = input.closest(".form-group");
  const errorElement = document.getElementById(inputId + "-error");

  formGroup?.classList.add("error");
  formGroup?.classList.remove("success");

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }
}

export function showLoginError() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const passwordErrorElement = document.getElementById("login-password-error");

  emailInput.closest(".form-group").classList.add("error");
  passwordInput.closest(".form-group").classList.add("error");

  passwordErrorElement.textContent = "Invalid email or password";
  passwordErrorElement.classList.add("show");

  setTimeout(() => {
    clearError("login-email");
    clearError("login-password");
  }, 4000);
}

export function showSuccess(inputId) {
  const input = document.getElementById(inputId);
  const formGroup = input.closest(".form-group");
  formGroup.classList.add("success");
  formGroup.classList.remove("error");
}

