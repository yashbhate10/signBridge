import { useEffect, useRef } from 'react';

/**
 * useScrollAnimation - triggers a CSS class when the element enters the viewport.
 * @param {string} animClass  - CSS class to add (default: 'animate-in')
 * @param {number} threshold  - intersection threshold (default: 0.15)
 * @param {string} rootMargin - root margin (default: '0px 0px -60px 0px')
 */
export function useScrollAnimation(animClass = 'animate-in', threshold = 0.15, rootMargin = '0px 0px -60px 0px') {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(animClass);
          observer.unobserve(el); // fire once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animClass, threshold, rootMargin]);

  return ref;
}

/**
 * useStaggerAnimation - applies stagger animation to a list of children.
 * Adds 'animate-in' to the parent, which triggers --i-based stagger via CSS.
 */
export function useStaggerAnimation(threshold = 0.12, rootMargin = '0px 0px -40px 0px') {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set --i CSS var on each direct child for stagger timing
    const children = Array.from(el.children);
    children.forEach((child, i) => {
      child.style.setProperty('--i', i);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('stagger-in');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
