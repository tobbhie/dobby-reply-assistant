// Dobby Reply Assistant - Background Script
// Handles API communication and extension management

class TwitterAIBackground {
    constructor() {
        // Auto-detect API endpoint from environment or use defaults
        this.defaultEndpoint = this.detectApiEndpoint();
        this.apiEndpoint = this.defaultEndpoint;
        this.loadSettings();
        this.setupMessageHandling();
    }

    detectApiEndpoint() {
        // Use configuration from config.js if available
        if (window.TWITTER_AI_CONFIG) {
            return window.TWITTER_AI_CONFIG.getApiEndpoint();
        }
        
        // Fallback detection
        const isProduction = window.location.protocol === 'https:' || 
                           window.location.hostname !== 'localhost';
        
        if (isProduction) {
            // Default production endpoint
            return 'https://twitter-ai-api.onrender.com/api/generate-reply';
        }
        
        // Development default
        return 'http://localhost:8000/api/generate-reply';
    }

    async loadSettings() {
        try {
            const settings = await this.getSettings();
            if (settings?.apiEndpoint) {
                this.apiEndpoint = settings.apiEndpoint;
            }
            // Store Fireworks API key for use in API calls
            this.fireworksApiKey = settings?.fireworksApiKey || '';
        } catch (e) {
            this.apiEndpoint = this.defaultEndpoint;
            this.fireworksApiKey = '';
        }
    }

    setupMessageHandling() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'generateReply':
                    const reply = await this.generateAIReply(request.data);
                    sendResponse({ success: true, reply });
                    break;
                
                case 'checkAPIStatus':
                    const status = await this.checkAPIStatus();
                    sendResponse({ success: true, status });
                    break;
                
                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, settings });
                    break;
                
                case 'saveSettings':
                    await this.saveSettings(request.settings);
                    sendResponse({ success: true });
                    break;
                
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    // Generate AI reply using the local API with retry logic
    async generateAIReply(data, retryCount = 0) {
        const maxRetries = 2;
        
        try {
            // Get current settings including Fireworks API key
            const settings = await this.getSettings();
            
            // Validate that Fireworks API key is provided
            if (!settings.fireworksApiKey || settings.fireworksApiKey.trim() === '') {
                throw new Error('Fireworks API key is required. Please configure it in the extension settings.');
            }
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tweet: data.tweet,
                    author: data.author,
                    context: data.context,
                    prompt: data.prompt || "Generate a helpful, engaging reply to this tweet. Keep it under 280 characters and make it sound natural and conversational.",
                    fireworksApiKey: settings.fireworksApiKey
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                // Handle specific error cases
                if (response.status === 400) {
                    throw new Error('Fireworks API key is required. Please configure it in the extension settings.');
                } else if (response.status === 403) {
                    throw new Error('Invalid Fireworks API key. Please check your API key in the extension settings.');
                } else if (response.status === 401) {
                    throw new Error('Unauthorized. Please verify your Fireworks API key is correct.');
                } else {
                    throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
                }
            }

            const result = await response.json();
            return result.reply;
        } catch (error) {
            console.error('Error generating AI reply:', error);
            
            // If it's already a specific error message, preserve it
            if (error.message.includes('Fireworks API key') || 
                error.message.includes('Invalid') || 
                error.message.includes('Unauthorized')) {
                throw error;
            }
            
            // Retry logic for network/server errors
            if (retryCount < maxRetries && (
                error.message.includes('Failed to fetch') ||
                error.message.includes('NetworkError') ||
                error.message.includes('500') ||
                error.message.includes('502') ||
                error.message.includes('503')
            )) {
                console.log(`Retrying AI reply generation (attempt ${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                return this.generateAIReply(data, retryCount + 1);
            }
            
            // Otherwise, show generic connection error
            throw new Error('Failed to connect to AI service. Please make sure the local server is running.');
        }
    }

    // Check if the local AI API is available
    async checkAPIStatus() {
        try {
            const healthUrl = this.apiEndpoint.endsWith('/generate-reply')
                ? this.apiEndpoint.replace('/api/generate-reply', '/health')
                : `${this.apiEndpoint.replace(/\/$/, '')}/health`;

            const response = await fetch(healthUrl, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Get extension settings
    async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                apiEndpoint: 'http://localhost:8000/api/generate-reply',
                defaultPrompt: 'Generate a helpful, engaging reply to this tweet. Keep it under 280 characters and make it sound natural and conversational.',
                maxLength: 280,
                autoOpenReply: false
            }, (syncSettings) => {
                // Get Fireworks API key from local storage (not synced)
                chrome.storage.local.get({
                    fireworksApiKey: ''
                }, (localSettings) => {
                    resolve({
                        ...syncSettings,
                        ...localSettings
                    });
                });
            });
        });
    }

    // Save extension settings
    async saveSettings(settings) {
        return new Promise((resolve) => {
            const { fireworksApiKey, ...syncSettings } = settings;
            
            // Save non-sensitive settings to sync storage
            chrome.storage.sync.set(syncSettings, () => {
                // Save sensitive API key to local storage only
                if (fireworksApiKey !== undefined) {
                    chrome.storage.local.set({ fireworksApiKey }, resolve);
                } else {
                    resolve();
                }
            });
        });
    }
}

// Initialize background script
new TwitterAIBackground();
