import './globals.css'
import NavbarWrapper from '@/components/layout/NavbarWrapper'
import FooterWrapper from '@/components/layout/Footerwrapper'

export const metadata = {
  title: 'tpom - The Product Offer Marketplace',
  description: 'Find great deals on products near you.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper />
        <main>{children}</main>
        <FooterWrapper />
      </body>
    </html>
  )
}