/**
 * Mock Data Generator
 * 
 * This generates realistic test data for dashboard development.
 * DELETE THIS FILE when connecting to real database.
 */

import type { UnitTestData, E2ETestData } from '../types';

const PRODUCTS = ['Auth', 'Payment', 'User', 'Notification', 'Analytics', 'Admin'];
const SUBPRODUCTS = ['API', 'Worker', 'Frontend', 'Gateway', 'Service'];
const NAMESPACES = ['prod-ns', 'staging-ns', 'dev-ns'];

function generateServiceName(product: string, subproduct: string): string {
  return `${product.toLowerCase()}-${subproduct.toLowerCase()}-svc`;
}

function generateRandomCoverage(): number {
  // Simulate realistic distribution: most services 60-90%, some lower, some higher
  const rand = Math.random();
  if (rand < 0.1) return Math.random() * 40; // 10% are low coverage
  if (rand < 0.8) return 60 + Math.random() * 30; // 70% are medium-high
  return 85 + Math.random() * 15; // 20% are very high
}

function generateRandomTestCount(coverage: number): number {
  // More tests usually correlate with higher coverage
  const base = Math.floor(coverage * 2 + Math.random() * 100);
  return Math.max(0, base);
}

export function generateMockData(
  numServices: number = 250,
  startDate?: string,
  endDate?: string
): {
  unitTests: UnitTestData[];
  e2eTests: E2ETestData[];
} {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  const unitTests: UnitTestData[] = [];
  const e2eTests: E2ETestData[] = [];
  
  // Generate services
  const services: Array<{
    product: string;
    subproduct: string;
    namespace: string;
    service_name: string;
    baseCoverage: number;
    baseTestCount: number;
  }> = [];

  for (let i = 0; i < numServices; i++) {
    const product = PRODUCTS[i % PRODUCTS.length];
    const subproduct = SUBPRODUCTS[Math.floor(i / PRODUCTS.length) % SUBPRODUCTS.length];
    const namespace = NAMESPACES[i % NAMESPACES.length];
    const service_name = `${generateServiceName(product, subproduct)}-${i}`;
    const baseCoverage = generateRandomCoverage();
    const baseTestCount = generateRandomTestCount(baseCoverage);

    services.push({
      product,
      subproduct,
      namespace,
      service_name,
      baseCoverage,
      baseTestCount,
    });
  }

  // Generate daily data for each service
  let id = 1;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    services.forEach(service => {
      // Simulate gradual improvement with some randomness
      const daysSinceStart = Math.floor((currentDate.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      const improvement = daysSinceStart * 0.05; // 0.05% improvement per day on average
      const randomVariation = (Math.random() - 0.5) * 2; // ±1% random variation
      
      const coverage = Math.min(100, Math.max(0, service.baseCoverage + improvement + randomVariation));
      const tests = Math.max(0, service.baseTestCount + Math.floor(daysSinceStart * 0.5) + Math.floor((Math.random() - 0.5) * 5));

      unitTests.push({
        id: id++,
        date: dateStr,
        product: service.product,
        subproduct: service.subproduct,
        namespace: service.namespace,
        service_name: service.service_name,
        coverage_pct: parseFloat(coverage.toFixed(2)),
        test_count: tests,
      });
    });

    // Generate E2E test data (one per product per day)
    PRODUCTS.forEach(product => {
      e2eTests.push({
        id: id++,
        date: dateStr,
        product,
        test_count: Math.floor(30 + Math.random() * 50),
      });
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { unitTests, e2eTests };
}

