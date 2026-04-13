"use client";

import { useEffect, useRef, useState } from "react";

const LETTERS = [
  { char: "T", wordIdx: 0, charIdx: 0 },
  { char: "P", wordIdx: 1, charIdx: 0 },
  { char: "O", wordIdx: 1, charIdx: 4 },
  { char: "M", wordIdx: 2, charIdx: 0 },
];

const FULL_WORDS = ["The", "Pre-Owned", "Market"];
const SUBTITLE = "Cars · Bikes · Real Estate · Home Appliances";

const T_HIGHLIGHT_STEP = 400;
const T_DRIFT_START    = 1900;
const T_TEXT_FADE      = 2000;
const T_INITIALS_FADE  = 2200;
const T_LOGO_IN        = 2500;
const T_FADEOUT        = 3000;
const T_COMPLETE       = 3500;

export default function TPOMLoader({ logoSrc = "/TPOM-LOGO.JPEG", onComplete }) {
  const [highlightIdx, setHighlightIdx]   = useState(-1);
  const [textFaded, setTextFaded]         = useState(false);
  const [drifting, setDrifting]           = useState(false);
  const [initialsFaded, setInitialsFaded] = useState(false);
  const [logoVisible, setLogoVisible]     = useState(false);
  const [fadeOut, setFadeOut]             = useState(false);

  const letterRefs  = useRef({});
  const cloneRefs   = useRef({});
  const sentenceRef = useRef(null);

  useEffect(() => {
    const timers = [];
    const add = (fn, ms) => timers.push(setTimeout(fn, ms));

    LETTERS.forEach((_, i) =>
      add(() => setHighlightIdx(i), i * T_HIGHLIGHT_STEP + 300)
    );

    add(() => {
      LETTERS.forEach(({ wordIdx, charIdx }) => {
        const key = `${wordIdx}-${charIdx}`;
        const originEl = letterRefs.current[key];
        const cloneEl  = cloneRefs.current[key];
        if (!originEl || !cloneEl) return;

        const rect = originEl.getBoundingClientRect();
        cloneEl.style.left     = `${rect.left}px`;
        cloneEl.style.top      = `${rect.top}px`;
        cloneEl.style.width    = `${rect.width}px`;
        cloneEl.style.height   = `${rect.height}px`;
        cloneEl.style.fontSize = window.getComputedStyle(originEl).fontSize;
        cloneEl.style.opacity  = "1";
      });

      requestAnimationFrame(() => requestAnimationFrame(() => {
        setDrifting(true);
      }));
    }, T_DRIFT_START);

    add(() => setTextFaded(true),      T_TEXT_FADE);
    add(() => setInitialsFaded(true),  T_INITIALS_FADE);
    add(() => setLogoVisible(true),    T_LOGO_IN);
    add(() => setFadeOut(true),        T_FADEOUT);
    add(() => onComplete?.(),          T_COMPLETE);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const targetTop  = "clamp(14px, 3vw, 36px)";
  const targetLeft = (idx) => `calc(clamp(14px, 3vw, 36px) + ${idx} * clamp(10px, 1.6vw, 20px))`;

  return (
    <div style={styles.overlay(fadeOut)}>
      <style>{css}</style>

      {/* ── Sentence — column layout: words row + subtitle below ── */}
      <div ref={sentenceRef} style={styles.sentenceWrap(textFaded)}>

        {/* Main words row */}
        <div style={styles.wordsRow}>
          {FULL_WORDS.map((word, wi) => (
            <span key={wi} style={styles.word}>
              {word.split("").map((ch, ci) => {
                const letterDef   = LETTERS.find(l => l.wordIdx === wi && l.charIdx === ci);
                const isInitial   = !!letterDef;
                const letterOrder = letterDef ? LETTERS.indexOf(letterDef) : -1;
                const isActive    = isInitial && highlightIdx >= letterOrder && letterOrder !== -1;
                const key         = `${wi}-${ci}`;
                return (
                  <span
                    key={ci}
                    ref={isInitial ? (el) => { letterRefs.current[key] = el; } : null}
                    style={styles.char(isActive)}
                    className={isActive ? "tpom-pulse" : ""}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </div>

        {/* Subtitle — new line, smaller font */}
        <div style={styles.subtitle}>
          {SUBTITLE}
        </div>
      </div>

      {/* ── Floating clones of T P O M ── */}
      {LETTERS.map(({ char, wordIdx, charIdx }, idx) => {
        const key = `${wordIdx}-${charIdx}`;
        return (
          <span
            key={key}
            ref={(el) => { cloneRefs.current[key] = el; }}
            style={{
              position:       "fixed",
              opacity:        0,
              fontFamily:     "'Georgia', serif",
              fontStyle:      "italic",
              fontWeight:     700,
              color:          "#fe2722",
              lineHeight:     1,
              pointerEvents:  "none",
              zIndex:         10000,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              ...(drifting ? {
                top:        targetTop,
                left:       targetLeft(idx),
                width:      "clamp(10px, 1.4vw, 18px)",
                height:     "auto",
                fontSize:   "clamp(12px, 1.8vw, 22px)",
                opacity:    initialsFaded ? 0 : 1,
                transition: [
                  "top 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  "left 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  "font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  "width 0.6s ease",
                  "opacity 0.35s ease",
                ].join(", "),
              } : {}),
            }}
          >
            {char}
          </span>
        );
      })}

      {/* ── Logo — top-left, appears after initials fade ── */}
      <div style={styles.logoWrap(logoVisible)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="The Pre-Owned Market"
          style={styles.logo}
          draggable={false}
        />
      </div>
    </div>
  );
}

const styles = {
  overlay: (fading) => ({
    position:      "fixed",
    inset:         0,
    background:    "#fff",
    zIndex:        9999,
    overflow:      "hidden",
    opacity:       fading ? 0 : 1,
    transition:    "opacity 0.55s ease",
    pointerEvents: fading ? "none" : "auto",
  }),

  sentenceWrap: (faded) => ({
    position:       "absolute",
    inset:          0,
    display:        "flex",
    flexDirection:  "column",          // ← column so subtitle sits below
    alignItems:     "center",
    justifyContent: "center",
    gap:            "clamp(6px, 1vw, 14px)",
    padding:        "0 4vw",
    opacity:        faded ? 0 : 1,
    transition:     "opacity 0.4s ease",
    pointerEvents:  "none",
    overflow:       "hidden",
  }),

  wordsRow: {
    display:        "flex",
    flexWrap:       "nowrap",
    alignItems:     "center",
    justifyContent: "center",
    gap:            "clamp(10px, 1.5vw, 28px)",
  },

  word: {
    display:       "inline-flex",
    fontFamily:    "'Georgia', serif",
    fontStyle:     "italic",
    fontWeight:    700,
    fontSize:      "clamp(20px, 4vw, 88px)",      // ← was clamp(25px, 5vw, 88px)
    color:         "#fe2722",
    letterSpacing: "2px",
    lineHeight:    1,
    whiteSpace:    "nowrap",
    flexShrink:    1,
  },

  subtitle: {
    fontFamily:    "'Georgia', serif",
    fontStyle:     "italic",
    fontWeight:    600,
    fontSize:      "clamp(6px, 1.2vw, 20px)",     // ← was clamp(10px, 1.5vw, 20px)
    color:         "#fe2722",
    letterSpacing: "2px",
    textTransform: "uppercase",
    whiteSpace:    "nowrap",
    textAlign:     "center",
  },

  char: (isActive) => ({
    display:    "inline-block",
    color:      "#fe2722",
    transition: "color 0.2s ease",
  }),

  logoWrap: (visible) => ({
    position:      "absolute",
    top:           "clamp(14px, 3vw, 36px)",
    left:          "clamp(14px, 3vw, 36px)",
    opacity:       visible ? 1 : 0,
    transition:    "opacity 0.4s ease",
    pointerEvents: "none",
    lineHeight:    0,
  }),

  logo: {
    width:      "clamp(120px, 18vw, 240px)",
    height:     "auto",
    objectFit:  "contain",
    userSelect: "none",
  },
};

const css = `
  @keyframes tpom-pulse {
    0%   { text-shadow: 0 0 0px #fe2722; }
    50%  { text-shadow: 0 0 18px #fe2722; }
    100% { text-shadow: 0 0 0px #fe2722; }
  }
  .tpom-pulse { animation: tpom-pulse 0.6s ease; }
`;