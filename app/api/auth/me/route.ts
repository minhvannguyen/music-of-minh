import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const username = request.cookies.get('username')?.value;
    const email = request.cookies.get('email')?.value;
    const role = request.cookies.get('role')?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        username,
        email,
        role,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get user info' }, { status: 500 });
  }
}
