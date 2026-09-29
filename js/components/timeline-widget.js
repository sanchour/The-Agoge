/**
 * Compact Timeline Widget
 * Displays real-time calendar date progression for the active phase.
 * Shows "Day X of Y · ends [Date]" with a progress bar and next phase marker.
 * Tapping opens the phase edit modal to adjust dates directly.
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { openPhaseEditModal } from './hero-card.js';

export function renderCompactTimeline(container) {
  if (!container) return;

  const phase = store.getActivePhase();
  if (!phase) {
    container.innerHTML = '';
    return;
  }

  const phases = store.getPhases();
  const activeIdx = phases.findIndex(p => p.id === phase.id);
  const nextPhase = activeIdx >= 0 && activeIdx < phases.length - 1 ? phases[activeIdx + 1] : null;

  // Real date calculations
  const now = new Date();
  const start = phase.startDate ? new Date(phase.startDate) : new Date();
  const end = phase.endDate ? new Date(phase.endDate) : new Date(start.getTime() + 70 * 24 * 60 * 60 * 1000);

  const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  let elapsedDays = 0;
  if (now > end) {
    elapsedDays = totalDays;
  } else if (now < start) {
    elapsedDays = 0;
  } else {
    elapsedDays = Math.max(1, Math.min(totalDays, Math.round((now - start) / (1000 * 60 * 60 * 24)) + 1));
  }

  const progressPct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const nextTag = nextPhase
    ? `<span class="badge ${nextPhase.type === 'CUT' ? 'badge--cut' : 'badge--bulk'}" style="font-size: 0.65rem; padding: 2px 6px;">Next: ${nextPhase.name}</span>`
    : `<span class="badge" style="font-size: 0.65rem; padding: 2px 6px; background: rgba(201, 161, 90, 0.15); color: var(--color-accent-light);">Apex Goal</span>`;

  container.innerHTML = `
    <div class="card glass-clear timeline-widget animate-fade-in" style="margin-top: var(--space-sm); padding: var(--space-md); cursor: pointer; transition: transform 0.2s ease; border-top: 1px solid rgba(212, 175, 55, 0.25); background: linear-gradient(135deg, rgba(212, 175, 55, 0.07) 0%, rgba(20, 20, 24, 0.75) 100%); box-shadow: 0 4px 20px rgba(0,0,0,0.25);" title="View Timeline">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
        <div style="display: flex; align-items: center; gap: var(--space-sm);">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-xs); background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.3); display: flex; align-items: center; justify-content: center; color: var(--color-accent-light);">
            ${icons.calendar ? icons.calendar(16) : '📅'}
          </div>
          <div>
            <span class="font-display" style="font-size: var(--fs-body); font-weight: 700; color: var(--color-text); display: block; line-height: 1.1;">
              Day <strong style="color: var(--color-accent-light);">${elapsedDays}</strong> of ${totalDays}
            </span>
            <span class="text-caption text-tertiary" style="font-size: 10px; text-transform: none;">Ends ${endFormatted}</span>
          </div>
        </div>
        <div>
          ${nextTag}
        </div>
      </div>
      
      <!-- Luminous progress track -->
      <div style="height: 6px; background: rgba(243, 239, 230, 0.08); border-radius: var(--radius-pill); overflow: hidden; position: relative;">
        <div style="width: ${progressPct}%; height: 100%; background: linear-gradient(90deg, #D4AF37 0%, #F2CF75 75%, #FFFFFF 100%); border-radius: var(--radius-pill); box-shadow: 0 0 10px rgba(212, 175, 55, 0.6); transition: width 0.4s var(--ease-spring);"></div>
      </div>
    </div>
  `;

  const widgetEl = container.querySelector('.timeline-widget');
  if (widgetEl) {
    widgetEl.addEventListener('click', () => {
      const statsTab = document.getElementById('tab-statistics');
      if (statsTab) {
        window.__AGOGE_INITIAL_STAT_TAB = 'timeline';
        statsTab.click();
      }
    });
  }
}
