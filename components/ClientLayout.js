// ClientLayout.jsx
"use client";

import { useState } from "react";
import TPOMLoader from "@/components/Loader";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import FooterWrapper from "@/components/layout/Footerwrapper";
import { LoaderContext } from "@/context/LoaderContext";

export default function ClientLayout({ children }) {
  const [done, setDone] = useState(false);

  return (
    <>
      {!done && (
        <TPOMLoader logoSrc="/tpom-logo.png" onComplete={() => setDone(true)} />
      )}
      <LoaderContext.Provider value={done}>
      <div style={{
        visibility: done ? "visible" : "hidden",
        opacity: done ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: done ? "auto" : "none",
      }}>
        <NavbarWrapper />
        <main>{children}</main>
        <FooterWrapper />
      </div>
      </LoaderContext.Provider>
    </>
  );
}