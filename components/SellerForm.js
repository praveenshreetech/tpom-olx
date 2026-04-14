'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './SellerForm.module.css'


export default function SellerForm() {
  const [form, setForm] = useState({
    seller_name: '', seller_phone: '', seller_whatsapp: '', seller_email: '',
    product_title: '', description: '', price: '', location: '', category: '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])// ← ADDED

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // ─── REPLACED handleImages ────────────────────────────────────────────────
  const handleImages = e => {
    const newFiles = Array.from(e.target.files)
    const combined = [...images, ...newFiles].slice(0, 5)      // merge, cap at 5
    previews.forEach(url => URL.revokeObjectURL(url))          // free old memory
    setImages(combined)
    setPreviews(combined.map(f => URL.createObjectURL(f)))
    e.target.value = null                                      // reset input
  }

  const removeImage = (index) => {                             // ← ADDED
    URL.revokeObjectURL(previews[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const setMainImage = (index) => {                            // ← ADDED
    const newImages = [...images]
    const newPreviews = [...previews]
    const [img] = newImages.splice(index, 1)
    const [pre] = newPreviews.splice(index, 1)
    newImages.unshift(img)
    newPreviews.unshift(pre)
    setImages(newImages)
    setPreviews(newPreviews)
  }
  // ─────────────────────────────────────────────────────────────────────────

  const submit = async e => {
    e.preventDefault()
    if (!form.seller_name || !form.seller_phone || !form.product_title) {
      setError('Name, phone and product title are required.'); return
    }
    setState('loading'); setError('')

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    fd.append('contact_method', 'form')
    images.forEach(img => fd.append('images', img))

    const res = await fetch('/api/submissions', { method: 'POST', body: fd })
    if (res.ok) { setState('success') }
    else { setState('error'); setError('Something went wrong. Please try WhatsApp instead.') }
  }

  if (state === 'success') return (
    <div className="success-box" style={{ marginTop: 8 }}>
      ✅ Submission received! We'll review your product and contact you within a few hours.
    </div>
  )

  return (
    <form onSubmit={submit} className={styles.form}>
      {/* Seller info */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Your Details</p>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input name="seller_name" value={form.seller_name} onChange={handle} placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input name="seller_phone" value={form.seller_phone} onChange={handle} placeholder="+91 98765 43210" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>WhatsApp Number *</label>
            <input name="seller_whatsapp" value={form.seller_whatsapp} onChange={handle} placeholder="If different from phone" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="seller_email" type="email" value={form.seller_email} onChange={handle} placeholder="you@email.com" />
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Product Details</p>
        <div className="form-group">
          <label>Product Title *</label>
          <input name="product_title" value={form.product_title} onChange={handle} placeholder="e.g. iPhone 14 Pro 256GB Space Black" required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handle}
            placeholder="Condition, age, any defects, reason for selling…" rows={4} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input name="price" type="number" value={form.price} onChange={handle} placeholder="0" min="0" required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={form.location} onChange={handle} placeholder="City / Area" required />
          </div>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handle}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── IMAGES SECTION (updated) ──────────────────────────────────────── */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>
          Product Images (up to 5)&nbsp;
          <span style={{ fontWeight: 400, fontSize: '0.82rem', color: '#888' }}>
            {images.length}/5 selected
          </span>
        </p>

        {/* Hidden input, triggered by upload box click below */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImages}
          style={{ display: 'none' }} 
        />

        {/* Upload box */}
        <label
          className={styles.uploadBox}
          onClick={e => { e.preventDefault(); if (images.length < 5) fileInputRef.current.click() }}
          style={{ cursor: images.length >= 5 ? 'not-allowed' : 'pointer', opacity: images.length >= 5 ? 0.5 : 1 }}
        >
          <span className={styles.uploadIcon}>📸</span>
          <span>
            {images.length === 0
              ? 'Click to upload photos'
              : images.length >= 5
                ? 'Maximum 5 images reached'
                : `Add more photos (${5 - images.length} remaining)`}
          </span>
          <span className={styles.uploadHint}>JPG, PNG — max 5MB each</span>
        </label>

        {/* Preview grid with remove & set-main controls */}
        {previews.length > 0 && (
          <div className={styles.previews}>
            {previews.map((src, i) => (
              <div key={i} className={styles.previewThumb} style={{ position: 'relative' }}>
                <img src={src} alt={`Preview ${i + 1}`} />

                {/* Main badge */}
                {i === 0 && <span className={styles.mainBadge}>Main</span>}

                {/* Set as main (non-first images only) */}
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setMainImage(i)}
                    style={{
                      position: 'absolute', bottom: 4, left: 4,
                      fontSize: '0.65rem', padding: '2px 6px',
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      border: 'none', borderRadius: 4, cursor: 'pointer'
                    }}
                  >
                    Set Main
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 22, height: 22, lineHeight: '20px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    border: 'none', borderRadius: '50%', cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ─────────────────────────────────────────────────────────────────────── */}

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className={`btn submitBtn btn-primary ${styles.submitBtn}`}>
        {state === 'loading' ? 'Submitting…' : '✓ Submit Product'}
      </button>
    </form>
  )
}