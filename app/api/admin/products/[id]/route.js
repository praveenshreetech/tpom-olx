import { NextResponse } from 'next/server'
import { updateProductStatus, deleteProduct } from '@/lib/queries'
import pool from '@/lib/db'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, title, description, price, location, category_id, seller_name, seller_phone, seller_whatsapp } = body

    if (title !== undefined) {
      await pool.query(
        `UPDATE products 
         SET title=?, description=?, price=?, location=?, category_id=?, 
             seller_name=?, seller_phone=?, seller_whatsapp=?, status=? 
         WHERE id=?`,
        [
          title,
          description,
          price,
          location,
          category_id || null,
          seller_name || null,
          seller_phone || null,
          seller_whatsapp || null,
          status,
          id
        ]
      )

      return NextResponse.json({ success: true })
    }

    // Status-only update (from the quick dropdown in the table)
    if (!['active', 'sold', 'hidden'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    await updateProductStatus(id, status)
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


