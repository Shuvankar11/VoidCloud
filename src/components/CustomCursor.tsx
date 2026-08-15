import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Snappy, responsive spring physics (zero lag, instant tracking)
  const springConfig = { damping: 30, stiffness: 600, mass: 0.1 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  const auraSpringConfig = { damping: 24, stiffness: 280, mass: 0.3 };
  const auraX = useSpring(-100, auraSpringConfig);
  const auraY = useSpring(-100, auraSpringConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      auraX.set(e.clientX);
      auraY.set(e.clientY);
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
  }, [isVisible, cursorX, cursorY, auraX, auraY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* 1. Luminous Ambient Aura Ring (High Visibility) */}
      <motion.div
        style={{
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovered ? 1.8 : isClicked ? 0.75 : 1,
          opacity: isHovered ? 0.95 : 0.6,
          borderColor: isHovered ? '#38BDF8' : '#0EA5E9',
        }}
        transition={{ duration: 0.15 }}
        className="w-8 h-8 rounded-full border-2 border-sky-400 bg-sky-500/20 backdrop-blur-[2px] shadow-[0_0_20px_rgba(56,189,248,0.6)]"
      />

      {/* 2. High-Contrast Sharp Futuristic Pointer Arrow (Always Crystal Clear) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
        }}
        className="absolute top-0 left-0"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] transform -translate-x-1 -translate-y-1"
        >
          {/* Outer Cyan Glow Border */}
          <path
            d="M3 2L19 12L11 14L8 21L3 2Z"
            fill="#0EA5E9"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner Sharp Highlight */}
          <path
            d="M5 5L15 11.5L9.5 13L7.5 17.5L5 5Z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Precision Laser Center Dot */}
        <div className="w-1.5 h-1.5 bg-sky-300 rounded-full absolute top-[1px] left-[1px] shadow-[0_0_6px_#38BDF8]" />
      </motion.div>
    </div>
  );
};
