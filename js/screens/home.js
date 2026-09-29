/**
 * Home Screen — Main Orchestrator
 * Renders hero card, roadmap strip, discipline ring, and quick log.
 * Handles onboarding state.
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { renderOnboarding } from '../components/onboarding.js';
import { renderHeroCard } from '../components/hero-card.js';
import { renderDisciplineRing } from '../components/discipline-ring.js';
import { initQuickLog } from '../components/quick-log.js';
import { renderCompactTimeline } from '../components/timeline-widget.js';

let initialized = false;

/**
 * Initialize or re-render the home screen.
 */
export function initHome() {
  try {
    const content = document.getElementById('home-content');
    if (!content) return;

    renderHome(content);

    if (!initialized) {
      // Subscribe to store changes for reactivity
      store.subscribe(() => {
        const screen = document.getElementById('screen-home');
        if (screen && screen.classList.contains('screen--active')) {
          renderHome(content);
        }
      });
      initialized = true;
    }
  } catch (err) {
    console.error('Home Screen Error:', err);
  }
}

function renderHome(content) {
  // Check onboarding state
  if (!store.isOnboardingComplete()) {
    content.innerHTML = '<div id="onboarding-container"></div>';
    renderOnboarding(
      content.querySelector('#onboarding-container'),
      () => renderHome(content) // Re-render after onboarding
    );
    // Hide FAB during onboarding
    const fabContainer = document.getElementById('fab-container');
    if (fabContainer) fabContainer.innerHTML = '';
    return;
  }

  // Compute Banners
  let bannersHTML = '';

  // 1. Reminder Banner
  if (store.state.settings.reminderEnabled) {
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = store.state.checkIns.some(c => c.date === today);
    if (!hasCheckedInToday) {
      bannersHTML += `
        <div class="card card--glass glass-regular" style="margin-bottom: var(--space-md); padding: var(--space-sm) var(--space-md); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <div style="color: var(--color-accent);">${icons.activity(20)}</div>
            <span class="text-secondary" style="font-size: var(--fs-small);">Don't forget to log your daily check-in</span>
          </div>
        </div>
      `;
    }
  }

  // 2. Protocol Banner
  if (store.state.activeProtocol) {
    bannersHTML += `
      <div class="card card--glass glass-regular" style="margin-bottom: var(--space-md); padding: var(--space-sm) var(--space-md); display: flex; align-items: center; justify-content: space-between; border-color: rgba(201, 161, 90, 0.3);">
        <div style="display: flex; align-items: center; gap: var(--space-sm);">
          <div style="color: var(--color-accent);">${icons.alertCircle ? icons.alertCircle(20) : icons.activity(20)}</div>
          <span class="text-secondary" style="font-size: var(--fs-small); color: var(--color-accent-light);">Active Protocol: ${store.state.activeProtocol}</span>
        </div>
        <button class="btn btn-ghost" id="clear-protocol" style="padding: 0 var(--space-xs); height: 28px; min-width: 0; color: var(--color-text-secondary);">Clear</button>
      </div>
    `;
  }

  // Mini Roadmap Widget HTML
  const phases = store.getPhases();
  const currentPhaseIndex = phases.findIndex(p => p.id === store.state.activePhaseId);
  const totalPhaseTime = phases.length; // rough proportional width
  
  let roadmapStrip = '<div style="display:flex; height: 14px; border-radius: var(--radius-pill); overflow:hidden; background: var(--color-bg-elevated); margin-bottom: var(--space-xs); border: 1px solid rgba(243, 239, 230, 0.08); padding: 1px;">';
  phases.forEach((p, idx) => {
    const isCurrent = p.status === 'ACTIVE';
    const isPast = p.status === 'COMPLETED';
    const isCut = p.type === 'CUT';
    
    let bg;
    let glow = '';
    if (isCurrent) {
      bg = isCut ? 'var(--color-cut-light)' : 'var(--color-bulk-light)';
      glow = `box-shadow: 0 0 12px ${isCut ? 'rgba(224, 83, 83, 0.8)' : 'rgba(72, 186, 130, 0.8)'}; z-index: 2; border-radius: 3px;`;
    } else if (isPast) {
      bg = isCut ? 'rgba(166, 50, 50, 0.5)' : 'rgba(45, 110, 80, 0.5)';
    } else {
      bg = isCut ? 'rgba(166, 50, 50, 0.16)' : 'rgba(45, 110, 80, 0.16)';
    }

    roadmapStrip += `<div title="${p.name} (${p.type})" style="flex:1; background:${bg}; margin: 0 1px; border-radius: 2px; ${glow}"></div>`;
  });
  roadmapStrip += '</div>';

  // Full home screen layout
  content.innerHTML = `
    <div class="home-layout">
      ${bannersHTML}
      <div id="hero-card-container" class="animate-fade-in" style="position:relative;">
        <div id="motivation-trigger" style="position:absolute; top: var(--space-md); right: var(--space-md); z-index:10; cursor:pointer;" title="Read The Why">
          <div style="display:flex; align-items:center; gap: 4px; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35); padding: 3px 8px; border-radius: var(--radius-pill); box-shadow: 0 0 12px rgba(212, 175, 55, 0.25); transition: transform 0.15s ease;">
            <span style="color: var(--color-accent-light); font-size: 10px;">✦</span>
            <span class="font-display" style="font-size: 10px; font-weight: 700; color: var(--color-accent-light); letter-spacing: 0.05em;">THE WHY</span>
          </div>
        </div>
      </div>
      
      <!-- Compact Timeline Widget (Real Dates) -->
      <div id="timeline-widget-container"></div>
      
      <!-- Miniature Roadmap Widget -->
      <div class="card glass-clear animate-fade-in" style="margin-top: var(--space-sm); padding: var(--space-md); cursor: pointer; border-top: 1px solid rgba(243, 239, 230, 0.12); background: linear-gradient(135deg, rgba(20, 20, 24, 0.8) 0%, rgba(26, 26, 32, 0.6) 100%);" id="roadmap-preview-btn" title="View Full Roadmap">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: var(--color-accent); font-size: 14px;">⚡</span>
            <span class="text-caption text-secondary" style="font-weight: 600; letter-spacing: 0.08em;">AGOGE JOURNEY</span>
          </div>
          <span class="badge badge--active" style="font-size: 10px; padding: 2px 7px;">Phase ${currentPhaseIndex + 1} of ${phases.length}</span>
        </div>
        ${roadmapStrip}
      </div>
      
      <!-- Motivation Overlay (hidden) -->
      <div id="motivation-modal" class="modal-sheet" style="display:none; transform:translateY(100%);">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title font-display text-accent">The Why</h2>
          <button class="btn-icon" id="close-motivation">${icons.close ? icons.close(24) : 'X'}</button>
        </div>
        <div class="modal-sheet__content" style="padding-top: var(--space-md);">
          <p class="text-body font-display" style="font-size: var(--fs-h3); line-height: var(--lh-relaxed); color: var(--color-text);">
            "To become the strongest I know. To feel safe, secure and confident knowing I am strong and can defend myself. To feel, think and act like a different person. Someone who is strong, who knows how to fight. A big, strong dude, something which is now not at all in my identity. I want to build this identity because I know it will give me profound development and confidence. I want it. I will have it."
          </p>
        </div>
      </div>
      <div id="motivation-scrim" class="modal-scrim" style="display:none; opacity:0;"></div>
    </div>
  `;

  if (store.state.activeProtocol) {
    const clearBtn = content.querySelector('#clear-protocol');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        store.setActiveProtocol(null);
      });
    }
  }
  
  const roadmapBtn = content.querySelector('#roadmap-preview-btn');
  if (roadmapBtn) {
    roadmapBtn.addEventListener('click', () => {
      const statsTab = document.getElementById('tab-statistics');
      if (statsTab) {
        window.__AGOGE_INITIAL_STAT_TAB = 'roadmap';
        statsTab.click();
      }
    });
  }

  // Motivation Modal Logic
  const motTrigger = content.querySelector('#motivation-trigger');
  const motModal = content.querySelector('#motivation-modal');
  const motScrim = content.querySelector('#motivation-scrim');
  const motClose = content.querySelector('#close-motivation');
  
  if (motTrigger && motModal && motScrim) {
    const openMot = (e) => {
      e.stopPropagation();
      motModal.style.display = 'block';
      motScrim.style.display = 'block';
      // force reflow
      void motModal.offsetWidth;
      motModal.style.transform = 'translate3d(0, 0, 0)';
      motScrim.style.opacity = '1';
    };
    const closeMot = () => {
      motModal.style.transform = 'translate3d(0, 100%, 0)';
      motScrim.style.opacity = '0';
      setTimeout(() => {
        motModal.style.display = 'none';
        motScrim.style.display = 'none';
      }, 250);
    };
    motTrigger.addEventListener('click', openMot);
    motClose.addEventListener('click', closeMot);
    motScrim.addEventListener('click', closeMot);
  }

  // Render components
  renderHeroCard(document.getElementById('hero-card-container'));
  renderCompactTimeline(document.getElementById('timeline-widget-container'));
  initQuickLog();
}
