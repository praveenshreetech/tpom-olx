'use client'
import { useState } from 'react'
import styles from './InquiryForm.module.css'

export default function InquiryForm({ productId, productTitle }) {
  const [form, setForm] = useState({ buyer_name: '', buyer_phone: '', buyer_email: '', message: '' })
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.buyer_name || !form.message) { setError('Name and message are required.'); return }
    setState('loading')
    setError('')

    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        product_id: productId,
        contact_method: 'form'
      }),
    })

    const data = await res.json()

    if (res.ok) {
      setState('success')
      // Open WhatsApp with all details pre-filled
      if (data.waLink) {
        window.open(data.waLink, '_blank')
      }
    } else {
      setState('error')
      setError('Something went wrong. Please try WhatsApp instead.')
    }
  }

  if (state === 'success') return (
    <div className="success-box">
      ✅ Message sent! Opening WhatsApp to notify admin about <strong>{productTitle}</strong>.
    </div>
  )

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className="form-group">
        <label>Your Name *</label>
        <input name="buyer_name" value={form.buyer_name} onChange={handle} placeholder="Full name" required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Phone</label>
          <input name="buyer_phone" value={form.buyer_phone} onChange={handle} placeholder="+91 98765 43210" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="buyer_email" type="email" value={form.buyer_email} onChange={handle} placeholder="you@email.com" />
        </div>
      </div>
      <div className="form-group">
        <label>Message *</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handle}
          placeholder="I'm interested in this product. Please contact me."
          rows={3}
          required
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <button type="submit" className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={state === 'loading'}>
        {state === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}