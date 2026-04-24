import React, { useState, useEffect } from 'react';

const TypewriterHint = ({ phrases = [], typingSpeed = 50, deletingSpeed = 40, pauseDuration = 1500 }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Guard clause: if no phrases provided, don't run the typing effect
    if (!phrases || phrases.length === 0) {
      return;
    }

    if (isFinished) return;

    const handleTyping = () => {
      const currentPhrase = phrases[phraseIndex];

      // Additional safety check
      if (!currentPhrase) {
        return;
      }

      if (isDeleting) {
        // Handle deleting
        if (charIndex > 0) {
          setCurrentText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => prev + 1);
        }
      } else {
        // Handle typing
        if (charIndex < currentPhrase.length) {
          setCurrentText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else {
          // Pause at the end of the phrase before deleting
          if (phraseIndex === phrases.length - 1) {
            setIsFinished(true);
            return;
          }
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, isFinished]);

  // If no phrases provided, show a default placeholder
  if (!phrases || phrases.length === 0) {
    return <span className="truncate">What's on your mind?&nbsp;</span>;
  }

  return <span className="text-sm truncate">{currentText}&nbsp;</span>;
};

export default TypewriterHint;