// app/admin/products/page.jsx  ← save as .jsx not .tsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const STATUS_COLOR = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING:  'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  SOLD:     'bg-gray-100 text-gray-600',
};

// ─── Edit Modal Popup ─────────────────────────────────────────────────────────
function EditModal({ product, categories, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:        product.title        || '',
    description:  product.description  || '',
    price:        String(product.price || ''),
    city:         product.city         || '',
    state:        product.state        || '',
    location:     product.location     || '',
    condition:    product.condition    || 'USED',
    isNegotiable: product.isNegotiable || false,
    contactPhone: product.contactPhone || '',
    contactEmail: product.contactEmail || '',
    categoryId:   product.categoryId   || product.category?.id || '',
    status:       product.status       || 'PENDING',
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Save product details
      const res  = await fetch(`/api/products/${product.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const json = await res.json();
      if (!json.success) { toast.error(json.message); return; }

      // Save status via admin route
      const sRes  = await fetch(`/api/admin/products/${product.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: form.status }),
      });
      const sJson = await sRes.json();
      if (!sJson.success) { toast.error(sJson.message); return; }

      toast.success('Product updated!');
      onSaved({ ...product, ...form, price: Number(form.price) });
      onClose();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  // Close when clicking dark backdrop
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{ position:'fixed', inset:0, zIndex:50, display:'flex',
        alignItems:'center', justifyContent:'center', padding:16,
        background:'rgba(0,0,0,0.55)', backdropFilter:'blur(2px)' }}
    >
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 25px 60px rgba(0,0,0,0.3)',
        width:'100%', maxWidth:640, maxHeight:'90vh', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 24px', borderBottom:'1px solid #eee', flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#111', margin:0 }}>Edit Product</h2>
            <p style={{ fontSize:12, color:'#999', margin:'2px 0 0',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:360 }}>
              {product.title}
            </p>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%',
            background:'#f3f4f6', border:'none', cursor:'pointer', fontSize:16,
            display:'flex', alignItems:'center', justifyContent:'center', color:'#555' }}>
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
          <div style={{ overflowY:'auto', flex:1, padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

            {/* Status */}
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#1d4ed8',
                textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
                ⚙️ Product Status
              </label>
              <select name="status" value={form.status} onChange={handleChange}
                style={{ width:'100%', border:'1px solid #93c5fd', borderRadius:8, padding:'8px 12px',
                  background:'#fff', fontSize:14, fontWeight:500, outline:'none' }}>
                <option value="PENDING">⏳ PENDING — Awaiting review</option>
                <option value="APPROVED">✅ APPROVED — Live on website</option>
                <option value="REJECTED">❌ REJECTED — Hidden from site</option>
                <option value="SOLD">🏷️ SOLD — Marked as sold</option>
              </select>
              <p style={{ fontSize:11, color:'#3b82f6', margin:'4px 0 0' }}>
                Only APPROVED products appear on the public website.
              </p>
            </div>

            {/* Title */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required
                style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                  fontSize:14, outline:'none', boxSizing:'border-box' }}
                placeholder="Product title" />
            </div>

            {/* Category */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Category *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                  background:'#fff', fontSize:14, outline:'none' }}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                  fontSize:14, outline:'none', resize:'none', boxSizing:'border-box' }}
                placeholder="Product description..." />
            </div>

            {/* Price & Condition */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Price (₹) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="1"
                  style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                    fontSize:14, outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Condition *</label>
                <select name="condition" value={form.condition} onChange={handleChange}
                  style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                    background:'#fff', fontSize:14, outline:'none' }}>
                  <option value="USED">Used</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="NEW">Brand New</option>
                </select>
              </div>
            </div>

            {/* Negotiable */}
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <input type="checkbox" name="isNegotiable" checked={form.isNegotiable} onChange={handleChange}
                style={{ width:16, height:16, accentColor:'#f97316' }} />
              <span style={{ fontSize:14, color:'#374151' }}>Price is negotiable</span>
            </label>

            {/* City & State */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>City *</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} required
                  style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                    fontSize:14, outline:'none', boxSizing:'border-box' }}
                  placeholder="e.g. Chennai" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>State</label>
                <input type="text" name="state" value={form.state} onChange={handleChange}
                  style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                    fontSize:14, outline:'none', boxSizing:'border-box' }}
                  placeholder="e.g. Tamil Nadu" />
              </div>
            </div>

            {/* Full Location */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Full Location *</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} required
                style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                  fontSize:14, outline:'none', boxSizing:'border-box' }}
                placeholder="e.g. Anna Nagar, Chennai" />
            </div>

            {/* Contact */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Contact Phone</label>
                <input type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange}
                  style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                    fontSize:14, outline:'none', boxSizing:'border-box' }}
                  placeholder="+91 9999999999" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6b7280',
                  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Contact Email</label>
                <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange}
                  style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'9px 12px',
                    fontSize:14, outline:'none', boxSizing:'border-box' }}
                  placeholder="contact@email.com" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 24px',
            borderTop:'1px solid #eee', flexShrink:0, background:'#f9fafb',
            borderRadius:'0 0 16px 16px' }}>
            <button type="submit" disabled={saving}
              style={{ background: saving ? '#fdba74' : '#f97316', color:'#fff', fontWeight:700,
                padding:'10px 24px', borderRadius:8, border:'none', cursor: saving ? 'not-allowed' : 'pointer',
                fontSize:14, transition:'background 0.2s' }}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              style={{ background:'#fff', color:'#374151', padding:'10px 20px', borderRadius:8,
                border:'1px solid #d1d5db', cursor:'pointer', fontSize:14 }}>
              Cancel
            </button>
            <Link href={`/products/${product.id}`} target="_blank"
              style={{ marginLeft:'auto', fontSize:12, color:'#3b82f6', textDecoration:'none' }}>
              👁️ View on site →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminProductsContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [pagination,  setPagination]  = useState({ page:1, pages:1, total:0 });
  const [actioning,   setActioning]   = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const status = searchParams.get('status') || 'ALL';
  const page   = Number(searchParams.get('page') || 1);

  // Load categories once (for the modal dropdown)
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (d.success) setCategories(d.data);
    });
  }, []);

  // Load products when filter/page changes
  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status !== 'ALL') params.set('status', status);
    fetch(`/api/admin/products?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setProducts(d.data.products); setPagination(d.data.pagination); }
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, [status, page]);

  // Approve / Reject quick actions
  async function handleAction(id, action) {
    setActioning(id);
    try {
      const res  = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Product ${action.toLowerCase()}`);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: action } : p));
      } else toast.error(json.message);
    } catch { toast.error('Action failed'); }
    finally   { setActioning(null); }
  }

  // After modal saves — update row in table without reload
  function handleSaved(updated) {
    setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
  }

  function setFilter(s) {
    const p = new URLSearchParams();
    if (s !== 'ALL') p.set('status', s);
    router.push(`/admin/products?${p}`);
  }

  return (
    <div className="space-y-4">

      {/* Edit Modal — renders on top when editProduct is set */}
      {editProduct && (
        <EditModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <span className="text-sm text-gray-500">{pagination.total} total</span>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm p-2 overflow-x-auto">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
              status === s || (s === 'ALL' && !searchParams.get('status'))
                ? 'bg-[#002f34] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No products found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Seller</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.images?.[0]?.url
                            ? <Image src={p.images[0].url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">📦</div>}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/products/${p.id}`} target="_blank"
                            className="font-medium text-gray-900 hover:text-primary-600 truncate block max-w-[180px]">
                            {p.title}
                          </Link>
                          <span className="text-xs text-gray-400">{p.city}</span>
                        </div>
                      </div>
                    </td>
                    {/* Seller */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-gray-900">{p.user?.name}</div>
                      <div className="text-xs text-gray-400">{p.user?.email}</div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{p.category?.name}</td>
                    {/* Price */}
                    <td className="px-4 py-3 text-right font-medium">
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {p.status !== 'APPROVED' && (
                          <button onClick={() => handleAction(p.id, 'APPROVED')} disabled={actioning === p.id}
                            className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            ✓ Approve
                          </button>
                        )}
                        {p.status !== 'REJECTED' && (
                          <button onClick={() => handleAction(p.id, 'REJECTED')} disabled={actioning === p.id}
                            className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            ✕ Reject
                          </button>
                        )}
                        {/* Edit button — opens modal */}
                        <button
                          onClick={() => setEditProduct(p)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-2.5 py-1.5 rounded-lg transition-colors">
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(p));
                router.push(`/admin/products?${params}`);
              }}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                p === page ? 'bg-[#002f34] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-500'
              }`}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8 text-center text-gray-500">Loading...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}