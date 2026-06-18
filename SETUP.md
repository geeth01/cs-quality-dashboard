# Setup Guide

Complete step-by-step guide to get your CS Quality Dashboard up and running.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code editor** - VS Code recommended

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install all required packages:
- React & React DOM
- TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Recharts (charts)
- Lucide React (icons)

### 2. Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Open in Browser

Navigate to `http://localhost:5173`

🎉 **You should now see the dashboard with mock data!**

## 🎨 What You Should See

The dashboard includes:

1. **Header** - Title and refresh button
2. **Info Banner** - Indicates you're using mock data
3. **Filters** - Dropdowns and date pickers
4. **Summary Cards** - 4 metric cards showing:
   - Total Services (250)
   - Average Coverage (~65%)
   - Total Tests (~15,000)
   - Services Below 70%
5. **Coverage Trend Chart** - Line chart showing progress over 90 days
6. **Data Table** - Sortable table with all 250 services

## 🔧 Configuration

### Environment Variables

The dashboard uses environment variables for configuration. Create a `.env` file:

```env
# Mock data (default mode)
VITE_USE_MOCK_DATA=true

# Real API endpoint (use later)
# VITE_API_URL=http://localhost:3000/api
```

**Note:** With `VITE_USE_MOCK_DATA=true`, you don't need a database or API - the dashboard generates realistic sample data.

## 📊 Understanding Mock Data

The mock data generator (`src/services/mockData.ts`) creates:

- **250 microservices** across 6 products
- **90 days** of daily data
- Realistic coverage distribution:
  - 10% low coverage (0-40%)
  - 70% medium-high coverage (60-90%)
  - 20% excellent coverage (85-100%)
- Gradual improvement over time (simulating real development)

You can modify these parameters in `src/services/mockData.ts`.

## 🎯 Next Steps

### Option A: Explore the Dashboard (Recommended First)

1. Try the filters - select different products, subproducts
2. Change date ranges (7, 30, 90, 365 days)
3. Sort the table by different columns
4. Check the coverage trend chart
5. Explore the code structure

### Option B: Connect Real Data

When you're ready to use your actual data:

1. **Set up PostgreSQL database**
   - Follow `database/README.md`
   - Run `database/schema.sql`
   - Migrate your Google Sheets data

2. **Create an API server**
   - Simple Express.js or FastAPI server
   - Connect to PostgreSQL
   - Expose endpoints for dashboard

3. **Update environment**
   - Set `VITE_USE_MOCK_DATA=false`
   - Set `VITE_API_URL` to your API endpoint

4. **Modify `src/services/api.ts`**
   - Uncomment the fetch() calls
   - Remove mock data fallbacks

## 🛠️ Development Workflow

### Making Changes

1. **Edit components** in `src/components/`
2. **Save the file** - Vite will auto-reload
3. **Check browser** - Changes appear instantly

### Project Structure

```
src/
├── components/      # UI components
├── services/        # Data fetching
├── hooks/           # React hooks
├── types/           # TypeScript types
├── utils/           # Helper functions
├── App.tsx          # Main component
└── main.tsx         # Entry point
```

### Common Customizations

**Change color theme:**
- Edit `tailwind.config.js`
- Modify colors in `src/utils/helpers.ts`

**Adjust coverage thresholds:**
```typescript
// src/utils/helpers.ts
export function getCoverageColor(coverage: number): string {
  if (coverage >= 80) return 'text-green-600';  // Change 80
  if (coverage >= 70) return 'text-yellow-600'; // Change 70
  // ... etc
}
```

**Add new filters:**
1. Add field to `DashboardFilters` type in `src/types/index.ts`
2. Add UI in `src/components/Filters.tsx`
3. Update filtering logic in `src/services/api.ts`

## 🚢 Building for Production

### Build the app

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### Preview the production build

```bash
npm run preview
```

### Deploy

Upload the `dist/` folder to:
- **Vercel** - `vercel deploy`
- **Netlify** - Drag & drop the dist folder
- **GitHub Pages** - Push to gh-pages branch
- **Any static host** - Upload via FTP/SFTP

## 📦 Dependencies Explained

- **react** & **react-dom** - UI framework
- **typescript** - Type safety
- **vite** - Lightning fast build tool
- **tailwindcss** - Utility-first CSS
- **recharts** - React chart library
- **lucide-react** - Beautiful icons
- **date-fns** - Date formatting

## 🐛 Troubleshooting

### Port 5173 already in use

```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
# Restart your editor
# or
npm run build
```

### Charts not showing

- Check browser console for errors
- Ensure data format matches ChartDataPoint type
- Verify recharts is installed: `npm list recharts`

## 💡 Tips

1. **Use React DevTools** - Install the browser extension
2. **Check Network tab** - See API calls (when using real data)
3. **Use console.log()** - Debug data flow
4. **Read TypeScript errors** - They're helpful!

## ✅ Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server runs (`npm run dev`)
- [ ] Dashboard opens in browser
- [ ] Summary cards show numbers
- [ ] Chart displays data
- [ ] Table shows 250 services
- [ ] Filters work (try selecting a product)
- [ ] Table sorting works (click column headers)

## 📞 Getting Help

If you're stuck:

1. Check the error message in terminal
2. Check browser console (F12)
3. Review `README.md` for more details
4. Check `database/README.md` for database setup
5. Ask me! I'm here to help.

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Ready to track your code quality! 🚀**

