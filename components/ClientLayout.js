"use client";

import { useState } from "react";
import TPOMLoader from "@/components/Loader";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import FooterWrapper from "@/components/layout/Footerwrapper";

export default function ClientLayout({ children }) {
  const [done, setDone] = useState(false);

  return (
    <>
      {!done && (
        <TPOMLoader
          logoSrc="/tpom-logo.png"
          onComplete={() => setDone(true)}
        />
      )}
      <div style={{ visibility: done ? "visible" : "hidden" }}>
        <NavbarWrapper />
        <main>{children}</main>
        <FooterWrapper />
      </div>
    </>
  );
}