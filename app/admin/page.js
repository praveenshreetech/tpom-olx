'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from './page.module.css'

const TABS = ['Overview', 'Submissions', 'Inquiries', 'Products']

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

// ─── Add Product Modal (fully inline, no external import) ─────────────────────
function AddProductModal({ categories, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    location: '', category_id: '', status: 'active',
  })

  function handleChange(e) {
    setError('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImages(e) {
    setImages(Array.from(e.target.files).slice(0, 8))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.price) { setError('Price is required'); return }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('description', form.description.trim())
      fd.append('price', form.price)
      fd.append('location', form.location.trim())
      fd.append('category_id', form.category_id)
      fd.append('status', form.status)
      images.forEach(img => fd.append('images', img))

      const res = await fetch('/api/admin/products', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || `Server error (${res.status})`)
        return
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setSaving(false)
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }


  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
        width: '100%', maxWidth: 560, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {error && (
              <div style={{
                background: '#2d1515', border: '1px solid #ef4444',
                borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13,
              }}>⚠️ {error}</div>
            )}

            <div style={{ background: '#0f2027', border: '1px solid #1a4a5a', borderRadius: 10, padding: 14 }}>
              <label style={{ ...labelStyle, color: '#38bdf8' }}>⚙️ Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                style={{ ...inputStyle, border: '1px solid #2a5a6a' }}>
                <option value="active">✅ Active — Visible on website</option>
                <option value="hidden">🙈 Hidden — Not visible yet</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Title *</label>
              <input type="text" name="title" value={form.title}
                onChange={handleChange} required style={inputStyle} placeholder="Product title" />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id || c} value={c.id || c}>{c.name || c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                style={{ ...inputStyle, resize: 'none' }} placeholder="Product description..." />
            </div>

            <div>
              <label style={labelStyle}>Price (₹) *</label>
              <input type="number" name="price" value={form.price}
                onChange={handleChange} required min="0" style={inputStyle} placeholder="0" />
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <input type="text" name="location" value={form.location}
                onChange={handleChange} style={inputStyle} placeholder="e.g. Chennai" />
            </div>

            <div>
              <label style={labelStyle}>Images (up to 8)</label>
              <input type="file" accept="image/*" multiple onChange={handleImages}
                style={{ ...inputStyle, padding: '7px 12px', cursor: 'pointer' }} />
              {images.length > 0 && (
                <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                  {images.length} file{images.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

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
            }}>
              {saving ? '⏳ Adding...' : '+ Add Product'}
            </button>
            <button type="button" onClick={onClose} style={{
              background: 'transparent', color: '#aaa', padding: '10px 18px',
              borderRadius: 8, border: '1px solid #333', cursor: 'pointer', fontSize: 14,
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Product Modal ───────────────────────────────────────────────────────
function EditProductModal({ product, categories, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: product.title || '',
    description: product.description || '',
    price: product.price || '',
    location: product.location || '',
    category: product.category || '',
    status: product.status || 'active',
  })

  function handleChange(e) {
    setError('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          location: form.location.trim(),
          category: form.category,
          status: form.status,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || `Server error (${res.status})`)
        return
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setSaving(false)
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
        width: '100%', maxWidth: 560, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
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
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {error && (
              <div style={{
                background: '#2d1515', border: '1px solid #ef4444',
                borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13,
              }}>⚠️ {error}</div>
            )}

            <div style={{ background: '#0f2027', border: '1px solid #1a4a5a', borderRadius: 10, padding: 14 }}>
              <label style={{ ...labelStyle, color: '#38bdf8' }}>⚙️ Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                style={{ ...inputStyle, border: '1px solid #2a5a6a' }}>
                <option value="active">✅ Active — Visible on website</option>
                <option value="hidden">🙈 Hidden — Not visible</option>
                <option value="sold">🏷️ Sold — Marked as sold</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Title *</label>
              <input type="text" name="title" value={form.title}
                onChange={handleChange} required style={inputStyle} placeholder="Product title" />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id || c} value={c.name || c}>{c.name || c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                style={{ ...inputStyle, resize: 'none' }} placeholder="Product description..." />
            </div>

            <div>
              <label style={labelStyle}>Price (₹) *</label>
              <input type="number" name="price" value={form.price}
                onChange={handleChange} required min="0" style={inputStyle} placeholder="0" />
            </div>

            <div>
              <label style={labelStyle}>Location *</label>
              <input type="text" name="location" value={form.location}
                onChange={handleChange} required style={inputStyle} placeholder="e.g. Chennai" />
            </div>

            <div style={{ background: '#1a1a00', border: '1px solid #3a3a00', borderRadius: 8, padding: '10px 14px', color: '#a3a300', fontSize: 12 }}>
              ℹ️ To change images, delete and re-add the product.
            </div>
          </div>

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
            }}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            <button type="button" onClick={onClose} style={{
              background: 'transparent', color: '#aaa', padding: '10px 18px',
              borderRadius: 8, border: '1px solid #333', cursor: 'pointer', fontSize: 14,
            }}>Cancel</button>
          </div>
        </form>
      </div>
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

  useEffect(() => { fetchStats() }, [])
  useEffect(() => {
    if (tab === 'Submissions') fetchSubmissions()
    else if (tab === 'Inquiries') fetchInquiries()
    else if (tab === 'Products') fetchProducts()
  }, [tab])

  const updateSubmission = async (id, status) => {
    await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchSubmissions(); fetchStats()
  }

  const updateInquiry = async (id, status) => {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchInquiries(); fetchStats()
  }

  const updateProductStatus = async (id, status) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchProducts(); fetchStats()
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts(); fetchStats()
  }

  const fmt = n => Number(n || 0).toLocaleString('en-IN')
  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  function toWhatsAppNumber(phone) {
    if (!phone) return "";
    // Remove everything except digits
    let digits = phone.replace(/\D/g, "");
    // If it starts with 91 and is 12 digits, it's already correct
    // If it's 10 digits (Indian local), prepend 91
    if (digits.length === 10) {
      digits = "91" + digits;
    }
    return digits;
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Image
            src="/images/tpom-logo.png"
            alt="tpom logo"
            width={100}
            height={50}
            priority
          />
        </div>
        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`${styles.navBtn} ${tab === t ? styles.navActive : ''}`}>
              {t === 'Overview' && ' '}
              {t === 'Submissions' && ' '}
              {t === 'Inquiries' && ' '}
              {t === 'Products' && ' '}
              {t}
              {t === 'Submissions' && stats?.new_submissions > 0 && (
                <span className={styles.navBadge}>{stats.new_submissions}</span>
              )}
              {t === 'Inquiries' && stats?.new_inquiries > 0 && (
                <span className={styles.navBadge}>{stats.new_inquiries}</span>
              )}
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
          {tab === 'Products' && (
            <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
              + Add Product
            </button>
          )}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'Overview' && (
          <div>
            <div className={styles.statsGrid}>
              {[
                { label: 'Active Listings', value: stats?.total_products ?? '…', color: 'var(--accent)' },
                { label: 'New Submissions', value: stats?.new_submissions ?? '…', color: 'var(--accent)' },
                { label: 'New Inquiries', value: stats?.new_inquiries ?? '…', color: 'var(--accent)' },
                { label: 'Total Views', value: stats ? fmt(stats.total_views) : '…', color: 'var(--accent)' },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
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
                    <p style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      <span>by <strong>{s.seller_name}</strong></span>||
                      <span>{s.seller_phone}</span>||
                      {s.seller_whatsapp && <span>WA: {s.seller_whatsapp}</span>}||
                      {s.price && <span>₹{fmt(s.price)}</span>}||
                      {s.location && <span>📍{s.location}</span>}
                    </p>
                    {s.description && <p className={styles.subDesc}>{s.description}</p>}
                  </div>

                  {s.image_urls && (
                    <div className={styles.subImgs}>
                      {/* Only show first two images */}
                      {s.image_urls.split(',').slice(0, 2).map((url, i) => (
                        <div key={i} className={styles.subImgWrapper}>
                          <img src={url} alt="" className={styles.subImg} />
                          {/* If it's the 2nd image and there are more, show the count */}
                          {i === 1 && s.image_urls.split(',').length > 2 && (
                            <div className={styles.imgMoreOverlay}>
                              +{s.image_urls.split(',').length - 2}
                            </div>
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
                  {s.seller_whatsapp && (
                    <a
                      href={`https://wa.me/${toWhatsAppNumber(s.seller_whatsapp)}?text=${encodeURIComponent(`Hi ${s.seller_name}! We received your product listing for "${s.product_title}". We'll review and publish it shortly.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ fontSize: 13, padding: '7px 14px' }}
                    >
                      WhatsApp Seller
                    </a>
                  )}
                  {s.status === 'new' && <>
                    <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px' }}
                      onClick={() => updateSubmission(s.id, 'reviewed')}>Mark Reviewed</button>
                    <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
                      onClick={() => updateSubmission(s.id, 'posted')}>Mark Posted</button>
                    <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }}
                      onClick={() => updateSubmission(s.id, 'rejected')}>Reject</button>
                  </>}
                  {s.status === 'reviewed' && <>
                    <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
                      onClick={() => updateSubmission(s.id, 'posted')}>Mark Posted</button>
                    <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }}
                      onClick={() => updateSubmission(s.id, 'rejected')}>Reject</button>
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
                    <p style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
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
                    <a
                      href={`https://wa.me/${toWhatsAppNumber(inq.buyer_phone)}?text=${encodeURIComponent(`Hi ${inq.buyer_name}! We received your product listing for "${inq.product_title}". We'll review and publish it shortly.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ fontSize: 13, padding: '7px 14px' }}
                    >
                      WhatsApp Seller
                    </a>
                  )}
                  {inq.status === 'new' && (
                    <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px' }}
                      onClick={() => updateInquiry(inq.id, 'contacted')}>Mark Contacted</button>
                  )}
                  {inq.status !== 'closed' && (
                    <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }}
                      onClick={() => updateInquiry(inq.id, 'closed')}>Close</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'Products' && (
          <div className={styles.tableWrap}>
            {loading ? <p className={styles.loading}>Loading…</p> : products.length === 0 ? (
              <p className={styles.empty}>No products yet. Add your first one!</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Image</th><th>Title</th><th>Category</th>
                    <th>Price</th><th>Location</th><th>Status</th><th>Views</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.tableImgWrapper}>
                          {p.primary_image
                            ? <img src={p.primary_image} alt="" className={styles.tableImg} />
                            : <div className={styles.tableNoImg}>—</div>}
                          {/* THIS IS THE NEW BADGE LINE */}
                          {p.images_count > 1 && (
                            <div className={styles.tableImgBadge}>+{p.images_count - 1}</div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableTitle}>{p.title}</td>
                      <td className={styles.tableMuted}>{p.category || '—'}</td>
                      <td>₹{fmt(p.price)}</td>
                      <td className={styles.tableMuted}>{p.location || '—'}</td>
                      <td><span className={`badge ${statusColors[p.status]}`}>{p.status}</span></td>
                      <td className={styles.tableMuted}>{p.views_count}</td>
                      <td>
                        <div className={styles.tableActions}>
                          <select value={p.status}
                            onChange={e => updateProductStatus(p.id, e.target.value)}
                            className={styles.statusSelect}>
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="hidden">Hidden</option>
                          </select>
                          <button onClick={() => setEditProduct(p)} style={{
                            fontSize: 12, padding: '5px 10px', background: '#2563eb',
                            color: '#fff', border: 'none', borderRadius: 6,
                            cursor: 'pointer', fontWeight: 600,
                          }}>Edit</button>
                          <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 10px' }}
                            onClick={() => deleteProduct(p.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {showAddProduct && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => { setShowAddProduct(false); fetchProducts(); fetchStats() }}
        />
      )}

      {editProduct && (
        <EditProductModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSuccess={() => { setEditProduct(null); fetchProducts(); fetchStats() }}
        />
      )}
    </div>
  )
}