# Access Local Development Server Over WiFi Network

This guide will help you make your local development server accessible to other devices on your local WiFi network.

---

## Table of Contents
1. [Find Your Local IPv4 Address](#1-find-your-local-ipv4-address)
2. [Configure Server to Run on 0.0.0.0](#2-configure-server-to-run-on-0000)
3. [Allow Port Through Firewall](#3-allow-port-through-firewall)
4. [Framework-Specific Configuration](#4-framework-specific-configuration)
5. [Test Access from Another Device](#5-test-access-from-another-device)
6. [Troubleshooting Checklist](#6-troubleshooting-checklist)
7. [Bonus: Expose Localhost to Internet](#7-bonus-expose-localhost-to-internet)

---

## 1. Find Your Local IPv4 Address

### Windows
Open Command Prompt and run:
```
cmd
ipconfig
```
Look for **IPv4 Address** under your active network adapter (usually "Wireless LAN adapter Wi-Fi" or "Ethernet adapter").

Example output:
```
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : home
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
```

### macOS
Open Terminal and run:
```
bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Or use:
```
bash
ipconfig getifaddr en0
```

Example output:
```
192.168.1.105
```

### Quick Method (All Systems)
```
cmd
# Windows
ipconfig | findstr "IPv4"

# macOS/Linux
hostname -I | awk '{print $1}'
```

---

## 2. Configure Server to Run on 0.0.0.0

By default, Node.js and most servers listen on `127.0.0.1` (localhost), which means only local processes can access them. To allow external access, bind to `0.0.0.0` which listens on all network interfaces.

### Current Configuration (localhost only)
```
javascript
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
```

### Updated Configuration (Network Access)
```
javascript
app.listen(PORT, '0.0.0.0', () =>
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`)
);
```

---

## 3. Allow Port Through Firewall

### Windows (Using PowerShell as Administrator)

**Check if port is blocked:**
```
powershell
netsh advfirewall firewall show rule name=all | findstr "3003"
```

**Allow port through firewall:**
```
powershell
netsh advfirewall firewall add rule name="SmartEdu Server" dir=in action=allow protocol=tcp localport=3003
```

### macOS (Using Terminal with sudo)

**Allow port through firewall:**
```
bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --addapp=/Applications/Node.app
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp=/Applications/Node.app
```

**Alternative - Add firewall rule:**
```
bash
sudo pfctl -ef /etc/pf.conf  # Enable packet filter
```

**Easier method - Temporarily disable firewall (not recommended for production):**
```
bash
sudo /usr/libexec/ApplicationFirewall/com.apple.knowledge
```

---

## 4. Framework-Specific Configuration

### Node.js + Express (Your Current Setup)

**server.js:**
```
javascript
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const PORT = 3003;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(
  session({
    secret: "smartedu-secret",
    resave: false,
    saveUninitialized: false
  })
);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.render('landing', { title: 'SmartEdu - Smart Learning Platform' });
});

app.use("/", authRoutes);
app.use("/student", studentRoutes);
app.use("/admin", adminRoutes);

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-edu";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    // ✅ KEY CHANGE: Listen on 0.0.0.0 for network access
    app.listen(PORT, '0.0.0.0', () => {
      const localIP = getLocalIPAddress();
      console.log(`✅ Server running on:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://${localIP}:${PORT}`);
    });
  })
  .catch(err => console.error(err));

// Helper function to get local IP
function getLocalIPAddress() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
```

### Vite

**package.json scripts:**
```
json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0"
  }
}
```

**vite.config.js:**
```
javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
});
```

### React (Create React App)

**Start command:**
```
bash
# Windows
set PORT=3000 && set HOST=0.0.0.0 && npm start

# macOS/Linux
PORT=3000 HOST=0.0.0.0 npm start
```

**package.json:**
```
json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "homepage": "."
}
```

**Add to .env file:**
```
PORT=3000
HOST=0.0.0.0
```

### Next.js

**package.json scripts:**
```
json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000",
    "lint": "next lint"
  }
}
```

**next.config.js:**
```
javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3003/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

**For Next.js 13+:**
```
javascript
// next.config.js
module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
};
```

### Basic HTTP Server

**Using Node.js http module:**
```
javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOST = '0.0.0.0';

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  let ext = path.extname(filePath);
  let contentType = 'text/html';

  if (ext === '.css') contentType = 'text/css';
  else if (ext === '.js') contentType = 'text/javascript';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg') contentType = 'image/jpeg';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
```

**Using http-server (npm package):**
```
bash
# Install globally
npm install -g http-server

# Run with network access
http-server ./public -a 0.0.0.0 -p 8080
```

---

## 5. Test Access from Another Device

### Step 1: Get Your Local IP Address
```
cmd
# Windows
ipconfig | findstr "IPv4"
# Output: 192.168.1.105

# macOS
ipconfig getifaddr en0
# Output: 192.168.1.105
```

### Step 2: Start Your Server
```
bash
# Navigate to your project
cd g:/smart-edu

# Start the server
npm start
# or
node server.js
```

### Step 3: Access from Another Device
Open a browser on your phone, tablet, or another laptop and navigate to:

```
http://192.168.1.105:3003
```

Replace:
- `192.168.1.105` with your local IP address
- `3003` with your port number

### Test URLs:
| Service | URL |
|---------|-----|
| Landing Page | http://192.168.1.105:3003/ |
| Student Dashboard | http://192.168.1.105:3003/student/dashboard |
| Admin Dashboard | http://192.168.1.105:3003/admin/dashboard |
| Auth Page | http://192.168.1.105:3003/auth/login |

---

## 6. Troubleshooting Checklist

### ❌ Firewall Issues

**Symptoms:** Cannot connect from other devices, connection timeout

**Solutions:**
- [ ] Windows: Allow port through firewall
  
```
powershell
  netsh advfirewall firewall add rule name="SmartEdu" dir=in action=allow protocol=tcp localport=3003
  
```
- [ ] Windows Defender: Add exception in Windows Security
- [ ] Mac: Allow Node.js in System Preferences > Security & Privacy > Firewall
- [ ] Temporarily disable antivirus/firewall to test (then re-enable)

### ❌ Wrong IP Address

**Symptoms:** Page doesn't load, connection refused

**Solutions:**
- [ ] Use the correct IPv4 address (not IPv6)
- [ ] Verify you're on the same WiFi network
- [ ] Check IP address again:
  
```
cmd
  # Windows
  ipconfig
  
  # macOS
  ifconfig en0
  
```
- [ ] Try pinging your device from another device:
  
```
bash
  ping 192.168.1.105
  
```

### ❌ Different WiFi Network

**Symptoms:** Works on one network, not another

**Solutions:**
- [ ] Each WiFi network has a different IP range
- [ ] Get new IP address for each network
- [ ] Some networks may block device-to-device communication (guest networks)
- [ ] Use wired Ethernet for more reliable access

### ❌ Port Already in Use

**Symptoms:** `EADDRINUSE: Address already in use`

**Solutions:**
- [ ] Find and kill the process using the port:
  
```
cmd
  # Windows
  netstat -ano | findstr :3003
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -i :3003
  kill -9 <PID>
  
```
- [ ] Use a different port:
  
```
bash
  PORT=3004 node server.js
  
```

### ❌ MongoDB Connection Issues

**Symptoms:** Server starts but database connection fails

**Solutions:**
- [ ] Ensure MongoDB is running
- [ ] For external access, change MongoDB bind IP:
  
```
bash
  # In mongod.conf
  net:
    port: 27017
    bindIp: 0.0.0.0  # Allow all IPs (development only!)
  
```
- [ ] Use full connection string with IP:
  
```
javascript
  const MONGODB_URI = "mongodb://192.168.1.105:27017/smart-edu";
  
```

---

## 7. Bonus: Expose Localhost to Internet

Sometimes you need to share your local server with others or test webhooks. Here are the options:

### Option 1: ngrok (Most Popular)

```
bash
# Install ngrok
npm install -g ngrok

# or download from https://ngrok.com/download

# Expose your local port
ngrok http 3003

# Output:
# Session Status                online
# Account                      your@email.com
# Version                      3.x.x
# Region                       United States (us)
# Web Interface               http://127.0.0.1:4040
# Forwarding                   https://abc123.ngrok.io -> http://localhost:3003
```

**Usage:**
- Share the `https://abc123.ngrok.io` URL with anyone
- Great for testing webhooks, demos, and quick sharing
- Free tier has some limitations

### Option 2: Cloudflare Tunnel

```
bash
# Install cloudflared
# Download from https://github.com/cloudflare/cloudflared/releases

# Authenticate
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create my-tunnel

# Configure tunnel
cloudflared tunnel route dns my-tunnel myapp.example.com

# Run tunnel
cloudflared tunnel --url http://localhost:3003
```

### Option 3: LocalTunnel

```
bash
# Install localtunnel
npm install -g localtunnel

# Expose your local port
lt --port 3003

# Output:
# your-url.loca.lt sends requests to localhost:3003
```

**Usage:**
```
bash
# With custom subdomain
lt --port 3003 --subdomain my-smart-edu

# Output:
# https://my-smart-edu.loca.lt
```

### Comparison Table

| Feature | ngrok | Cloudflare Tunnel | LocalTunnel |
|---------|-------|-------------------|-------------|
| Free | ✅ (limited) | ✅ | ✅ |
| HTTPS | ✅ | ✅ | ✅ |
| Custom Domain | ❌ (paid) | ✅ | ❌ |
| Persistence | ❌ | ✅ | ❌ |
| Speed | Fast | Fast | Slower |
| Setup Difficulty | Easy | Medium | Easy |

---

## Quick Start Commands for Your Project

```
bash
# 1. Navigate to your project
cd g:/smart-edu

# 2. Get your local IP (in another terminal)
# Windows: ipconfig | findstr "IPv4"
# macOS: ipconfig getifaddr en0

# 3. Start the server with network access
# Option A: Direct modification (edit server.js)
node server.js

# Option B: Use environment variables
HOST=0.0.0.0 PORT=3003 node server.js

# 4. Test from another device
# Open browser: http://<YOUR-IP>:3003
```

---

## Security Notes

⚠️ **Important:**
- Only use `0.0.0.0` for development, never in production
- Always use environment variables for sensitive data
- Consider using a VPN for production deployments
- Don't expose MongoDB directly to the network without authentication
- When done testing, revert to `127.0.0.1` or `localhost`

---

## Related Files in Your Project

- **Server Entry Point:** `g:/smart-edu/server.js`
- **Routes:** 
  - `g:/smart-edu/routes/auth.routes.js`
  - `g:/smart-edu/routes/student.routes.js`
  - `g:/smart-edu/routes/admin.routes.js`
- **Views:** `g:/smart-edu/views/`
- **Static Files:** `g:/smart-edu/public/`

---

**Happy Testing! 🎉**
