"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLoaderDone } from "@/context/LoaderContext";

export default function BlurText({
  text = "",
  delay = 150,
  className = "",
  direction = "top",
  animateBy = "words",
  onAnimationComplete,
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const loaderDone = useLoaderDone();

  // Split text into words
  const elements =
    animateBy === "words" ? text.split(" ") : text.split("");

  useEffect(() => {
    if (!ref.current) return;
    if (!loaderDone) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [loaderDone]);

  return (
    <span ref={ref} className={className}>
      {elements.map((word, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: "blur(10px)",
            y: direction === "top" ? -40 : 40,
          }}
          animate={
            inView
              ? {
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.5,
            delay: index * (delay / 1000),
          }}
          onAnimationComplete={
            index === elements.length - 1
              ? onAnimationComplete
              : undefined
          }
          style={{
            marginRight: animateBy === "words" ? "8px" : "0px",
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}