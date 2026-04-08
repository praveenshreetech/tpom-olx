import { NextResponse } from 'next/server'
import { createInquiry } from '@/lib/queries'

export async function POST(request) {
  try {
    const body = await request.json()
    const { product_id, buyer_name, buyer_phone, buyer_email, message, contact_method } = body

    if (!product_id || !buyer_name || !message) {
      return NextResponse.json({ error: 'product_id, buyer_name and message are required' }, { status: 400 })
    }

    // Save to database
    const id = await createInquiry({
      product_id, buyer_name, buyer_phone, buyer_email, message,
      contact_method: contact_method || 'form'
    })

    // Build WhatsApp message with all buyer details
    const adminWhatsApp = process.env.ADMIN_WHATSAPP
    const waText = `
🛒 *New Buyer Inquiry*

*Product ID:* ${product_id}
*Product name:* ${product_id}
*Buyer Name:* ${buyer_name}
*Phone:* ${buyer_phone || 'Not provided'}
*Email:* ${buyer_email || 'Not provided'}
*Message:* ${message}

_Inquiry ID: #${id}_
    `.trim()

    const waLink = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(waText)}`

    return NextResponse.json({ success: true, id, waLink }, { status: 201 })
  } catch (err) {
    console.error('Inquiry error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}