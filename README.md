# Dobby Reply Assistant

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
├── minimal-model.py     # Flask API server
├── server.py            # Production server for Render.com
├── requirements.txt     # Python dependencies
├── render.yaml          # Render.com deployment config
├── INSTALLATION.md      # Extension installation guide
├── DEPLOYMENT.md        # Server deployment guide
├── package.json         # Project metadata
├── .gitignore          # Git ignore rules
├── LICENSE             # Apache 2.0 license
└── README.md           # This file
```

## 🚀 Quick Start

### **Option 1: Local Development**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tobbhie/dobby-reply-assistant.git
   cd twitter-ai-extension
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the API server**:
   ```bash
   python minimal-model.py
   ```

4. **Install Chrome extension** (see [INSTALLATION.md](INSTALLATION.md))

### **Option 2: Cloud Deployment (Recommended)**

1. **Deploy to Render.com** (see [DEPLOYMENT.md](DEPLOYMENT.md))
2. **Install Chrome extension** (see [INSTALLATION.md](INSTALLATION.md))
3. **Configure extension** with your Render URL

## 🔑 Get Your Fireworks API Key

1. Visit [app.fireworks.ai](https://app.fireworks.ai)
2. Sign up or log in to your account
3. Navigate to your API keys section
4. Create a new API key
5. Copy the key (starts with `fw_`)

## 🎯 Usage

### **On Twitter/X:**

1. **Navigate to any tweet** on Twitter/X
2. **Look for the "AI Reply" button** (blue button with AI icon)
3. **Click the button** to generate AI reply suggestions
4. **Review the suggestions** in the modal that appears
5. **Copy to clipboard** or **open Twitter reply** with the suggested text
6. **Edit if needed** and post your reply

### **Extension Configuration:**

1. **Click the extension icon** in your browser toolbar
2. **Enter your Fireworks API key** (required for AI functionality)
3. **API endpoint**: `https://dobby-reply-assistant.onrender.com` (automatically configured) ✅
4. **Configure additional settings**:
   - Default prompt for replies
   - Maximum reply length
   - Auto-open reply box option
4. **Test connection** to ensure API is working
5. **Save settings** to apply changes

**🔒 Security**: Your Fireworks API key is stored locally and never synced to the cloud.

## 🔒 Privacy & Security

- **No Data Collection**: We don't collect or store any personal information
- **Local Storage Only**: All settings and API keys stored locally in your browser
- **HTTPS Encryption**: All communications encrypted
- **No Cloud Sync**: Your data never leaves your device
- **Open Source**: Full transparency in how your data is handled

[Read our full Privacy Policy](PRIVACY.md)

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

## 🌐 Deployment Options

### **Local Development**
- Run `python minimal-model.py` for local testing
- Extension connects to `http://localhost:8000`

### **Cloud Deployment (Recommended)**
- **Render.com**: See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guide
- **Other platforms**: Works with any WSGI-compatible hosting

## 🔧 API Endpoints

The extension communicates with the Flask API server:

- `GET /health` - Health check and status
- `POST /api/generate-reply` - Generate AI reply suggestions
- **CORS enabled** for Chrome extension compatibility

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

### **Common Issues:**

1. **"AI service unavailable"**
   - Check if API server is running (local or cloud)
   - Verify API endpoint in extension settings
   - Test connection using "Test Connection" button

2. **Extension not working on Twitter**
   - Refresh the Twitter page
   - Check if extension is enabled in `chrome://extensions/`
   - Look for console errors in Developer Tools (F12)

3. **"Fireworks API key required"**
   - Enter your API key in extension settings
   - Verify key format (starts with `fw_`)
   - Check key is not truncated

4. **"Failed to connect to AI service"**
   - For local: Ensure `python minimal-model.py` is running
   - For cloud: Check your Render deployment is active
   - Verify URL in extension settings

### **Debug Steps:**

1. **Check extension console** (F12 → Console)
2. **Test API health**: Visit `http://localhost:8000/health` or your Render URL
3. **Verify API key**: Check it's complete and valid
4. **Check server logs**: Look at terminal output or Render logs

## 🔒 Privacy & Security

- **Secure API Key Storage**: Fireworks API keys stored locally, never synced
- **No Data Collection**: No user data is sent to external services except Fireworks AI
- **User Control**: You review all suggestions before posting
- **CORS Protection**: Server configured for Chrome extension security
- **Production Ready**: Comprehensive error handling and validation

## 🤝 Contributing

This extension is designed to be easily extensible:

1. **Add new features** by modifying the content script
2. **Customize AI behavior** by updating the API server
3. **Improve UI/UX** by modifying the popup and styles
4. **Add new platforms** by creating similar content scripts

## 📄 License

This project is part of the Sentient Social Agent and follows the same Apache 2.0 license.

## 📚 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Chrome extension installation guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Server deployment to Render.com
- **[Privacy Policy](PRIVACY.md)** - Data collection and usage information
- **[GitHub Repository](https://github.com/tobbhie/dobby-reply-assistant)** - Source code and issues

## 🆘 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Review the documentation** (INSTALLATION.md, DEPLOYMENT.md)
3. **Check GitHub issues** for similar problems
4. **Create a new issue** if needed

---

**🚀 Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for Render.com setup!
