import { NextResponse } from 'next/server';
import { authenticateRequest, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { calculateRefinanceAnalysis } from '@/lib/mortgage-calculations';

// POST /api/mortgages/refinance - Analyze refinancing scenarios
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
    const requiredFields = ['currentMortgage', 'newMortgage', 'remainingBalance'];
    const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400),
        { status: 400 }
      );
    }

    const { currentMortgage, newMortgage, remainingBalance } = body;

    // Validate remaining balance
    const balance = parseFloat(remainingBalance);
    if (isNaN(balance) || balance <= 0) {
      return NextResponse.json(
        createErrorResponse('remainingBalance must be a positive number', 400),
        { status: 400 }
      );
    }

    // Validate current mortgage data
    const currentRequiredFields = ['interestRate', 'rateType', 'amortizationPeriodYears', 'paymentFrequency'];
    const currentMissingFields = currentRequiredFields.filter(field => currentMortgage[field] === undefined || currentMortgage[field] === null);
    
    if (currentMissingFields.length > 0) {
      return NextResponse.json(
        createErrorResponse(`Missing current mortgage fields: ${currentMissingFields.join(', ')}`, 400),
        { status: 400 }
      );
    }

    // Validate new mortgage data
    const newRequiredFields = ['originalAmount', 'interestRate', 'rateType', 'amortizationPeriodYears', 'paymentFrequency'];
    const newMissingFields = newRequiredFields.filter(field => newMortgage[field] === undefined || newMortgage[field] === null);
    
    if (newMissingFields.length > 0) {
      return NextResponse.json(
        createErrorResponse(`Missing new mortgage fields: ${newMissingFields.join(', ')}`, 400),
        { status: 400 }
      );
    }

    // Process current mortgage data
    const processedCurrentMortgage = {
      originalAmount: balance,
      interestRate: parseFloat(currentMortgage.interestRate),
      rateType: currentMortgage.rateType,
      amortizationPeriodYears: parseInt(currentMortgage.amortizationPeriodYears),
      paymentFrequency: currentMortgage.paymentFrequency,
      startDate: currentMortgage.startDate ? new Date(currentMortgage.startDate) : new Date(),
      termYears: currentMortgage.termYears || currentMortgage.amortizationPeriodYears
    };

    // Process new mortgage data
    const processedNewMortgage = {
      originalAmount: parseFloat(newMortgage.originalAmount),
      interestRate: parseFloat(newMortgage.interestRate),
      rateType: newMortgage.rateType,
      amortizationPeriodYears: parseInt(newMortgage.amortizationPeriodYears),
      paymentFrequency: newMortgage.paymentFrequency,
      startDate: newMortgage.startDate ? new Date(newMortgage.startDate) : new Date(),
      termYears: newMortgage.termYears || newMortgage.amortizationPeriodYears
    };

    // Validate data ranges
    if (processedCurrentMortgage.interestRate < 0 || processedCurrentMortgage.interestRate > 0.5) {
      return NextResponse.json(
        createErrorResponse('Current mortgage interestRate must be between 0 and 50%', 400),
        { status: 400 }
      );
    }

    if (processedNewMortgage.interestRate < 0 || processedNewMortgage.interestRate > 0.5) {
      return NextResponse.json(
        createErrorResponse('New mortgage interestRate must be between 0 and 50%', 400),
        { status: 400 }
      );
    }

    if (!['FIXED', 'VARIABLE'].includes(processedCurrentMortgage.rateType)) {
      return NextResponse.json(
        createErrorResponse('Current mortgage rateType must be either FIXED or VARIABLE', 400),
        { status: 400 }
      );
    }

    if (!['FIXED', 'VARIABLE'].includes(processedNewMortgage.rateType)) {
      return NextResponse.json(
        createErrorResponse('New mortgage rateType must be either FIXED or VARIABLE', 400),
        { status: 400 }
      );
    }

    if (!['MONTHLY', 'BIWEEKLY', 'WEEKLY'].includes(processedCurrentMortgage.paymentFrequency)) {
      return NextResponse.json(
        createErrorResponse('Current mortgage paymentFrequency must be MONTHLY, BIWEEKLY, or WEEKLY', 400),
        { status: 400 }
      );
    }

    if (!['MONTHLY', 'BIWEEKLY', 'WEEKLY'].includes(processedNewMortgage.paymentFrequency)) {
      return NextResponse.json(
        createErrorResponse('New mortgage paymentFrequency must be MONTHLY, BIWEEKLY, or WEEKLY', 400),
        { status: 400 }
      );
    }

    // Calculate refinance analysis
    const analysis = calculateRefinanceAnalysis(processedCurrentMortgage, processedNewMortgage, balance);

    const result = {
      currentMortgage: processedCurrentMortgage,
      newMortgage: processedNewMortgage,
      remainingBalance: balance,
      analysis
    };

    return NextResponse.json(
      createSuccessResponse(result),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error analyzing refinance:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}
