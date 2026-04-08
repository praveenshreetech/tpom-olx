import SellerForm from '@/components/SellerForm'
import styles from './page.module.css'

export const metadata = { title: 'Sell With Us — Marketplace' }

export default function ContactPage() {
  const adminWA = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || ''
  const waMsg = encodeURIComponent(
    `Hi! I want to list my product on Marketplace.\n\nProduct: \nPrice: \nLocation: \nPhone: `
  )
  const waLink = `https://wa.me/${adminWA}?text=${waMsg}`

  return (
    <div className={styles.tabContainer}>
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className={styles.header}>
        <span className={styles.tag}>Sell With Us</span>
        <h1 className={styles.title}>List Your <span className="accent">Product</span></h1>
        <p className={styles.sub}>
          Submit your product details below or ping us on WhatsApp.<br />
          Our admin will review and publish your listing — usually within a few hours.
        </p>
      </div>

      <div className={styles.layout}>
        {/* Form column */}
        <div>
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>
              Fill the Form
            </h2>
            <p className={styles.cardSub}>We'll contact you after reviewing your submission.</p>
            <SellerForm />
          </div>
        </div>

        {/* WhatsApp column */}
        <div className={styles.rightCol}>
          <div className={styles.waCard}>
            <div className={styles.waIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#25d366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <h2 className={styles.cardTitle}>
              WhatsApp Us
            </h2>
            <p className={styles.cardSub}>
              Prefer to chat? Send us your product details directly on WhatsApp and we'll list it for you.
            </p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`btn btn-whatsapp ${styles.waBtn}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp
            </a>

            <div className={styles.howBox}>
              <p className={styles.howTitle}>How it works</p>
              <ol className={styles.howList}>
                <li>Submit the form <strong>or</strong> message us on WhatsApp</li>
                <li>Admin reviews your product details</li>
                <li>We publish your listing on the marketplace</li>
                <li>Buyers contact us — we connect you</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
