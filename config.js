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
        
        // Check if we're on a production domain
        if (window.location.protocol === 'https:' && 
            !window.location.hostname.includes('localhost')) {
            return 'https://dobby-reply-assistant.onrender.com/api/generate-reply';
        }
        
        // Development fallback
        return 'http://localhost:8000/api/generate-reply';
    })(),
    
    // Environment Detection
    isProduction: () => {
        return window.location.protocol === 'https:' || 
               window.location.hostname !== 'localhost';
    },
    
    // Get the appropriate API endpoint
    getApiEndpoint: () => {
        return CONFIG.API_ENDPOINT;
    }
};

// Make it globally available
window.TWITTER_AI_CONFIG = CONFIG;
