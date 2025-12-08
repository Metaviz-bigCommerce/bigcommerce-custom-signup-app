import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 401 });
    }
    const { accessToken, storeHash } = session;

    const url = `https://api.bigcommerce.com/stores/${storeHash}/v2/customer_groups`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': String(accessToken),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Next.js fetch defaults are fine; no-cache to always reflect latest groups
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data?.message || 'Failed to fetch customer groups' }, { status: res.status });
    }

    // Normalize to a predictable shape on the frontend
    const groups = Array.isArray(data) ? data : [];
    return NextResponse.json({ groups }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unknown error' }, { status: 500 });
  }
}


