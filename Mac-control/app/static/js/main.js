/**
 * Mac Control - Main JavaScript
 * Handles client-side interactions and animations
 */

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize application
 */
function initializeApp() {
    console.log('Mac Control app initialized');
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add keyboard shortcuts
    addKeyboardShortcuts();
    
    // Add loading states to links
    addLoadingStates();
}

/**
 * Add keyboard shortcuts
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Refresh page with Cmd+R or Ctrl+R (prevent default and use custom)
        if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
            e.preventDefault();
            location.reload();
        }
        
        // Go home with Cmd+H or Ctrl+H
        if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
            e.preventDefault();
            const token = new URLSearchParams(window.location.search).get('token');
            if (token) {
                window.location.href = `/?token=${token}`;
            }
        }
    });
}

/**
 * Add loading states to external links
 */
function addLoadingStates() {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => {
        link.addEventListener('click', function() {
            const icon = this.querySelector('.card-icon');
            if (icon) {
                const originalText = icon.textContent;
                icon.textContent = '⏳';
                setTimeout(() => {
                    icon.textContent = originalText;
                }, 2000);
            }
        });
    });
}

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - Message type: 'info', 'success', 'error', 'warning'
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
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
        maxWidth: '400px',
        wordWrap: 'break-word'
    });
    
    // Set background color based on type
    const colors = {
        info: 'rgba(59, 130, 246, 0.9)',
        success: 'rgba(74, 222, 128, 0.9)',
        error: 'rgba(239, 68, 68, 0.9)',
        warning: 'rgba(251, 191, 36, 0.9)'
    };
    notification.style.background = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
async function apiRequest(url, options = {}) {
    const token = new URLSearchParams(window.location.search).get('token');
    
    if (!token) {
        throw new Error('Authentication token not found');
    }
    
    // Add token to URL if not already present
    const urlObj = new URL(url, window.location.origin);
    if (!urlObj.searchParams.has('token')) {
        urlObj.searchParams.set('token', token);
    }
    
    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    return fetch(urlObj.toString(), {
        ...options,
        headers
    });
}

/**
 * Confirm action with custom dialog
 * @param {string} message - Confirmation message
 * @returns {boolean} - User confirmation
 */
function confirmAction(message) {
    return confirm(message);
}

/**
 * Format bytes to human readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Add animation keyframes to document
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in templates
window.MacControl = {
    showNotification,
    apiRequest,
    confirmAction,
    formatBytes
};
