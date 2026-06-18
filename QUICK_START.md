# Quick Start - Get Running in 2 Minutes! ⚡

## Install and Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dashboard
npm run dev

# 3. Open in browser
# Navigate to http://localhost:5173
```

That's it! 🎉

## What You'll See

- **Mock data** showing 250 services
- **90 days** of coverage history
- **Interactive filters** and charts
- **Sortable table** with all services

## Quick Actions

### Change Date Range
Click the preset buttons: "Last 7 days", "Last 30 days", etc.

### Filter by Product
Use the dropdown in the Filters section

### Sort Table
Click any column header to sort

### See Trends
Check the line chart showing coverage over time

## Files You'll Want to Know

- `src/App.tsx` - Main dashboard component
- `src/components/` - All UI components
- `src/services/api.ts` - Data fetching logic
- `README.md` - Full documentation

## Next Steps

### Using Real Data?

See `CONNECTING_REAL_DATA.md` for:
- Simple CSV-based API server (10 min setup)
- PostgreSQL database setup (30 min setup)

### Customizing?

- **Colors**: Edit `src/utils/helpers.ts`
- **Thresholds**: Change in `getCoverageColor()` function
- **Mock data**: Modify `src/services/mockData.ts`

### Deploying?

```bash
npm run build
# Upload 'dist' folder to Vercel, Netlify, etc.
```

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

## Troubleshooting

**Port already in use?**
```bash
npm run dev -- --port 3000
```

**Need to reinstall?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Charts not showing?**
- Clear browser cache
- Check browser console (F12)

## Get Help

- Read `SETUP.md` for detailed setup guide
- Read `README.md` for full documentation
- Check `database/README.md` for database setup

---

**Happy dashboarding! 📊**

