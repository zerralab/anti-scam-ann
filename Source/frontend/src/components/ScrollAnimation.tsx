import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'slide-right' | 'slide-left';
  delay?: number;
  threshold?: number;
}

export function ScrollAnimation({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // 一旦顯示就不再觀察
        }
      },
      {
        threshold: threshold
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  // 動畫類型
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-up':
        return 'translate-y-10 opacity-0';
      case 'fade-in':
        return 'opacity-0';
      case 'slide-right':
        return 'translate-x-10 opacity-0';
      case 'slide-left':
        return '-translate-x-10 opacity-0';
      default:
        return 'opacity-0';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible 
          ? 'translate-y-0 translate-x-0 opacity-100' 
          : getAnimationClass()
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
