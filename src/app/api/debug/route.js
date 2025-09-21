import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

// GET /api/debug - Debug production environment
export async function GET(request) {
  try {
    const debugInfo = {
      environment: process.env.NODE_ENV,
      firebaseConfigured: !!db,
      timestamp: new Date().toISOString(),
      firebaseConfig: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'configured' : 'missing',
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'configured' : 'missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'configured' : 'missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'configured' : 'missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'configured' : 'missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'configured' : 'missing'
      },
      uploadEndpoint: '/api/mortgages/upload',
      mortgagesEndpoint: '/api/mortgages'
    };

    return NextResponse.json({
      success: true,
      data: debugInfo,
      message: 'Debug information retrieved'
    }, { status: 200 });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Debug failed'
    }, { status: 500 });
  }
}
