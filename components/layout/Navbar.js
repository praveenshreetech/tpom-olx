'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const path = usePathname()
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          Market<span>place</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={path === '/' ? styles.active : ''}>Browse</Link>
          <Link href="/contact" className={path === '/contact' ? styles.active : ''}>Sell With Us</Link>
        </nav>
        <Link href="/contact" className="btn btn-primary" style={{fontSize:11,padding:'8px 18px'}}>
          + List Your Product
        </Link>
      </div>
    </header>
  )
}
