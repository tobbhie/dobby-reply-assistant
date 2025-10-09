// Configuration for Twitter AI Reply Assistant
// Automatically detects the correct API endpoint

const CONFIG = {
    // API Endpoint Configuration - Auto-detected
    API_ENDPOINT: (() => {
        // Check if we're in a Chrome extension context
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            // We're in a Chrome extension - use production endpoint
            return 'https://dobby-reply-assistant.onrender.com/api/generate-reply';
        }
        
        // Check if we're on a production domain (only if window is available)
        if (typeof window !== 'undefined' && window.location) {
            if (window.location.protocol === 'https:' && 
                !window.location.hostname.includes('localhost')) {
                return 'https://dobby-reply-assistant.onrender.com/api/generate-reply';
            }
        }
        
        // Development fallback
        return 'http://localhost:8000/api/generate-reply';
    })(),
    
    // Environment Detection
    isProduction: () => {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.protocol === 'https:' || 
                   window.location.hostname !== 'localhost';
        }
        return true; // Assume production in service worker context
    },
    
    // Get the appropriate API endpoint
    getApiEndpoint: () => {
        return CONFIG.API_ENDPOINT;
    }
};

// Make it globally available (only if window is available)
if (typeof window !== 'undefined') {
    window.TWITTER_AI_CONFIG = CONFIG;
}
