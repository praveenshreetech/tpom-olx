import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { uploadImages } from '@/lib/uploadImages'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
    const imageFile = formData.get('image')

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const uploadedUrls = await uploadImages([imageFile], 'banners')
    if (uploadedUrls.length === 0) throw new Error('Cloudinary upload failed')

    await pool.query(
      'INSERT INTO banners (image_url, link_url, title) VALUES (?, ?, ?)',
      [uploadedUrls[0], link_url, title]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin POST banner error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
