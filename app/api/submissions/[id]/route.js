import { NextResponse } from 'next/server'
import { db } from '@/lib/db' // your db import

export async function DELETE(request, { params }) {
  const { id } = params
  try {
    await db.query('DELETE FROM submissions WHERE id = $1', [id])
    // or if using mysql: await db.query('DELETE FROM submissions WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}