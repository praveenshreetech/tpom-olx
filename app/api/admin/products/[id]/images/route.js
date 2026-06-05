import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { uploadImages } from '@/lib/uploadImages'

// GET /api/admin/products/[id]/images — fetch all images for a product
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const [images] = await pool.query(
      'SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC',
      [id]
    )
    return NextResponse.json({ images })
  } catch (err) {
    console.error('[GET product images]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin/products/[id]/images — replace all images for a product
export async function POST(request, { params }) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const existing_images = formData.get('existing_images') || ''
    const imageFiles = formData.getAll('images').filter(f => f && f.size > 0)

    // Save any newly uploaded files via Cloudinary
    let uploadedPaths = []
    if (imageFiles.length > 0) {
      uploadedPaths = await uploadImages(imageFiles, 'products')
    }

    // Existing URLs that were kept (not removed by admin)
    const existingPaths = existing_images
      ? existing_images.split(',').map(u => u.trim()).filter(Boolean)
      : []

    // Final image list: kept existing + newly uploaded (max 5)
    const allPaths = [...existingPaths, ...uploadedPaths].slice(0, 5)

    // Delete old image records and re-insert
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [id])

    for (let i = 0; i < allPaths.length; i++) {
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
        [id, allPaths[i], i === 0 ? 1 : 0]
      )
    }

    return NextResponse.json({ success: true, count: allPaths.length })
  } catch (err) {
    console.error('[POST product images]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}