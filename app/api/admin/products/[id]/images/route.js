import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'

// GET /api/admin/products/[id]/images — fetch all images for a product
export async function GET(request, { params }) {
  try {
    const [images] = await pool.query(
      'SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC',
      [params.id]
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
    const formData = await request.formData()
    const existing_images = formData.get('existing_images') || ''
    const imageFiles = formData.getAll('images').filter(f => f && f.size > 0)

    // Save any newly uploaded files
    const uploadedPaths = []
    if (imageFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
      await mkdir(uploadDir, { recursive: true })
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
        const filename = `prod_${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        await writeFile(path.join(uploadDir, filename), buffer)
        uploadedPaths.push(`/uploads/products/${filename}`)
      }
    }

    // Existing URLs that were kept (not removed by admin)
    const existingPaths = existing_images
      ? existing_images.split(',').map(u => u.trim()).filter(Boolean)
      : []

    // Final image list: kept existing + newly uploaded (max 5)
    const allPaths = [...existingPaths, ...uploadedPaths].slice(0, 5)

    // Delete old image records and re-insert
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [params.id])

    for (let i = 0; i < allPaths.length; i++) {
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
        [params.id, allPaths[i], i === 0 ? 1 : 0]
      )
    }

    return NextResponse.json({ success: true, count: allPaths.length })
  } catch (err) {
    console.error('[POST product images]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}