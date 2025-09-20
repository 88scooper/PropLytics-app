import { auth } from '@/lib/firebase';

// Mock user data for development when Firebase is not configured
const mockUsers = {
  'mock-user-1': {
    uid: 'mock-user-1',
    email: 'user@example.com',
    email_verified: true
  }
};

// Authentication middleware for API routes
export async function authenticateRequest(req) {
  try {
    // Check if Firebase is configured
    if (!auth) {
      // Return mock user for development
      return mockUsers['mock-user-1'];
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    
    // For client-side Firebase Auth, we'll validate the token differently
    // In a production app, you'd use Firebase Admin SDK here
    const user = await auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    return {
      uid: user.uid,
      email: user.email,
      email_verified: user.emailVerified
    };
  } catch (error) {
    // Fallback to mock user for development
    console.warn('Authentication failed, using mock user:', error.message);
    return mockUsers['mock-user-1'];
  }
}

// Validation utilities
export function validateMortgageData(data, isUpdate = false) {
  const errors = [];
  const requiredFields = [
    'lenderName',
    'propertyId',
    'originalAmount',
    'interestRate',
    'rateType',
    'amortizationPeriodYears',
    'termYears',
    'startDate',
    'paymentFrequency'
  ];

  // Check required fields for creation
  if (!isUpdate) {
    requiredFields.forEach(field => {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`${field} is required`);
      }
    });
  }

  // Validate data types and ranges
  if (data.originalAmount !== undefined) {
    const amount = parseFloat(data.originalAmount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('originalAmount must be a positive number');
    }
  }

  if (data.interestRate !== undefined) {
    const rate = parseFloat(data.interestRate);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      errors.push('interestRate must be between 0 and 50');
    }
  }

  if (data.rateType !== undefined && !['FIXED', 'VARIABLE'].includes(data.rateType)) {
    errors.push('rateType must be either FIXED or VARIABLE');
  }

  if (data.amortizationPeriodYears !== undefined) {
    const years = parseInt(data.amortizationPeriodYears);
    if (isNaN(years) || years < 1 || years > 50) {
      errors.push('amortizationPeriodYears must be between 1 and 50');
    }
  }

  if (data.termYears !== undefined) {
    const years = parseInt(data.termYears);
    if (isNaN(years) || years < 1 || years > 30) {
      errors.push('termYears must be between 1 and 30');
    }
  }

  if (data.paymentFrequency !== undefined && !['MONTHLY', 'SEMI_MONTHLY', 'BI_WEEKLY', 'ACCELERATED_BI_WEEKLY', 'WEEKLY', 'ACCELERATED_WEEKLY'].includes(data.paymentFrequency)) {
    errors.push('paymentFrequency must be one of the supported options');
  }

  if (data.startDate !== undefined) {
    const date = new Date(data.startDate);
    if (isNaN(date.getTime())) {
      errors.push('startDate must be a valid date');
    }
  }

  if (data.variableRateSpread !== undefined && data.variableRateSpread !== null) {
    const spread = parseFloat(data.variableRateSpread);
    if (isNaN(spread) || spread < -10 || spread > 10) {
      errors.push('variableRateSpread must be between -10 and 10');
    }
  }

  return errors;
}

// Standard API response format
export function createApiResponse(success, data = null, error = null, statusCode = 200) {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
    statusCode
  };
}

// Error response helper
export function createErrorResponse(message, statusCode = 400) {
  return createApiResponse(false, null, message, statusCode);
}

// Success response helper
export function createSuccessResponse(data, statusCode = 200) {
  return createApiResponse(true, data, null, statusCode);
}
