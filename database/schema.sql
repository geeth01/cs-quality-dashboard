-- CS Quality Dashboard Database Schema
-- This is a PLACEHOLDER - Use this when setting up your PostgreSQL database

-- Table for Unit Test Coverage Data
CREATE TABLE IF NOT EXISTS unit_tests (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    product VARCHAR(255) NOT NULL,
    subproduct VARCHAR(255) NOT NULL,
    namespace VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    coverage_pct DECIMAL(5,2) DEFAULT 0.0,
    test_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Create unique constraint to prevent duplicate entries for same service on same date
    UNIQUE(date, product, subproduct, namespace, service_name)
);

-- Table for E2E Test Data
CREATE TABLE IF NOT EXISTS e2e_tests (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    product VARCHAR(255) NOT NULL,
    test_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Create unique constraint to prevent duplicate entries for same product on same date
    UNIQUE(date, product)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_unit_tests_date ON unit_tests(date);
CREATE INDEX IF NOT EXISTS idx_unit_tests_product ON unit_tests(product);
CREATE INDEX IF NOT EXISTS idx_unit_tests_service ON unit_tests(service_name);
CREATE INDEX IF NOT EXISTS idx_unit_tests_date_product ON unit_tests(date, product);

CREATE INDEX IF NOT EXISTS idx_e2e_tests_date ON e2e_tests(date);
CREATE INDEX IF NOT EXISTS idx_e2e_tests_product ON e2e_tests(product);

-- View for latest coverage per service
CREATE OR REPLACE VIEW latest_unit_test_coverage AS
SELECT DISTINCT ON (product, subproduct, namespace, service_name)
    *
FROM unit_tests
ORDER BY product, subproduct, namespace, service_name, date DESC;

-- View for coverage trends (comparing current vs 7 days ago)
CREATE OR REPLACE VIEW coverage_trends AS
WITH current_data AS (
    SELECT * FROM latest_unit_test_coverage
),
week_ago AS (
    SELECT 
        product,
        subproduct,
        namespace,
        service_name,
        coverage_pct as coverage_pct_week_ago,
        test_count as test_count_week_ago
    FROM unit_tests
    WHERE date = CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    c.*,
    w.coverage_pct_week_ago,
    w.test_count_week_ago,
    COALESCE(c.coverage_pct - w.coverage_pct_week_ago, 0) as coverage_change,
    COALESCE(c.test_count - w.test_count_week_ago, 0) as test_count_change
FROM current_data c
LEFT JOIN week_ago w ON 
    c.product = w.product AND
    c.subproduct = w.subproduct AND
    c.namespace = w.namespace AND
    c.service_name = w.service_name;

