import { NextRequest, NextResponse } from 'next/server'
import { auth } from './app/lib/auth'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const isAuthenticated = !!session?.session
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/register')

  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}