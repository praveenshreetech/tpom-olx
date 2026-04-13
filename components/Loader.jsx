"use client";

import { useEffect, useRef, useState } from "react";

const LETTERS = [
  { char: "T", wordIdx: 0, charIdx: 0 },
  { char: "P", wordIdx: 1, charIdx: 0 },
  { char: "O", wordIdx: 1, charIdx: 4 },
  { char: "M", wordIdx: 2, charIdx: 0 },
];

const FULL_WORDS = ["The", "Pre-Owned", "Market"];

const T_HIGHLIGHT_STEP = 400;
const T_DRIFT_START    = 1900;
const T_TEXT_FADE      = 2000;
const T_INITIALS_FADE  = 2200;
const T_LOGO_IN        = 2500;
const T_FADEOUT        = 3000;
const T_COMPLETE       = 3500;

export default function TPOMLoader({ logoSrc = "/tpom-logo.png", onComplete }) {
  const [highlightIdx, setHighlightIdx]   = useState(-1);
  const [textFaded, setTextFaded]         = useState(false);
  const [drifting, setDrifting]           = useState(false);
  const [initialsFaded, setInitialsFaded] = useState(false);
  const [logoVisible, setLogoVisible]     = useState(false);
  const [fadeOut, setFadeOut]             = useState(false);

  // refs to each highlighted letter span in the sentence
  const letterRefs = useRef({});
  // refs to the floating clones
  const cloneRefs  = useRef({});
  // ref to the sentence container (to get its rect)
  const sentenceRef = useRef(null);

  useEffect(() => {
    const timers = [];
    const add = (fn, ms) => timers.push(setTimeout(fn, ms));

    LETTERS.forEach((_, i) =>
      add(() => setHighlightIdx(i), i * T_HIGHLIGHT_STEP + 300)
    );

    add(() => {
      // Snapshot positions of each highlighted letter and move clones
      LETTERS.forEach(({ char, wordIdx, charIdx }) => {
        const key = `${wordIdx}-${charIdx}`;
        const originEl = letterRefs.current[key];
        const cloneEl  = cloneRefs.current[key];
        if (!originEl || !cloneEl) return;

        const rect = originEl.getBoundingClientRect();
        // set clone to exact position of original letter
        cloneEl.style.left     = `${rect.left}px`;
        cloneEl.style.top      = `${rect.top}px`;
        cloneEl.style.width    = `${rect.width}px`;
        cloneEl.style.height   = `${rect.height}px`;
        cloneEl.style.fontSize = window.getComputedStyle(originEl).fontSize;
        cloneEl.style.opacity  = "1";
      });

      // small delay so browser paints the start position before transition
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

  // Target position for each clone when drifting
  const targetTop  = "clamp(14px, 3vw, 36px)";
  const targetLeft = (idx) => `calc(clamp(14px, 3vw, 36px) + ${idx} * clamp(10px, 1.6vw, 20px))`;

  return (
    <div style={styles.overlay(fadeOut)}>
      <style>{css}</style>

      {/* ── Sentence — stays centred, fades out in place ── */}
      <div ref={sentenceRef} style={styles.sentenceWrap(textFaded)}>
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

      {/* ── Floating clones of T P O M — fly from sentence to top-left ── */}
      {LETTERS.map(({ char, wordIdx, charIdx }, idx) => {
        const key = `${wordIdx}-${charIdx}`;
        return (
          <span
            key={key}
            ref={(el) => { cloneRefs.current[key] = el; }}
            style={{
              position:   "fixed",
              opacity:    0,             // hidden until drift starts
              fontFamily: "'Georgia', serif",
              fontStyle:  "italic",
              fontWeight: 700,
              color:      "#1c5536",
              lineHeight: 1,
              pointerEvents: "none",
              zIndex:     10000,
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              // animate to top-left when drifting
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
  alignItems:     "center",
  justifyContent: "center",
  flexWrap:       "nowrap",           // ← was "wrap"
  gap:            "clamp(10px, 1.5vw, 28px)",  // ← tighter
  padding:        "0 4vw",
  opacity:        faded ? 0 : 1,
  transition:     "opacity 0.4s ease",
  pointerEvents:  "none",
  overflow:       "hidden",           // ← added
}),

  word: {
  display:       "inline-flex",
  fontFamily:    "'Georgia', serif",
  fontStyle:     "italic",
  fontWeight:    700,
  fontSize:      "clamp(25px, 5vw, 88px)",  // ← was clamp(28px, 6.5vw, 88px)
  color:         "rgba(26, 92, 56, 0.6)",
  letterSpacing: "2px",
  lineHeight:    1,
  whiteSpace:    "nowrap",
  flexShrink:    1,                          // ← added
},

  char: (isActive) => ({
    display:    "inline-block",
    color:      isActive ? "#1c5536" : "rgba(26, 92, 56, 0.6)",
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
    width:      "clamp(120px, 18vw, 140px)",
    height:     "auto",
    objectFit:  "contain",
    userSelect: "none",
  },

  progressBar: {
    position: "absolute",
    bottom:   "clamp(10px, 2.2vh, 22px)",
    left:     0,
    right:    0,
    display:  "flex",
    gap:      "3px",
    padding:  "0 clamp(14px, 3vw, 36px)",
  },

  dash: (active, idx) => ({
    height:          "3px",
    flex:            1,
    borderRadius:    "2px",
    background:      active ? (idx % 3 === 2 ? "#1a5c38" : "#a8c5b5") : "#e0e0e0",
    transform:       active ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: "left center",
    transition:      active
      ? `transform 0.15s ease ${idx * 28}ms, background 0.2s ease ${idx * 28}ms`
      : "none",
  }),
};

const css = `
  @keyframes tpom-pulse {
    0%   { text-shadow: 0 0 0px #1c5536; }
    50%  { text-shadow: 0 0 18px #1c553688; }
    100% { text-shadow: 0 0 0px #1c5536; }
  }
  .tpom-pulse { animation: tpom-pulse 0.6s ease; }
`;