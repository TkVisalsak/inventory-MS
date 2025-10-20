// API Configuration
window.API_CONFIG = {
  // Use environment variable or fallback to localhost for development
  BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : window.location.origin.replace(/:\d+$/, ':3000'), // Replace any port with 3000 for backend
  
  // Alternative: Use environment variable if available
  // BASE_URL: window.API_BASE_URL || 'http://localhost:3000'
};

// For Render deployment, you can set this manually:
// window.API_CONFIG.BASE_URL = 'https://your-backend-url.onrender.com';

// Helper function to get full API URL
window.getApiUrl = (endpoint) => {
  return `${window.API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG: window.API_CONFIG, getApiUrl: window.getApiUrl };
}
