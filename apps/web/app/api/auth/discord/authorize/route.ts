import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  discordOAuthStateCookieName,
  getDiscordOAuthConfig,
  getSessionUser,
  saveDiscordOAuthState,
  sessionCookieName,
} from '../../../../lib/auth-store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = getSessionUser(request.cookies.get(sessionCookieName)?.value);
  if (!user) {
    return NextResponse.redirect(new URL('/login?next=%2Fprofile', request.url));
  }

  const config = getDiscordOAuthConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL('/profile?discord=not_configured', request.url),
    );
  }

  let redirectUri: URL;
  try {
    redirectUri = new URL(config.redirectUri);
    if (
      process.env.NODE_ENV === 'production' &&
      redirectUri.protocol !== 'https:'
    ) {
      throw new Error('Production Discord redirect URI must use HTTPS.');
    }
  } catch (error) {
    console.error('Discord OAuth redirect URI is invalid:', error);
    return NextResponse.redirect(
      new URL('/profile?discord=not_configured', request.url),
    );
  }

  const state = randomBytes(32).toString('hex');
  saveDiscordOAuthState(user.id, state);
  const authorizeUrl = new URL('https://discord.com/oauth2/authorize');
  authorizeUrl.searchParams.set('client_id', config.clientId);
  authorizeUrl.searchParams.set('redirect_uri', config.redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'identify guilds.members.read');
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('prompt', 'consent');

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(discordOAuthStateCookieName, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/discord',
    maxAge: 600,
  });
  return response;
}
