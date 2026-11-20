import { NextResponse } from 'next/server';
import {
  createSession,
  registerUser,
  sessionCookieName,
  isSupportedLanguage,
  validateRegistration,
} from '../../../lib/auth-store';

export const runtime = 'nodejs';

type RegistrationBody = {
  username?: unknown;
  email?: unknown;
  password?: unknown;
  language?: unknown;
};

export async function POST(request: Request) {
  let body: RegistrationBody;
  try {
    body = (await request.json()) as RegistrationBody;
  } catch {
    return NextResponse.json({ error: 'İstek verisi okunamadı.' }, { status: 400 });
  }

  if (
    typeof body.username !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string'
  ) {
    return NextResponse.json({ error: 'Tüm alanları doldurun.' }, { status: 400 });
  }

  const language = body.language === undefined ? 'tr' : body.language;
  if (!isSupportedLanguage(language)) {
    return NextResponse.json({ error: 'Desteklenmeyen site dili.' }, { status: 400 });
  }

  const input = {
    username: body.username.trim(),
    email: body.email.trim(),
    password: body.password,
    language,
  };
  const validationError = validateRegistration(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const userId = await registerUser(input);
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
    if (error instanceof Error && error.message.startsWith('Bu ')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Kayıt işlemi başarısız oldu:', error);
    return NextResponse.json(
      { error: 'Hesap oluşturulamadı. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 },
    );
  }
}
