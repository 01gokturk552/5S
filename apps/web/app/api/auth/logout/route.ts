import { NextRequest, NextResponse } from 'next/server';
import {
  deleteSession,
  sessionCookieName,
} from '../../../lib/auth-store';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  deleteSession(request.cookies.get(sessionCookieName)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
