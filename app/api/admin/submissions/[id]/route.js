import { NextResponse } from 'next/server'
import { updateSubmissionStatus, deleteSubmission } from '@/lib/queries'

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const { status, admin_notes } = await request.json()
    if (!['new','reviewed','posted','rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    await updateSubmissionStatus(id, status, admin_notes)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteSubmission(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE submission error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
