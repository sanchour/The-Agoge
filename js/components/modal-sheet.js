/**
 * Glass Modal Sheet System
 * Slides up from bottom with spring easing.
 * Supports focus trapping, backdrop dismiss, and swipe-to-close.
 */
import { prefersReducedMotion } from '../spring.js';
import { icons } from '../icons.js';

const container = () => document.getElementById('modal-container');
let activeModal = null;

/**
 * Open a modal sheet with given content.
 * @param {Object} options
 * @param {string} options.title - Modal title
 * @param {string} options.content - HTML content string
 * @param {function} [options.onClose] - Called when modal is closed
 * @param {string} [options.id] - Unique modal ID
 * @returns {{ close: function, element: HTMLElement }}
 */
export function openModal({ title, content, onClose, id }) {
  // Close any existing modal first
  if (activeModal && typeof activeModal.close === 'function') {
    activeModal.close();
  }

  const modalId = id || 'modal-' + Date.now();

  const html = `
    <div class="modal-scrim" data-modal-scrim="${modalId}"></div>
    <div class="modal-sheet glass-regular" data-modal="${modalId}" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-sheet__handle"></div>
      <div class="modal-sheet__header">
        <h3 class="modal-sheet__title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; flex: 1;">${title}</h3>
        <button class="btn-icon" data-modal-close="${modalId}" aria-label="Close">
          ${icons.x(20)}
        </button>
      </div>
      <div class="modal-sheet__body">
        ${content}
      </div>
    </div>
  `;

  const target = container();
  target.insertAdjacentHTML('beforeend', html);

  const scrim = target.querySelector(`[data-modal-scrim="${modalId}"]`);
  const sheet = target.querySelector(`[data-modal="${modalId}"]`);

  // Trigger animations after a frame
  requestAnimationFrame(() => {
    scrim.classList.add('modal-scrim--active');
    sheet.classList.add('modal-sheet--active');
  });

  // Close handlers
  const closeBtns = target.querySelectorAll(`[data-modal-close="${modalId}"]`);
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
  scrim.addEventListener('click', closeModal);

  // Escape key
  function onKeyDown(e) {
    if (e.key === 'Escape') closeModal();
  }
  document.addEventListener('keydown', onKeyDown);

  // Focus trap — focus first input or close button
  const firstFocusable = sheet.querySelector('input, button, select, textarea, [tabindex]');
  if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);

  // Touch Drag-Down-to-Dismiss Gesture
  let startY = 0;
  let currentY = 0;
  let startTime = 0;
  let isDragging = false;
  let canDrag = false;

  const handle = sheet.querySelector('.modal-sheet__handle');
  const header = sheet.querySelector('.modal-sheet__header');

  function onTouchStart(e) {
    const touch = e.touches[0];
    startY = touch.clientY;
    currentY = startY;
    startTime = Date.now();
    
    const targetEl = e.target;
    // Don't drag if touching an interactive input/slider
    if (targetEl.closest('input, select, textarea, .liquid-slider-container, .liquid-slider-track')) {
      canDrag = false;
      return;
    }

    const isHeaderOrHandle = (handle && handle.contains(targetEl)) || (header && header.contains(targetEl));
    if (isHeaderOrHandle || sheet.scrollTop <= 0) {
      canDrag = true;
      isDragging = false;
    } else {
      canDrag = false;
    }
  }

  function onTouchMove(e) {
    if (!canDrag) return;
    const touch = e.touches[0];
    currentY = touch.clientY;
    const dy = currentY - startY;

    if (dy > 0 && sheet.scrollTop <= 0) {
      if (!isDragging) {
        isDragging = true;
        sheet.classList.add('modal-sheet--dragging');
      }
      sheet.style.transform = `translate3d(0, ${dy}px, 0)`;
      if (scrim) {
        scrim.style.opacity = Math.max(0, 1 - (dy / 350));
      }
      if (e.cancelable) e.preventDefault();
    } else if (isDragging) {
      sheet.style.transform = '';
      sheet.classList.remove('modal-sheet--dragging');
      isDragging = false;
    }
  }

  function onTouchEnd() {
    if (!isDragging) {
      canDrag = false;
      return;
    }
    
    sheet.classList.remove('modal-sheet--dragging');
    const dy = currentY - startY;
    const dt = Math.max(1, Date.now() - startTime);
    const velocity = dy / dt;

    if (dy > 90 || velocity > 0.45) {
      sheet.style.transform = `translate3d(0, 100%, 0)`;
      if (scrim) scrim.style.opacity = '0';
      closeModal();
    } else {
      sheet.style.transform = '';
      if (scrim) scrim.style.opacity = '';
    }
    isDragging = false;
    canDrag = false;
  }

  sheet.addEventListener('touchstart', onTouchStart, { passive: true });
  sheet.addEventListener('touchmove', onTouchMove, { passive: false });
  sheet.addEventListener('touchend', onTouchEnd, { passive: true });
  sheet.addEventListener('touchcancel', onTouchEnd, { passive: true });

  function closeModal() {
    if (scrim) scrim.classList.remove('modal-scrim--active');
    if (sheet) sheet.classList.remove('modal-sheet--active');

    const cleanup = () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
      sheet.removeEventListener('touchcancel', onTouchEnd);
      if (scrim && scrim.parentNode) scrim.remove();
      if (sheet && sheet.parentNode) sheet.remove();
      document.removeEventListener('keydown', onKeyDown);
      activeModal = null;
      if (onClose) onClose();
    };

    if (prefersReducedMotion()) {
      cleanup();
    } else {
      sheet.addEventListener('transitionend', cleanup, { once: true });
      setTimeout(cleanup, 700); // fallback
    }
  }

  activeModal = { close: closeModal, element: sheet, id: modalId };
  return activeModal;
}

export function closeActiveModal() {
  if (activeModal) activeModal.close();
}

export function getActiveModal() {
  return activeModal;
}
