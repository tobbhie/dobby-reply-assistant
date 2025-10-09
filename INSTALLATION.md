# 📦 Chrome Extension Installation Guide

This guide shows how to install the Twitter AI Reply Assistant Chrome extension.

## 🚀 Quick Installation (Recommended)

### **Method 1: Load from GitHub (Developer Mode)**

1. **Download the extension**:
   - Go to [GitHub Repository](https://github.com/tobbhie/dobby-reply-assistant)
   - Click **"Code"** → **"Download ZIP"**
   - Extract the ZIP file to your computer

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top-right)

3. **Load the extension**:
   - Click **"Load unpacked"**
   - Select the extracted folder
   - The extension should appear in your extensions list

4. **Pin the extension**:
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Dobby Reply Assistant" and click the pin icon

## 🔧 Setup Instructions

### **Step 1: Configure the Extension**

1. **Click the extension icon** in your Chrome toolbar
2. **Enter your Fireworks API key**:
   - Get your key from [app.fireworks.ai](https://app.fireworks.ai)
   - Paste it in the "Fireworks API Key" field
3. **Set API endpoint** (if using cloud deployment):
   - Default: `http://localhost:8000` (for local server)
   - Or your Render URL: `https://your-app.onrender.com`
4. **Test connection** and **Save settings**

### **Step 2: Start the API Server**

**Option A: Local Server (Recommended for testing)**
```bash
# Clone the repository
git clone https://github.com/tobbhie/dobby-reply-assistant.git
cd twitter-ai-extension

# Install dependencies
pip install -r requirements.txt

# Start the server
python minimal-model.py
```

**Option B: Use Cloud Server**
- Deploy to Render.com (see [DEPLOYMENT.md](DEPLOYMENT.md))
- Update extension settings with your Render URL

## 🎯 How to Use

1. **Go to Twitter/X** in your browser
2. **Look for the "AI Reply" button** on any tweet
3. **Click the button** to generate AI reply suggestions
4. **Review and edit** the suggestions
5. **Copy to clipboard** or **open Twitter reply**

## 🔍 Troubleshooting

### **Extension not working?**

1. **Check if extension is enabled**:
   - Go to `chrome://extensions/`
   - Make sure "Dobby Reply Assistant" is enabled

2. **Check API connection**:
   - Open extension popup
   - Click "Test Connection"
   - If it fails, check your server is running

3. **Check console for errors**:
   - Press F12 → Console tab
   - Look for any error messages

### **"AI Reply" button not appearing?**

1. **Refresh the Twitter page**
2. **Check if you're on a tweet page** (not timeline)
3. **Try a different tweet**

### **API key issues?**

1. **Verify your Fireworks API key** is correct
2. **Check the key format** (should start with `fw_`)
3. **Make sure the key is not truncated**

## 📱 Alternative Installation Methods

### **Method 2: Chrome Web Store (Future)**

*Coming soon!* We're working on publishing to the Chrome Web Store for easier installation.

### **Method 3: Enterprise Distribution**

For organizations wanting to distribute to multiple users:

1. **Package the extension**:
   ```bash
   # Create a ZIP file of the extension folder
   zip -r dobby-reply-assistant.zip . -x "*.git*" "*.md" "*.py" "requirements.txt"
   ```

2. **Upload to your organization's extension management**

## 🔒 Security Notes

- **API keys are stored locally** on your device
- **No data is sent to external services** except Fireworks AI
- **You control all your data** and API usage
- **Extension only works on Twitter/X** pages

## 🆘 Need Help?

- **Check the [README.md](README.md)** for detailed setup
- **See [DEPLOYMENT.md](DEPLOYMENT.md)** for server deployment
- **Create an issue** on GitHub if you encounter problems

## 🔄 Updates

To update the extension:

1. **Download the latest version** from GitHub
2. **Go to `chrome://extensions/`**
3. **Click "Load unpacked"** and select the new folder
4. **Or use the "Reload" button** if you're updating the same folder

---

**Enjoy your AI-powered Twitter experience!** 🎉
