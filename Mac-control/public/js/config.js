/**
 * Configuration Management
 * Stores API URL and authentication token in localStorage
 */

const Config = {
    // Get API URL from localStorage or use default
    getApiUrl() {
        return localStorage.getItem('mac_control_api_url') || '';
    },

    // Set API URL
    setApiUrl(url) {
        // Remove trailing slash
        url = url.replace(/\/$/, '');
        localStorage.setItem('mac_control_api_url', url);
    },

    // Get auth token
    getAuthToken() {
        return localStorage.getItem('mac_control_auth_token') || '';
    },

    // Set auth token
    setAuthToken(token) {
        localStorage.setItem('mac_control_auth_token', token);
    },

    // Check if configured
    isConfigured() {
        return this.getApiUrl() && this.getAuthToken();
    },

    // Clear all settings
    clearAll() {
        localStorage.removeItem('mac_control_api_url');
        localStorage.removeItem('mac_control_auth_token');
    },

    // Redirect to settings if not configured
    requireConfig() {
        if (!this.isConfigured()) {
            if (!window.location.pathname.includes('settings.html')) {
                window.location.href = 'settings.html';
            }
            return false;
        }
        return true;
    }
};

// Check configuration on page load (except settings page)
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('settings.html')) {
        if (!Config.isConfigured()) {
            showNotification('⚙️ Please configure your API settings first', 'warning', 5000);
            setTimeout(() => {
                window.location.href = 'settings.html';
            }, 2000);
        }
    }
});
