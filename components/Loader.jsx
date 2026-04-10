"use client";

import { useEffect, useRef } from "react";

export default function Loader({ onFinish }) {
  const sceneRef = useRef(null);
  const lettersRef = useRef([]);

  const text = "The Pre-Owned Market";

  const clamp = (min, val, max) => {
    return Math.min(Math.max(val, min), max);
  };

  useEffect(() => {
    const scene = sceneRef.current;
    const letters = [];

    const createLetters = () => {
      const spacing = clamp(28, window.innerWidth * 0.042, 52);
      const totalWidth = text.length * spacing;
      const start = window.innerWidth / 2 - totalWidth / 2;

      [...text].forEach((char, i) => {
        const el = document.createElement("div");
        el.className = "letter";
        el.innerText = char;
        el.style.left = `${start + i * spacing}px`;
        el.style.top = "50%";

        if ("TPOM".includes(char) && char !== " ") {
          el.style.color = "#F5C518";
        } else {
          el.style.color = char === " " ? "transparent" : "#ffffff";
        }

        scene.appendChild(el);
        letters.push(el);
      });

      lettersRef.current = letters;
    };

    const animate = () => {
      letters.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = "translate(-50%, -50%) scale(1)";
        }, i * 80);
      });

      setTimeout(() => {
        document.getElementById("road").style.opacity = "1";
      }, letters.length * 80 + 100);

      setTimeout(() => {
        letters.forEach((el) => {
          const char = el.innerText;

          if ("TPOM".includes(char) && char !== " ") {
            const rect = el.getBoundingClientRect();

            const targets = { T: 20, P: 42, O: 64, M: 86 };
            const targetX = targets[char];
            const targetY = 20;

            const dx = targetX - rect.left;
            const dy = targetY - rect.top;

            el.style.transition =
              "transform 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.8s ease";

            el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.28)`;
          } else {
            el.style.opacity = "0";
          }
        });
      }, 2000);

      setTimeout(() => {
        letters.forEach((el) => {
          el.style.opacity = "0";
        });

        document.getElementById("corner").style.opacity = "1";
        document.getElementById("tagline").style.opacity = "1";
      }, 2900);

      setTimeout(() => {
        onFinish();
      }, 4400);
    };

    createLetters();
    animate();
  }, [onFinish]);

  return (
    <div className="loader-wrapper">
      <div className="scene" ref={sceneRef}></div>

      <div className="corner" id="corner">
        <span>T</span>
        <span>P</span>
        <span>O</span>
        <span>M</span>
      </div>

      <div className="tagline" id="tagline">
        The Pre-Owned Market
      </div>

      <div className="road" id="road">
        <div className="dash"></div>
      </div>
    </div>
  );
}