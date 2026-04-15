import { NextResponse } from 'next/server'
import { createSubmission } from '@/lib/queries'
import { uploadImages } from '@/lib/uploadImages'   // ← use Cloudinary uploader

export async function POST(request) {
  try {
    const formData = await request.formData()

    const fields = {
      seller_name:    formData.get('seller_name')    || '',
      seller_phone:   formData.get('seller_phone')   || '',
      seller_whatsapp:formData.get('seller_whatsapp')|| null,
      seller_email:   formData.get('seller_email')   || null,
      product_title:  formData.get('product_title')  || '',
      description:    formData.get('description')    || null,
      price:          formData.get('price')           || null,
      location:       formData.get('location')        || null,
      category_id:    formData.get('category_id')     || null,
      contact_method: formData.get('contact_method') || 'form',
    }

    console.log("FORM DATA RECEIVED:", fields)

    if (
      !fields.seller_name  ||
      !fields.seller_phone ||
      !fields.product_title||
      !fields.category_id  ||
      !fields.price        ||
      !fields.location
    ) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // ── IMAGE UPLOAD via Cloudinary (works on Vercel) ──────────────────────
    const imageFiles = formData.getAll('images').filter(f => f && f.size > 0)
    let uploadedUrls = []

    if (imageFiles.length > 0) {
      // uploadImages returns array of secure Cloudinary URLs
      uploadedUrls = await uploadImages(
        imageFiles.slice(0, 5),
        'submissions'          // Cloudinary folder name
      )
    }
    // ───────────────────────────────────────────────────────────────────────

    const id = await createSubmission({
      ...fields,
      image_urls: uploadedUrls.length > 0 ? uploadedUrls.join(',') : null,
    })

    return NextResponse.json({ success: true, id }, { status: 201 })

  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'Server error', detail: err.message }, { status: 500 })
  }
}