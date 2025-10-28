import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear all auth cookies
  const cookiesToClear = ['accessToken', 'refreshToken', 'username', 'email', 'role'];
  
  cookiesToClear.forEach(cookieName => {
    response.cookies.set(cookieName, '', {
      httpOnly: cookieName === 'accessToken' || cookieName === 'refreshToken',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
  });

  return response;
}
