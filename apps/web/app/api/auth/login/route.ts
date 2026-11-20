import { NextResponse } from 'next/server';
import {
  authenticateUser,
  createSession,
  sessionCookieName,
} from '../../../lib/auth-store';

export const runtime = 'nodejs';

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'İstek verisi okunamadı.' }, { status: 400 });
  }

  if (
    typeof body.email !== 'string' ||
    typeof body.password !== 'string' ||
    body.email.length > 254 ||
    body.password.length > 128
  ) {
    return NextResponse.json(
      { error: 'E-posta adresi ve parola gerekli.' },
      { status: 400 },
    );
  }

  try {
    const userId = await authenticateUser(body.email, body.password);
    if (!userId) {
      return NextResponse.json(
        { error: 'E-posta adresi veya parola hatalı.' },
        { status: 401 },
      );
    }
    const session = createSession(userId);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    console.error('Giriş işlemi başarısız oldu:', error);
    return NextResponse.json(
      { error: 'Giriş yapılamadı. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 },
    );
  }
}
