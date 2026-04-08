import { NextResponse } from 'next/server'
import { getAllInquiries } from '@/lib/queries'

export async function GET() {
  try {
    const inquiries = await getAllInquiries()
    return NextResponse.json({ inquiries })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
