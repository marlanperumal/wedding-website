import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/rsvp')) {
    if (!request.cookies.has('guestInviteId')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/guests')) {
    if (!request.cookies.has('adminSession')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/rsvp/:path*', '/admin/dashboard/:path*', '/admin/guests/:path*'],
}
