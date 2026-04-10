"use client";

import { useEffect, useState } from "react";

export default function TextType({
  text = [],
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "|",
  loop = true,
  as: Component = "span",
}) {
  const textArray = Array.isArray(text) ? text : [text];

  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;

    const currentText = textArray[textIndex];

    if (!isDeleting) {
      if (charIndex < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) =>
          loop ? (prev + 1) % textArray.length : prev
        );
      }
    }

    return () => clearTimeout(timeout);
  }, [
    charIndex,
    isDeleting,
    textArray,
    textIndex,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
  ]);

  return (
    <Component>
      {displayedText}
      {showCursor && cursorCharacter}
    </Component>
  );
}