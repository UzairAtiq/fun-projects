/**
 * Main JavaScript for index.html
 */

// Check connection status on load
document.addEventListener('DOMContentLoaded', async () => {
    if (Config.isConfigured()) {
        await checkConnection();
    }
});

/**
 * Check connection to Mac
 */
async function checkConnection() {
    const statusEl = document.getElementById('connection-status');
    const dotEl = statusEl.querySelector('.status-dot');
    const textEl = statusEl.querySelector('.status-text');

    try {
        await API.testConnection();
        dotEl.classList.add('connected');
        textEl.textContent = 'Connected to your Mac';
    } catch (error) {
        dotEl.classList.remove('connected');
        textEl.textContent = 'Not connected';
        console.error('Connection error:', error);
    }
}

/**
 * Capture photo from camera
 */
async function capturePhoto(cameraId) {
    showResult('📸 Capturing photo...', 'info');
    
    try {
        const blob = await API.capturePhoto(cameraId);
        const imageUrl = URL.createObjectURL(blob);
        
        // Show in modal
        const modal = document.getElementById('imageModal');
        const img = document.getElementById('capturedImage');
        img.src = imageUrl;
        img.dataset.imageUrl = imageUrl;
        modal.style.display = 'flex';
        
        showResult('✅ Photo captured successfully!', 'success');
    } catch (error) {
        showResult('❌ Error: ' + error.message, 'error');
    }
}

/**
 * List all cameras
 */
async function listCameras() {
    showResult('📷 Detecting cameras...', 'info');
    
    try {
        const data = await API.listCameras();
        const cameras = data.cameras;
        
        if (cameras.length === 0) {
            showResult('❌ No cameras found', 'error');
            return;
        }

        let message = `Found ${cameras.length} camera(s):\n\n`;
        cameras.forEach(cam => {
            message += `Camera ${cam.id}: ${cam.status}`;
            if (cam.resolution) {
                message += ` (${cam.resolution})`;
            }
            message += '\n';
        });
        
        alert(message);
        showResult('✅ Camera list retrieved', 'success');
    } catch (error) {
        showResult('❌ Error: ' + error.message, 'error');
    }
}

/**
 * Lock screen
 */
async function lockScreen() {
    if (!confirm('🔒 Are you sure you want to lock your Mac?')) {
        return;
    }

    showResult('🔒 Locking screen...', 'info');
    
    try {
        const result = await API.lockScreen();
        showResult('✅ ' + result.result, 'success');
        await checkConnection(); // Recheck connection after lock
    } catch (error) {
        showResult('❌ Error: ' + error.message, 'error');
    }
}

/**
 * Restart Mac
 */
async function restartMac() {
    if (!confirm('⚠️ Are you sure you want to restart your Mac?\n\nThis will close all applications and restart the system.')) {
        return;
    }

    showResult('🔄 Sending restart command...', 'info');
    
    try {
        const result = await API.restart();
        showResult('✅ ' + result.result + ' Your Mac will restart shortly.', 'success');
    } catch (error) {
        showResult('❌ Error: ' + error.message, 'error');
    }
}

/**
 * Show result message
 */
function showResult(message, type = 'info') {
    const resultBox = document.getElementById('result');
    const resultContent = resultBox.querySelector('.result-content');
    
    resultBox.className = 'result-box result-' + type;
    resultContent.textContent = message;
    resultBox.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        resultBox.style.display = 'none';
    }, 5000);
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

/**
 * Download captured image
 */
function downloadImage() {
    const img = document.getElementById('capturedImage');
    const imageUrl = img.dataset.imageUrl;
    
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `mac-snapshot-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showResult('✅ Image downloaded', 'success');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 5000) {
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
