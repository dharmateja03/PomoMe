'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useAnimationFrame } from 'motion/react';
import useMeasure from 'react-use-measure';

interface InfiniteSliderProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export function InfiniteSlider({
  children,
  speed = 30,
  direction = 'left',
  className = '',
}: InfiniteSliderProps) {
  const [ref, { width }] = useMeasure();
  const [contentWidth, setContentWidth] = useState(0);
  const xRef = useRef(0);
  const [x, setX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const firstChild = containerRef.current.children[0] as HTMLElement;
      if (firstChild) {
        setContentWidth(firstChild.scrollWidth);
      }
    }
  }, [children]);

  useAnimationFrame((_, delta) => {
    if (!contentWidth) return;

    const moveBy = (delta / 1000) * speed;

    if (direction === 'left') {
      xRef.current -= moveBy;
      if (xRef.current <= -contentWidth) {
        xRef.current = 0;
      }
    } else {
      xRef.current += moveBy;
      if (xRef.current >= 0) {
        xRef.current = -contentWidth;
      }
    }

    setX(xRef.current);
  });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex gap-12"
        style={{ x }}
      >
        <div className="flex gap-12 shrink-0">
          {children}
        </div>
        <div className="flex gap-12 shrink-0">
          {children}
        </div>
        <div className="flex gap-12 shrink-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
