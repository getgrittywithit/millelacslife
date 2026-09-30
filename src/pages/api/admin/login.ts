import type { APIRoute } from 'astro';

export const prerender = false;

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'changeme123';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const { password } = data;

    if (password === ADMIN_PASSWORD) {
      // Set a session cookie (valid for 7 days)
      const sessionToken = Buffer.from(`admin:${Date.now()}`).toString('base64');

      cookies.set('admin_session', sessionToken, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid password' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
