# Twitter AI Reply Assistant

A production-ready Chrome extension that provides AI-powered reply suggestions for Twitter/X using Fireworks AI. Features secure API key management, error recovery, and real-time validation.

## 🚀 Features

- **AI-Powered Replies**: Generate contextual, intelligent replies to any tweet
- **Secure API Key Management**: Fireworks API keys stored locally, never synced
- **Real-time Validation**: Instant feedback on API key format and connection status
- **Error Recovery**: Automatic retry logic with exponential backoff
- **Rate Limiting**: Prevents API abuse with intelligent request throttling
- **Production Ready**: Comprehensive error handling and user feedback
- **User Control**: Review and edit suggestions before posting
- **Real-time Integration**: Works directly on Twitter/X pages
- **Customizable**: Configure prompts and API settings

## 📁 Project Structure

```
twitter-ai-extension/
├── manifest.json          # Chrome extension configuration
├── content.js            # Content script for Twitter integration
├── background.js         # Background service worker
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── styles.css           # Additional styling
├── dobby.png            # Extension icon
├── minimal-model.py     # Minimal Flask API server
├── requirements.txt     # Python dependencies
├── package.json         # Project metadata
└── README.md           # This file
```

## 🛠️ Installation

### 1. Install Python Dependencies

```bash
cd twitter-ai-extension
pip install -r requirements.txt
```

### 2. Get Your Fireworks API Key

1. Visit [app.fireworks.ai](https://app.fireworks.ai)
2. Sign up or log in to your account
3. Navigate to your API keys section
4. Create a new API key
5. Copy the key (starts with `fw_`)

### 3. Start the API Server

The server runs in production mode by default, requiring the extension to provide its own API key:

```bash
python minimal-model.py
```

The API server will run on `http://localhost:8000`

### 4. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `twitter-ai-extension` folder
5. The extension should now appear in your extensions

## 🎯 Usage

### On Twitter/X:

1. **Navigate to any tweet** on Twitter/X
2. **Look for the "AI Reply" button** (blue button with AI icon)
3. **Click the button** to generate AI reply suggestions
4. **Review the suggestions** in the modal that appears
5. **Copy to clipboard** or **open Twitter reply** with the suggested text
6. **Edit if needed** and post your reply

### Extension Popup:

1. **Click the extension icon** in your browser toolbar
2. **Enter your Fireworks API key** (required for AI functionality)
3. **Configure settings**:
   - API endpoint (default: http://localhost:8000)
   - Default prompt for replies
   - Maximum reply length
   - Auto-open reply box option
4. **Test connection** to ensure API is working
5. **Save settings** to apply changes

**Important**: Your Fireworks API key is stored locally and never synced to the cloud for security.

## ⚙️ Configuration

### API Settings

- **API Endpoint**: URL of your local API server
- **Default Prompt**: Customize how the AI generates replies
- **Max Length**: Limit reply length (default: 280 characters)
- **Auto-open Reply**: Automatically open Twitter's reply box

### Custom Prompts

You can customize the AI's behavior by modifying the default prompt:

```
Generate a helpful, engaging reply to this tweet. Keep it under 280 characters and make it sound natural and conversational.
```

## 🔧 API Endpoints

The extension communicates with a local Flask API server:

- `GET /health` - Health check
- `POST /api/generate-reply` - Generate single reply
- `POST /api/analyze-tweet` - Analyze tweet sentiment/topics  
- `POST /api/suggest-replies` - Generate multiple reply suggestions

## 🎨 Customization

### Styling

The extension includes comprehensive CSS that:
- Matches Twitter's design language
- Supports dark mode
- Is responsive for mobile
- Doesn't conflict with Twitter's styles

### Functionality

You can extend the extension by:
- Adding new reply styles
- Implementing tweet analysis features
- Adding keyboard shortcuts
- Creating custom prompts

## 🐛 Troubleshooting

### Common Issues:

1. **"AI service unavailable"**
   - Make sure the API server is running on localhost:8000
   - Check your MODEL_API_KEY in the .env file

2. **Extension not working on Twitter**
   - Refresh the Twitter page
   - Check if the extension is enabled
   - Look for console errors in Developer Tools

3. **API connection failed**
   - Verify the API endpoint in extension settings
   - Test the connection using the "Test Connection" button

### Debug Mode:

1. Open Chrome Developer Tools (F12)
2. Go to the Console tab
3. Look for messages starting with "🤖 Twitter AI Assistant"
4. Check for any error messages

## 🔒 Privacy & Security

- **Local Processing**: All AI processing happens on your local machine
- **No Data Collection**: No user data is sent to external services
- **API Key Security**: Your API keys stay on your local machine
- **User Control**: You review all suggestions before posting

## 🤝 Contributing

This extension is designed to be easily extensible:

1. **Add new features** by modifying the content script
2. **Customize AI behavior** by updating the API server
3. **Improve UI/UX** by modifying the popup and styles
4. **Add new platforms** by creating similar content scripts

## 📄 License

This project is part of the Sentient Social Agent and follows the same Apache 2.0 license.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console for error messages
3. Ensure all dependencies are installed
4. Verify your API configuration

---

**Powered by [Sentient Social Agent](https://github.com/sentient-agi/Sentient-Social-Agent)**
