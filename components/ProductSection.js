'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '@/app/page.module.css'

export default function ProductSection({ initialProducts, categories, searchParam }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)

  const CATEGORY_ORDER = ['bikes', 'cars', 'real-estate', 'home-appliances']

  const sortedCategories = [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug)
    const bi = CATEGORY_ORDER.indexOf(b.slug)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  const fetchFilteredProducts = async (cat, type) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cat) params.set('category', cat)
      if (type) params.set('type', type)
      if (searchParam) params.set('search', searchParam)

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (slug) => {
    if (activeCategory === slug) return
    setActiveCategory(slug)
    setActiveType(null)
    fetchFilteredProducts(slug, null)
  }

  const handleTypeClick = (type) => {
    if (activeType === type) return
    setActiveType(type)
    fetchFilteredProducts(activeCategory, type)
  }

  // Update products if searchParam changes from URL
  useEffect(() => {
    fetchFilteredProducts(activeCategory, activeType)
  }, [searchParam])

  return (
    <>
      {/* Category pills */}
      <section className={styles.catSection}>
        <div className={`container ${styles.catRow}`}>
          <button 
            onClick={() => handleCategoryClick(null)}
            className={`${styles.catPill} ${!activeCategory ? styles.catActive : ''}`}
            style={{ cursor: 'pointer' }}
          >
            All
          </button>
          {sortedCategories.map(c => (
            <button
              key={c.id}
              onClick={() => handleCategoryClick(c.slug)}
              className={`${styles.catPill} ${activeCategory === c.slug ? styles.catActive : ''}`}
              style={{ cursor: 'pointer' }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Sub-tabs for Real Estate */}
      {activeCategory === 'real-estate' && (
        <section className={styles.subCatSection} style={{ marginBottom: 20 }}>
          <div className={`container ${styles.catRow}`} style={{ marginTop: 30, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button 
              onClick={() => handleTypeClick(null)}
              className={`${styles.catPill} ${!activeType ? styles.catActive : ''}`} 
              style={{ fontSize: '0.85rem', padding: '6px 18px', height: 'auto', minHeight: 'unset', cursor: 'pointer' }}
            >
              All
            </button>
            <button 
              onClick={() => handleTypeClick('Sale')}
              className={`${styles.catPill} ${activeType === 'Sale' ? styles.catActive : ''}`} 
              style={{ fontSize: '0.85rem', padding: '6px 18px', height: 'auto', minHeight: 'unset', cursor: 'pointer' }}
            >
              Sale
            </button>
            <button 
              onClick={() => handleTypeClick('Rent')}
              className={`${styles.catPill} ${activeType === 'Rent' ? styles.catActive : ''}`} 
              style={{ fontSize: '0.85rem', padding: '6px 18px', height: 'auto', minHeight: 'unset', cursor: 'pointer' }}
            >
              Rent
            </button>
          </div>
        </section>
      )}

      {/* Products grid */}
      <section className={styles.gridSection}>
        <div className="container">
          <div className={styles.gridHeader}>
            <h2 className={styles.sectionTitle}>
              {searchParam ? `Results for "${searchParam}"` : activeCategory ? `${activeCategory.replace('-', ' ')}` : 'Latest Listings'}
            </h2>
            <span className={styles.count}>{loading ? '...' : products.length} items</span>
          </div>

          {loading ? (
             <div className={styles.empty} style={{ padding: '80px 0' }}>
               <p>Loading listings...</p>
             </div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <p>No products found.</p>
              <button onClick={() => { setActiveCategory(null); setActiveType(null); fetchFilteredProducts(null, null); }} className="btn btn-outline" style={{ marginTop: 16, border: '1px solid #ddd', padding: '8px 16px', borderRadius: 8 }}>Clear filters</button>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className={`card ${styles.productCard}`}>
                  <div className={styles.imgWrap}>
                    {p.primary_image
                      ? <img src={p.primary_image} alt={p.title} />
                      : <div className={styles.noImg}>No Image</div>}
                    {p.images_count > 1 && (
                      <div className={styles.imgBadge}>+{p.images_count - 1}</div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    {p.category && <span className={styles.catLabel}>{p.category}</span>}
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <div className={styles.cardFooter}>
                      <span className={styles.price}>
                        {parseFloat(p.price) > 0 ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Contact for price'}
                      </span>
                      {p.location && <span className={styles.loc}>📍 {p.location}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
