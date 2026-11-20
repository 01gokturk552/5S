import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  discordOAuthStateCookieName,
  consumeDiscordOAuthState,
  getDiscordOAuthConfig,
  getSessionUser,
  linkDiscordAccount,
  sessionCookieName,
} from '../../../../lib/auth-store';

export const runtime = 'nodejs';

type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
};

type DiscordUser = {
  id?: string;
  username?: string;
  global_name?: string | null;
};

function redirectToProfile(request: NextRequest, status: string) {
  const response = NextResponse.redirect(
    new URL(`/profile?discord=${encodeURIComponent(status)}`, request.url),
  );
  response.cookies.set(discordOAuthStateCookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/discord',
    maxAge: 0,
  });
  return response;
}

function stateMatches(cookieState: string | undefined, callbackState: string | null) {
  if (!cookieState || !callbackState) return false;
  const cookie = Buffer.from(cookieState);
  const callback = Buffer.from(callbackState);
  return cookie.length === callback.length && timingSafeEqual(cookie, callback);
}

export async function GET(request: NextRequest) {
  const cookieState = request.cookies.get(discordOAuthStateCookieName)?.value;
  const callbackState = request.nextUrl.searchParams.get('state');
  if (!stateMatches(cookieState, callbackState)) {
    return redirectToProfile(request, 'invalid_state');
  }

  const user = getSessionUser(request.cookies.get(sessionCookieName)?.value);
  if (!user) {
    const response = NextResponse.redirect(new URL('/login?next=%2Fprofile', request.url));
    response.cookies.set(discordOAuthStateCookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/discord',
      maxAge: 0,
    });
    return response;
  }

  if (!callbackState || !consumeDiscordOAuthState(user.id, callbackState)) {
    return redirectToProfile(request, 'invalid_state');
  }

  if (request.nextUrl.searchParams.has('error')) {
    return redirectToProfile(request, 'denied');
  }

  const code = request.nextUrl.searchParams.get('code');
  const config = getDiscordOAuthConfig();
  if (!code || !config) {
    return redirectToProfile(
      request,
      config ? 'failed' : 'not_configured',
    );
  }

  try {
    const tokenResponse = await fetch(
      'https://discord.com/api/v10/oauth2/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.redirectUri,
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!tokenResponse.ok) {
      console.error('Discord token exchange failed:', tokenResponse.status);
      return redirectToProfile(request, 'failed');
    }
    const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;
    if (!tokenData.access_token) {
      console.error('Discord token exchange returned no access token.');
      return redirectToProfile(request, 'failed');
    }

    const profileResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!profileResponse.ok) {
      console.error('Discord profile request failed:', profileResponse.status);
      return redirectToProfile(request, 'failed');
    }
    const discordUser = (await profileResponse.json()) as DiscordUser;
    if (!discordUser.id || !discordUser.username) {
      console.error('Discord profile response was missing required fields.');
      return redirectToProfile(request, 'failed');
    }

    try {
      linkDiscordAccount(
        user.id,
        discordUser.id,
        discordUser.global_name || discordUser.username,
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'DISCORD_ACCOUNT_ALREADY_LINKED') {
        return redirectToProfile(request, 'already_linked');
      }
      throw error;
    }

    return redirectToProfile(request, 'connected');
  } catch (error) {
    console.error('Discord OAuth callback failed:', error);
    return redirectToProfile(request, 'failed');
  }
}
