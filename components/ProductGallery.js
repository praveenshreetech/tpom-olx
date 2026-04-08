'use client'
import { useState } from 'react'
import styles from '@/app/products/[id]/page.module.css'

export default function ProductGallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImg}>
          <div className={styles.noImg}>No Image</div>
        </div>
      </div>
    )
  }

  const next = () => setActiveIndex((activeIndex + 1) % images.length)
  const prev = () => setActiveIndex((activeIndex - 1 + images.length) % images.length)

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImg}>
        <img src={images[activeIndex].image_url} alt={title} />
        
        {images.length > 1 && (
          <>
            <button className={styles.navBtnPrev} onClick={prev}>❮</button>
            <button className={styles.navBtnNext} onClick={next}>❯</button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img.image_url}
              alt={`Thumbnail ${i + 1}`}
              className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ''}`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}