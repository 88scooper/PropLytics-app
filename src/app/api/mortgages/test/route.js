import { NextResponse } from 'next/server';

// GET /api/mortgages/test - Test endpoint to demonstrate API usage
export async function GET() {
  const testExamples = {
    endpoints: {
      'POST /api/mortgages': {
        description: 'Create a new mortgage',
        example: {
          method: 'POST',
          url: '/api/mortgages',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <token>'
          },
          body: {
            lenderName: 'TD Bank',
            propertyId: 'richmond-st-e-403',
            originalAmount: 500000,
            interestRate: 5.25,
            rateType: 'FIXED',
            variableRateSpread: null,
            amortizationPeriodYears: 25,
            termYears: 5,
            startDate: '2024-01-01',
            paymentFrequency: 'MONTHLY'
          }
        }
      },
      'GET /api/mortgages': {
        description: 'Get all mortgages for the authenticated user',
        example: {
          method: 'GET',
          url: '/api/mortgages',
          headers: {
            'Authorization': 'Bearer <token>'
          }
        }
      },
      'GET /api/mortgages?propertyId=richmond-st-e-403': {
        description: 'Get mortgages for a specific property',
        example: {
          method: 'GET',
          url: '/api/mortgages?propertyId=richmond-st-e-403',
          headers: {
            'Authorization': 'Bearer <token>'
          }
        }
      },
      'PUT /api/mortgages/{id}': {
        description: 'Update a specific mortgage',
        example: {
          method: 'PUT',
          url: '/api/mortgages/mortgage-id-123',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <token>'
          },
          body: {
            interestRate: 4.75,
            termYears: 3
          }
        }
      },
      'DELETE /api/mortgages/{id}': {
        description: 'Delete a specific mortgage',
        example: {
          method: 'DELETE',
          url: '/api/mortgages/mortgage-id-123',
          headers: {
            'Authorization': 'Bearer <token>'
          }
        }
      }
    },
    responseFormat: {
      success: {
        success: true,
        data: '...',
        timestamp: '2024-01-01T00:00:00.000Z',
        statusCode: 200
      },
      error: {
        success: false,
        data: null,
        error: 'Error message',
        timestamp: '2024-01-01T00:00:00.000Z',
        statusCode: 400
      }
    },
    validation: {
      requiredFields: [
        'lenderName',
        'originalAmount',
        'interestRate',
        'rateType',
        'amortizationPeriodYears',
        'termYears',
        'startDate',
        'paymentFrequency'
      ],
      fieldValidation: {
        originalAmount: 'Must be a positive number',
        interestRate: 'Must be between 0 and 50',
        rateType: 'Must be either FIXED or VARIABLE',
        amortizationPeriodYears: 'Must be between 1 and 50',
        termYears: 'Must be between 1 and 30',
        paymentFrequency: 'Must be MONTHLY, BIWEEKLY, or WEEKLY',
        startDate: 'Must be a valid date',
        variableRateSpread: 'Must be between -10 and 10 (only for VARIABLE rate type)'
      }
    },
    statusCodes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request (validation error)',
      401: 'Unauthorized (authentication required)',
      404: 'Not Found',
      500: 'Internal Server Error'
    }
  };

  return NextResponse.json(testExamples, { status: 200 });
}
