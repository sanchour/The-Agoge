/**
 * AGOGE — Main Application Entry Point
 * Initializes all modules and manages the app lifecycle.
 */

import { store } from './store.js';
import { router } from './router.js';
import { initTabBar } from './components/tab-bar.js';
import { initHome } from './screens/home.js';
import { initStatistics } from './screens/statistics.js';
import { initStoa } from './screens/stoa.js';
import { initSettings } from './screens/settings.js';

/** Boot the application */
async function boot() {
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');

  // Dynamically sync physical viewport height to prevent iOS bottom clipping
  const syncViewportHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };
  window.addEventListener('resize', syncViewportHeight);
  window.addEventListener('orientationchange', syncViewportHeight);
  syncViewportHeight();

  // Completely eliminate iOS Safari pinch-to-zoom and double-tap zoom for true native app feel
  preventZoom();

  const dismissSplash = () => {
    if (app) app.hidden = false;
    if (splash) {
      splash.classList.add('splash--hidden');
      setTimeout(() => { if (splash && splash.parentNode) splash.remove(); }, 600);
    }
  };

  try {
    // 1. Initialize data store
    store.init();

    // Apply theme
    if (store.state && store.state.settings && store.state.settings.theme === 'light') {
      document.body.classList.add('theme-light');
    }

    // 2. Wait for fonts to be ready (or timeout after 1.5s)
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
    } catch (e) {
      // Continue even if fonts fail
    }

    // 3. Minimum splash display duration (600ms)
    const elapsed = performance.now();
    const minSplash = 600;
    if (elapsed < minSplash) {
      await new Promise(r => setTimeout(r, minSplash - elapsed));
    }
  } catch (err) {
    console.error('[AGOGE] Error during store/theme initialization:', err);
  } finally {
    // 4. Guaranteed: Always reveal app shell and remove splash
    dismissSplash();
  }

  try {
    // 5. Listen for screen changes to lazy-init screens
    window.addEventListener('screen:change', (e) => {
      const { tabId } = e.detail;
      if (tabId === 'home') initHome();
      if (tabId === 'statistics') initStatistics();
      if (tabId === 'stoa') initStoa();
      if (tabId === 'settings') initSettings();
    });

    // 6. Initialize router and tab bar
    router.init();
    initTabBar();

    // 7. Start daily notification background scheduler
    startNotificationScheduler();

    console.log('[AGOGE] Application initialized successfully');
  } catch (err) {
    console.error('[AGOGE] Error during screen/router initialization:', err);
    dismissSplash();
  }
}

function startNotificationScheduler() {
  let lastNotifiedDate = null;
  setInterval(() => {
    try {
      const s = store.state?.settings;
      if (!s || !s.notificationsEnabled) return;
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentH}:${currentM}`;
      const targetTime = s.notificationTime || '08:00';

      const todayStr = now.toISOString().split('T')[0];
      if (currentTime === targetTime && lastNotifiedDate !== todayStr) {
        const loggedToday = store.state.checkIns?.some(c => c.date === todayStr);
        if (!loggedToday) {
          lastNotifiedDate = todayStr;
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              title: 'Daily AGOGE Check-In',
              body: 'Time to record your daily physical metrics, Spartan.'
            });
          } else {
            new Notification('Daily AGOGE Check-In', {
              body: 'Time to record your daily physical metrics, Spartan.',
              icon: './icon.svg'
            });
          }
        }
      }
    } catch (e) {
      console.warn('[Notification] Scheduler check failed:', e);
    }
  }, 30000);
}

/**
 * Disable all gesture zooming, pinch gestures, and double-tap zoom
 * to give AGOGE the fixed, uncompromising feel of a native iOS app.
 */
function preventZoom() {
  // 1. Block Safari gesture zoom (pinch gestures)
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

  // 2. Block multi-touch pinch zoom
  document.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // 3. Block desktop / trackpad pinch-to-zoom (ctrl + wheel)
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // 4. Block double-click zoom
  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
  }, { passive: false });

  // 5. Block iOS double-tap to zoom on background/text while preserving interactive clicks
  let lastTouchEndTime = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEndTime <= 300) {
      const target = e.target;
      const isInteractive = target && (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('.interactive') ||
        target.closest('.stoa-tile') ||
        target.closest('.quick-log__pill') ||
        target.closest('.log-day-item') ||
        target.closest('.card') ||
        target.closest('.btn') ||
        target.closest('.tab-item')
      );
      if (!isInteractive) {
        e.preventDefault();
      }
    }
    lastTouchEndTime = now;
  }, { passive: false });
}

// Call preventZoom immediately so it activates before full DOM load
preventZoom();

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
