import { NextResponse } from 'next/server';
import { authenticateRequest, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { 
  calculateLumpSumPrepayment, 
  calculateIncreasedPaymentPrepayment,
  generateAmortizationSchedule 
} from '@/lib/mortgage-calculations';

// POST /api/mortgages/prepayment - Analyze prepayment scenarios
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
    const requiredFields = ['mortgageData', 'prepaymentType'];
    const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400),
        { status: 400 }
      );
    }

    const { mortgageData, prepaymentType } = body;

    // Validate mortgage data
    const requiredMortgageFields = ['originalAmount', 'interestRate', 'rateType', 'amortizationPeriodYears', 'paymentFrequency'];
    const missingMortgageFields = requiredMortgageFields.filter(field => mortgageData[field] === undefined || mortgageData[field] === null);
    
    if (missingMortgageFields.length > 0) {
      return NextResponse.json(
        createErrorResponse(`Missing mortgage data fields: ${missingMortgageFields.join(', ')}`, 400),
        { status: 400 }
      );
    }

    // Prepare mortgage data
    const processedMortgageData = {
      originalAmount: parseFloat(mortgageData.originalAmount),
      interestRate: parseFloat(mortgageData.interestRate),
      rateType: mortgageData.rateType,
      amortizationPeriodYears: parseInt(mortgageData.amortizationPeriodYears),
      paymentFrequency: mortgageData.paymentFrequency,
      startDate: mortgageData.startDate ? new Date(mortgageData.startDate) : new Date(),
      termYears: mortgageData.termYears || mortgageData.amortizationPeriodYears
    };

    let analysis;

    if (prepaymentType === 'lumpSum') {
      // Lump sum prepayment analysis
      const { lumpSumAmount, lumpSumPaymentNumber } = body;
      
      if (lumpSumAmount === undefined || lumpSumAmount === null) {
        return NextResponse.json(
          createErrorResponse('lumpSumAmount is required for lump sum prepayment', 400),
          { status: 400 }
        );
      }
      
      const amount = parseFloat(lumpSumAmount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          createErrorResponse('lumpSumAmount must be a positive number', 400),
          { status: 400 }
        );
      }
      
      const paymentNumber = lumpSumPaymentNumber || 1;
      if (paymentNumber < 1) {
        return NextResponse.json(
          createErrorResponse('lumpSumPaymentNumber must be at least 1', 400),
          { status: 400 }
        );
      }

      analysis = calculateLumpSumPrepayment(processedMortgageData, amount, paymentNumber);
      
    } else if (prepaymentType === 'increasedPayment') {
      // Increased payment prepayment analysis
      const { additionalPayment, startPaymentNumber } = body;
      
      if (additionalPayment === undefined || additionalPayment === null) {
        return NextResponse.json(
          createErrorResponse('additionalPayment is required for increased payment prepayment', 400),
          { status: 400 }
        );
      }
      
      const amount = parseFloat(additionalPayment);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          createErrorResponse('additionalPayment must be a positive number', 400),
          { status: 400 }
        );
      }
      
      const paymentNumber = startPaymentNumber || 1;
      if (paymentNumber < 1) {
        return NextResponse.json(
          createErrorResponse('startPaymentNumber must be at least 1', 400),
          { status: 400 }
        );
      }

      analysis = calculateIncreasedPaymentPrepayment(processedMortgageData, amount, paymentNumber);
      
    } else {
      return NextResponse.json(
        createErrorResponse('prepaymentType must be either "lumpSum" or "increasedPayment"', 400),
        { status: 400 }
      );
    }

    // Generate original schedule for comparison
    const originalSchedule = generateAmortizationSchedule(processedMortgageData);

    const result = {
      prepaymentType,
      originalSchedule,
      analysis,
      mortgageData: processedMortgageData
    };

    return NextResponse.json(
      createSuccessResponse(result),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error analyzing prepayment:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}
