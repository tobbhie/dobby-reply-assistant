# 🚀 Render.com Deployment Guide

This guide covers deploying the Twitter AI Reply Assistant to Render.com.

## 📋 Prerequisites

- GitHub repository with your code
- Fireworks API key
- Render.com account (free tier available)

## 🌐 Deploy to Render.com

### **Step 1: Sign up for Render**

1. **Go to** [render.com](https://render.com)
2. **Sign up** with your GitHub account
3. **Connect your GitHub** repository

### **Step 2: Create Web Service**

1. **Click "New +"** → **"Web Service"**
2. **Connect your GitHub repository**
3. **Configure the service**:
   - **Name**: `twitter-ai-api` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
   - **Plan**: Free (or paid for better performance)

### **Step 3: Set Environment Variables**

In the Render dashboard, go to **Environment** tab and add:
- `PRODUCTION_MODE` = `true`

### **Step 4: Deploy**

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Get your URL** (e.g., `https://twitter-ai-api.onrender.com`)

## 📱 Update Extension Settings

After deployment, update your Chrome extension:

1. **Open extension popup**
2. **Change API endpoint** to your Render URL:
   - Example: `https://twitter-ai-api.onrender.com`
3. **Test connection**
4. **Save settings**

## 🚨 Important Notes

- **API Key Security**: Your Fireworks API key is stored locally in the extension
- **CORS**: The server is configured to accept requests from Chrome extensions
- **Health Check**: Use `/health` endpoint for monitoring
- **Logs**: Check platform logs for debugging

## 🔍 Troubleshooting

### **Common Issues:**

1. **"Connection failed"**
   - Check if server is running
   - Verify URL in extension settings
   - Check platform logs

2. **"API key required"**
   - Ensure `PRODUCTION_MODE=true` is set
   - Check extension has valid Fireworks API key

3. **"CORS error"**
   - Server includes CORS headers for Chrome extensions
   - Check if platform blocks CORS

### **Debug Steps:**

1. **Check server logs** in your deployment platform
2. **Test health endpoint**: `https://your-app.com/health`
3. **Verify environment variables** are set correctly
4. **Check extension console** for errors

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Platform Logs**: Check your deployment platform's log viewer
- **Extension Console**: F12 → Console for client-side errors

## 🔄 Updates

To update your deployment:

1. **Push changes** to GitHub
2. **Render auto-deploys** from your main branch
3. **Or manually trigger** deployment in Render dashboard

---

**Need help?** Check [Render documentation](https://render.com/docs) or create an issue in the GitHub repository.
