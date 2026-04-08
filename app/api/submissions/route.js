import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { createSubmission } from '@/lib/queries'

export async function POST(request) {
  try {
    const formData = await request.formData()

    const fields = {
      seller_name:     formData.get('seller_name')     || '',
      seller_phone:    formData.get('seller_phone')    || '',
      seller_whatsapp: formData.get('seller_whatsapp') || null,
      seller_email:    formData.get('seller_email')    || null,
      product_title:   formData.get('product_title')   || '',
      description:     formData.get('description')     || null,
      price:           formData.get('price')           || null,
      location:        formData.get('location')        || null,
      contact_method:  formData.get('contact_method')  || 'form',
    }

    if (!fields.seller_name || !fields.seller_phone || !fields.product_title) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // Handle image uploads
    const imageFiles = formData.getAll('images').filter(f => f && f.size > 0)
    const uploadedPaths = []

    if (imageFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'submissions')
      await mkdir(uploadDir, { recursive: true })

      for (const file of imageFiles.slice(0, 5)) {
        const bytes  = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const ext    = file.name.split('.').pop().toLowerCase()
        const fname  = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        await writeFile(path.join(uploadDir, fname), buffer)
        uploadedPaths.push(`/uploads/submissions/${fname}`)
      }
    }

    const id = await createSubmission({
      ...fields,
      image_urls: uploadedPaths.length > 0 ? uploadedPaths.join(',') : null,
    })

    return NextResponse.json({ success: true, id }, { status: 201 })
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
