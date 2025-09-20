import { NextResponse } from 'next/server';
import { authenticateRequest, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { 
  calculateMortgagePayment, 
  generateAmortizationSchedule, 
  calculateMortgageSummary 
} from '@/lib/mortgage-calculations';

// POST /api/mortgages/calculate - Calculate mortgage payment and schedule
export async function POST(request) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Authentication required', 401),
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['originalAmount', 'interestRate', 'rateType', 'amortizationPeriodYears', 'paymentFrequency'];
    const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400),
        { status: 400 }
      );
    }

    // Validate data types and ranges
    const originalAmount = parseFloat(body.originalAmount);
    const interestRate = parseFloat(body.interestRate);
    const amortizationPeriodYears = parseInt(body.amortizationPeriodYears);
    
    if (isNaN(originalAmount) || originalAmount <= 0) {
      return NextResponse.json(
        createErrorResponse('originalAmount must be a positive number', 400),
        { status: 400 }
      );
    }
    
    if (isNaN(interestRate) || interestRate < 0 || interestRate > 0.5) {
      return NextResponse.json(
        createErrorResponse('interestRate must be between 0 and 50%', 400),
        { status: 400 }
      );
    }
    
    if (isNaN(amortizationPeriodYears) || amortizationPeriodYears < 1 || amortizationPeriodYears > 50) {
      return NextResponse.json(
        createErrorResponse('amortizationPeriodYears must be between 1 and 50', 400),
        { status: 400 }
      );
    }
    
    if (!['FIXED', 'VARIABLE'].includes(body.rateType)) {
      return NextResponse.json(
        createErrorResponse('rateType must be either FIXED or VARIABLE', 400),
        { status: 400 }
      );
    }
    
    if (!['MONTHLY', 'SEMI_MONTHLY', 'BI_WEEKLY', 'ACCELERATED_BI_WEEKLY', 'WEEKLY', 'ACCELERATED_WEEKLY'].includes(body.paymentFrequency)) {
      return NextResponse.json(
        createErrorResponse('paymentFrequency must be one of the supported options', 400),
        { status: 400 }
      );
    }

    // Prepare mortgage data
    const mortgageData = {
      originalAmount,
      interestRate,
      rateType: body.rateType,
      amortizationPeriodYears,
      paymentFrequency: body.paymentFrequency,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      termYears: body.termYears || amortizationPeriodYears
    };

    // Calculate payment
    const payment = calculateMortgagePayment(
      originalAmount,
      interestRate,
      body.rateType,
      amortizationPeriodYears,
      body.paymentFrequency
    );

    // Generate amortization schedule if requested
    let schedule = null;
    if (body.includeSchedule === true) {
      schedule = generateAmortizationSchedule(mortgageData);
    }

    // Calculate summary statistics
    const summary = calculateMortgageSummary(mortgageData);

    const result = {
      payment,
      summary,
      schedule,
      mortgageData
    };

    return NextResponse.json(
      createSuccessResponse(result),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error calculating mortgage:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}
