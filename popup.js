// Twitter AI Reply Assistant - Popup Script
// Handles the extension popup interface

class TwitterAIPopup {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.checkConnection();
    }

    // Load settings from storage
    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
            if (response.success) {
                const settings = response.settings;
                document.getElementById('fireworksApiKey').value = settings.fireworksApiKey || '';
                document.getElementById('apiEndpoint').value = settings.apiEndpoint;
                document.getElementById('defaultPrompt').value = settings.defaultPrompt;
                document.getElementById('maxLength').value = settings.maxLength;
                document.getElementById('autoOpenReply').checked = settings.autoOpenReply;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Save settings to storage
    async saveSettings() {
        const fireworksApiKey = document.getElementById('fireworksApiKey').value.trim();
        
        // Validate required Fireworks API key
        if (!fireworksApiKey) {
            this.showMessage('Fireworks API key is required!', 'error');
            document.getElementById('fireworksApiKey').focus();
            return;
        }

        const settings = {
            fireworksApiKey: fireworksApiKey,
            apiEndpoint: document.getElementById('apiEndpoint').value,
            defaultPrompt: document.getElementById('defaultPrompt').value,
            maxLength: parseInt(document.getElementById('maxLength').value),
            autoOpenReply: document.getElementById('autoOpenReply').checked
        };

        try {
            const response = await chrome.runtime.sendMessage({ 
                action: 'saveSettings', 
                settings: settings 
            });
            
            if (response.success) {
                this.showMessage('Settings saved successfully!', 'success');
            } else {
                this.showMessage('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showMessage('Failed to save settings', 'error');
        }
    }

    // Check API connection status
    async checkConnection() {
        try {
            // First check if API key is provided
            const fireworksApiKey = document.getElementById('fireworksApiKey').value.trim();
            if (!fireworksApiKey) {
                this.updateStatus('Fireworks API key required', 'error');
                return;
            }

            const response = await chrome.runtime.sendMessage({ action: 'checkAPIStatus' });
            if (response.success && response.status) {
                this.updateStatus('Connected to AI service', 'connected');
            } else {
                this.updateStatus('AI service unavailable', 'disconnected');
            }
        } catch (error) {
            this.updateStatus('Connection failed', 'error');
        }
    }

    // Test API connection
    async testConnection() {
        // First check if API key is provided
        const fireworksApiKey = document.getElementById('fireworksApiKey').value.trim();
        if (!fireworksApiKey) {
            this.updateStatus('Fireworks API key required', 'error');
            this.showMessage('Please enter your Fireworks API key first!', 'error');
            document.getElementById('fireworksApiKey').focus();
            return;
        }

        this.updateStatus('Testing connection...', 'testing');
        
        try {
            const response = await chrome.runtime.sendMessage({ action: 'checkAPIStatus' });
            if (response.success && response.status) {
                this.updateStatus('Connection successful!', 'connected');
                this.showMessage('API connection is working!', 'success');
            } else {
                this.updateStatus('Connection failed', 'disconnected');
                this.showMessage('Cannot connect to AI service. Please check your settings.', 'error');
            }
        } catch (error) {
            this.updateStatus('Connection error', 'error');
            this.showMessage('Connection test failed', 'error');
        }
    }

    // Update connection status display
    updateStatus(text, status) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        const statusDetails = document.getElementById('statusDetails');
        
        statusText.textContent = text;
        statusDot.className = `status-dot ${status}`;
        
        switch (status) {
            case 'connected':
                statusDetails.textContent = 'Ready to generate AI replies!';
                break;
            case 'disconnected':
                statusDetails.textContent = 'Make sure the AI service is running on localhost:8000';
                break;
            case 'testing':
                statusDetails.textContent = 'Testing API endpoint...';
                break;
            case 'error':
                if (text.includes('Fireworks API key required')) {
                    statusDetails.textContent = 'Please enter your Fireworks API key to continue';
                } else {
                    statusDetails.textContent = 'Check your API endpoint configuration';
                }
                break;
        }
    }

    // Show message to user
    showMessage(message, type) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            padding: 12px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            z-index: 1000;
            background: ${type === 'success' ? '#00ba7c' : '#e0245e'};
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 3000);
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('testConnection').addEventListener('click', () => {
            this.testConnection();
        });

        // Auto-save on input change
        document.getElementById('apiEndpoint').addEventListener('input', () => {
            this.debounce(() => this.saveSettings(), 1000);
        });

        document.getElementById('defaultPrompt').addEventListener('input', () => {
            this.debounce(() => this.saveSettings(), 1000);
        });

        document.getElementById('maxLength').addEventListener('input', () => {
            this.debounce(() => this.saveSettings(), 1000);
        });

        document.getElementById('autoOpenReply').addEventListener('change', () => {
            this.saveSettings();
        });

        // Fireworks API key visibility toggle
        document.getElementById('toggleApiKey').addEventListener('click', () => {
            this.toggleApiKeyVisibility();
        });

        // Auto-save on Fireworks API key change
        document.getElementById('fireworksApiKey').addEventListener('input', () => {
            this.debounce(() => this.saveSettings(), 1000);
            this.validateApiKey();
        });
    }

    // Validate API key format
    validateApiKey() {
        const apiKeyInput = document.getElementById('fireworksApiKey');
        const apiKey = apiKeyInput.value.trim();
        
        // Remove any existing validation styling
        apiKeyInput.classList.remove('valid', 'invalid');
        
        if (apiKey.length === 0) {
            // Empty - no validation needed
            return;
        }
        
        // Basic validation for Fireworks API key format
        if (apiKey.startsWith('fw_') && apiKey.length >= 20) {
            apiKeyInput.classList.add('valid');
        } else {
            apiKeyInput.classList.add('invalid');
        }
    }

    // Toggle API key visibility
    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('fireworksApiKey');
        const toggleButton = document.getElementById('toggleApiKey');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleButton.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            toggleButton.textContent = '👁️';
        }
    }

    // Debounce function to limit API calls
    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TwitterAIPopup();
});
