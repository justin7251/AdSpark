import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Simple rate limiting without external service
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const currentTime = Date.now();

  // Check if the route is an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ipRequestData = requestCounts.get(ip) || { count: 0, resetTime: currentTime + 60000 }; // 1 minute reset

    // Reset count if time has passed
    if (currentTime > ipRequestData.resetTime) {
      ipRequestData.count = 0;
      ipRequestData.resetTime = currentTime + 60000;
    }

    // Limit to 10 requests per minute
    if (ipRequestData.count >= 10) {
      return NextResponse.json(
        { 
          error: 'Too Many Requests', 
          details: 'Limit of 10 requests per minute' 
        }, 
        { status: 429 }
      );
    }

    // Increment request count
    ipRequestData.count++;
    requestCounts.set(ip, ipRequestData);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
}; 