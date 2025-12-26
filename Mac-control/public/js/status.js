/**
 * Status page JavaScript
 */

// Load status on page load
document.addEventListener('DOMContentLoaded', () => {
    if (Config.isConfigured()) {
        loadStatus();
    }
});

/**
 * Load and display system status
 */
async function loadStatus() {
    const contentEl = document.getElementById('statusContent');
    const hostnameEl = document.getElementById('hostname');
    
    try {
        const data = await API.getStatus();
        
        // Update hostname
        hostnameEl.textContent = `🖥️ ${data.hostname}`;
        
        // Build status HTML
        const html = `
            <!-- Memory Card -->
            <div class="info-card">
                <div class="card-header">
                    <span class="card-icon-large">💾</span>
                    <h3>Memory Usage</h3>
                </div>
                <div class="stat-list">
                    <div class="stat-item">
                        <span class="stat-label">Total Memory</span>
                        <span class="stat-value">${data.memory.total}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Used Memory</span>
                        <span class="stat-value stat-warning">${data.memory.used}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Available Memory</span>
                        <span class="stat-value stat-success">${data.memory.available}</span>
                    </div>
                </div>
            </div>

            <!-- Storage Card -->
            <div class="info-card">
                <div class="card-header">
                    <span class="card-icon-large">💽</span>
                    <h3>Storage Usage</h3>
                </div>
                <div class="stat-list">
                    <div class="stat-item">
                        <span class="stat-label">Total Storage</span>
                        <span class="stat-value">${data.storage.total}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Used Storage</span>
                        <span class="stat-value stat-warning">${data.storage.used}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Available Storage</span>
                        <span class="stat-value stat-success">${data.storage.available}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Usage Percentage</span>
                        <span class="stat-value">${data.storage.percent_used}</span>
                    </div>
                </div>
            </div>

            <!-- Battery Card -->
            <div class="info-card">
                <div class="card-header">
                    <span class="card-icon-large">🔋</span>
                    <h3>Battery Status</h3>
                </div>
                <div class="stat-list">
                    <div class="stat-item">
                        <span class="stat-label">Battery Level</span>
                        <span class="stat-value stat-success">${data.battery.percent}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Status</span>
                        <span class="stat-value">${data.battery.status}</span>
                    </div>
                </div>
            </div>

            <!-- Running Apps Card -->
            <div class="info-card info-card-full">
                <div class="card-header">
                    <span class="card-icon-large">🚀</span>
                    <h3>Running Applications</h3>
                </div>
                <div class="apps-grid">
                    ${data.running_apps.map(app => `<div class="app-badge">${app}</div>`).join('')}
                </div>
            </div>
        `;
        
        contentEl.innerHTML = html;
    } catch (error) {
        contentEl.innerHTML = `
            <div class="info-card">
                <div class="card-header">
                    <span class="card-icon-large">⚠️</span>
                    <h3>Error Loading Status</h3>
                </div>
                <p style="color: var(--text-secondary); padding: var(--spacing-md);">
                    ${error.message}<br><br>
                    Please check your <a href="settings.html" style="color: var(--info-color);">settings</a>
                    and make sure your Mac is running the control server.
                </p>
            </div>
        `;
    }
}
