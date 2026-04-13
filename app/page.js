import Link from 'next/link'
import { Suspense } from 'react'
import { getAllProducts, getCategories } from '@/lib/queries'
import SearchBar from '@/components/SearchBar'
import BlurText from "@/components/BlurText";
import styles from './page.module.css'

export const revalidate = 60 // ISR: refresh every 60s

export default async function HomePage({ searchParams }) {
  const { category, search } = searchParams || {}
  const [products, categories] = await Promise.all([
    getAllProducts({ category, search }),
    getCategories(),
  ])

  return (
    <div className={styles.tabContainer}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.heroTag}>🛒 Buy &amp; Sell</p>
          <h1 className={styles.heroTitle}>
            <BlurText
              text="Sell"
              delay={550}
              animateBy="words"
              direction="top"
            />
            <span className="accent"> Easily</span>
            <br />

            <BlurText
              text="Buy"
              delay={500}
              animateBy="words"
              direction="top"
            />

            <span className="accent"> Happily</span>
          </h1>
          {/* <Suspense fallback={<div className={styles.searchPlaceholder} />}>
            <SearchBar />
          </Suspense> */}
        </div>
      </section>

      {/* Category pills */}
      <section className={styles.catSection}>
        <div className={`container ${styles.catRow}`}>
          <Link href="/" className={`${styles.catPill} ${!category ? styles.catActive : ''}`}>All</Link>
          {categories.map(c => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}`}
              className={`${styles.catPill} ${category === c.slug ? styles.catActive : ''}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section className={styles.gridSection}>
        <div className="container">
          <div className={styles.gridHeader}>
            <h2 className={styles.sectionTitle}>
              {search ? `Results for "${search}"` : category ? `${category.replace('-', ' ')}` : 'Latest Listings'}
            </h2>
            <span className={styles.count}>{products.length} items</span>
          </div>

          {products.length === 0 ? (
            <div className={styles.empty}>
              <p>No products found.</p>
              <Link href="/" className="btn btn-outline" style={{ marginTop: 16 }}>Clear filters</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className={`card ${styles.productCard}`}>
                  <div className={styles.imgWrap}>
                    {p.primary_image
                      ? <img src={p.primary_image} alt={p.title} />
                      : <div className={styles.noImg}>No Image</div>}
                    {/* THIS IS THE NEW BADGE LINE */}
                    {p.images_count > 1 && (
                      <div className={styles.imgBadge}>+{p.images_count - 1}</div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    {p.category && <span className={styles.catLabel}>{p.category}</span>}
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <div className={styles.cardFooter}>
                      <span className={styles.price}>
                        {p.price > 0 ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Contact for price'}
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
    </div>
  )
}
