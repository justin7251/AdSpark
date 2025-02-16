import { NextResponse } from 'next/server';
import axios from 'axios';

// Centralized error handling utility
const handleApiError = (error) => {
  console.error('API Generation Error:', {
    message: error.message,
    stack: error.stack,
    responseData: error.response?.data,
    status: error.response?.status
  });

  // Detailed error response
  return NextResponse.json(
    { 
      error: 'Hook Generation Failed', 
      details: error.message 
    }, 
    { status: error.response?.status || 500 }
  );
};

// Input validation function
const validateInput = (body) => {
  // Basic input validation
  if (!body) {
    throw new Error('No request body provided');
  }

  // Validate required fields
  if (!body.contents || !Array.isArray(body.contents)) {
    throw new Error('Invalid contents format');
  }

  // Validate text content
  const text = body.contents[0]?.parts[0]?.text;
  if (!text || text.length < 10 || text.length > 500) {
    throw new Error('Invalid text length. Must be between 10-500 characters.');
  }

  return body;
};

// Sanitize input to prevent potential security issues
const sanitizeInput = (body) => {
  return {
    ...body,
    contents: body.contents.map(content => ({
      ...content,
      parts: content.parts.map(part => ({
        ...part,
        text: part.text
          .replace(/[<>]/g, '') // Remove potential XSS characters
          .trim()
      }))
    }))
  };
};

export async function POST(request) {
  try {
    const { product, audience, tone, platform } = await request.json();

    console.log('Hook Generation Input:', {
      product, 
      audience, 
      tone, 
      platform
    });

    // Validate input
    if (!product || !audience || !tone || !platform) {
      return NextResponse.json(
        { 
          error: 'Hook Generation Failed', 
          details: 'Missing required parameters' 
        }, 
        { status: 400 }
      );
    }

    // Hardcoded mock response for debugging
    const mockHooks = [
      `Unlock your ${product} potential with ${audience}-focused strategies!`,
      `Transform your ${platform} game: ${product} insights that matter`,
      `${tone} approach to ${product}: Breakthrough strategies for ${audience}`,
      `Elevate your ${platform} presence with smart ${product} tactics`
    ];

    console.log('Generated Mock Hooks:', mockHooks);

    return NextResponse.json({ 
      hooks: mockHooks,
      metadata: { product, audience, tone, platform }
    });

  } catch (error) {
    console.error('Unexpected error in hook generation:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Hook Generation Failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Optimize runtime
export const runtime = 'nodejs';

// Disable dynamic rendering for better performance
export const dynamic = 'force-static';