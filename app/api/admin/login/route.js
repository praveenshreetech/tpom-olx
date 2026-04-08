import { NextResponse } from 'next/server'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'praveen'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      // Small delay to prevent brute-force
      await new Promise(r => setTimeout(r, 500))
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Set a simple session cookie
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}