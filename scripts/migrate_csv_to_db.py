"""
PLACEHOLDER: Migration script to import CSV data to PostgreSQL

This script reads your existing Google Sheets data (exported as CSV) 
and imports it into the PostgreSQL database.

Prerequisites:
    pip install psycopg2-binary pandas
    
Usage:
    1. Export your Google Sheets to CSV:
       - UNIT_TESTS sheet → data/unit_tests.csv
       - E2E_TESTS sheet → data/e2e_tests.csv
    
    2. Run this script:
       python scripts/migrate_csv_to_db.py
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
from pathlib import Path

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://localhost:5432/cs_quality_dashboard')

def migrate_unit_tests(csv_path='data/unit_tests.csv'):
    """Import unit tests CSV to database"""
    
    print(f"📖 Reading unit tests from {csv_path}...")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    
    # Expected columns: DATE, PRODUCT, SUBPRODUCT, NAMESPACE, SERVICE_NAME, COVERAGE_%, TEST_COUNT
    # Normalize column names (handle spaces, case)
    df.columns = df.columns.str.strip().str.upper()
    
    # Map columns
    column_mapping = {
        'DATE': 'date',
        'PRODUCT': 'product',
        'SUBPRODUCT': 'subproduct',
        'NAMESPACE': 'namespace',
        'SERVICE NAME': 'service_name',
        'SERVICE_NAME': 'service_name',
        'COVERAGE_%': 'coverage_pct',
        'COVERAGE_PCT': 'coverage_pct',
        'TEST_COUNT': 'test_count',
        'TEST COUNT': 'test_count'
    }
    
    # Rename columns
    for old_name, new_name in column_mapping.items():
        if old_name in df.columns:
            df.rename(columns={old_name: new_name}, inplace=True)
    
    # Fill NaN values with defaults
    df['coverage_pct'] = df['coverage_pct'].fillna(0.0)
    df['test_count'] = df['test_count'].fillna(0)
    
    # Convert to records
    records = df.to_dict('records')
    
    print(f"📝 Found {len(records)} records to import")
    
    # Connect and insert
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        values = [
            (
                record['date'],
                record['product'],
                record['subproduct'],
                record['namespace'],
                record['service_name'],
                float(record['coverage_pct']),
                int(record['test_count'])
            )
            for record in records
        ]
        
        query = """
            INSERT INTO unit_tests (date, product, subproduct, namespace, service_name, coverage_pct, test_count)
            VALUES %s
            ON CONFLICT (date, product, subproduct, namespace, service_name)
            DO UPDATE SET
                coverage_pct = EXCLUDED.coverage_pct,
                test_count = EXCLUDED.test_count
        """
        
        execute_values(cursor, query, values)
        conn.commit()
        
        print(f"✅ Successfully imported {len(records)} unit test records!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def migrate_e2e_tests(csv_path='data/e2e_tests.csv'):
    """Import E2E tests CSV to database"""
    
    print(f"📖 Reading E2E tests from {csv_path}...")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    
    # Normalize column names
    df.columns = df.columns.str.strip().str.upper()
    
    # Map columns
    column_mapping = {
        'DATE': 'date',
        'PRODUCT': 'product',
        'TEST_COUNT': 'test_count',
        'TEST COUNT': 'test_count'
    }
    
    for old_name, new_name in column_mapping.items():
        if old_name in df.columns:
            df.rename(columns={old_name: new_name}, inplace=True)
    
    # Fill NaN values
    df['test_count'] = df['test_count'].fillna(0)
    
    records = df.to_dict('records')
    
    print(f"📝 Found {len(records)} records to import")
    
    # Connect and insert
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        values = [
            (
                record['date'],
                record['product'],
                int(record['test_count'])
            )
            for record in records
        ]
        
        query = """
            INSERT INTO e2e_tests (date, product, test_count)
            VALUES %s
            ON CONFLICT (date, product)
            DO UPDATE SET
                test_count = EXCLUDED.test_count
        """
        
        execute_values(cursor, query, values)
        conn.commit()
        
        print(f"✅ Successfully imported {len(records)} E2E test records!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🚀 Starting data migration...\n")
    
    # Create data directory if it doesn't exist
    Path("data").mkdir(exist_ok=True)
    
    # Check if CSV files exist
    unit_csv = 'data/unit_tests.csv'
    e2e_csv = 'data/e2e_tests.csv'
    
    if not os.path.exists(unit_csv):
        print(f"⚠️  {unit_csv} not found. Please export your Google Sheet and place it here.")
    else:
        migrate_unit_tests(unit_csv)
    
    if not os.path.exists(e2e_csv):
        print(f"⚠️  {e2e_csv} not found. Please export your Google Sheet and place it here.")
    else:
        migrate_e2e_tests(e2e_csv)
    
    print("\n✅ Migration complete!")

