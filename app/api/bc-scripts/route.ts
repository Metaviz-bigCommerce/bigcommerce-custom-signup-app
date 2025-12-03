import { bigcommerceClient, getSession } from "@/lib/auth";
import db from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";

// export async function POST (req: Request) {
//   const body = await req.json();

//   const res = await fetch(
//     `https://api.bigcommerce.com/stores/noyunnhark/v3/content/scripts`,
//     {
//       method: "POST",
//       headers: {
//         "X-Auth-Token": "q0e3e3unxrwsvnwgi4fx27624lqwayg"!, // never expose this in frontend
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     }
//   );

//   const data = await res.json();
//   return NextResponse.json(data, { status: res.status });
// }

export async function POST (req: NextRequest, res: NextResponse) {
  try {
      // First, retrieve the session by calling:
      const session = await getSession(req);

      // Check if session is valid
      if (!session) {
          return NextResponse.json({ message: 'Session not found' }, { status: 401 });
      }

      const body = await req.json();

      const { accessToken, storeHash } = session;

      // Log the session to verify it's correct
      console.log('session:', session);

      // Then, connect the Node API client (to make API calls to BigCommerce)
      const bigcommerce = bigcommerceClient(accessToken, storeHash);
      
      // Ensure src includes a public store id (opaque) for the storefront script
      const baseUrl = process?.env?.BASE_URL || '';
      let src = body?.src || '';
      if (src) {
        try {
          const url = new URL(src, baseUrl || undefined);
          const publicId = await db.getPublicStoreId(storeHash);
          url.searchParams.set('pub', publicId);
          src = url.toString();
        } catch {
          // Fallback simple concat
          const publicId = await db.getPublicStoreId(storeHash);
          src = `${src}${src.includes('?') ? '&' : '?'}pub=${encodeURIComponent(publicId)}`;
        }
        body.src = src;
      }

      // Create script
      const { data } = await bigcommerce.post('/content/scripts', body);

      // Persist script uuid against store for later updates
      if (data?.uuid) {
        // storeHash already normalized by getSession
        const { storeHash } = session;
        // dynamic import through db facade
        const dbModule = await import('@/lib/db');
        await dbModule.default.setStoreScriptUuid(storeHash, data.uuid);
      }

      // Log the data to verify it's correct
      // console.log('data:', data);

      return NextResponse.json({data: data}, {status: 200});
  } catch (error: any) {
       // Finally, handle errors
      const { message, response } = error;
      return NextResponse.json(
          { message: message || 'Something went wrong' }, 
          { status: response?.status || 500 }
      );
  }
}

export async function PUT (req: NextRequest, res: NextResponse) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 401 });
    }
    const { accessToken, storeHash } = session;
    const bigcommerce = bigcommerceClient(accessToken, storeHash);
    const uuid = req.nextUrl.searchParams.get("script_uuid");
    if (!uuid) {
      return NextResponse.json({ message: 'Missing script_uuid' }, { status: 400 });
    }
    const body = await req.json();
    // Ensure src keeps public id query param
    if (body?.src) {
      try {
        const url = new URL(body.src, process?.env?.BASE_URL || undefined);
        const publicId = await db.getPublicStoreId(storeHash);
        url.searchParams.set('pub', publicId);
        body.src = url.toString();
      } catch {
        const publicId = await db.getPublicStoreId(storeHash);
        body.src = `${body.src}${body.src.includes('?') ? '&' : '?'}pub=${encodeURIComponent(publicId)}`;
      }
    }
    const { data } = await bigcommerce.put(`/content/scripts/${uuid}`, body);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    const { message, response } = error;
    return NextResponse.json(
      { message: message || 'Something went wrong' }, 
      { status: response?.status || 500 }
    );
  }
}

export async function DELETE (req: NextRequest, res: NextResponse) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 401 });
    }
    const { accessToken, storeHash } = session;
    const bigcommerce = bigcommerceClient(accessToken, storeHash);
    const uuid = req.nextUrl.searchParams.get("script_uuid");
    if (!uuid) {
      return NextResponse.json({ message: 'Missing script_uuid' }, { status: 400 });
    }
    const resp = await bigcommerce.delete(`/content/scripts/${uuid}`);
    // Clear uuid from store doc
    const dbModule = await import('@/lib/db');
    await dbModule.default.setStoreScriptUuid(storeHash, ''); // clears field now
    return NextResponse.json({ ok: true }, { status: resp?.status || 200 });
  } catch (error: any) {
    const { message, response } = error;
    return NextResponse.json(
      { message: message || 'Something went wrong' }, 
      { status: response?.status || 500 }
    );
  }
}
