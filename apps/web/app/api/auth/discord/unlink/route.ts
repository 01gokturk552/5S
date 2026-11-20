import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionUser,
  sessionCookieName,
  unlinkDiscordAccount,
} from '../../../../lib/auth-store';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'İstek doğrulanamadı.' }, { status: 403 });
  }

  const user = getSessionUser(request.cookies.get(sessionCookieName)?.value);
  if (!user) {
    return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
  }

  try {
    unlinkDiscordAccount(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Discord account unlink failed:', error);
    return NextResponse.json(
      { error: 'Discord bağlantısı kaldırılamadı.' },
      { status: 500 },
    );
  }
}
