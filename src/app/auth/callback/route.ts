// src/app/auth/callback/route.ts — OAuth callback handler
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/next'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${request.nextUrl.origin}/`)
    }
  }

  // Redirect to login if there's an error
  return NextResponse.redirect(`${request.nextUrl.origin}/login?error=auth_failed`)
}
