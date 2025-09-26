#!/usr/bin/env python3
"""
Minimal Model for Twitter AI Extension
Production-only version that requires extension to provide API key.
"""

import os
import sys
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Add security headers for production
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

class MinimalModel:
    """Minimal model class for the Chrome extension"""
    
    def __init__(self, api_key):
        self.api_key = api_key
        self.model = "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new"
        self.temperature = 0.0
        self.max_tokens = None
        self.base_url = "https://api.fireworks.ai/inference/v1"
        self.date_context = datetime.now().strftime("%Y-%m-%d")
        
        # Set up OpenAI client
        self.client = openai.OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )
        
        # Default system prompt
        self.system_prompt = "You are a helpful assistant that can answer questions and provide information."

    def query(self, query):
        """Generate response using the model"""
        try:
            # Handle different model types
            if self.model in ["o1-preview", "o1-mini"]:
                messages = [
                    {"role": "user", "content": f"System Instruction: {self.system_prompt} \n Instruction:{query}"}
                ]
            else:
                messages = [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": query}
                ]

            # Generate response
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise

def initialize_model():
    """Initialize the AI model - production mode only"""
    try:
        logger.info("🔒 Production mode: Extension must provide API key")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to initialize model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok", 
        "message": "AI service is running",
        "mode": "production",
        "requires_extension_api_key": True
    })

@app.route('/api/generate-reply', methods=['POST'])
def generate_reply():
    """Generate AI reply for a tweet"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Extract tweet information
        tweet_text = data.get('tweet', '')
        author = data.get('author', '')
        context = data.get('context', [])
        custom_prompt = data.get('prompt', '')
        fireworks_api_key = data.get('fireworksApiKey', '')
        
        # Require API key from extension
        if not fireworks_api_key:
            return jsonify({
                "error": "Fireworks API key is required. Please configure it in the extension settings.",
                "mode": "production"
            }), 400
        
        # Create model instance with extension-provided API key
        current_model = MinimalModel(api_key=fireworks_api_key)
        
        if not tweet_text:
            return jsonify({"error": "Tweet text is required"}), 400
        
        # Input validation and sanitization
        if len(tweet_text) > 10000:  # Reasonable limit
            return jsonify({"error": "Tweet text is too long"}), 400
        
        if len(author) > 100:  # Reasonable limit
            return jsonify({"error": "Author name is too long"}), 400
        
        # Build context string
        context_str = ""
        if context:
            context_str = f"Context: {' '.join([c.get('text', '') for c in context])}\n"
        
        # Create prompt for the model
        if custom_prompt:
            prompt = f"{custom_prompt}\n\nTweet: {tweet_text}\nAuthor: {author}\n{context_str}"
        else:
            prompt = f"""Generate a helpful, engaging reply to this tweet. Keep it under 280 characters and make it sound natural and conversational.

Tweet: {tweet_text}
Author: {author}
{context_str}

Reply:"""
        
        # Generate response using the model
        logger.info(f"Generating reply for tweet: {tweet_text[:50]}...")
        response = current_model.query(prompt)
        
        # Clean up the response
        reply = response.strip()
        if reply.startswith('"') and reply.endswith('"'):
            reply = reply[1:-1]
        
        # Ensure it's under 280 characters
        if len(reply) > 280:
            reply = reply[:277] + "..."
        
        logger.info(f"Generated reply: {reply[:50]}...")
        
        return jsonify({
            "success": True,
            "reply": reply,
            "length": len(reply),
            "tweet_analyzed": tweet_text,
            "author": author
        })
        
    except Exception as e:
        logger.error(f"Error generating reply: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    """Serve the API documentation"""
    return jsonify({
        "name": "Twitter AI Reply Assistant API",
        "version": "1.0.0",
        "mode": "production",
        "endpoints": {
            "/health": "GET - Health check",
            "/api/generate-reply": "POST - Generate single reply"
        },
        "status": "running",
        "requires_extension_api_key": True
    })

if __name__ == '__main__':
    print("🚀 Starting Twitter AI Reply Assistant API Server...")
    print("🔧 Mode: PRODUCTION")
    
    # Initialize the model
    if not initialize_model():
        print("❌ Failed to initialize model. Please check your configuration.")
        sys.exit(1)
    
    print("🔒 Production mode: Extension must provide Fireworks API key")
    print("✅ Model initialized successfully")
    print("🌐 API server starting on http://localhost:8000")
    print("📖 API documentation available at http://localhost:8000")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=True,
        threaded=True
    )
