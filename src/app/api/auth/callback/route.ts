import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAccessToken } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  if (error) {
    return NextResponse.redirect(new URL('/?error=access_denied', request.url));
  }
  // Note: You'll also need to generate and store the state parameter when initiating the OAuth flow.
    // Validate state parameter for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL('/?error=invalid_state', request.url));
    }
    
    // Clear the state cookie after validation
    cookieStore.delete('oauth_state');
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const tokens = await getAccessToken(code);
    if (!tokens?.access_token){
      throw new Error('Invalid token response: missing access_token')
    }
    // Store tokens in cookies (in production, use a more secure method)
    const cookieStore = await cookies();
    cookieStore.set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    if (tokens.refresh_token) {cookieStore.set('spotify_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });}

    return NextResponse.redirect(new URL('/loading', request.url));
  } catch (err) {
    console.error('Auth callback error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
