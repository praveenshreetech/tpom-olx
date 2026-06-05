import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { uploadImages } from '@/lib/uploadImages'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Automatically ensure the 'type' column exists (migration helper)
    try {
      await pool.query('SELECT type FROM banners LIMIT 1')
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR' || dbErr.message.includes('unknown column') || dbErr.message.includes('type')) {
        await pool.query("ALTER TABLE banners ADD COLUMN type ENUM('needs', 'support') DEFAULT 'needs'")
      }
    }

    const [banners] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC')
    return NextResponse.json(banners)
  } catch (err) {
    console.error('Admin Fetch banners error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') || ''
    const link_url = formData.get('link_url') || ''
    const type = formData.get('type') || 'needs'
    const imageFile = formData.get('image')

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const uploadedUrls = await uploadImages([imageFile], 'banners')
    if (uploadedUrls.length === 0) throw new Error('Cloudinary upload failed')

    await pool.query(
      'INSERT INTO banners (image_url, link_url, title, type) VALUES (?, ?, ?, ?)',
      [uploadedUrls[0], link_url, title, type]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin POST banner error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
