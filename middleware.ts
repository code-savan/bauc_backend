import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Check if user is approved
    const { data: admin } = await supabase
      .from('admins')
      .select('is_approved, is_superadmin')
      .eq('id', session.user.id)
      .single();

    if (!admin?.is_approved) {
      return NextResponse.redirect(new URL('/auth/pending', req.url));
    }

    // Check superadmin routes
    if (
      req.nextUrl.pathname.startsWith('/admin/approval') && 
      !admin?.is_superadmin
    ) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};