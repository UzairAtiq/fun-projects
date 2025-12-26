/**
 * Settings page JavaScript
 */

// Load current settings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentSettings();
});

/**
 * Load current settings from localStorage
 */
function loadCurrentSettings() {
    const apiUrl = Config.getApiUrl();
    const token = Config.getAuthToken();

    if (apiUrl) {
        document.getElementById('apiUrl').value = apiUrl;
    }
    
    if (token) {
        document.getElementById('authToken').value = token;
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const token = document.getElementById('authToken').value.trim();

    if (!apiUrl) {
        alert('❌ Please enter an API URL');
        return;
    }

    if (!token) {
        alert('❌ Please enter an authentication token');
        return;
    }

    // Validate URL format
    try {
        new URL(apiUrl);
    } catch (e) {
        alert('❌ Invalid URL format. Example: http://192.168.1.100:8080');
        return;
    }

    // Save settings
    Config.setApiUrl(apiUrl);
    Config.setAuthToken(token);

    showNotification('✅ Settings saved successfully!', 'success');
    
    // Redirect to home after 1 second
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * Test connection to Mac
 */
async function testConnection() {
    // Temporarily save settings to test
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const token = document.getElementById('authToken').value.trim();

    if (!apiUrl || !token) {
        alert('❌ Please enter both API URL and token first');
        return;
    }

    // Save temporarily
    const oldUrl = Config.getApiUrl();
    const oldToken = Config.getAuthToken();
    
    Config.setApiUrl(apiUrl);
    Config.setAuthToken(token);

    showNotification('🔍 Testing connection...', 'info');

    try {
        await API.testConnection();
        showNotification('✅ Connection successful!', 'success');
    } catch (error) {
        showNotification('❌ Connection failed: ' + error.message, 'error', 7000);
        // Restore old settings
        if (oldUrl) Config.setApiUrl(oldUrl);
        else localStorage.removeItem('mac_control_api_url');
        if (oldToken) Config.setAuthToken(oldToken);
        else localStorage.removeItem('mac_control_auth_token');
    }
}

/**
 * Clear all settings
 */
function clearSettings() {
    if (!confirm('⚠️ Are you sure you want to clear all settings?\n\nYou will need to reconfigure the connection.')) {
        return;
    }

    Config.clearAll();
    document.getElementById('apiUrl').value = '';
    document.getElementById('authToken').value = '';
    
    showNotification('✅ Settings cleared', 'success');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        maxWidth: '400px'
    });
    
    const colors = {
        info: 'rgba(59, 130, 246, 0.9)',
        success: 'rgba(74, 222, 128, 0.9)',
        error: 'rgba(239, 68, 68, 0.9)',
        warning: 'rgba(251, 191, 36, 0.9)'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}
