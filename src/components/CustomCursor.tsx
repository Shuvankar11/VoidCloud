import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Snappy, responsive spring physics (zero lag, instant tracking)
  const springConfig = { damping: 35, stiffness: 800, mass: 0.05 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive =
        target?.closest('button') ||
        target?.closest('a') ||
        target?.closest('input') ||
        target?.closest('.cloud-card') ||
        target?.closest('.interactive-hover');

      setIsHovered(Boolean(interactive));
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleElementHover);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleElementHover);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* High-Precision Futuristic Pointer Arrow (No trailing circle) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isClicked ? 0.85 : isHovered ? 1.15 : 1,
        }}
        transition={{ duration: 0.1 }}
        className="absolute top-0 left-0"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_8px_rgba(14,165,233,0.5)] transform -translate-x-1 -translate-y-1"
        >
          {/* Main Pointer Body */}
          <path
            d="M3 3L10.5 21L14 13.5L21.5 10L3 3Z"
            fill="url(#cursorGrad)"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Inner Gloss Accent */}
          <path
            d="M5 5L10 17L12.5 12L17.5 9.5L5 5Z"
            fill="white"
            fillOpacity="0.4"
          />

          {/* High-Tech Gradient Definition */}
          <defs>
            <linearGradient id="cursorGrad" x1="3" y1="3" x2="21.5" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};
