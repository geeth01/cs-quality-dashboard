# Database Setup Guide

## PLACEHOLDER - Follow these steps when ready to set up the database

### Step 1: Create a PostgreSQL Database

**Option A: Supabase (Recommended - Free Tier)**
1. Go to https://supabase.com
2. Sign up (no credit card required)
3. Create a new project
4. Wait ~2 minutes for database to be ready
5. Go to Settings → Database → Connection String
6. Copy the connection string (looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

**Option B: Neon (Alternative - Free Tier)**
1. Go to https://neon.tech
2. Sign up (no credit card required)
3. Create a new project
4. Copy the connection string

**Option C: Local PostgreSQL**
```bash
# Install PostgreSQL (Mac)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb cs_quality_dashboard
```

### Step 2: Run the Schema

```bash
# If using Supabase/Neon - use their SQL editor in the dashboard
# Copy and paste the contents of schema.sql

# If using local PostgreSQL
psql cs_quality_dashboard < database/schema.sql
```

### Step 3: Set Environment Variables

Create a `.env` file in the project root:

```env
# Database Connection
DATABASE_URL=your_connection_string_here

# Example for Supabase:
# DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres

# Example for local:
# DATABASE_URL=postgresql://localhost:5432/cs_quality_dashboard
```

### Step 4: Migrate Existing Google Sheets Data

```bash
# First, export your Google Sheet to CSV
# Place the files as: data/unit_tests.csv and data/e2e_tests.csv

# Then run the migration script (TODO: create this)
python scripts/migrate_csv_to_db.py
```

### Step 5: Update Your Daily Script

See `scripts/db_writer_example.py` for how to write to the database from your script.

## Database Schema Overview

### Tables

**unit_tests**
- Stores daily coverage data for each microservice
- Unique constraint on (date, product, subproduct, namespace, service_name)
- ~250 services × 365 days = ~91K rows/year

**e2e_tests**
- Stores daily E2E test counts per product
- Unique constraint on (date, product)
- Much smaller dataset

### Views

**latest_unit_test_coverage**
- Shows the most recent coverage data for each service
- Used for current state displays

**coverage_trends**
- Compares current coverage with 7 days ago
- Shows coverage_change and test_count_change
- Used for trend indicators

## Query Examples

```sql
-- Get latest coverage for all services
SELECT * FROM latest_unit_test_coverage
ORDER BY coverage_pct ASC;

-- Get coverage trend for a specific product
SELECT * FROM coverage_trends
WHERE product = 'YourProduct'
ORDER BY coverage_change DESC;

-- Get coverage over time for a service
SELECT date, coverage_pct, test_count
FROM unit_tests
WHERE service_name = 'your-service'
  AND date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY date;

-- Get average coverage by product
SELECT 
    product,
    AVG(coverage_pct) as avg_coverage,
    SUM(test_count) as total_tests,
    COUNT(*) as service_count
FROM latest_unit_test_coverage
GROUP BY product
ORDER BY avg_coverage DESC;
```

## Connection Test

To test your database connection:

```bash
# Using psql
psql "your_connection_string_here"

# Then in psql:
\dt  -- List tables
\dv  -- List views
SELECT COUNT(*) FROM unit_tests;
```

