'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import styles from './page.module.css'

const TABS = ['Overview', 'Products', 'Submissions', 'Inquiries', 'Banners']

const statusColors = {
  new: 'badge-new-item', reviewed: 'badge-sold', posted: 'badge-active',
  rejected: 'badge-hidden', active: 'badge-active', sold: 'badge-sold',
  hidden: 'badge-hidden', contacted: 'badge-sold', closed: 'badge-hidden',
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5,
}
const inputStyle = {
  width: '100%', background: '#111', border: '1px solid #333',
  borderRadius: 8, padding: '9px 12px', color: '#fff',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

// ─── Reusable Multi-Image Uploader ────────────────────────────────────────────
function ImageUploader({ images, setImages, existingUrls = [], onRemoveExisting, label = 'Upload Images (max 5)' }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  function handleFiles(e) {
    setError('')
    const files = Array.from(e.target.files)
    const total = files.length + images.length + existingUrls.length
    if (total > 5) {
      setError(`Too many images — max 5 total (you have ${existingUrls.length} existing + ${images.length} queued)`)
      e.target.value = ''
      return
    }
    setImages(prev => [...prev, ...files].slice(0, 5))
    e.target.value = ''
  }

  function removeNew(idx) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const totalCount = existingUrls.length + images.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={labelStyle}>{label}</label>

      {/* Preview grid */}
      {(existingUrls.length > 0 || images.length > 0) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Existing saved images */}
          {existingUrls.map((url, i) => (
            <div key={`existing-${i}`} style={{ position: 'relative', width: 80, height: 80 }}>
              <img src={url} alt=""
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid #444' }} />
              <div style={{
                position: 'absolute', top: -4, left: 2,
                background: '#22c55e', borderRadius: 4, padding: '1px 5px',
                fontSize: 9, fontWeight: 700, color: '#000'
              }}>SAVED</div>
              {onRemoveExisting && (
                <button onClick={() => onRemoveExisting(i)} style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#ef4444', border: 'none', cursor: 'pointer',
                  color: '#fff', fontSize: 11, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>×</button>
              )}
            </div>
          ))}
          {/* New queued images */}
          {images.map((file, i) => (
            <div key={`new-${i}`} style={{ position: 'relative', width: 80, height: 80 }}>
              <img src={URL.createObjectURL(file)} alt=""
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid #c8f135' }} />
              <div style={{
                position: 'absolute', top: -4, left: 2,
                background: '#c8f135', borderRadius: 4, padding: '1px 5px',
                fontSize: 9, fontWeight: 700, color: '#000'
              }}>NEW</div>
              <button onClick={() => removeNew(i)} style={{
                position: 'absolute', top: -6, right: -6,
                width: 20, height: 20, borderRadius: '50%',
                background: '#ef4444', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: 11, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>×</button>
            </div>
          ))}
          {/* Empty slot indicators */}
          {Array.from({ length: Math.max(0, 5 - totalCount) }).map((_, i) => (
            <div key={`empty-${i}`}
              onClick={() => inputRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: 8,
                border: '2px dashed #333', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#444', fontSize: 22, transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#666'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
            >+</div>
          ))}
        </div>
      )}

      {error && (
        <div style={{
          background: '#2d1515', border: '1px solid #ef4444',
          borderRadius: 6, padding: '8px 12px', color: '#f87171', fontSize: 12,
        }}>⚠️ {error}</div>
      )}

      {totalCount < 5 && (
        <div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles}
            style={{ display: 'none' }} />
          <button type="button" onClick={() => inputRef.current?.click()} style={{
            background: '#1a1a1a', border: '1px dashed #444', borderRadius: 8,
            padding: '9px 16px', color: '#aaa', fontSize: 13, cursor: 'pointer',
            width: '100%', textAlign: 'center', transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8f135'; e.currentTarget.style.color = '#c8f135' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#aaa' }}
          >
            📎 Choose images ({totalCount}/5 used)
          </button>
        </div>
      )}
      {totalCount >= 5 && (
        <p style={{ color: '#666', fontSize: 12, margin: 0 }}>✅ Maximum 5 images reached. Remove one to add another.</p>
      )}
    </div>
  )
}

// ─── Post Product from Submission Modal ──────────────────────────────────────
function PostProductModal({ submission, categories, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState([])
  // existing = submission image URLs that will be used if no new ones uploaded
  const [existingUrls, setExistingUrls] = useState(
    submission.image_urls ? submission.image_urls.split(',').map(u => u.trim()).filter(Boolean) : []
  )
  const [form, setForm] = useState({
    title: submission.product_title || '',
    description: submission.description || '',
    price: submission.price || '',
    location: submission.location || '',
    category_id: submission.category_id || '',
    seller_name: submission.seller_name || '',
    seller_phone: submission.seller_phone || '',
    seller_whatsapp: submission.seller_whatsapp || '',
    status: 'active',
    model: submission.model || '',
    ownership: submission.ownership || '',
    year: submission.year || '',
    kilometers: submission.kilometers || '',
    expected_price: submission.expected_price || '',
    property_type: submission.property_type || '',
  })

  function handleChange(e) {
    setError('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function removeExisting(idx) {
    setExistingUrls(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.price) { setError('Price is required'); return }
    if (images.length + existingUrls.length > 5) { setError('Maximum 5 images allowed'); return }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('description', form.description.trim())
      fd.append('price', form.price)
      fd.append('location', form.location.trim())
      fd.append('category_id', form.category_id)
      fd.append('seller_name', form.seller_name.trim())
      fd.append('seller_phone', form.seller_phone.trim())
      fd.append('seller_whatsapp', form.seller_whatsapp.trim())
      fd.append('status', form.status)
      fd.append('submission_id', submission.id)
      fd.append('existing_images', existingUrls.join(','))
      fd.append('model', form.model)
      fd.append('ownership', form.ownership)
      fd.append('year', form.year)
      fd.append('kilometers', form.kilometers)
      fd.append('expected_price', form.expected_price)
      fd.append('property_type', form.property_type)
      images.forEach(img => fd.append('images', img))

      const res = await fetch('/api/admin/products', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) { setError(data.error || `Server error (${res.status})`); return }
      onSuccess(); onClose()
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setSaving(false)
    }
  }

  function handleBackdrop(e) { if (e.target === e.currentTarget) onClose() }

  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
        width: '100%', maxWidth: 600, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #2a2a2a', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>📦 Post Product</h2>
            <p style={{ color: '#666', fontSize: 12, margin: '3px 0 0' }}>
              From submission #{submission.id} — review and post to live site
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#2a2a2a',
            border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {(() => {
            const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
            const isVehicle = selectedCat && (selectedCat.slug === 'cars' || selectedCat.slug === 'bikes' || selectedCat.name === 'Cars' || selectedCat.name === 'Bikes');
            const isRealEstate = selectedCat && (selectedCat.slug === 'real-estate' || selectedCat.name === 'Real Estate');

            return (
              <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {error && (
                  <div style={{ background: '#2d1515', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>⚠️ {error}</div>
                )}
                <div style={{ background: '#0f2027', border: '1px solid #1a4a5a', borderRadius: 10, padding: 14 }}>
                  <label style={{ ...labelStyle, color: '#38bdf8' }}>⚙️ Status</label>
                  <select name="status" value={form.status} onChange={handleChange} style={{ ...inputStyle, border: '1px solid #2a5a6a' }}>
                    <option value="active">✅ Active — Visible on website</option>
                    <option value="hidden">🙈 Hidden — Not visible yet</option>
                  </select>
                </div>
                <SectionDivider label="Product Info" />
                <Field label="Category" required>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id || c} value={c.id || c}>
                        {c.name || c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Title *"><input type="text" name="title" value={form.title} onChange={handleChange} required style={inputStyle} placeholder="Product title" /></Field>
                <Field label="Description" required>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    required
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Product description..."
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Price (₹) *"><input type="number" name="price" value={form.price} onChange={handleChange} required min="0" style={inputStyle} placeholder="0" /></Field>
                  <Field label="Location"><input type="text" name="location" value={form.location} onChange={handleChange} style={inputStyle} placeholder="e.g. Chennai" /></Field>
                </div>
                <SectionDivider label="Seller Info" />
                <Field label="Seller Name"><input type="text" name="seller_name" value={form.seller_name} onChange={handleChange} style={inputStyle} placeholder="Seller full name" /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Seller Phone"><input type="tel" name="seller_phone" value={form.seller_phone} onChange={handleChange} style={inputStyle} placeholder="+91 98765 43210" /></Field>
                  <Field label="Seller WhatsApp"><input type="tel" name="seller_whatsapp" value={form.seller_whatsapp} onChange={handleChange} style={inputStyle} placeholder="+91 98765 43210" /></Field>
                </div>

                {isVehicle && (
                  <>
                    <SectionDivider label="Vehicle Info" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Model"><input type="text" name="model" value={form.model} onChange={handleChange} style={inputStyle} placeholder="e.g. Swift VXI" /></Field>
                      <Field label="Ownership"><input type="text" name="ownership" value={form.ownership} onChange={handleChange} style={inputStyle} placeholder="e.g. 1st Owner" /></Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Year"><input type="number" name="year" value={form.year} onChange={handleChange} style={inputStyle} placeholder="2020" /></Field>
                      <Field label="Kilometers"><input type="number" name="kilometers" value={form.kilometers} onChange={handleChange} style={inputStyle} placeholder="25000" /></Field>
                    </div>
                    <Field label="Expected Price"><input type="number" name="expected_price" value={form.expected_price} onChange={handleChange} style={inputStyle} placeholder="0" /></Field>
                  </>
                )}

                {isRealEstate && (
                  <>
                    <SectionDivider label="Property Info" />
                    <Field label="Property For">
                      <select name="property_type" value={form.property_type} onChange={handleChange} style={inputStyle}>
                        <option value="">Select Option</option>
                        <option value="Sale">Sale</option>
                        <option value="Rent">Rent</option>
                      </select>
                    </Field>
                  </>
                )}

                <SectionDivider label="Images" />
                <ImageUploader
                  images={images}
                  setImages={setImages}
                  existingUrls={existingUrls}
                  onRemoveExisting={removeExisting}
                  label="Images (max 5) — seller's images pre-loaded"
                />

              </div>
            )
          })()}
          <ModalFooter onClose={onClose} saving={saving} label="🚀 Post Product" savingLabel="⏳ Posting..." />
        </form>
      </div>
    </div>
  )
}

// ─── Add Product Modal ────────────────────────────────────────────────────────
function AddProductModal({ categories, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '', category_id: '',
    seller_name: '', seller_phone: '', seller_whatsapp: '', status: 'active',
    model: '', ownership: '', year: '', kilometers: '', expected_price: '',
    property_type: '',
  })

  function handleChange(e) {
    setError('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category_id) {
      setError("Please select a category");
      return;
    }

    if (!form.description) {
      setError("Description is required");
      return;
    }

    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.price) { setError('Price is required'); return }
    if (images.length > 5) { setError('Maximum 5 images allowed'); return }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('description', form.description.trim())
      fd.append('price', form.price)
      fd.append('location', form.location.trim())
      fd.append('category_id', form.category_id)
      fd.append('seller_name', form.seller_name.trim())
      fd.append('seller_phone', form.seller_phone.trim())
      fd.append('seller_whatsapp', form.seller_whatsapp.trim())
      fd.append('status', form.status)
      fd.append('model', form.model)
      fd.append('ownership', form.ownership)
      fd.append('year', form.year)
      fd.append('kilometers', form.kilometers)
      fd.append('expected_price', form.expected_price)
      fd.append('property_type', form.property_type)
      images.forEach(img => fd.append('images', img))

      const res = await fetch('/api/admin/products', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) { setError(data.error || `Server error (${res.status})`); return }
      onSuccess(); onClose()
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setSaving(false)
    }
  }

  function handleBackdrop(e) { if (e.target === e.currentTarget) onClose() }

  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
        width: '100%', maxWidth: 600, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #2a2a2a', flexShrink: 0,
        }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Add New Product</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#2a2a2a',
            border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className='scrollbar' style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {(() => {
            const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
            const isVehicle = selectedCat && (selectedCat.slug === 'cars' || selectedCat.slug === 'bikes' || selectedCat.name === 'Cars' || selectedCat.name === 'Bikes');
            const isRealEstate = selectedCat && (selectedCat.slug === 'real-estate' || selectedCat.name === 'Real Estate');

            return (
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ background: '#2d1515', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>⚠️ {error}</div>}
            <div style={{ background: '#0f2027', border: '1px solid #1a4a5a', borderRadius: 10, padding: 14 }}>
              <label style={{ ...labelStyle, color: '#38bdf8' }}>⚙️ Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={{ ...inputStyle, border: '1px solid #2a5a6a' }}>
                <option value="active">✅ Active — Visible on website</option>
                <option value="hidden">🙈 Hidden — Not visible yet</option>
              </select>
            </div>
            <SectionDivider label="Product Info" />
            <Field label="Category" required>
              <select name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id || c} value={c.id || c}>{c.name || c}</option>)}
              </select>
            </Field>
            <Field label="Title *"><input type="text" name="title" value={form.title} onChange={handleChange} required style={inputStyle} placeholder="Product title" /></Field>
            <Field label="Description" required><textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product description..." /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Price (₹) *"><input type="number" name="price" value={form.price} onChange={handleChange} required min="0" style={inputStyle} placeholder="0" /></Field>
              <Field label="Location" required><input type="text" name="location" value={form.location} onChange={handleChange} required style={inputStyle} placeholder="e.g. Chennai" /></Field>
            </div>
            <SectionDivider label="Seller Info" />
            <Field label="Seller Name" required><input type="text" name="seller_name" value={form.seller_name} onChange={handleChange} required style={inputStyle} placeholder="Seller full name" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Seller Phone" required><input type="tel" name="seller_phone" value={form.seller_phone} onChange={handleChange} required style={inputStyle} placeholder="+91 98765 43210" /></Field>
              <Field label="Seller WhatsApp" required><input type="tel" name="seller_whatsapp" value={form.seller_whatsapp} onChange={handleChange} required style={inputStyle} placeholder="+91 98765 43210" /></Field>
            </div>
            {isVehicle && (
              <>
                <SectionDivider label="Vehicle Info" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Model"><input type="text" name="model" value={form.model} onChange={handleChange} style={inputStyle} placeholder="e.g. Swift VXI" /></Field>
                  <Field label="Ownership"><input type="text" name="ownership" value={form.ownership} onChange={handleChange} style={inputStyle} placeholder="e.g. 1st Owner" /></Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Year"><input type="number" name="year" value={form.year} onChange={handleChange} style={inputStyle} placeholder="2020" /></Field>
                  <Field label="Kilometers"><input type="number" name="kilometers" value={form.kilometers} onChange={handleChange} style={inputStyle} placeholder="25000" /></Field>
                </div>
                <Field label="Expected Price"><input type="number" name="expected_price" value={form.expected_price} onChange={handleChange} style={inputStyle} placeholder="0" /></Field>
              </>
            )}

            {isRealEstate && (
              <>
                <SectionDivider label="Property Info" />
                <Field label="Property For">
                  <select name="property_type" value={form.property_type} onChange={handleChange} style={inputStyle}>
                    <option value="">Select Option</option>
                    <option value="Sale">Sale</option>
                    <option value="Rent">Rent</option>
                  </select>
                </Field>
              </>
            )}

            <SectionDivider label="Images" />
            <ImageUploader required images={images} setImages={setImages} label="Upload Images (max 5)" />
          </div>
            )
          })()}
          <ModalFooter onClose={onClose} saving={saving} label="+ Add Product" savingLabel="⏳ Adding..." />
        </form>
      </div>
    </div>
  )
}

// ─── Add Banner Modal ────────────────────────────────────────────────────────
function AddBannerModal({ onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ title: '', link_url: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) { setError('Please select an image'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('link_url', form.link_url)
      fd.append('image', file)
      const res = await fetch('/api/admin/banners', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Failed to upload')
      onSuccess(); onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{ background: '#1a1a1a', padding: 24, borderRadius: 16, width: '100%', maxWidth: 450, border: '1px solid #333' }}>
        <h2 style={{ color: '#fff', fontSize: 20, margin: '0 0 20px' }}>Add Banner</h2>
        {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Banner Image *</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="e.g. Summer Sale" />
          </div>
          <div>
            <label style={labelStyle}>Click Link URL</label>
            <input type="text" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} style={inputStyle} placeholder="e.g. /category/cars" />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{saving ? 'Uploading...' : 'Save Banner'}</button>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
function EditProductModal({ product, categories, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newImages, setNewImages] = useState([])
  const [existingUrls, setExistingUrls] = useState([]) // loaded from server
  const [loadingImages, setLoadingImages] = useState(true)
  const [form, setForm] = useState({
    title: product.title || '',
    description: product.description || '',
    price: product.price || '',
    location: product.location || '',
    category_id: product.category_id || '',
    seller_name: product.seller_name || '',
    seller_phone: product.seller_phone || '',
    seller_whatsapp: product.seller_whatsapp || '',
    status: product.status || 'active',
    model: product.model || '',
    ownership: product.ownership || '',
    year: product.year || '',
    kilometers: product.kilometers || '',
    expected_price: product.expected_price || '',
    property_type: product.property_type || '',
  })

  // Load existing images for this product
  useEffect(() => {
    async function loadImages() {
      try {
        const res = await fetch(`/api/admin/products/${product.id}/images`)
        if (res.ok) {
          const data = await res.json()
          setExistingUrls(data.images?.map(img => img.image_url) || [])
        }
      } catch (e) {
        console.warn('Could not load product images:', e)
      } finally {
        setLoadingImages(false)
      }
    }
    loadImages()
  }, [product.id])

  function handleChange(e) {
    setError('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function removeExisting(idx) {
    setExistingUrls(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // First update product details
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          location: form.location.trim(),
          category_id: form.category_id,
          seller_name: form.seller_name.trim(),
          seller_phone: form.seller_phone.trim(),
          seller_whatsapp: form.seller_whatsapp.trim(),
          status: form.status,
          model: form.model,
          ownership: form.ownership,
          year: form.year,
          kilometers: form.kilometers,
          expected_price: form.expected_price,
          property_type: form.property_type,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setError(data.error || `Server error (${res.status})`); return }

      // Then update images if changed
      if (newImages.length > 0 || existingUrls.length !== (product.images_count || 0)) {
        const fd = new FormData()
        fd.append('existing_images', existingUrls.join(','))
        newImages.forEach(img => fd.append('images', img))
        await fetch(`/api/admin/products/${product.id}/images`, { method: 'POST', body: fd })
      }

      onSuccess(); onClose()
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setSaving(false)
    }
  }

  function handleBackdrop(e) { if (e.target === e.currentTarget) onClose() }

  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
        width: '100%', maxWidth: 600, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #2a2a2a', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Product</h2>
            <p style={{ color: '#666', fontSize: 12, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
              ID: {product.id} · {product.title}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#2a2a2a',
            border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {(() => {
            const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
            const isVehicle = selectedCat && (selectedCat.slug === 'cars' || selectedCat.slug === 'bikes' || selectedCat.name === 'Cars' || selectedCat.name === 'Bikes');
            const isRealEstate = selectedCat && (selectedCat.slug === 'real-estate' || selectedCat.name === 'Real Estate');

            return (
              <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ background: '#2d1515', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>⚠️ {error}</div>}
            <div style={{ background: '#0f2027', border: '1px solid #1a4a5a', borderRadius: 10, padding: 14 }}>
              <label style={{ ...labelStyle, color: '#38bdf8' }}>⚙️ Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={{ ...inputStyle, border: '1px solid #2a5a6a' }}>
                <option value="active">✅ Active — Visible on website</option>
                <option value="hidden">🙈 Hidden — Not visible</option>
                <option value="sold">🏷️ Sold — Marked as sold</option>
              </select>
            </div>
            <SectionDivider label="Product Info" />
            <Field label="Category">
              <select name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id || c} value={c.id || c}>{c.name || c}</option>)}
              </select>
            </Field>
            <Field label="Title *"><input type="text" name="title" value={form.title} onChange={handleChange} required style={inputStyle} placeholder="Product title" /></Field>
            <Field label="Description"><textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product description..." /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Price (₹) *"><input type="number" name="price" value={form.price} onChange={handleChange} required min="0" style={inputStyle} placeholder="0" /></Field>
              <Field label="Location"><input type="text" name="location" value={form.location} onChange={handleChange} style={inputStyle} placeholder="e.g. Chennai" /></Field>
            </div>
            <SectionDivider label="Seller Info" />
            <Field label="Seller Name"><input type="text" name="seller_name" value={form.seller_name} onChange={handleChange} style={inputStyle} placeholder="Seller full name" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Seller Phone"><input type="tel" name="seller_phone" value={form.seller_phone} onChange={handleChange} style={inputStyle} placeholder="+91 98765 43210" /></Field>
              <Field label="Seller WhatsApp"><input type="tel" name="seller_whatsapp" value={form.seller_whatsapp} onChange={handleChange} style={inputStyle} placeholder="+91 98765 43210" /></Field>
            </div>
                {isVehicle && (
                  <>
                    <SectionDivider label="Vehicle Info" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Model"><input type="text" name="model" value={form.model} onChange={handleChange} style={inputStyle} placeholder="e.g. Swift VXI" /></Field>
                      <Field label="Ownership"><input type="text" name="ownership" value={form.ownership} onChange={handleChange} style={inputStyle} placeholder="e.g. 1st Owner" /></Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Year"><input type="number" name="year" value={form.year} onChange={handleChange} style={inputStyle} placeholder="2020" /></Field>
                      <Field label="Kilometers"><input type="number" name="kilometers" value={form.kilometers} onChange={handleChange} style={inputStyle} placeholder="25000" /></Field>
                    </div>
                    <Field label="Expected Price"><input type="number" name="expected_price" value={form.expected_price} onChange={handleChange} style={inputStyle} placeholder="0" /></Field>
                  </>
                )}

                {isRealEstate && (
                  <>
                    <SectionDivider label="Property Info" />
                    <Field label="Property For">
                      <select name="property_type" value={form.property_type} onChange={handleChange} style={inputStyle}>
                        <option value="">Select Option</option>
                        <option value="Sale">Sale</option>
                        <option value="Rent">Rent</option>
                      </select>
                    </Field>
                  </>
                )}

                <SectionDivider label="Images" />
                {loadingImages ? (
                  <p style={{ color: '#666', fontSize: 13 }}>Loading images…</p>
                ) : (
                  <ImageUploader
                    images={newImages}
                    setImages={setNewImages}
                    existingUrls={existingUrls}
                    onRemoveExisting={removeExisting}
                    label="Manage Images (max 5) — click × to remove"
                  />
                )}
              </div>
            )
          })()}
          <ModalFooter onClose={onClose} saving={saving} label="💾 Save Changes" savingLabel="⏳ Saving..." />
        </form>
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ borderBottom: '1px solid #222', paddingBottom: 4 }}>
      <p style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function ModalFooter({ onClose, saving, label, savingLabel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '16px 24px', borderTop: '1px solid #2a2a2a',
      flexShrink: 0, background: '#111', borderRadius: '0 0 16px 16px',
    }}>
      <button type="submit" disabled={saving} style={{
        background: saving ? '#555' : 'var(--accent, #c8f135)',
        color: saving ? '#aaa' : '#000', fontWeight: 700,
        padding: '10px 24px', borderRadius: 8, border: 'none',
        cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14,
      }}>{saving ? savingLabel : label}</button>
      <button type="button" onClick={onClose} style={{
        background: 'transparent', color: '#aaa', padding: '10px 18px',
        borderRadius: 8, border: '1px solid #333', cursor: 'pointer', fontSize: 14,
      }}>Cancel</button>
    </div>
  )
}

// ─── Product Card (matches Submission card style) ─────────────────────────────
function ProductCard({ p, fmt, fmtDate, statusColors, onEdit, onDelete, onStatusChange }) {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const images = p.all_images
    ? p.all_images.split(',').map(u => u.trim()).filter(Boolean)
    : p.primary_image ? [p.primary_image] : []

  return (
    <div style={{
      background: '#fff', border: '1px solid #fff', borderRadius: 14,
      overflow: 'hidden', transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#C8943A'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#C8943A'}
    >
      <div style={{ display: 'flex', gap: 16, padding: '16px 18px', alignItems: 'flex-start' }}>

        {/* Image gallery — OLX style */}
        <div style={{ flexShrink: 0 }}>
          {images.length === 0 ? (
            <div style={{
              width: 100, height: 100, borderRadius: 10, background: '#1e1e1e',
              border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#444', fontSize: 28,
            }}>📦</div>
          ) : (
            <div style={{ position: 'relative', width: 100 }}>
              {/* Main image */}
              <img
                src={images[0]}
                alt=""
                onClick={() => setLightboxIdx(0)}
                style={{
                  width: 100, height: 100, objectFit: 'cover', borderRadius: 10,
                  border: '1px solid #333', cursor: 'pointer', display: 'block',
                }}
              />
              {/* Extra count badge */}
              {images.length > 1 && (
                <div
                  onClick={() => setLightboxIdx(0)}
                  style={{
                    position: 'absolute', bottom: 5, right: 5,
                    background: 'rgba(0,0,0,0.75)', borderRadius: 6,
                    padding: '2px 7px', fontSize: 11, color: '#fff',
                    fontWeight: 700, cursor: 'pointer',
                  }}>+{images.length - 1}</div>
              )}
            </div>
          )}
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 6, width: 100, flexWrap: 'wrap' }}>
              {images.slice(1, 4).map((url, i) => (
                <img key={i} src={url} alt=""
                  onClick={() => setLightboxIdx(i + 1)}
                  style={{
                    width: 30, height: 30, objectFit: 'cover', borderRadius: 5,
                    border: '1px solid #333', cursor: 'pointer', opacity: 0.8,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                />
              ))}
              {images.length > 4 && (
                <div onClick={() => setLightboxIdx(4)} style={{
                  width: 30, height: 30, borderRadius: 5, background: '#222',
                  border: '1px solid #333', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#aaa', fontSize: 9, fontWeight: 700,
                }}>+{images.length - 4}</div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Row 1 : Title + Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.title}
            </h3>

            <span
              className={`badge ${statusColors[p.status] || ""}`}
              style={{ flexShrink: 0 }}
            >
              {p.status}
            </span>
          </div>

          {/* Row 2 : Product Info */}
          <div
            style={{
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
              marginTop: 6,
              fontSize: 16,
              color: "#888",
            }}
          >
            {p.category && <span>Category: {p.category}</span>}
            <span style={{ color: "#000", fontWeight: 700 }}>
              Price: ₹{fmt(p.price)}
            </span>
            {p.location && <span>Location: {p.location}</span>}
            <span>👁 {p.views_count || 0} views</span>
          </div>

          {/* Row 3 : Description */}
          {p.description && (
            <p
              style={{
                color: "#666",
                fontSize: 15,
                marginTop: 6,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              Description: {p.description}
            </p>
          )}

          {/* Row 4 : Seller + Date */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 6,
              flexWrap: "wrap",
              fontSize: 15,
              color: "#555",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              {p.seller_name && <span>👤 {p.seller_name}</span>}
              {p.seller_phone && <span>📞 {p.seller_phone}</span>}
            </div>

            <span style={{ color: "#444" }}>
              Created: {fmtDate(p.created_at)}
            </span>
          </div>

        </div>

        {/* Right: date + actions */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <select value={p.status} onChange={e => onStatusChange(p.id, e.target.value)}
            style={{
              background: '#C8943A', borderRadius: 6,
              padding: '5px 8px', color: '#fff', fontSize: 12, cursor: 'pointer',
            }}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Actions bar */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 18px', background: '#fff',
      }}>
        <button onClick={() => onEdit(p)} style={{
          fontSize: 14, padding: '8px 15px', background: '#2563eb',
          color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 600,
        }}>✏️ Edit</button>
        <button onClick={() => onDelete(p.id)} style={{
          fontSize: 14, padding: '8px 15px', background: '#ef4444',
          color: '#fff', borderRadius: 20, cursor: 'pointer', fontWeight: 600,
        }}>🗑 Delete</button>
        {p.primary_image && (
          <span style={{ marginLeft: 'auto', fontSize: 14, color: '#444', alignSelf: 'center' }}>
            {images.length} image{images.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div onClick={() => setLightboxIdx(null)} style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.max(0, i - 1)) }}
            style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, color: '#fff', fontSize: 22, cursor: 'pointer' }}>‹</button>
          <img src={images[lightboxIdx]} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 10, objectFit: 'contain' }} />
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.min(images.length - 1, i + 1)) }}
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, color: '#fff', fontSize: 22, cursor: 'pointer' }}>›</button>
          <div style={{ position: 'absolute', bottom: 24, display: 'flex', gap: 8 }}>
            {images.map((url, i) => (
              <img key={i} src={url} alt="" onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: `2px solid ${i === lightboxIdx ? '#c8f135' : 'transparent'}`, opacity: i === lightboxIdx ? 1 : 0.5 }} />
            ))}
          </div>
          <button onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [postSubmission, setPostSubmission] = useState(null)
  const [banners, setBanners] = useState([])
  const [showAddBanner, setShowAddBanner] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    const r = await fetch('/api/admin/stats')
    setStats(await r.json())
  }, [])

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/submissions')
    const d = await r.json()
    setSubmissions(d.submissions || [])
    setLoading(false)
  }, [])

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/inquiries')
    const d = await r.json()
    setInquiries(d.inquiries || [])
    setLoading(false)
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/products')
    const d = await r.json()
    setProducts(d.products || [])
    setCategories(d.categories || [])
    setLoading(false)
  }, [])

  const fetchCategories = useCallback(async () => {
    const r = await fetch('/api/admin/products')
    const d = await r.json()
    setCategories(d.categories || [])
  }, [])

  useEffect(() => { fetchStats() }, [])
  useEffect(() => {
    if (tab === 'Submissions') { fetchSubmissions(); fetchCategories() }
    else if (tab === 'Inquiries') fetchInquiries()
    else if (tab === 'Products') fetchProducts()
    else if (tab === 'Banners') fetchBanners()
  }, [tab])

  const updateSubmission = async (id, status) => {
    await fetch(`/api/admin/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchSubmissions(); fetchStats()
  }

  const updateInquiry = async (id, status) => {
    await fetch(`/api/admin/inquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchInquiries(); fetchStats()
  }

  const updateProductStatus = async (id, status) => {
    await fetch(`/api/admin/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchProducts(); fetchStats()
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts(); fetchStats()
  }

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/banners')
      const d = await r.json()
      setBanners(d || [])
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleBanner = async (id, is_active) => {
    await fetch(`/api/admin/banners/${id}`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ is_active }) 
    })
    fetchBanners()
  }

  const deleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    fetchBanners()
  }

  const fmt = n => Number(n || 0).toLocaleString('en-IN')
  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  function toWhatsAppNumber(phone) {
    if (!phone) return ''
    let digits = phone.replace(/\D/g, '')
    if (digits.length === 10) digits = '91' + digits
    return digits
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Image src="/tpom-logo.webp" alt="tpom logo" width={150} height={80} priority />
        </div>
        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`${styles.navBtn} ${tab === t ? styles.navActive : ''}`}>
              {t}
              {t === 'Submissions' && stats?.new_submissions > 0 && <span className={styles.navBadge}>{stats.new_submissions}</span>}
              {t === 'Inquiries' && stats?.new_inquiries > 0 && <span className={styles.navBadge}>{stats.new_inquiries}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sideFooter}>
          <a href="/" className={styles.sideLink}>← View Site</a>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>{tab}</h1>
          {(tab === 'Products' || tab === '') && (
            <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>+ Post Product</button>
          )}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'Overview' && (
          <div>
            <div className={styles.statsGrid}>
              {[
                { label: 'Active Listings', value: stats?.total_products ?? '…' },
                { label: 'New Submissions', value: stats?.new_submissions ?? '…' },
                { label: 'New Inquiries', value: stats?.new_inquiries ?? '…' },
                { label: 'Total Views', value: stats ? fmt(stats.total_views) : '…' },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <span className={styles.statValue} style={{ color: 'var(--accent)' }}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className={styles.quickLinks}>
              {[
                { label: 'Review Submissions', tab: 'Submissions', count: stats?.new_submissions },
                { label: 'Handle Inquiries', tab: 'Inquiries', count: stats?.new_inquiries },
                { label: 'Manage Products', tab: 'Products', count: stats?.total_products },
              ].map(q => (
                <button key={q.tab} className={styles.quickCard} onClick={() => setTab(q.tab)}>
                  <span className={styles.quickCount}>{q.count ?? '…'}</span>
                  <span className={styles.quickLabel}>{q.label} →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUCTS — card layout like Submissions ── */}
        {tab === 'Products' && (
          <div className={styles.tableWrap}>
            {loading ? <p className={styles.loading}>Loading…</p> : products.length === 0 ? (
              <p className={styles.empty}>No products yet. Add your first one!</p>
            ) : products.map(p => (
              <ProductCard
                key={p.id}
                p={p}
                fmt={fmt}
                fmtDate={fmtDate}
                statusColors={statusColors}
                onEdit={setEditProduct}
                onDelete={deleteProduct}
                onStatusChange={updateProductStatus}
              />
            ))}
          </div>
        )}

        {/* ── SUBMISSIONS ── */}
        {tab === 'Submissions' && (
          <div className={styles.tableWrap}>
            {loading ? <p className={styles.loading}>Loading…</p> : submissions.length === 0 ? (
              <p className={styles.empty}>No submissions yet.</p>
            ) : submissions.map(s => (
              <div key={s.id} className={styles.subCard}>
                <div className={styles.subHeader}>
                  <div className={styles.subInfo}>
                    <h3 className={styles.subTitle}>{s.product_title}</h3>
                    <p style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span>by <strong>{s.seller_name}</strong></span>||
                      <span>{s.seller_phone}</span>||
                      {s.seller_whatsapp && <span>WA: {s.seller_whatsapp}</span>}||
                      {s.price && <span>₹{fmt(s.price)}</span>}||
                      {s.category_name && <span>🏷️ {s.category_name}</span>}||
                      {s.location && <span>📍 {s.location}</span>}
                    </p>
                    {(s.model || s.year || s.kilometers || s.property_type) && (
                      <p style={{ marginTop: 5, fontSize: 13, color: 'var(--accent, #c8f135)', fontWeight: 600 }}>
                        {s.property_type && <span>🏠 {s.property_type} · </span>}
                        {s.category_name === 'Cars' || s.category_name === 'Bikes' ? '🚗 ' : ''}
                        {s.model} {s.year ? `· ${s.year}` : ''} {s.kilometers ? `· ${fmt(s.kilometers)} km` : ''} {s.ownership ? `· ${s.ownership}` : ''} {s.expected_price ? `· Expected: ₹${fmt(s.expected_price)}` : ''}
                      </p>
                    )}
                    {s.description && <p className={styles.subDesc}>{s.description}</p>}
                  </div>
                  {s.image_urls && (
                    <div className={styles.subImgs}>
                      {s.image_urls.split(',').slice(0, 2).map((url, i) => (
                        <div key={i} className={styles.subImgWrapper}>
                          <img src={url.trim()} alt="" className={styles.subImg} />
                          {i === 1 && s.image_urls.split(',').length > 2 && (
                            <div className={styles.imgMoreOverlay}>+{s.image_urls.split(',').length - 2}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.subRight}>
                    <span className={`badge ${statusColors[s.status] || ''}`}>{s.status}</span>
                    <span className={styles.subDate}>{fmtDate(s.created_at)}</span>
                    <span className={styles.contactMethod}>{s.contact_method === 'whatsapp' ? '📱 WA' : '📝 Form'}</span>
                  </div>
                </div>
                <div className={styles.subActions}>
                  {s.status === 'posted' ? (
                    <button className="btn btn-primary" disabled
                      style={{ fontSize: 13, padding: '7px 14px', background: '#22c55e', color: '#fff', fontWeight: 700, opacity: 1, cursor: 'default' }}>
                      ✅ Product Posted
                    </button>
                  ) : (
                    <button className="btn btn-primary"
                      style={{ fontSize: 13, padding: '7px 14px', background: 'var(--accent, #c8f135)', color: '#fff', fontWeight: 700 }}
                      onClick={() => setPostSubmission(s)}>📦 Post Product</button>
                  )}
                  {s.seller_whatsapp && (
                    <a href={`https://wa.me/${toWhatsAppNumber(s.seller_whatsapp)}?text=${encodeURIComponent(`Hi ${s.seller_name}! We received your product listing for "${s.product_title}". We'll review and publish it shortly.`)}`}
                      target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"
                      style={{ fontSize: 13, padding: '7px 14px' }}>WhatsApp Seller</a>
                  )}
                  {s.status === 'new' && <>
                    {/* <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => updateSubmission(s.id, 'reviewed')}>Mark Reviewed</button> */}
                    {/* <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => updateSubmission(s.id, 'posted')}>Mark Posted</button> */}
                    <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => updateSubmission(s.id, 'rejected')}>Reject</button>
                  </>}
                  {s.status === 'reviewed' && <>
                    <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => updateSubmission(s.id, 'posted')}>Mark Posted</button>
                    <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => updateSubmission(s.id, 'rejected')}>Reject</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── INQUIRIES ── */}
        {tab === 'Inquiries' && (
          <div className={styles.tableWrap}>
            {loading ? <p className={styles.loading}>Loading…</p> : inquiries.length === 0 ? (
              <p className={styles.empty}>No inquiries yet.</p>
            ) : inquiries.map(inq => (
              <div key={inq.id} className={styles.subCard}>
                <div className={styles.subHeader}>
                  <div>
                    <h3 className={styles.subTitle}>{inq.product_title}</h3>
                    <p style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span>Buyer: <strong>{inq.buyer_name}</strong></span>||
                      {inq.buyer_phone && <span>{inq.buyer_phone}</span>}||
                      {inq.buyer_email && <span>{inq.buyer_email}</span>}||
                      <span>₹{fmt(inq.product_price)}</span>
                    </p>
                    <p className={styles.subDesc}>{inq.message}</p>
                  </div>
                  <div className={styles.subRight}>
                    <span className={`badge ${statusColors[inq.status] || ''}`}>{inq.status}</span>
                    <span className={styles.subDate}>{fmtDate(inq.created_at)}</span>
                  </div>
                </div>
                <div className={styles.subActions}>
                  {inq.buyer_phone && (
                    <a href={`https://wa.me/${toWhatsAppNumber(inq.buyer_phone)}?text=${encodeURIComponent(`Hi ${inq.buyer_name}! We received your inquiry for "${inq.product_title}".`)}`}
                      target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"
                      style={{ fontSize: 13, padding: '7px 14px' }}>WhatsApp Buyer</a>
                  )}
                  {inq.status === 'new' && (
                    <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => updateInquiry(inq.id, 'contacted')}>Mark Contacted</button>
                  )}
                  {inq.status !== 'closed' && (
                    <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => updateInquiry(inq.id, 'closed')}>Close</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BANNERS ── */}
        {tab === 'Banners' && (
          <div className={styles.tableWrap}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowAddBanner(true)}>+ Add New Banner</button>
            </div>
            {loading ? <p className={styles.loading}>Loading…</p> : banners.length === 0 ? (
              <p className={styles.empty}>No banners yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {banners.map(b => (
                  <div key={b.id} style={{ background: '#F9F7F4', border: '1px solid #333', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={b.image_url} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                    <div style={{ padding: 12 }}>
                      <p style={{ margin: '0 0 5px', fontWeight: 500, color: '#6B6878' }}>{b.title || 'Untitled Banner'}</p>
                      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#000000e2', wordBreak: 'break-all' }}>{b.link_url || 'No link'}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          className={`btn ${b.is_active ? 'btn-primary' : 'btn-primary'}`} 
                          style={{ flex: 1, fontSize: 11, padding: '5px' }}
                          onClick={() => toggleBanner(b.id, !b.is_active)}
                        >
                          {b.is_active ? '⏸ Disable' : '▶️ Enable'}
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ flex: 1, fontSize: 11, padding: '5px' }}
                          onClick={() => deleteBanner(b.id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showAddBanner && (
        <AddBannerModal 
          onClose={() => setShowAddBanner(false)} 
          onSuccess={() => { setShowAddBanner(false); fetchBanners(); }} 
        />
      )}

      {/* ── Modals ── */}
      {showAddProduct && (
        <AddProductModal categories={categories}
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => { setShowAddProduct(false); fetchProducts(); fetchStats() }} />
      )}
      {editProduct && (
        <EditProductModal product={editProduct} categories={categories}
          onClose={() => setEditProduct(null)}
          onSuccess={() => { setEditProduct(null); fetchProducts(); fetchStats() }} />
      )}
      {postSubmission && (
        <PostProductModal submission={postSubmission} categories={categories}
          onClose={() => setPostSubmission(null)}
          onSuccess={() => { setPostSubmission(null); fetchProducts(); fetchSubmissions(); fetchStats() }} />
      )}
    </div>
  )
}