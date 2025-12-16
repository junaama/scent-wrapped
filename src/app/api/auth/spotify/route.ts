import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { getSpotifyAuthUrl } from '@/lib/spotify';

export async function GET() {
  // Generate a cryptographically secure random state for CSRF protection
  const state = randomBytes(32).toString('base64url');
  
  // Store state in a secure cookie
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });
  
  const authUrl = getSpotifyAuthUrl(state);
  if (!authUrl) {
    return new Response('Unable to generate Spotify auth URL', { status: 500 });
  }
  redirect(authUrl);
}
