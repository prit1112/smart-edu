# 🚀 SmartEdu Render Deployment Guide

Complete step-by-step guide to deploy your SmartEdu application to Render (free plan).

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier)
- [ ] Code pushed to GitHub repository

---

## 🗄️ STEP 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Click "Try Free" → Create free account
3. Select "M0 Free Cluster" (free forever)
4. Choose a cloud provider (Google Cloud recommended)
5. Select a region closest to your users
6. Create Cluster (wait 1-2 minutes)

### 1.2 Configure Network Access
1. Go to **Network Access** in left sidebar
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere (0.0.0.0/0)**
4. Click Confirm

> ⚠️ **Security Note**: For production, restrict to specific IPs. For Render free tier, use 0.0.0.0/0.

### 1.3 Create Database User
1. Go to **Database Access** in left sidebar
2. Click **Add New Database User**
3. Username: `smartedu_admin`
4. Password: Generate a strong password (save it!)
5. privileges: **Read and Write to any database**
6. Click Add User

### 1.4 Get Connection String
1. Go to **Database** → **Connect** → **Drivers**
2. Copy the connection string:
```
mongodb+srv://smartedu_admin:<password>@cluster0.xyz123.mongodb.net/smart-edu?retryWrites=true&w=majority
```
3. Replace `<password>` with the password you created
4. Save this connection string for later

---

## ⚙️ STEP 2: Configure Environment Variables

Create a `.env` file in your project root with these variables:

```
env
# ========================
# REQUIRED VARIABLES
# ========================

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://smartedu_admin:YOUR_PASSWORD@cluster0.xyz123.mongodb.net/smart-edu?retryWrites=true&w=majority

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# ========================
# EMAIL CONFIGURATION (REQUIRED for OTP)
# ========================

# Gmail with App Password (recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# Or use other email service
# EMAIL_HOST=smtp.yourprovider.com
# EMAIL_PORT=587

# ========================
# OPTIONAL: TWILIO (SMS)
# ========================

# Only required if you want real SMS
# Get free trial: https://www.twilio.com/
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# ========================
# OPTIONAL: PUSH NOTIFICATIONS
# ========================

# Generate keys: https://vapidkeys.com/
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# ========================
# OPTIONAL: AI CHATBOT
# ========================

# Google Gemini (free tier available)
# Get key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# OR Groq (free tier available)
# Get key: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key

# ========================
# CORS CONFIGURATION
# ========================

# Your Render domain after deployment (e.g., https://smart-edu.onrender.com)
ALLOWED_ORIGINS=https://your-app-name.onrender.com

# ========================
# NODE ENVIRONMENT
# ========================
NODE_ENV=production
```

### How to Generate App Password for Gmail:
1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords (search in settings)
4. Create new app password for "Mail"
5. Use that 16-character password as EMAIL_PASS

---

## 📤 STEP 3: Push to GitHub

### 3.1 Initialize Git (if not already done)
```
bash
cd your-project-folder
git init
git add .
git commit -m "Prepare for production deployment"
```

### 3.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name: `smart-edu`
4. Make it Public or Private
5. Click Create Repository

### 3.3 Push Code
```
bash
# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/smart-edu.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚀 STEP 4: Deploy to Render

### 4.1 Create Render Account
1. Go to [Render](https://render.com)
2. Click "Sign Up" → "GitHub"
3. Authorize Render to access your GitHub

### 4.2 Create Web Service
1. Click **New** → **Web Service**
2. Find your `smart-edu` repository
3. Click **Connect**

### 4.3 Configure Build Settings
Configure these settings:

| Setting | Value |
|---------|-------|
| Name | smart-edu |
| Environment | Node |
| Region | Oregon (or closest to you) |
| Branch | main |
| Build Command | `npm install` |
| Start Command | `npm start` |

### 4.4 Add Environment Variables
Scroll down to **Environment Variables** and add:

```
MONGODB_URI=mongodb+srv://smartedu_admin:YOUR_PASSWORD@cluster0.xyz123.mongodb.net/smart-edu?retryWrites=true&w=majority
SESSION_SECRET=your-super-secret-session-key-min-32-chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app-name.onrender.com
```

> ⚠️ **Important**: Add variables one at a time or in small groups to avoid issues.

### 4.5 Deploy
1. Click **Create Web Service**
2. Wait for build to complete (2-5 minutes)
3. Check build logs for errors

### 4.6 Get Your Live URL
Once deployed, you'll see:
- **Dashboard URL**: https://smart-edu.onrender.com
- **Status**: Live

---

## ✅ STEP 5: Post-Deployment Verification

### 5.1 Test Your Application
Visit your Render URL and test:

- [ ] Landing page loads
- [ ] Student login works
- [ ] Admin login works
- [ ] OTP sent to email
- [ ] Profile page loads
- [ ] Dashboard displays correctly
- [ ] File uploads work

### 5.2 Common Issues & Fixes

#### Issue: "Application Error" or "Crashed"
**Solution**: Check logs in Render dashboard
- Go to your service → Logs
- Look for error messages
- Common fixes:
  
```
bash
  # Ensure MongoDB URI is correct
  # Check that all required env vars are set
  
```

#### Issue: "MongoDB connection failed"
**Solution**:
1. Check Network Access in Atlas → Allow 0.0.0.0/0
2. Verify MONGODB_URI is correct
3. Check password doesn't contain special chars (or URL encode them)

#### Issue: "CORS error"
**Solution**:
1. Update ALLOWED_ORIGINS in Render env vars
2. Format: `https://your-app-name.onrender.com` (no trailing slash)

#### Issue: "Email not working"
**Solution**:
1. Use Gmail App Password (not regular password)
2. Enable 2-Step Verification first
3. Verify EMAIL_USER and EMAIL_PASS are correct

#### Issue: "Session not working"
**Solution**:
1. Ensure SESSION_SECRET is set (min 32 characters)
2. Check that NODE_ENV=production

#### Issue: "Free tier sleeping"
**Solution**:
- Render free tier: service sleeps after 15 min of inactivity
- First request after sleep takes 30-60 seconds to wake up
- This is normal for free plan
- Consider upgrading to paid plan for always-on

---

## 📊 STEP 6: Final Checklist

### Security Checklist
- [ ] All secrets stored in environment variables (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] CORS configured with specific domains
- [ ] Session uses secure cookies (NODE_ENV=production)

### Functionality Checklist
- [ ] MongoDB Atlas connected
- [ ] User registration/login works
- [ ] OTP via email works
- [ ] Student dashboard loads
- [ ] Admin dashboard loads
- [ ] File uploads work
- [ ] All routes work

### Performance Checklist
- [ ] Static files served correctly
- [ ] Compression enabled
- [ ] No memory leaks
- [ ] Logs show no errors

---

## 🔧 Useful Render Commands

### View Logs
```
# In Render dashboard
Your Service → Logs
```

### Restart Service
```
# In Render dashboard
Your Service → Settings → Restart
```

### Environment Variables
```
# In Render dashboard
Your Service → Environment
```

---

## 📞 Need Help?

### Common Error Messages:
1. **"MongoServerError: authentication failed"** → Check username/password
2. **"ECONNREFUSED"** → Check Atlas network access
3. **"CORS policy"** → Update ALLOWED_ORIGINS
4. **"Timeout"** → Service may be sleeping (free tier)

### Resources:
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Node.js Deployment](https://render.com/docs/deploy-node-express-app)

---

## 🎉 Congratulations!

Your SmartEdu application is now live on the internet!

**Live URL**: `https://your-app-name.onrender.com`

Share this URL with others to let them access your application!

---

*Generated for SmartEdu Project - Node.js + Express + MongoDB*
