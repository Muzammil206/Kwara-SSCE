// app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the session cookie
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.delete('sb-access-token');

  return response;
}