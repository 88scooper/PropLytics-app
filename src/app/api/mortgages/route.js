import { NextResponse } from 'next/server';
import { authenticateRequest, validateMortgageData, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { addMortgage, getMortgagesByProperty, getMortgages } from '@/lib/firestore';
import { validatePropertyExists } from '@/lib/property-validation';
import { mockMortgages, addMockMortgage } from '@/lib/mock-data';
import { db } from '@/lib/firebase';

// POST /api/mortgages - Create a new mortgage
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
    
    // Validate the mortgage data
    const validationErrors = validateMortgageData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        createErrorResponse(`Validation failed: ${validationErrors.join(', ')}`, 400),
        { status: 400 }
      );
    }

    // Validate property exists if propertyId is provided
    if (body.propertyId) {
      const propertyValidation = validatePropertyExists(body.propertyId, user.uid);
      if (!propertyValidation.valid) {
        return NextResponse.json(
          createErrorResponse(propertyValidation.error, 400),
          { status: 400 }
        );
      }
    }

    // Convert amortization to months
    let amortizationInMonths;
    if (body.amortizationValue && body.amortizationUnit) {
      amortizationInMonths = body.amortizationUnit === 'years' 
        ? body.amortizationValue * 12 
        : body.amortizationValue;
    } else {
      // Fallback for old format
      amortizationInMonths = parseInt(body.amortizationPeriodYears) * 12;
    }

    // Convert term to months
    let termInMonths;
    if (body.termValue && body.termUnit) {
      termInMonths = body.termUnit === 'years' 
        ? body.termValue * 12 
        : body.termValue;
    } else {
      // Fallback for old format
      termInMonths = parseInt(body.termYears) * 12;
    }

    // Prepare mortgage data
    const mortgageData = {
      userId: user.uid,
      lenderName: body.lenderName.trim(),
      propertyId: body.propertyId?.trim() || null,
      originalAmount: parseFloat(body.originalAmount),
      interestRate: parseFloat(body.interestRate),
      rateType: body.rateType,
      variableRateSpread: body.variableRateSpread ? parseFloat(body.variableRateSpread) : null,
      amortizationPeriodMonths: amortizationInMonths,
      termMonths: termInMonths,
      startDate: new Date(body.startDate),
      paymentFrequency: body.paymentFrequency,
      mortgageType: body.mortgageType || 'CLOSED',
      hasFixedPayments: body.hasFixedPayments !== undefined ? body.hasFixedPayments : null
    };

    let mortgageId;

    if (!db) {
      // Mock implementation for development
      const newMortgage = {
        id: `mock-mortgage-${Date.now()}`,
        ...mortgageData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addMockMortgage(newMortgage);
      mortgageId = newMortgage.id;
    } else {
      // Real Firebase implementation
      mortgageId = await addMortgage(user.uid, mortgageData);
    }

    // Return the created mortgage
    const createdMortgage = !db 
      ? mockMortgages.find(m => m.id === mortgageId)
      : { id: mortgageId, ...mortgageData };

    return NextResponse.json(
      createSuccessResponse(createdMortgage, 201),
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating mortgage:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}

// GET /api/mortgages - Get mortgages
export async function GET(request) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Authentication required', 401),
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    // Validate property exists if propertyId is provided
    if (propertyId) {
      const propertyValidation = validatePropertyExists(propertyId, user.uid);
      if (!propertyValidation.valid) {
        return NextResponse.json(
          createErrorResponse(propertyValidation.error, 400),
          { status: 400 }
        );
      }
    }

    let mortgages;

    if (!db) {
      // Mock implementation for development
      mortgages = mockMortgages.filter(mortgage => {
        const matchesUser = mortgage.userId === user.uid;
        const matchesProperty = !propertyId || mortgage.propertyId === propertyId;
        return matchesUser && matchesProperty;
      });
    } else {
      // Real Firebase implementation
      if (propertyId) {
        mortgages = await getMortgagesByProperty(user.uid, propertyId);
      } else {
        // Get all mortgages for the user
        mortgages = await new Promise((resolve, reject) => {
          const unsubscribe = getMortgages(user.uid, (mortgageList) => {
            unsubscribe();
            resolve(mortgageList);
          });
        });
      }
    }

    return NextResponse.json(
      createSuccessResponse(mortgages),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching mortgages:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}
