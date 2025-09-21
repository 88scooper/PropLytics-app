import { NextResponse } from 'next/server';
import { authenticateRequest, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { seedMortgageData } from '@/lib/seed-data';
import { addMortgage } from '@/lib/firestore';
import { db } from '@/lib/firebase';

// POST /api/seed - Seed production database with mortgage data
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

    // Check if this is a production environment
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        createErrorResponse('Seeding is only available in production', 403),
        { status: 403 }
      );
    }

    const results = {
      total: seedMortgageData.length,
      successful: [],
      failed: [],
      summary: {
        imported: 0,
        errors: 0
      }
    };

    // Process each mortgage
    for (let i = 0; i < seedMortgageData.length; i++) {
      const mortgageData = seedMortgageData[i];
      
      try {
        let mortgageId;
        
        if (db) {
          // Real Firebase implementation
          mortgageId = await addMortgage(user.uid, mortgageData);
        } else {
          // Fallback for development
          mortgageId = `seed-mortgage-${Date.now()}-${i}`;
        }
        
        results.successful.push({
          index: i + 1,
          mortgageId,
          lenderName: mortgageData.lenderName,
          originalAmount: mortgageData.originalAmount
        });
        
        results.summary.imported++;
        
      } catch (error) {
        console.error(`Error seeding mortgage ${i + 1}:`, error);
        
        results.failed.push({
          index: i + 1,
          error: error.message,
          data: mortgageData
        });
        
        results.summary.errors++;
      }
    }

    return NextResponse.json(
      createSuccessResponse(results, 'Production data seeding completed'),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in seed endpoint:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}

// GET /api/seed - Get seed data information
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

    return NextResponse.json(
      createSuccessResponse({
        available: seedMortgageData.length,
        environment: process.env.NODE_ENV,
        data: seedMortgageData.map(m => ({
          lenderName: m.lenderName,
          originalAmount: m.originalAmount,
          rateType: m.rateType,
          amortizationPeriodMonths: m.amortizationPeriodMonths,
          termMonths: m.termMonths
        }))
      }, 'Seed data information'),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error getting seed info:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}
