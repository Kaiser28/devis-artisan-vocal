import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Si c'est /devis/vocal, laisser passer (route statique prioritaire)
  if (pathname === '/devis/vocal') {
    return NextResponse.next()
  }
  
  // Si c'est /devis/nouveau, laisser passer
  if (pathname === '/devis/nouveau') {
    return NextResponse.next()
  }
  
  // Sinon, continuer normalement
  return NextResponse.next()
}

export const config = {
  matcher: ['/devis/:path*']
}
