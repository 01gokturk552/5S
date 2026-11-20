import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, sessionCookieName } from '../../../lib/auth-store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = getSessionUser(request.cookies.get(sessionCookieName)?.value);
  return NextResponse.json({ user });
}
