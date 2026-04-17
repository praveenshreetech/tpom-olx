import Link from 'next/link'
import { Suspense } from 'react'
import { getAllProducts, getCategories } from '@/lib/queries'
import SearchBar from '@/components/SearchBar'
import BlurText from "@/components/BlurText";
import BannerCarousel from "@/components/bannercarousal";
import styles from './page.module.css'

import ProductSection from '@/components/ProductSection'

export const revalidate = 60 // ISR: refresh every 60s

export default async function HomePage({ searchParams }) {
  const { category, search, type } = searchParams || {}
  const [products, categories] = await Promise.all([
    getAllProducts({ category, search, property_type: type }),
    getCategories(),
  ])

  return (
    <div className={styles.tabContainer}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container banner-div">
          <div className={styles.bannerDiv}>
            <div className={styles.bannerleft}>
              <p className={styles.heroTag}>🛒 Buy & Sell</p>
              <h1 className={styles.heroTitle}>
                <BlurText text="Sell" delay={550} animateBy="words" direction="top" />
                <span className="accent">Easily</span>
                <br />
                <BlurText text="Buy" delay={500} animateBy="words" direction="top" />
                <span className="accent">Happily</span>
              </h1>
            </div>
            <div className={styles.bannerRight}>
              <h2><BlurText text="Tpom" delay={550} animateBy="words" direction="top" /><span className="accent">Needs:</span></h2>
              <BannerCarousel />
            </div>
          </div>
        </div>
      </section>

      <ProductSection 
        initialProducts={products} 
        categories={categories} 
        searchParam={search} 
      />
    </div>
  )
}
