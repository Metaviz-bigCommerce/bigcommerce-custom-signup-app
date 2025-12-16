/**
 * CORS middleware with environment-based origin whitelist
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllowedOrigins } from '../env';

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins();
  
  // If no origins configured, deny all (security by default)
  if (allowedOrigins.length === 0) {
    return false;
  }
  
  // TEMP: allow all origins if wildcard is present
  if (allowedOrigins.includes('*')) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  req: NextRequest,
  res: NextResponse
): NextResponse {
  const origin = req.headers.get('origin');
  
  if (origin && isOriginAllowed(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    // No origin or not allowed - don't set CORS headers
    // This effectively blocks cross-origin requests
    return res;
  }
  
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');
  res.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return res;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflight(req: NextRequest): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(req, res);
}

