import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ message: 'Session not found' }, { status: 401 });
    const { storeHash } = session;
    const pageSize = Number(req.nextUrl.searchParams.get('pageSize') || '10');
    const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
    const statusParam = (req.nextUrl.searchParams.get('status') || '') as 'pending' | 'approved' | 'rejected' | '';
    const status = statusParam || undefined;
    const result = await db.listSignupRequests(storeHash, { pageSize, cursor, status: status as any });
    return NextResponse.json({ items: result.items, nextCursor: result.nextCursor }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ message: 'Session not found' }, { status: 401 });
    const { storeHash } = session;
    const id = req.nextUrl.searchParams.get('id') || '';
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });
    const body = await req.json();
    const status = body?.status as 'pending' | 'approved' | 'rejected';
    if (!status) return NextResponse.json({ message: 'Missing status' }, { status: 400 });
    await db.updateSignupRequestStatus(storeHash, id, status);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unknown error' }, { status: 500 });
  }
}


