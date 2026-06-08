"use client";

import { useState, useEffect } from "react";
import Link from 'next/link'
import Image from 'next/image'
import TextType from "@/components/TextType";

const styles = {
  footer: {
    background: "#c4ab84",
    color: "#fff",
    paddingTop: "56px",
    position: "relative",
    overflow: "hidden"
  },

  topSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "44px",
    paddingBottom: "48px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    marginBottom: "20px"
  },

  brandColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  appColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  logo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "4px"
  },
  logoImg: {
    width: "100px",
    height: "100px",
    objectFit: "contain",   // camelCase in JS
    flexShrink: 0
  },

  logoOlx: {
    fontFamily: "DM Serif Display, serif",
    fontSize: "32px",
    fontWeight: "400",
    lineHeight: "1",
    color: "#fff",
    letterSpacing: "-0.02em"
  },

  logoTm: {
    fontSize: "11px",
    color: "#fff",
    marginTop: "4px",
    fontWeight: "500"
  },

  tagline: {
    fontSize: "13.5px",
    color: "#fff",
    lineHeight: "1.6",
    maxWidth: "210px"
  },

  columnTitle: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1.4px",
    color: "#fff",
    marginBottom: "4px"
  },

  link: {
    fontSize: "14px",
    color: "#fff",
    textDecoration: "none",
    lineHeight: "1.5",
    transition: "color 0.15s ease"
  },

  socialRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px"
  },

  socialBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    backgroundImage: "none",
    cursor: "pointer",
    transition: "all 0.25s ease-in-out"
  },

  appBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "11px 15px",
    textDecoration: "none",
    color: "#fff"
  },

  appBadgeIcon: {
    fontSize: "18px",
    width: "22px",
    textAlign: "center"
  },

  appBadgeText: {
    display: "flex",
    flexDirection: "column"
  },

  appBadgeSmall: {
    fontSize: "10px",
    color: "#fff"
  },

  appBadgeBig: {
    fontSize: "14px",
    fontWeight: "600"
  },

  divider: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    margin: "24px 0"
  },

  midSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px"
  },

  popularTag: {
    fontSize: "12px",
    padding: "5px 14px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    cursor: "default"
  },

  bottomBar: {
    background: "#c4ab84",
    padding: "20px 0"
  },

  bottomInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gridTemplateRows: "auto auto",
    alignItems: "center",
    gap: "8px"
  },
  poweredText: {
    fontSize: "12px",
    color: "#ffff",
    textAlign: "center"
  },

  copyright: {
    fontSize: "12.5px",
    color: "#ffff"
  },

  legalLinks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },

  legalLink: {
    fontSize: "12.5px",
    padding: "2px 8px",
    textDecoration: "none"
  },

  flagRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12.5px",
    color: "#ffff"
  }
};

const popularSearches = [
  "Mobile Phones", "Cars", "Bikes", "Laptops", "Houses for Rent",
  "Jobs", "Furniture", "Electronics", "Clothes", "Refrigerators",
];

const footerLinks = {
  "OUR SERVICES": ["Buy Products", "Sell Products", "Product Listings", "Secure Payments", "Customer Support"],
  "SUPPORT": ["Help Center", "Safety Tips", "Report a Issue", "Privacy Policy", "Contact Us"],
};

const socialIcons = [
  {
    title: "Facebook",
    link: "https://www.facebook.com/share/1Doz5n77mF/",
    style: {
      backgroundColor: "#1877F2",
      borderColor: "#1877F2",
    },
    hoverStyle: {
      backgroundColor: "#145dbf",
      borderColor: "#145dbf",
      transform: "translateY(-3px)",
      boxShadow: "0 4px 12px rgba(24, 119, 242, 0.4)",
    },
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  },
  // {
  //   title: "Youtube",
  //   link: "https://www.youtube.com/channel/UC4J_ltCuCr4ZDM0krL23nbg",
  //   style: {
  //     backgroundColor: "#FF0000",
  //     borderColor: "#FF0000",
  //   },
  //   hoverStyle: {
  //     backgroundColor: "#cc0000",
  //     borderColor: "#cc0000",
  //     transform: "translateY(-3px)",
  //     boxShadow: "0 4px 12px rgba(255, 0, 0, 0.4)",
  //   },
  //   icon: (
  //     <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
  //       <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  //     </svg>
  //   )
  // },
  {
    title: "Instagram",
    link: "https://www.instagram.com/tpommadurai?igsh=MWk0ZzQwdnp3NTR0dQ==",
    style: {
      backgroundColor: "transparent",
      backgroundImage: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      borderColor: "transparent",
    },
    hoverStyle: {
      backgroundColor: "transparent",
      backgroundImage: "linear-gradient(45deg, #f5a044 0%, #eb764b 25%, #e13751 50%, #d13271 75%, #c12592 100%)",
      borderColor: "transparent",
      transform: "translateY(-3px)",
      boxShadow: "0 4px 12px rgba(225, 48, 108, 0.4)",
    },
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    )
  }
];

export default function OLXFooter() {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [hoveredBadge, setHoveredBadge] = useState(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    @media (max-width: 640px) {
      .olx-footer-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 28px 20px !important;
      }
      .olx-brand-col { grid-column: 1 / -1; }
      .olx-app-col   { grid-column: 1 / -1; }
    }
  `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);


  return (
    <footer style={styles.footer}>
      {/* Top grid */}
      <div style={styles.topSection} className="olx-footer-grid">
        <div style={styles.brandColumn} className="olx-brand-col">
          <Link href="/" className={styles.logo}>
            <Image
              className={styles.logoImg}
              src="/tpom-logo.webp"
              alt="tpom logo"
              width={200}
              height={100}
              priority
            />
          </Link>
          <p style={styles.tagline}>
            India's most popular classifieds. Buy &amp; sell anything — fast and free.
          </p>
          <div style={styles.socialRow}>
            {socialIcons.map((s) => (
              <a target="_blank"
                rel="noopener noreferrer"
                key={s.title}
                href={s.link}
                title={s.title}
                style={{
                  ...styles.socialBtn,
                  ...s.style,
                  ...(hoveredSocial === s.title ? s.hoverStyle : {}),
                }}
                onMouseEnter={() => setHoveredSocial(s.title)}
                onMouseLeave={() => setHoveredSocial(null)}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} style={styles.column}>
            <p style={styles.columnTitle}>{title}</p>
            {links.map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  ...styles.link,
                  color: hoveredLink === link ? "#ffffff" : "#fff",
                }}
                onMouseEnter={() => setHoveredLink(link)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link}
              </a>
            ))}
          </div>
        ))}

        {/* App downloads */}
        <div style={styles.appColumn} className="olx-app-col">
          <p style={styles.columnTitle}>Get the App</p>
          {[
            { icon: "", store: "App Store", sub: "Download on the" },
            { icon: "▶", store: "Google Play", sub: "Get it on" },
          ].map((app) => (
            <a
              key={app.store}
              href="#"
              style={{
                ...styles.appBadge,
                backgroundColor:
                  hoveredBadge === app.store
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.07)",
              }}
              onMouseEnter={() => setHoveredBadge(app.store)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <span style={styles.appBadgeIcon}>{app.icon}</span>
              <div style={styles.appBadgeText}>
                <span style={styles.appBadgeSmall}>{app.sub}</span>
                <span style={styles.appBadgeBig}>{app.store}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomInner}>

          <span style={styles.copyright}>
            © {new Date().getFullYear()} tpom Group. All rights reserved.
          </span>

          <div style={{ ...styles.flagRow, justifySelf: "end" }}>
            <span style={{ fontSize: "16px" }}>🇮🇳</span>
            <span>India</span>
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center"
            }}
          >
            <p style={styles.poweredText}>
              <a
                href="https://shreetechhub.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TextType
                  text={[
                    "Powered by shreetechhub.com || Web Development • Mobile Apps • IT Services"
                  ]}
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                />
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}