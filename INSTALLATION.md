# Installation Instructions

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Terminal/Command Line** access
- **Internet connection** for downloading packages

Check your Node version:
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd /Users/geethanjali.kandasamy/Desktop/cs-quality-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

**If you encounter permission errors**, try:

#### Option A: Fix npm permissions (Recommended)
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /opt/homebrew  # If using Homebrew on Mac
npm install
```

#### Option B: Use a different npm cache
```bash
npm install --cache ~/.npm-cache
```

#### Option C: Clean install
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 3. Verify Installation

Check that node_modules folder was created:
```bash
ls -la node_modules
```

You should see many folders including:
- react
- react-dom
- typescript
- vite
- tailwindcss
- recharts

### 4. Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 5. Open in Browser

Navigate to: **http://localhost:5173**

You should see the dashboard with mock data! 🎉

## Troubleshooting

### Problem: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Problem: "EACCES: permission denied"

**Solution 1 - Change npm directory ownership:**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.config
```

**Solution 2 - Use a prefix:**
```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install
```

### Problem: "Port 5173 already in use"

**Solution 1 - Kill the process:**
```bash
lsof -ti:5173 | xargs kill -9
npm run dev
```

**Solution 2 - Use different port:**
```bash
npm run dev -- --port 3000
```

### Problem: "Cannot find module" errors

**Solution - Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Blank page in browser

**Solutions:**
1. Check browser console (F12) for errors
2. Try a different browser (Chrome recommended)
3. Clear browser cache
4. Ensure dev server is running in terminal

### Problem: "npm ERR! code EPERM"

This is the permission error you encountered.

**Solution - Fix file permissions:**
```bash
# On Mac/Linux
sudo chown -R $(whoami) /opt/homebrew/lib/node_modules
sudo chown -R $(whoami) ~/.npm

# Then try again
npm install
```

**Alternative - Use nvm (Node Version Manager):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 18
nvm use 18
npm install
```

### Problem: Very slow npm install

**Solution - Use faster package manager:**
```bash
# Install pnpm (faster alternative)
npm install -g pnpm

# Use pnpm instead
pnpm install
pnpm dev
```

## Verification Checklist

After installation, verify:

- [ ] `node_modules/` folder exists
- [ ] `package-lock.json` file created
- [ ] `npm run dev` starts without errors
- [ ] Browser shows dashboard at `http://localhost:5173`
- [ ] Dashboard displays 250 services
- [ ] Charts render correctly
- [ ] Filters are clickable
- [ ] Table is sortable

## System Requirements

**Minimum:**
- 4 GB RAM
- 500 MB disk space
- Modern browser (Chrome, Firefox, Safari, Edge)

**Recommended:**
- 8 GB RAM
- 1 GB disk space
- Latest Chrome browser

## Alternative Installation Methods

### Using Yarn

```bash
yarn install
yarn dev
```

### Using pnpm

```bash
pnpm install
pnpm dev
```

### Using Docker (Advanced)

Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

Run:
```bash
docker build -t cs-dashboard .
docker run -p 5173:5173 cs-dashboard
```

## Post-Installation

After successful installation:

1. **Explore the dashboard**
   - Try different filters
   - Click on chart elements
   - Sort the table

2. **Read the documentation**
   - `README.md` - Full guide
   - `QUICK_START.md` - Quick reference
   - `SETUP.md` - Detailed setup

3. **Customize if needed**
   - Colors, thresholds, etc.
   - See customization section in README

4. **Plan data integration**
   - Read `CONNECTING_REAL_DATA.md`
   - Choose CSV or PostgreSQL approach

## Getting Help

If you're still having issues:

1. **Check error messages** carefully
2. **Search online** - Most npm errors have solutions
3. **Ask me** - I can help troubleshoot!

Include this information when asking for help:
```bash
node --version
npm --version
cat package.json
# Copy any error messages
```

## Success!

Once you see the dashboard in your browser, you're all set! 🎉

Next steps:
- Explore the features
- Read the documentation
- Plan your data integration

---

**Happy coding! 📊**

