import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function middleware(request) {
  // Get the session token from cookies
  const session = request.cookies.get('sb-access-token')?.value;

  // Fetch the user from Supabase using the session token
  const { data: { user }, error } = await supabase.auth.getUser(session);

  // Define protected routes
  const protectedRoutes = ['/dashbord' ]; // Add more routes as needed

  // Check if the requested route is protected
  if (protectedRoutes.includes(request.nextUrl.pathname)) {
    // Redirect to login if the user is not authenticated
    if (!user || error) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }


  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  const url = request.nextUrl;

  // Only rewrite root path (/), leave other paths untouched
  if (url.pathname === '/') {
    if (subdomain === 'portal') {
      url.pathname = '/dashboard'; // or /Form if you prefer
      return NextResponse.rewrite(url);
    }

    if (subdomain === 'admin') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
  }

   
  

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api|static).*)'],
};
