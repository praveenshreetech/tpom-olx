import { NextResponse } from 'next/server'
import { createInquiry } from '@/lib/queries'

export async function POST(request) {
  try {
    const body = await request.json()
    const { product_id, product_name, product_price, buyer_name, buyer_phone, buyer_email, message, contact_method } = body

    if (!product_id || !product_name || !buyer_name || !message) {
      return NextResponse.json({ error: 'product_id, product_name, buyer_name and message are required' }, { status: 400 })
    }

    // Save to database
    const id = await createInquiry({
      product_id, product_name, buyer_name, buyer_phone, buyer_email, message,
      contact_method: contact_method || 'form'
    })

    // Build WhatsApp message with all buyer details
    const adminWhatsApp = process.env.ADMIN_WHATSAPP
    const waText = `
🛒 *New Buyer Inquiry*

*Product name:* ${product_name}
*Product Price:* ${product_price || 'Not provided'}
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