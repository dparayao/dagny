import { useState, useEffect } from 'react';

/**
 * TypingEffect Component
 *
 * Displays text with a typewriter animation that cycles through sentences
 * Types out each character, pauses, then deletes before moving to next sentence
 *
 * @param {string[]} sentences - Array of sentences to cycle through
 */
function TypingEffect({ sentences }) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!sentences || sentences.length === 0) return;

    const currentSentence = sentences[currentSentenceIndex];
    const typingSpeed = isDeleting ? 30 : 80; // Faster deletion, slower typing
    const pauseBeforeDelete = 2000; // 2 second pause when sentence is complete
    const pauseBeforeNext = 500; // 0.5 second pause before typing next sentence

    let timeout;

    if (!isDeleting && currentText === currentSentence) {
      // Pause before starting to delete
      timeout = setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
    } else if (isDeleting && currentText === '') {
      // Move to next sentence after deletion complete
      setIsDeleting(false);
      setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length);
      timeout = setTimeout(() => {}, pauseBeforeNext);
    } else {
      // Type or delete one character
      timeout = setTimeout(() => {
        if (isDeleting) {
          setCurrentText(currentSentence.substring(0, currentText.length - 1));
        } else {
          setCurrentText(currentSentence.substring(0, currentText.length + 1));
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentSentenceIndex, sentences]);

  return (
    <div className="typing-container">
      <span className="typing-label">currently:</span>
      <span className="typing-text">
        {currentText}
        <span className="typing-cursor">|</span>
      </span>
    </div>
  );
}

export default TypingEffect;
