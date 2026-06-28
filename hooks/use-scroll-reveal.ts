"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Returns a callback ref that applies scroll-reveal animation classes
 * to child elements with data-reveal attribute.
 * Usage: <div ref={revealRef}> <div data-reveal="fade-up" data-delay="100">...</div> </div>
 */
export function useScrollRevealGroup(options: ScrollRevealOptions = {}): any {
  const { threshold = 0.1, rootMargin = "0px 0px -40px 0px", triggerOnce = true } = options;
  const [element, setElement] = useState<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = element.querySelectorAll("[data-reveal]");
          children.forEach((child, i) => {
            const el = child as HTMLElement;
            const delay = el.dataset.delay ? parseInt(el.dataset.delay) : i * 100;
            setTimeout(() => {
              el.classList.add("revealed");
            }, delay);
          });
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, threshold, rootMargin, triggerOnce]);

  return ref;
}
