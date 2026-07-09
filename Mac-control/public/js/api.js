/**
 * API Communication Module
 * Handles all HTTP requests to the Mac Control backend
 */

const API = {
    /**
     * Make an API request
     */
    async request(endpoint, options = {}) {
        const apiUrl = Config.getApiUrl();
        const token = Config.getAuthToken();

        if (!apiUrl || !token) {
            throw new Error('API not configured. Please go to Settings.');
        }

        const url = `${apiUrl}${endpoint}`;
        
        const headers = {
            'X-Auth-Token': token,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Handle unauthorized
            if (response.status === 401) {
                throw new Error('Invalid authentication token');
            }

            return response;
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to your Mac. Make sure it\'s on and the server is running.');
            }
            throw error;
        }
    },

    /**
     * Get system status
     */
    async getStatus() {
        const response = await this.request('/status/');
        if (!response.ok) {
            throw new Error('Failed to get system status');
        }
        return await response.json();
    },

    /**
     * Capture photo from camera
     */
    async capturePhoto(cameraId = 0) {
        const response = await this.request(`/camera/?camera=${cameraId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to capture photo');
        }
        return await response.blob();
    },

    /**
     * List available cameras
     */
    async listCameras() {
        const response = await this.request('/camera/list');
        if (!response.ok) {
            throw new Error('Failed to list cameras');
        }
        return await response.json();
    },

    /**
     * Lock screen
     */
    async lockScreen() {
        const response = await this.request('/actions/lock', {
            method: 'POST'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to lock screen');
        }
        return await response.json();
    },

    /**
     * Restart system
     */
    async restart() {
        const response = await this.request('/actions/restart', {
            method: 'POST'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to restart');
        }
        return await response.json();
    },

    /**
     * Test connection
     */
    async testConnection() {
        try {
            await this.getStatus();
            return true;
        } catch (error) {
            throw error;
        }
    }
};
