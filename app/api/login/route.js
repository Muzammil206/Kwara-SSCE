// app/api/login/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  const { userId, password } = await request.json();

  // Fetch the user from the database
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId);

  if (error || !users || users.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  

  const user = users[0];

  // Verify the password (plain-text comparison)
  if (password !== user.password) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Create a session token (you can use a library like `jsonwebtoken` for this)
  const sessionToken = `session-token-for-${user.user_id}`; // Replace with a secure token

  // Set the session token in a cookie
  const response = NextResponse.json({ user });
  response.cookies.set('session-token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return response;
}