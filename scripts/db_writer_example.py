"""
PLACEHOLDER: Example script showing how to write data to PostgreSQL

This is a template for how to modify your existing script to write to the database.
Install required package: pip install psycopg2-binary
"""

import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import os

# Database connection string (from environment variable)
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://localhost:5432/cs_quality_dashboard')

def get_db_connection():
    """Create a database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def write_unit_tests_to_db(data_records):
    """
    Write unit test coverage data to PostgreSQL
    
    Args:
        data_records: List of dictionaries with keys:
            - date (string or datetime): Date of measurement
            - product (string): Product name
            - subproduct (string): Subproduct name
            - namespace (string): Kubernetes namespace
            - service_name (string): Microservice name
            - coverage_pct (float): Coverage percentage (0-100)
            - test_count (int): Number of unit tests
    
    Example:
        data = [
            {
                'date': '2025-11-14',
                'product': 'Auth',
                'subproduct': 'Login',
                'namespace': 'auth-ns',
                'service_name': 'login-service',
                'coverage_pct': 75.5,
                'test_count': 234
            },
            # ... more records
        ]
        write_unit_tests_to_db(data)
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Prepare data for bulk insert
        values = [
            (
                record.get('date'),
                record.get('product', ''),
                record.get('subproduct', ''),
                record.get('namespace', ''),
                record.get('service_name', ''),
                record.get('coverage_pct', 0.0),
                record.get('test_count', 0)
            )
            for record in data_records
        ]
        
        # Use ON CONFLICT to update if record already exists for this date
        query = """
            INSERT INTO unit_tests (date, product, subproduct, namespace, service_name, coverage_pct, test_count)
            VALUES %s
            ON CONFLICT (date, product, subproduct, namespace, service_name)
            DO UPDATE SET
                coverage_pct = EXCLUDED.coverage_pct,
                test_count = EXCLUDED.test_count,
                created_at = CURRENT_TIMESTAMP
        """
        
        execute_values(cursor, query, values)
        conn.commit()
        
        print(f"✅ Successfully wrote {len(data_records)} unit test records to database")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error writing to database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def write_e2e_tests_to_db(data_records):
    """
    Write E2E test data to PostgreSQL
    
    Args:
        data_records: List of dictionaries with keys:
            - date (string or datetime): Date of measurement
            - product (string): Product name
            - test_count (int): Number of E2E tests
    
    Example:
        data = [
            {
                'date': '2025-11-14',
                'product': 'Auth',
                'test_count': 45
            },
            # ... more records
        ]
        write_e2e_tests_to_db(data)
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        values = [
            (
                record.get('date'),
                record.get('product', ''),
                record.get('test_count', 0)
            )
            for record in data_records
        ]
        
        query = """
            INSERT INTO e2e_tests (date, product, test_count)
            VALUES %s
            ON CONFLICT (date, product)
            DO UPDATE SET
                test_count = EXCLUDED.test_count,
                created_at = CURRENT_TIMESTAMP
        """
        
        execute_values(cursor, query, values)
        conn.commit()
        
        print(f"✅ Successfully wrote {len(data_records)} E2E test records to database")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error writing to database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

# ============================================
# EXAMPLE USAGE - Integrate into your script
# ============================================

if __name__ == "__main__":
    # Example: Your existing script collects this data
    unit_test_data = [
        {
            'date': datetime.now().date(),
            'product': 'Auth',
            'subproduct': 'Login',
            'namespace': 'auth-ns',
            'service_name': 'login-service',
            'coverage_pct': 75.5,
            'test_count': 234
        },
        {
            'date': datetime.now().date(),
            'product': 'Auth',
            'subproduct': 'Session',
            'namespace': 'auth-ns',
            'service_name': 'session-service',
            'coverage_pct': 82.3,
            'test_count': 189
        },
    ]
    
    e2e_test_data = [
        {
            'date': datetime.now().date(),
            'product': 'Auth',
            'test_count': 45
        },
        {
            'date': datetime.now().date(),
            'product': 'Payment',
            'test_count': 67
        },
    ]
    
    # Write to database
    write_unit_tests_to_db(unit_test_data)
    write_e2e_tests_to_db(e2e_test_data)
    
    print("✅ All data written successfully!")

