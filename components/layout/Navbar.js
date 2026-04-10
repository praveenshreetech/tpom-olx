'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import styles from './Navbar.module.css'

export default function Navbar() {
  const path = usePathname()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>

        <Link href="/" className={styles.logo}>
          <Image src="/images/tpom-logo.png"alt="tpom logo" width={100} height={100} priority />
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={path === '/' ? styles.active : ''}>Browse</Link>
          <Link href="/contact" className={path === '/contact' ? styles.active : ''}>Sell With Us</Link>
        </nav>

        <Link href="/contact" className="btn btn-primary" style={{fontSize:12, fontWeight:500, padding:'8px 18px'}}>
          + List Your Product
        </Link>

      </div>
    </header>
  )
}