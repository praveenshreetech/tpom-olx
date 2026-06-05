import { NextResponse } from 'next/server'
import { updateInquiryStatus } from '@/lib/queries'

export async function PATCH(request, { params }) {
  try {
    const { status, admin_notes } = await request.json()
    if (!['new','contacted','closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const { id } = await params
    await updateInquiryStatus(id, status, admin_notes)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
