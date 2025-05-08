import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // If trying to access login page and already authenticated, redirect to home
  if (isLoginPage && authCookie?.value === 'true') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If not authenticated and not on login page, redirect to login
  if (!authCookie?.value && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 