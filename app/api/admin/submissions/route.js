import { NextResponse } from 'next/server'
import { getAllSubmissions } from '@/lib/queries'

export async function GET() {
  try {
    const submissions = await getAllSubmissions()
    return NextResponse.json({ submissions })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
