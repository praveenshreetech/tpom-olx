import { NextResponse } from 'next/server'
import { updateProductStatus, deleteProduct } from '@/lib/queries'
import pool from '@/lib/db'

export async function PATCH(request, { params }) {
  try {
    const body = await request.json()
    const { status, title, description, price, location, category } = body

    if (title !== undefined) {
      // category from the form is the category NAME (e.g. "RealEstate")
      // We need to look up its id from the categories table first
      let category_id = null

      if (category) {
        const [rows] = await pool.query(
          'SELECT id FROM categories WHERE name = ? LIMIT 1',
          [category]
        )
        if (rows.length > 0) {
          category_id = rows[0].id
        }
      }

      await pool.query(
        `UPDATE products 
       SET title=?, description=?, price=?, location=?, category=?, 
           seller_name=?, seller_phone=?, seller_whatsapp=?, status=? 
       WHERE id=?`,
      [
        body.title,
        body.description,
        body.price,
        body.location,
        body.category,
        body.seller_name,
        body.seller_phone,
        body.seller_whatsapp,
        body.status,
        id
      ]
      )

      return NextResponse.json({ success: true })
    }

    // Status-only update (from the quick dropdown in the table)
    if (!['active', 'sold', 'hidden'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    await updateProductStatus(params.id, status)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('PATCH product error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteProduct(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE product error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


