import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Automatically ensure the 'type' column exists (migration helper)
    try {
      await pool.query('SELECT type FROM banners LIMIT 1')
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR' || dbErr.message.includes('unknown column') || dbErr.message.includes('type')) {
        await pool.query("ALTER TABLE banners ADD COLUMN type ENUM('needs', 'support') DEFAULT 'needs'")
      }
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'needs'

    const [banners] = await pool.query(
      'SELECT id, image_url, link_url, title FROM banners WHERE is_active = 1 AND type = ? ORDER BY sort_order ASC',
      [type]
    )
    return NextResponse.json(banners)
  } catch (err) {
    console.error('Fetch banners error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
