import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await pool.query('DELETE FROM banners WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin DELETE banner error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const { is_active } = await request.json()
    await pool.query('UPDATE banners SET is_active = ? WHERE id = ?', [is_active, id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin PATCH banner error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
