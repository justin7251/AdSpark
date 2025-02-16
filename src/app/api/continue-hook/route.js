import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { previousHook, context } = await request.json();

    console.log('Continue Hook Input:', {
      previousHook,
      context
    });

    // Validate input
    if (!previousHook || !context) {
      return NextResponse.json(
        { 
          error: 'Hook Continuation Failed', 
          details: 'Missing required parameters' 
        }, 
        { status: 400 }
      );
    }

    // Generate continuation based on user input
    const continuedHook = `${previousHook} ${context.userPrompt ? `Enhanced with: ${context.userPrompt}` : ''}`;

    console.log('Generated Continued Hook:', continuedHook);

    return NextResponse.json({ 
      continuedHook: continuedHook,
      metadata: context
    });

  } catch (error) {
    console.error('Unexpected error in hook continuation:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Hook Continuation Failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}