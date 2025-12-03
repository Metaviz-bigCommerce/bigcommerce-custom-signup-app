import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const publicId = (req.nextUrl.searchParams.get('pub') || body?.pub || '').trim();
    if (!publicId) {
      return cors(NextResponse.json({ ok: false, error: 'Missing store identifier' }, { status: 400 }));
    }
    const storeHash = await db.resolveStoreHashByPublicId(publicId);
    if (!storeHash) return cors(NextResponse.json({ ok: false, error: 'Unknown store' }, { status: 404 }));
    const ip = req.headers.get('x-forwarded-for') || req.ip || null;
    const origin = req.headers.get('origin') || null;
    const userAgent = req.headers.get('user-agent') || null;
    const payload = {
      data: body?.data || {},
      ip,
      origin,
      userAgent,
    };
    const created = await db.createSignupRequest(storeHash, payload);
    return cors(NextResponse.json({ ok: true, id: created.id }, { status: 200 }));
  } catch (e: any) {
    return cors(NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 }));
  }
}


