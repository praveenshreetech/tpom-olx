"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./globals.css";

import NavbarWrapper from "@/components/layout/NavbarWrapper";
import FooterWrapper from "@/components/layout/Footerwrapper";

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body>
        {loading ? (
          <div className="loader-screen">
            <Image
              src="/loader.gif"
              alt="Loading..."
              width={100}
              height={100}
              className="loader-gif"
              priority
            />
          </div>
        ) : (
          <>
            <NavbarWrapper />
            <main>{children}</main>
            <FooterWrapper />
          </>
        )}
      </body>
    </html>
  );
}