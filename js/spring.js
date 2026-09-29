/**
 * Spring easing utility for JS-driven animations.
 * Uses Web Animations API with spring-like cubic-bezier curves.
 */

/** Spring easing (bouncy) */
export const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Gentle spring (subtle overshoot) */
export const SPRING_GENTLE = 'cubic-bezier(0.22, 1.0, 0.36, 1)';
/** Smooth ease-out */
export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Check if user prefers reduced motion */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animate an element with spring easing using Web Animations API.
 * Respects prefers-reduced-motion.
 * @param {Element} el - Element to animate
 * @param {Keyframe[]} keyframes - Animation keyframes
 * @param {number} duration - Duration in ms (default 600)
 * @param {string} easing - Easing function (default SPRING)
 * @returns {Animation|null}
 */
export function springAnimate(el, keyframes, duration = 600, easing = SPRING) {
  if (prefersReducedMotion()) {
    // Apply final state immediately
    const lastFrame = keyframes[keyframes.length - 1];
    Object.assign(el.style, lastFrame);
    return null;
  }
  return el.animate(keyframes, {
    duration,
    easing,
    fill: 'forwards'
  });
}

/**
 * Animate a numeric value change with spring easing.
 * Calls the callback with interpolated values.
 * @param {number} from - Start value
 * @param {number} to - End value  
 * @param {function} callback - Called with (currentValue) each frame
 * @param {number} duration - Duration in ms
 */
export function springValue(from, to, callback, duration = 600) {
  if (prefersReducedMotion()) {
    callback(to);
    return;
  }
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Simple spring approximation using ease-out curve
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = from + (to - from) * eased;
    callback(value);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
