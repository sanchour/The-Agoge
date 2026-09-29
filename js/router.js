/**
 * AGOGE Client-Side Router
 * Handles tab navigation and screen switching.
 */

const TABS = ['home', 'statistics', 'stoa', 'settings'];
const SESSION_KEY = 'agoge_active_tab';

class Router {
  constructor() {
    this.activeTab = null;
    this.screens = new Map();
    this.tabs = new Map();
    this.onNavigate = null; // callback for screen initialization
  }

  init() {
    // Cache DOM references
    TABS.forEach(id => {
      this.screens.set(id, document.getElementById(`screen-${id}`));
      this.tabs.set(id, document.getElementById(`tab-${id}`));
    });

    // Set up tab click handlers
    const tabBar = document.getElementById('tab-bar');
    if (tabBar) {
      tabBar.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-tab]');
        if (tab) this.navigate(tab.dataset.tab);
      });
    }

    // Restore last active tab or default to home
    const saved = sessionStorage.getItem(SESSION_KEY);
    const initialTab = saved && TABS.includes(saved) ? saved : 'home';
    this.navigate(initialTab);
  }

  /**
   * Navigate to a tab.
   * @param {string} tabId - One of: home, statistics, martial-art, settings
   */
  navigate(tabId) {
    try {
      if (!TABS.includes(tabId)) return;
      if (this.activeTab === tabId) return;

      const prevTab = this.activeTab;
      this.activeTab = tabId;

      // Update screens
      this.screens.forEach((screen, id) => {
        if (id === tabId) {
          screen.hidden = false;
          screen.classList.add('screen--active');
        } else {
          screen.classList.remove('screen--active');
          // Delay hiding for transition
          setTimeout(() => {
            if (id !== this.activeTab) screen.hidden = true;
          }, 300);
        }
      });

      // Update tab bar
      this.tabs.forEach((tab, id) => {
        const isActive = id === tabId;
        tab.classList.toggle('tab-bar__tab--active', isActive);
        tab.setAttribute('aria-selected', isActive.toString());
      });

      // Scroll to top
      const activeScreen = this.screens.get(tabId);
      if (activeScreen) activeScreen.scrollTop = 0;

      // Persist
      sessionStorage.setItem(SESSION_KEY, tabId);

      // Fire event
      window.dispatchEvent(new CustomEvent('screen:change', {
        detail: { tabId, prevTab }
      }));

      if (this.onNavigate) this.onNavigate(tabId, prevTab);
    } catch (err) {
      console.error('Router navigation error:', err);
    }
  }

  getActiveTab() { return this.activeTab; }
}

export const router = new Router();
