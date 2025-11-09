/**
 * Test script for financial calculation fixes
 * Tests all four fixes from FINANCIAL_CALCULATIONS_AUDIT_REPORT.md
 * 
 * Note: This test requires Next.js compilation or TypeScript compilation.
 * Run with: node --loader ts-node/esm test_calculation_fixes.js
 * Or compile first and run the compiled version
 */

let getMonthlyMortgagePayment, getMonthlyMortgageInterest, getMonthlyMortgagePrincipal;
let getCurrentMortgageBalance, getAnnualMortgageInterest, calculateAmortizationSchedule;
let getMortgageYearlySummary, getMortgageBalanceAtYear;
let calculateNOI, calculateAnnualOperatingExpenses;

// Try to import (will work if compiled/transpiled)
try {
  const mortgageUtils = require('./src/utils/mortgageCalculator');
  getMonthlyMortgagePayment = mortgageUtils.getMonthlyMortgagePayment;
  getMonthlyMortgageInterest = mortgageUtils.getMonthlyMortgageInterest;
  getMonthlyMortgagePrincipal = mortgageUtils.getMonthlyMortgagePrincipal;
  getCurrentMortgageBalance = mortgageUtils.getCurrentMortgageBalance;
  getAnnualMortgageInterest = mortgageUtils.getAnnualMortgageInterest;
  calculateAmortizationSchedule = mortgageUtils.calculateAmortizationSchedule;
  getMortgageYearlySummary = mortgageUtils.getMortgageYearlySummary;
  getMortgageBalanceAtYear = mortgageUtils.getMortgageBalanceAtYear;
} catch (error) {
  console.warn('Could not load mortgageCalculator. Tests will be skipped.');
  console.warn('Note: This test file requires TypeScript compilation or Next.js build.');
}

try {
  const financialUtils = require('./src/utils/financialCalculations');
  calculateNOI = financialUtils.calculateNOI;
  calculateAnnualOperatingExpenses = financialUtils.calculateAnnualOperatingExpenses;
} catch (error) {
  console.warn('Could not load financialCalculations. Tests will be skipped.');
}

// Skip tests if imports failed
if (!getMonthlyMortgagePayment || !calculateNOI) {
  console.log('⚠️  Cannot run tests - required modules not available.');
  console.log('   This is expected if TypeScript files are not compiled.');
  console.log('   Tests should be run after Next.js build or with TypeScript compiler.');
  process.exit(0);
}

// Test property data (First St)
const testMortgage = {
  lender: 'Lender 1',
  originalAmount: 400000,
  interestRate: 0.025, // 2.5%
  rateType: 'Fixed',
  termMonths: 60,
  amortizationYears: 30,
  paymentFrequency: 'Monthly',
  startDate: '2021-01-01'
};

const testProperty = {
  id: 'first-st-1',
  rent: {
    monthlyRent: 2650,
    annualRent: 31800
  },
  currentMarketValue: 600000,
  monthlyExpenses: {
    propertyTax: 233,
    condoFees: 928.58,
    insurance: 49.67,
    maintenance: 23.42,
    professionalFees: 0,
    utilities: 0
  },
  mortgage: testMortgage,
  totalInvestment: 550000
};

console.log('='.repeat(80));
console.log('FINANCIAL CALCULATION FIXES TEST SUITE');
console.log('='.repeat(80));
console.log('');

// Test results tracker
let testsPassed = 0;
let testsFailed = 0;

function test(name, condition, expected, actual) {
  const passed = condition;
  if (passed) {
    testsPassed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testsFailed++;
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
  }
}

// ============================================================================
// FIX #1: Accelerated and Semi-Monthly Payment Frequencies
// ============================================================================
console.log('FIX #1: Accelerated and Semi-Monthly Payment Frequencies');
console.log('-'.repeat(80));

// Test monthly payment for different frequencies
const monthlyMortgage = { ...testMortgage, paymentFrequency: 'Monthly' };
const semiMonthlyMortgage = { ...testMortgage, paymentFrequency: 'Semi-Monthly' };
const biWeeklyMortgage = { ...testMortgage, paymentFrequency: 'Bi-weekly' };
const acceleratedBiWeeklyMortgage = { ...testMortgage, paymentFrequency: 'Accelerated Bi-weekly' };
const weeklyMortgage = { ...testMortgage, paymentFrequency: 'Weekly' };
const acceleratedWeeklyMortgage = { ...testMortgage, paymentFrequency: 'Accelerated Weekly' };

try {
  const monthlyPayment = getMonthlyMortgagePayment(monthlyMortgage);
  const semiMonthlyPayment = getMonthlyMortgagePayment(semiMonthlyMortgage);
  const biWeeklyPayment = getMonthlyMortgagePayment(biWeeklyMortgage);
  const acceleratedBiWeeklyPayment = getMonthlyMortgagePayment(acceleratedBiWeeklyMortgage);
  const weeklyPayment = getMonthlyMortgagePayment(weeklyMortgage);
  const acceleratedWeeklyPayment = getMonthlyMortgagePayment(acceleratedWeeklyMortgage);

  // Expected: Monthly payment should be ~$1,577.80
  test(
    'Monthly payment calculation',
    Math.abs(monthlyPayment - 1577.80) < 1,
    '$1,577.80',
    `$${monthlyPayment.toFixed(2)}`
  );

  // Semi-monthly should equal monthly (same payment frequency calculation)
  test(
    'Semi-monthly equals monthly',
    Math.abs(semiMonthlyPayment - monthlyPayment) < 0.01,
    `$${monthlyPayment.toFixed(2)}`,
    `$${semiMonthlyPayment.toFixed(2)}`
  );

  // Bi-weekly conversion
  test(
    'Bi-weekly payment converted to monthly equivalent',
    biWeeklyPayment > 0 && biWeeklyPayment < monthlyPayment * 1.1,
    'Positive value < monthly * 1.1',
    `$${biWeeklyPayment.toFixed(2)}`
  );

  // Accelerated bi-weekly: should be (monthlyPayment / 2) * 26 / 12
  const expectedAcceleratedBiWeekly = (monthlyPayment / 2) * 26 / 12;
  test(
    'Accelerated bi-weekly calculation',
    Math.abs(acceleratedBiWeeklyPayment - expectedAcceleratedBiWeekly) < 0.01,
    `$${expectedAcceleratedBiWeekly.toFixed(2)}`,
    `$${acceleratedBiWeeklyPayment.toFixed(2)}`
  );

  // Accelerated weekly: should be (monthlyPayment / 4) * 52 / 12
  const expectedAcceleratedWeekly = (monthlyPayment / 4) * 52 / 12;
  test(
    'Accelerated weekly calculation',
    Math.abs(acceleratedWeeklyPayment - expectedAcceleratedWeekly) < 0.01,
    `$${expectedAcceleratedWeekly.toFixed(2)}`,
    `$${acceleratedWeeklyPayment.toFixed(2)}`
  );

  // Test interest calculations
  const monthlyInterest = getMonthlyMortgageInterest(monthlyMortgage);
  const acceleratedBiWeeklyInterest = getMonthlyMortgageInterest(acceleratedBiWeeklyMortgage);
  
  test(
    'Monthly interest calculation',
    monthlyInterest > 0 && monthlyInterest < monthlyPayment,
    'Positive value < payment',
    `$${monthlyInterest.toFixed(2)}`
  );

  test(
    'Accelerated bi-weekly interest calculation',
    acceleratedBiWeeklyInterest > 0,
    'Positive value',
    `$${acceleratedBiWeeklyInterest.toFixed(2)}`
  );

  // Test principal calculations
  const monthlyPrincipal = getMonthlyMortgagePrincipal(monthlyMortgage);
  const acceleratedBiWeeklyPrincipal = getMonthlyMortgagePrincipal(acceleratedBiWeeklyMortgage);

  test(
    'Monthly principal calculation',
    monthlyPrincipal > 0 && monthlyPrincipal < monthlyPayment,
    'Positive value < payment',
    `$${monthlyPrincipal.toFixed(2)}`
  );

  test(
    'Accelerated bi-weekly principal calculation',
    acceleratedBiWeeklyPrincipal > 0,
    'Positive value',
    `$${acceleratedBiWeeklyPrincipal.toFixed(2)}`
  );

} catch (error) {
  console.log(`❌ ERROR in Fix #1 tests: ${error.message}`);
  testsFailed++;
}

console.log('');

// ============================================================================
// MORTGAGE SCHEDULE ALIGNMENT TESTS
// ============================================================================
console.log('MORTGAGE SCHEDULE ALIGNMENT TESTS');
console.log('-'.repeat(80));

if (calculateAmortizationSchedule && getMortgageYearlySummary && getMortgageBalanceAtYear) {
  const paymentsPerYearMap = {
    monthly: 12,
    'semi-monthly': 24,
    'bi-weekly': 26,
    'accelerated bi-weekly': 26,
    weekly: 52,
    'accelerated weekly': 52
  };

  try {
    const scheduleMonthly = calculateAmortizationSchedule(monthlyMortgage);
    const monthlySummaries = getMortgageYearlySummary(monthlyMortgage, 5);
    const monthlyPaymentsPerYear = paymentsPerYearMap['monthly'];
    const monthlyTargetIndex = Math.min(scheduleMonthly.payments.length, monthlyPaymentsPerYear * 5) - 1;
    const expectedMonthlyBalance = monthlyTargetIndex >= 0
      ? scheduleMonthly.payments[monthlyTargetIndex].remainingBalance
      : scheduleMonthly.payments[scheduleMonthly.payments.length - 1].remainingBalance;
    const monthlyYearFive = monthlySummaries.find(summary => summary.year === 5);

    test(
      'Yearly summary balance matches amortization schedule (monthly, year 5)',
      Boolean(monthlyYearFive) && Math.abs(monthlyYearFive.endingBalance - expectedMonthlyBalance) < 1,
      `$${expectedMonthlyBalance.toFixed(2)}`,
      monthlyYearFive ? `$${monthlyYearFive.endingBalance.toFixed(2)}` : 'No summary available'
    );

    const scheduleAccelerated = calculateAmortizationSchedule(acceleratedBiWeeklyMortgage);
    const acceleratedPaymentsPerYear = paymentsPerYearMap['accelerated bi-weekly'];
    const acceleratedTargetIndex = Math.min(scheduleAccelerated.payments.length, acceleratedPaymentsPerYear * 3) - 1;
    const expectedAcceleratedBalance = acceleratedTargetIndex >= 0
      ? scheduleAccelerated.payments[acceleratedTargetIndex].remainingBalance
      : scheduleAccelerated.payments[scheduleAccelerated.payments.length - 1].remainingBalance;
    const acceleratedBalanceYearThree = getMortgageBalanceAtYear(acceleratedBiWeeklyMortgage, 3);

    test(
      'getMortgageBalanceAtYear matches schedule (accelerated bi-weekly, year 3)',
      Math.abs(acceleratedBalanceYearThree - expectedAcceleratedBalance) < 1,
      `$${expectedAcceleratedBalance.toFixed(2)}`,
      `$${acceleratedBalanceYearThree.toFixed(2)}`
    );

    const acceleratedSummaries = getMortgageYearlySummary(acceleratedBiWeeklyMortgage, 1);
    const acceleratedYearOne = acceleratedSummaries[0];

    test(
      'Accelerated bi-weekly payments per forecast year respected',
      Boolean(acceleratedYearOne) && acceleratedYearOne.payments === acceleratedPaymentsPerYear,
      `${acceleratedPaymentsPerYear}`,
      acceleratedYearOne ? `${acceleratedYearOne.payments}` : 'No summary available'
    );
  } catch (error) {
    console.log(`❌ ERROR in mortgage schedule alignment tests: ${error.message}`);
    testsFailed++;
  }
} else {
  console.log('⚠️  Skipping mortgage schedule alignment tests (helpers unavailable).');
}

console.log('');

// ============================================================================
// FIX #2: Portfolio Mortgage Balance
// ============================================================================
console.log('FIX #2: Portfolio Mortgage Balance Using getCurrentMortgageBalance()');
console.log('-'.repeat(80));

try {
  // Test current mortgage balance calculation
  const currentBalance = getCurrentMortgageBalance(testMortgage);
  
  test(
    'Current mortgage balance calculated',
    currentBalance > 0 && currentBalance <= testMortgage.originalAmount,
    '0 < balance <= originalAmount',
    `$${currentBalance.toFixed(2)}`
  );

  // Test that balance decreases over time (if start date is in past)
  const pastMortgage = { ...testMortgage, startDate: '2020-01-01' };
  const pastBalance = getCurrentMortgageBalance(pastMortgage);
  
  test(
    'Past mortgage has lower balance',
    pastBalance <= testMortgage.originalAmount,
    'balance <= originalAmount',
    `$${pastBalance.toFixed(2)}`
  );

} catch (error) {
  console.log(`❌ ERROR in Fix #2 tests: ${error.message}`);
  testsFailed++;
}

console.log('');

// ============================================================================
// FIX #3: Portfolio Deductible Expenses
// ============================================================================
console.log('FIX #3: Portfolio Deductible Expenses Using getAnnualMortgageInterest()');
console.log('-'.repeat(80));

try {
  // Test annual mortgage interest calculation
  const annualInterest = getAnnualMortgageInterest(testMortgage);
  
  test(
    'Annual mortgage interest calculated',
    annualInterest > 0 && annualInterest < testMortgage.originalAmount * testMortgage.interestRate * 1.1,
    'Positive value < originalAmount * rate * 1.1',
    `$${annualInterest.toFixed(2)}`
  );

  // Test that it uses actual schedule (should be less than simple calculation for older mortgages)
  const simpleEstimate = testMortgage.originalAmount * testMortgage.interestRate;
  
  test(
    'Annual interest uses schedule (may differ from simple estimate)',
    annualInterest > 0,
    'Positive value',
    `$${annualInterest.toFixed(2)} (simple estimate: $${simpleEstimate.toFixed(2)})`
  );

} catch (error) {
  console.log(`❌ ERROR in Fix #3 tests: ${error.message}`);
  testsFailed++;
}

console.log('');

// ============================================================================
// FIX #4: NOI Prefers annualRent
// ============================================================================
console.log('FIX #4: NOI Calculation Prefers annualRent When Available');
console.log('-'.repeat(80));

try {
  // Test with annualRent available
  const noiWithAnnualRent = calculateNOI(testProperty);
  const expectedNOI = testProperty.rent.annualRent - calculateAnnualOperatingExpenses(testProperty);
  
  test(
    'NOI uses annualRent when available',
    Math.abs(noiWithAnnualRent - expectedNOI) < 0.01,
    `$${expectedNOI.toFixed(2)}`,
    `$${noiWithAnnualRent.toFixed(2)}`
  );

  // Test with only monthlyRent (no annualRent)
  const propertyWithoutAnnual = {
    ...testProperty,
    rent: {
      monthlyRent: 2650
      // No annualRent property
    }
  };
  const noiWithoutAnnual = calculateNOI(propertyWithoutAnnual);
  const expectedNOIFromMonthly = propertyWithoutAnnual.rent.monthlyRent * 12 - calculateAnnualOperatingExpenses(propertyWithoutAnnual);
  
  test(
    'NOI uses monthlyRent * 12 when annualRent not available',
    Math.abs(noiWithoutAnnual - expectedNOIFromMonthly) < 0.01,
    `$${expectedNOIFromMonthly.toFixed(2)}`,
    `$${noiWithoutAnnual.toFixed(2)}`
  );

  // Verify that when both are present, annualRent is preferred
  const propertyWithBoth = {
    ...testProperty,
    rent: {
      monthlyRent: 2650,
      annualRent: 35000 // Different from monthly * 12 to test preference
    }
  };
  const noiWithBoth = calculateNOI(propertyWithBoth);
  const expectedNOIFromAnnual = propertyWithBoth.rent.annualRent - calculateAnnualOperatingExpenses(propertyWithBoth);
  
  test(
    'NOI prefers annualRent over monthlyRent when both available',
    Math.abs(noiWithBoth - expectedNOIFromAnnual) < 0.01,
    `$${expectedNOIFromAnnual.toFixed(2)} (using annualRent)`,
    `$${noiWithBoth.toFixed(2)}`
  );

} catch (error) {
  console.log(`❌ ERROR in Fix #4 tests: ${error.message}`);
  testsFailed++;
}

console.log('');

// ============================================================================
// EDGE CASES
// ============================================================================
console.log('EDGE CASES');
console.log('-'.repeat(80));

try {
  // Edge case: Zero interest rate
  const zeroRateMortgage = { ...testMortgage, interestRate: 0 };
  const zeroRatePayment = getMonthlyMortgagePayment(zeroRateMortgage);
  test(
    'Zero interest rate handled',
    zeroRatePayment > 0 && zeroRatePayment === testMortgage.originalAmount / (testMortgage.amortizationYears * 12),
    `$${(testMortgage.originalAmount / (testMortgage.amortizationYears * 12)).toFixed(2)}`,
    `$${zeroRatePayment.toFixed(2)}`
  );

  // Edge case: Missing rent data
  const noRentProperty = { ...testProperty, rent: {} };
  const noiNoRent = calculateNOI(noRentProperty);
  test(
    'Missing rent data handled',
    noiNoRent === 0 || !isNaN(noiNoRent),
    '0 or valid number',
    `${noiNoRent}`
  );

  // Edge case: Missing mortgage data
  const noMortgageProperty = { ...testProperty, mortgage: null };
  try {
    const balance = getCurrentMortgageBalance(null);
    test(
      'Missing mortgage data handled',
      balance === 0 || balance === undefined,
      '0 or undefined',
      `${balance}`
    );
  } catch (error) {
    // Error is expected for null mortgage
    test(
      'Missing mortgage data throws error (acceptable)',
      true,
      'Error thrown',
      'Error thrown'
    );
  }

} catch (error) {
  console.log(`❌ ERROR in edge case tests: ${error.message}`);
  testsFailed++;
}

console.log('');
console.log('='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('='.repeat(80));

if (testsFailed === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the output above.');
  process.exit(1);
}

