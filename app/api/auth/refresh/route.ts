import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 });
    }

    // Call backend refresh token API
    const response = await fetch('https://localhost:7114/api/auth/RefreshToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(refreshToken),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Refresh failed' }, { status: 401 });
    }

    const data = await response.json();

    // Update cookies with new tokens
    const nextResponse = NextResponse.json({ success: true });

    nextResponse.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });

    nextResponse.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return nextResponse;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ success: false, error: 'Failed to refresh token' }, { status: 500 });
  }
}
