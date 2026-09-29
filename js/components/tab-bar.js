/**
 * Tab Bar — iOS 26-style Liquid Glass Thumb-Hover & Gesture Engine
 *
 * Contiguous sector partitioning (zero dead zones) with pointer capture,
 * fluid refraction pill tracking, liquid icon expansion, haptics,
 * and immediate dwell-selection on thumb hover or release.
 */

import { router } from '../router.js';

const TABS = ['home', 'statistics', 'stoa', 'settings'];

export function initTabBar() {
  const tabBar = document.getElementById('tab-bar');
  if (!tabBar) return;

  let dragActive = false;
  let activePointerId = null;
  let currentHoveredTabId = null;
  let hoverTimer = null;

  // Create or reuse indicator pill
  let indicator = tabBar.querySelector('.tab-bar__indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'tab-bar__indicator';
    tabBar.prepend(indicator);
  }

  // iOS 26 Liquid Glass pill styling
  indicator.style.cssText = `
    position: absolute;
    height: 42px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.26);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 4px 16px rgba(0, 0, 0, 0.25);
    pointer-events: none;
    transition: left 0.32s cubic-bezier(0.16, 1, 0.3, 1), width 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 0;
    top: 50%;
    transform: translateY(-50%);
    will-change: left, width, background, box-shadow;
  `;

  // Failsafe: remove leftover collapse class and sync resting indicator position on navigation
  window.addEventListener('screen:change', () => {
    tabBar.classList.remove('tab-bar--collapsed');
    if (!dragActive) {
      scheduleIndicatorSync();
    }
  });

  function getTabEl(tabId) {
    return document.getElementById(`tab-${tabId}`);
  }

  function getActiveTabId() {
    return TABS.find(id => {
      const el = getTabEl(id);
      return el && el.classList.contains('tab-bar__tab--active');
    }) || 'home';
  }

  function positionIndicatorAt(tabId, instant = false) {
    const tabEl = getTabEl(tabId);
    if (!tabEl) return;
    const barRect = tabBar.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();
    const left = tabRect.left - barRect.left;
    const width = tabRect.width;

    indicator.style.background = 'rgba(255, 255, 255, 0.18)';
    indicator.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 4px 16px rgba(0, 0, 0, 0.25)';

    if (instant) {
      indicator.style.transition = 'none';
      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;
    } else {
      indicator.style.transition = 'left 0.32s cubic-bezier(0.16, 1, 0.3, 1), width 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;
    }
  }

  function scheduleIndicatorSync(instant = false) {
    requestAnimationFrame(() => {
      const active = getActiveTabId();
      positionIndicatorAt(active, instant);
    });
  }

  // Initial sync & post-load sync
  scheduleIndicatorSync(true);
  window.addEventListener('load', () => scheduleIndicatorSync(true));
  window.addEventListener('resize', () => scheduleIndicatorSync(true));

  /**
   * Contiguous sector partitioning:
   * Maps any clientX coordinate to exactly one of the 4 tabs.
   * Eliminates dead zones or gaps between buttons.
   */
  function getTabUnderPoint(clientX) {
    const barRect = tabBar.getBoundingClientRect();
    if (barRect.width <= 0) return null;
    const segWidth = barRect.width / TABS.length;
    const clampedX = Math.max(barRect.left, Math.min(barRect.right - 1, clientX));
    const idx = Math.floor((clampedX - barRect.left) / segWidth);
    const safeIdx = Math.max(0, Math.min(TABS.length - 1, idx));
    return {
      tabId: TABS[safeIdx],
      tabEl: getTabEl(TABS[safeIdx]),
      index: safeIdx,
      barRect,
      segWidth
    };
  }

  function resetIconStyles() {
    tabBar.querySelectorAll('.tab-bar__tab').forEach(t => {
      t.style.transform = '';
      t.style.filter = '';
    });
  }

  /**
   * Updates indicator position and hovered icon styling in real-time
   */
  function updateThumbFeedback(tabId, clientX) {
    const barRect = tabBar.getBoundingClientRect();

    // 1. Fluid liquid indicator tracking finger
    const pillWidth = Math.min(barRect.width / TABS.length + 8, 76);
    const relativeX = clientX - barRect.left;
    const targetLeft = Math.max(4, Math.min(barRect.width - pillWidth - 4, relativeX - pillWidth / 2));

    indicator.style.transition = 'none';
    indicator.style.left = `${targetLeft}px`;
    indicator.style.width = `${pillWidth}px`;
    indicator.style.background = 'rgba(255, 255, 255, 0.25)';
    indicator.style.boxShadow = '0 0 16px rgba(201, 161, 90, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.5)';

    // 2. Icon liquid feedback when transitioning to a tab
    if (tabId !== currentHoveredTabId) {
      resetIconStyles();
      currentHoveredTabId = tabId;

      const tabEl = getTabEl(tabId);
      if (tabEl) {
        tabEl.style.transform = 'scale(1.22) translateY(-2px)';
        tabEl.style.filter = 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.8)) brightness(1.25)';
        tabEl.style.transition = 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), filter 0.16s ease';
      }

      // Haptic tick on entering new tab sector
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }

      // 3. Select tab on thumb hover / dwell (75ms dwell)
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (dragActive && currentHoveredTabId) {
          if (router.activeTab !== currentHoveredTabId) {
            router.navigate(currentHoveredTabId);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(12);
            }
          }
        }
      }, 75);
    }
  }

  function startInteraction(clientX, clientY, pointerId = null) {
    if (document.querySelector('.modal-scrim, .modal-overlay')) return;

    dragActive = true;
    activePointerId = pointerId;
    indicator.style.transition = 'none';

    const hit = getTabUnderPoint(clientX);
    if (hit) {
      updateThumbFeedback(hit.tabId, clientX);
    }
  }

  function moveInteraction(clientX, clientY) {
    if (!dragActive) return;
    const hit = getTabUnderPoint(clientX);
    if (hit) {
      updateThumbFeedback(hit.tabId, clientX);
    }
  }

  function finishInteraction() {
    if (!dragActive) return;
    dragActive = false;
    activePointerId = null;
    clearTimeout(hoverTimer);

    const targetTab = currentHoveredTabId || getActiveTabId();
    resetIconStyles();

    if (targetTab) {
      router.navigate(targetTab);
    }
    scheduleIndicatorSync();
  }

  // ─── POINTER EVENTS (Modern iOS 13+, Android, Desktop) ─────────────────────
  if (window.PointerEvent) {
    tabBar.addEventListener('pointerdown', (e) => {
      try { tabBar.setPointerCapture(e.pointerId); } catch (_) {}
      startInteraction(e.clientX, e.clientY, e.pointerId);
    });

    tabBar.addEventListener('pointermove', (e) => {
      if (dragActive && (activePointerId === null || activePointerId === e.pointerId)) {
        moveInteraction(e.clientX, e.clientY);
      }
    });

    tabBar.addEventListener('pointerup', (e) => {
      try { tabBar.releasePointerCapture(e.pointerId); } catch (_) {}
      finishInteraction();
    });

    tabBar.addEventListener('pointercancel', (e) => {
      try { tabBar.releasePointerCapture(e.pointerId); } catch (_) {}
      finishInteraction();
    });
  } else {
    // Fallback for legacy Touch Events
    tabBar.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        startInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    tabBar.addEventListener('touchmove', (e) => {
      if (dragActive && e.touches.length > 0) {
        e.preventDefault();
        moveInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    tabBar.addEventListener('touchend', () => finishInteraction(), { passive: true });
    tabBar.addEventListener('touchcancel', () => finishInteraction(), { passive: true });
  }
}
