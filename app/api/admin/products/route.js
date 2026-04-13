import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { uploadImages } from '@/lib/uploadImages'

// ─── GET ─────────────────────────────────────
export async function GET() {
  try {
    const [products] = await pool.query(`
      SELECT
        p.id, p.title, p.description, p.price, p.location,
        p.status, p.created_at,
        COALESCE(p.views_count, 0) AS views_count,
        p.seller_name, p.seller_phone, p.seller_whatsapp,
        c.name AS category,
        (
          SELECT pi.image_url FROM product_images pi
          WHERE pi.product_id = p.id AND pi.is_primary = 1
          LIMIT 1
        ) AS primary_image,
        (
          SELECT COUNT(*) FROM product_images pi2
          WHERE pi2.product_id = p.id
        ) AS images_count,
        (
          SELECT GROUP_CONCAT(pi3.image_url ORDER BY pi3.is_primary DESC, pi3.id ASC)
          FROM product_images pi3
          WHERE pi3.product_id = p.id
        ) AS all_images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `)

    const [categories] = await pool.query(
      'SELECT id, name, slug FROM categories ORDER BY name ASC'
    )

    return NextResponse.json({ products, categories })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ─── POST ────────────────────────────────────
export async function POST(request) {
  try {
    const formData = await request.formData()

    const title = (formData.get('title') || '').trim()
    const description = (formData.get('description') || '').trim()
    const price = parseFloat(formData.get('price') || '0')
    const location = (formData.get('location') || '').trim()
    const category_id = formData.get('category_id') || null
    const seller_name = (formData.get('seller_name') || '').trim()
    const seller_phone = (formData.get('seller_phone') || '').trim()
    const seller_whatsapp = (formData.get('seller_whatsapp') || '').trim()
    const status = formData.get('status') || 'active'
    const submission_id = formData.get('submission_id') || null
    const existing_images = formData.get('existing_images') || ''

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    // ✅ images
    const files = formData.getAll('images')
      .filter(f => f && f.size > 0)
      .slice(0, 5)

    // ✅ upload
    const uploadedUrls = files.length > 0
      ? await uploadImages(files, "products")
      : []

    // ✅ existing fallback
    const existingPaths = existing_images
      ? existing_images.split(',').map(u => u.trim()).filter(Boolean)
      : []

    const imagePaths = uploadedUrls.length > 0 ? uploadedUrls : existingPaths

    // ✅ insert product
    const [result] = await pool.query(
      `INSERT INTO products
      (title, description, price, location, category_id,
       seller_name, seller_phone, seller_whatsapp, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        description,
        price,
        location,
        category_id || null,
        seller_name || null,
        seller_phone || null,
        seller_whatsapp || null,
        status
      ]
    )

    const productId = result.insertId

    // ✅ insert images
    for (let i = 0; i < imagePaths.length; i++) {
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_primary)
         VALUES (?, ?, ?)`,
        [productId, imagePaths[i], i === 0 ? 1 : 0]
      )
    }

    // ✅ update submission
    if (submission_id) {
      await pool.query(
        `UPDATE submissions SET status='posted' WHERE id=?`,
        [submission_id]
      )
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Server error', detail: err.message },
      { status: 500 }
    )
  }
}