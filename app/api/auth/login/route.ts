import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  if (password === process.env.LOGIN_PASSWORD) {
    const response = NextResponse.json({ success: true })
    
    // Set a cookie to maintain the session
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    
    return response
  }
  
  return NextResponse.json(
    { error: 'Invalid password' },
    { status: 401 }
  )
} 