import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { auth } from './app/lib/auth'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const isAuthenticated = !!session?.session
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    redirect('/login')
  }

  if (isAuthenticated && isAuthRoute) {
    redirect('/dashboard')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
