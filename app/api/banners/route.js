import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [banners] = await pool.query(
      'SELECT id, image_url, link_url, title FROM banners WHERE is_active = 1 ORDER BY sort_order ASC'
    )
    return NextResponse.json(banners)
  } catch (err) {
    console.error('Fetch banners error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
