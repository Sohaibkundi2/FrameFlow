import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';


const isPublicRoute = createRouteMatcher([
  '/',
  '/home',
  '/sign-in',
  '/sign-up'
])

const isPublicApiRoute = createRouteMatcher([
  '/api/videos'
])

export default clerkMiddleware(  async (auth, req) => {
  const { userId } = await auth()
  const currentUrl = new URL(req.url)
  const isAccessingDashboard = currentUrl.pathname === "/home"
  const isAccessingApiRequest = currentUrl.pathname.startsWith("/api")

  if (userId && isPublicApiRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  if (!userId) {
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    if (isAccessingApiRequest && isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|.*\\..*).*)',
  ],
}