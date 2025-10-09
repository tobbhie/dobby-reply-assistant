// Dobby Reply Assistant - Content Script
// This script runs on Twitter/X pages and adds AI reply functionality

class TwitterAIAssistant {
    constructor() {
        this.isProcessing = false;
        this.defaultEndpoint = this.detectApiEndpoint();
        this.apiEndpoint = this.defaultEndpoint;
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000; // 2 seconds between requests
        this.init();
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

    init() {
        console.log('🤖 Dobby Reply Assistant loaded');
        this.observeTweets();
        this.addGlobalStyles();
        this.loadSettings();
    }

    async loadSettings() {
        try {
            chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
                if (response?.success && response.settings?.apiEndpoint) {
                    this.apiEndpoint = response.settings.apiEndpoint;
                }
            });
        } catch (e) {
            this.apiEndpoint = this.defaultEndpoint;
        }
    }

    // Monitor for new tweets and add AI reply buttons
    observeTweets() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.addAIReplyButtons(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also check existing tweets on page load
        this.addAIReplyButtons(document.body);
    }

    // Add AI reply button to tweet elements
    addAIReplyButtons(container) {
        // Find tweet containers (Twitter's structure may change, so we use multiple selectors)
        const tweetSelectors = [
            '[data-testid="tweet"]',
            '[data-testid="tweetText"]',
            'article[role="article"]'
        ];

        tweetSelectors.forEach(selector => {
            const tweets = container.querySelectorAll(selector);
            tweets.forEach(tweet => {
                if (tweet.querySelector('.ai-reply-btn')) return; // Already has button

                this.addAIReplyButton(tweet);
            });
        });
    }

    // Add AI reply button to a specific tweet
    addAIReplyButton(tweetElement) {
        // Find the action bar (where reply, retweet, like buttons are)
        const actionBar = tweetElement.querySelector('[role="group"]') || 
                         tweetElement.querySelector('[data-testid="reply"]')?.parentElement;
        
        if (!actionBar) return;

        // Create AI reply button
        const aiButton = document.createElement('button');
        aiButton.className = 'ai-reply-btn';
        aiButton.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>AI Reply</span>
        `;
        
        aiButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleAIReply(tweetElement);
        });

        // Insert button before the last action (usually share button)
        const lastAction = actionBar.lastElementChild;
        if (lastAction) {
            actionBar.insertBefore(aiButton, lastAction);
        } else {
            actionBar.appendChild(aiButton);
        }
    }

    // Handle AI reply generation
    async handleAIReply(tweetElement) {
        if (this.isProcessing) return;

        // Rate limiting
        const now = Date.now();
        if (now - this.lastRequestTime < this.minRequestInterval) {
            this.showError('Please wait a moment before making another request.');
            return;
        }

        this.isProcessing = true;
        this.currentTweetElement = tweetElement;
        this.lastRequestTime = now;
        this.showLoadingState(tweetElement);
        
        // Add timeout for long-running requests
        const timeoutId = setTimeout(() => {
            if (this.isProcessing) {
                this.showError('Request is taking longer than expected. Please try again.');
                this.isProcessing = false;
                this.hideLoadingState(tweetElement);
            }
        }, 30000); // 30 second timeout

        try {
            // Extract tweet content and context
            const tweetData = this.extractTweetData(tweetElement);
            
            // Generate AI reply
            const aiReply = await this.generateAIReply(tweetData);
            
            // Show AI reply modal
            this.showAIReplyModal(aiReply, tweetData);
            
        } catch (error) {
            console.error('Error generating AI reply:', error);
            
            // Show specific error messages based on the error type
            let errorMessage = 'Failed to generate AI reply. Please try again.';
            
            if (error.message.includes('Fireworks API key is required')) {
                errorMessage = 'Fireworks API key is required. Please configure it in the extension settings.';
            } else if (error.message.includes('Invalid Fireworks API key') || error.message.includes('Unauthorized')) {
                errorMessage = 'Invalid Fireworks API key. Please check your API key in the extension settings.';
            } else if (error.message.includes('Failed to connect to AI service')) {
                errorMessage = 'Cannot connect to AI service. Please make sure the local server is running.';
            }
            
            this.showError(errorMessage);
        } finally {
            clearTimeout(timeoutId);
            this.isProcessing = false;
            this.hideLoadingState(tweetElement);
        }
    }

    // Extract tweet data for AI analysis
    extractTweetData(tweetElement) {
        const tweetText = tweetElement.querySelector('[data-testid="tweetText"]')?.textContent || '';
        const author = tweetElement.querySelector('[data-testid="User-Name"]')?.textContent || '';
        const timestamp = tweetElement.querySelector('time')?.getAttribute('datetime') || '';
        
        // Get conversation context (replies, quoted tweets)
        const conversationContext = this.getConversationContext(tweetElement);
        
        return {
            text: tweetText,
            author: author,
            timestamp: timestamp,
            context: conversationContext,
            url: window.location.href
        };
    }

    // Get conversation context for better AI understanding
    getConversationContext(tweetElement) {
        const context = [];
        
        // Check for quoted tweet
        const quotedTweet = tweetElement.querySelector('[data-testid="tweetText"]');
        if (quotedTweet) {
            context.push({
                type: 'quoted',
                text: quotedTweet.textContent
            });
        }
        
        // Check for reply context
        const replyTo = tweetElement.querySelector('[data-testid="reply"]');
        if (replyTo) {
            context.push({
                type: 'reply',
                text: 'This is a reply to another tweet'
            });
        }
        
        return context;
    }

    // Generate AI reply using the background script
    async generateAIReply(tweetData) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'generateReply',
                data: {
                    tweet: tweetData.text,
                    author: tweetData.author,
                    context: tweetData.context,
                    prompt: "Generate a helpful, engaging reply to this tweet. Keep it under 280 characters and make it sound natural and conversational."
                }
            }, (response) => {
                if (response?.success) {
                    resolve(response.reply);
                } else {
                    reject(new Error(response?.error || 'Failed to generate AI reply'));
                }
            });
        });
    }

    // Show AI reply modal
    showAIReplyModal(aiReply, tweetData) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'ai-reply-modal-overlay';
        // Track copy state for this modal session
        this.hasCopiedCurrentReply = false;
        modal.innerHTML = `
            <div class="ai-reply-modal">
                <div class="ai-reply-header">
                    <h3>🤖 AI Reply Suggestion</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="ai-reply-content">
                    <div class="original-tweet">
                        <strong>Original Tweet:</strong>
                        <p>${tweetData.text}</p>
                        <small>by @${tweetData.author}</small>
                    </div>
                    <div class="ai-suggestion">
                        <strong>AI Suggestion:</strong>
                        <textarea class="ai-reply-text" maxlength="280">${aiReply}</textarea>
                        <div class="char-count">${aiReply.length}/280</div>
                    </div>
                </div>
                <div class="ai-reply-actions">
                    <button class="copy-btn">📋 Copy to Clipboard</button>
                    <button class="tweet-btn">🐦 Open Twitter Reply</button>
                    <button class="regenerate-btn">🔄 Regenerate</button>
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.copy-btn').addEventListener('click', () => {
            const text = modal.querySelector('.ai-reply-text').value;
            navigator.clipboard.writeText(text);
            this.hasCopiedCurrentReply = true;
            this.showToast('Copied to clipboard!');
        });

        modal.querySelector('.tweet-btn').addEventListener('click', () => {
            if (!this.hasCopiedCurrentReply) {
                this.showToast('Reply not copied. Proceed anyway?', 'error');
                const proceed = window.confirm('The AI reply has not been copied to your clipboard. Do you still want to proceed to open the reply box?');
                if (!proceed) {
                    return;
                }
            }
            const replyText = modal.querySelector('.ai-reply-text').value;
            // Close modal to return focus to Twitter UI
            if (modal.parentElement) {
                document.body.removeChild(modal);
            }
            this.openTwitterReply(replyText, this.currentTweetElement);
        });

        modal.querySelector('.regenerate-btn').addEventListener('click', () => {
            this.hasCopiedCurrentReply = false;
            this.handleAIReply(this.currentTweetElement || document.querySelector('[data-testid="tweet"]'));
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.body.appendChild(modal);
    }

    // Open Twitter reply with pre-filled text
    openTwitterReply(replyText, tweetElement) {
        // Prefer the reply button within the specific tweet
        const container = tweetElement || document;
        const replyButton = container.querySelector('[data-testid="reply"]') || document.querySelector('[data-testid="reply"]');

        if (replyButton) {
            replyButton.click();
            // Focus the composer if available, but do not insert text
            setTimeout(() => {
                const composer = document.querySelector('[data-testid^="tweetTextarea"][role="textbox"]') ||
                                 document.querySelector('div[contenteditable="true"][data-testid^="tweetTextarea"]') ||
                                 document.querySelector('[data-testid="tweetTextarea_0"]');
                if (composer) composer.focus();
            }, 300);
        }
    }

    // Show loading state
    showLoadingState(tweetElement) {
        const button = tweetElement.querySelector('.ai-reply-btn');
        if (button) {
            button.classList.add('loading');
            button.innerHTML = `
                <svg class="spinner" width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                </svg>
                <span>AI Thinking...</span>
            `;
        }
    }

    // Hide loading state
    hideLoadingState(tweetElement) {
        const button = tweetElement.querySelector('.ai-reply-btn');
        if (button) {
            button.classList.remove('loading');
            button.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>AI Reply</span>
            `;
        }
    }

    // Show error message
    showError(message) {
        this.showToast(message, 'error');
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `ai-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }

    // Add global styles
    addGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-reply-btn {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 8px 12px;
                border: none;
                background: #1d9bf0;
                color: white;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 8px;
            }
            
            .ai-reply-btn:hover {
                background: #1a8cd8;
                transform: translateY(-1px);
            }
            
            .ai-reply-btn.loading {
                background: #657786;
                cursor: not-allowed;
            }
            
            .ai-reply-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-reply-modal {
                background: white;
                border-radius: 16px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .ai-reply-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #657786;
            }
            
            .original-tweet {
                background: #f7f9fa;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 16px;
            }
            
            .ai-suggestion {
                margin-bottom: 20px;
            }
            
            .ai-reply-text {
                width: 100%;
                min-height: 80px;
                padding: 12px;
                border: 1px solid #e1e8ed;
                border-radius: 8px;
                font-size: 14px;
                resize: vertical;
                font-family: inherit;
            }
            
            .char-count {
                text-align: right;
                font-size: 12px;
                color: #657786;
                margin-top: 4px;
            }
            
            .ai-reply-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .ai-reply-actions button {
                padding: 8px 16px;
                border: none;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .copy-btn {
                background: #1d9bf0;
                color: white;
            }
            
            .tweet-btn {
                background: #1d9bf0;
                color: white;
            }
            
            .regenerate-btn {
                background: #657786;
                color: white;
            }
            
            .ai-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10001;
            }
            
            .ai-toast.success {
                background: #1d9bf0;
            }
            
            .ai-toast.error {
                background: #e0245e;
            }
            
            .spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the Dobby Reply Assistant
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TwitterAIAssistant();
    });
} else {
    new TwitterAIAssistant();
}
