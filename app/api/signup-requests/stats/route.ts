import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { errorResponse, successResponse, apiErrors } from '@/lib/api-response';
import { generateRequestId } from '@/lib/utils';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const logContext = { requestId };
  
  try {
    const session = await getSession(req);
    if (!session) {
      return apiErrors.unauthorized(requestId);
    }
    
    const { storeHash } = session;
    
    // Get all requests to calculate stats (with reasonable limit)
    const allRequests = await db.listSignupRequests(storeHash, { pageSize: 1000 });
    
    const stats = {
      total: allRequests.items.length,
      pending: allRequests.items.filter((r: { status: string }) => r.status === 'pending').length,
      approved: allRequests.items.filter((r: { status: string }) => r.status === 'approved').length,
      rejected: allRequests.items.filter((r: { status: string }) => r.status === 'rejected').length,
    };
    
    return successResponse(stats, 200, requestId);
  } catch (error: unknown) {
    logger.error('Failed to get signup request stats', error, logContext);
    return apiErrors.internalError('Failed to retrieve stats', error, requestId);
  }
}

