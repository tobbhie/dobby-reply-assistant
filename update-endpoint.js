#!/usr/bin/env node
/**
 * Simple script to update the API endpoint in config.js
 * Usage: node update-endpoint.js https://your-api-url.com/api/generate-reply
 */

const fs = require('fs');
const path = require('path');

// Get the new endpoint from command line argument
const newEndpoint = process.argv[2];

if (!newEndpoint) {
    console.log('❌ Please provide an API endpoint');
    console.log('Usage: node update-endpoint.js https://your-api-url.com/api/generate-reply');
    process.exit(1);
}

console.log('🔧 Updating API endpoint...');
console.log(`📡 New endpoint: ${newEndpoint}`);

// Update config.js
const configPath = path.join(__dirname, 'config.js');
const configContent = `// Configuration for Twitter AI Reply Assistant
// Automatically detects the correct API endpoint

const CONFIG = {
    // API Endpoint Configuration - Auto-detected
    API_ENDPOINT: (() => {
        // Check if we're in a Chrome extension context
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            // We're in a Chrome extension - use production endpoint
            return '${newEndpoint}';
        }
        
        // Check if we're on a production domain
        if (window.location.protocol === 'https:' && 
            !window.location.hostname.includes('localhost')) {
            return '${newEndpoint}';
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
window.TWITTER_AI_CONFIG = CONFIG;`;

try {
    fs.writeFileSync(configPath, configContent);
    console.log('✅ API endpoint updated successfully!');
    console.log('🚀 Extension will now use the new endpoint');
} catch (error) {
    console.error('❌ Error updating endpoint:', error);
    process.exit(1);
}
