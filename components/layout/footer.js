"use client";

import { useState, useEffect } from "react";
import Link from 'next/link'
import Image from 'next/image'
import TextType from "@/components/TextType";

const styles = {
  footer: {
    background: "#e4cba4",
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
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
    cursor: "pointer"
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
    background: "#e4cba4",
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
  { label: "f", title: "Facebook" },
  { label: "in", title: "LinkedIn" },
  { label: "X", title: "Twitter / X" },
  { label: "ig", title: "Instagram" },
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
              src="/TPOM-LOGO-1.png"
              alt="tpom logo"
              width={100}
              height={100}
              priority
            />
          </Link>
          <p style={styles.tagline}>
            India's most popular classifieds. Buy &amp; sell anything — fast and free.
          </p>
          <div style={styles.socialRow}>
            {socialIcons.map((s) => (
              <a
                key={s.title}
                href="#"
                title={s.title}
                style={{
                  ...styles.socialBtn,
                  backgroundColor: hoveredSocial === s.title ? "rgba(255,255,255,0.12)" : "transparent",
                  borderColor: hoveredSocial === s.title ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                }}
                onMouseEnter={() => setHoveredSocial(s.title)}
                onMouseLeave={() => setHoveredSocial(null)}
              >
                <span style={{ fontSize: "11px", fontWeight: "700" }}>{s.label}</span>
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