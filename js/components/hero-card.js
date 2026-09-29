/**
 * Hero Card — Active Phase Display
 * Shows current phase details with inline editing via modal.
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { openModal } from './modal-sheet.js';
import { getCurrentTDEEProfile } from './tdee.js';
import { createLiquidSlider } from './liquid-slider.js';
import { validatePhaseUpdate } from '../validation.js';

/**
 * Render the hero card into the given container.
 * @param {HTMLElement} container
 */
export function renderHeroCard(container) {
  const phase = store.getActivePhase();
  if (!phase) return;

  const isCut = phase.type === 'CUT';
  const isMaint = phase.type === 'MAINTENANCE';
  const typeClass = isCut ? 'card--cut' : (isMaint ? 'card--maintenance' : 'card--bulk');
  const badgeClass = isCut ? 'badge--cut' : (isMaint ? 'badge--maintenance' : 'badge--bulk');
  const themeColor = isCut ? 'var(--color-cut-light)' : (isMaint ? 'var(--color-maintenance-light)' : 'var(--color-bulk-light)');
  
  // TDEE live target
  const tdeeProfile = getCurrentTDEEProfile();
  let tdeeBase = tdeeProfile.katchTDEE || tdeeProfile.mifflinTDEE || 2500;
  let currentOffset = isCut ? -500 : (isMaint ? 0 : 300);
  if (phase.cals) {
    const match = phase.cals.match(/(-?\d+)\s*kcal/);
    if (match) currentOffset = parseInt(match[1], 10);
  }
  const liveTarget = tdeeBase + currentOffset;
  const weeklyRate = isMaint ? '0.00' : ((currentOffset * 7) / 7700).toFixed(2);

  // Compute days remaining from real dates
  let daysRemaining = '—';
  let totalDays = 0;
  if (phase.startDate && phase.endDate) {
    const start = new Date(phase.startDate);
    const end = new Date(phase.endDate);
    const now = new Date();
    totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    if (now > end) {
      daysRemaining = 0;
    } else if (now < start) {
      daysRemaining = totalDays;
    } else {
      daysRemaining = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));
    }
  } else {
    const weeksMatch = phase.weeks ? phase.weeks.match(/(\d+)/) : null;
    totalDays = weeksMatch ? parseInt(weeksMatch[1]) * 7 : 0;
    daysRemaining = totalDays;
  }

  const glowRgb = isCut ? '224, 83, 83' : (isMaint ? '245, 158, 11' : '72, 186, 130');

  container.innerHTML = `
    <div class="hero-card card ${typeClass}" data-phase-id="${phase.id}" style="cursor: pointer; position: relative; overflow: hidden; transition: transform 0.2s ease;">
      <!-- Corner ambient glow -->
      <div style="position: absolute; top: -50px; right: -50px; width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, rgba(${glowRgb}, 0.25) 0%, transparent 70%); pointer-events: none;"></div>

      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; margin-bottom: var(--space-sm); position: relative; z-index: 1; text-align: center;">
        <span class="badge ${badgeClass}" style="margin-bottom: 8px; box-shadow: 0 0 10px rgba(${glowRgb}, 0.3); font-size: 11px; padding: 4px 10px; font-weight: 700; letter-spacing: 0.05em;">${phase.type} PHASE</span>
        <h2 class="font-display" style="font-size: 2.2rem; font-weight: 700; letter-spacing: 0.03em; margin: 0;">${phase.name}</h2>
        <div style="position: absolute; right: 0; top: 0; display:flex; align-items:center; justify-content:center; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-secondary); transition: transform 0.2s ease;" title="Edit phase">
          ${icons.edit(15)}
        </div>
      </div>
      
      <!-- Circular Progress Ring with Perfectly Centered Numeral -->
      <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin: var(--space-sm) 0 var(--space-md) 0;">
        <div style="position: relative; display:flex; flex-direction:column; align-items:center; justify-content: center; width: 190px; height: 190px; border-radius: 50%; background: rgba(0,0,0,0.25); box-shadow: inset 0 4px 20px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.04); text-align: center; box-sizing: border-box;">
          
          <span class="text-caption" style="color: var(--color-text-tertiary); letter-spacing: 0.14em; font-size: 10px; font-weight: 600; line-height: 1; margin-bottom: 2px; z-index: 1;">REMAINING</span>
          
          <span style="font-family: var(--font-body); font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1; font-size: 4.8rem; line-height: 0.9; font-weight: 700; letter-spacing: -2px; z-index: 1; color: var(--color-text); text-shadow: 0 2px 10px rgba(0,0,0,0.5); display: block;">
            ${daysRemaining}
          </span>
          
          <div style="display:flex; align-items:center; gap: 4px; margin-top: 2px; z-index: 1; line-height: 1;">
            <span class="text-small" style="font-family: var(--font-body); font-variant-numeric: tabular-nums; color: ${themeColor}; font-size: 11.5px; font-weight: 600;">/ ${totalDays} DAYS</span>
          </div>
          
          <svg style="position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); filter: drop-shadow(0 0 6px rgba(${glowRgb}, 0.4));" viewBox="0 0 190 190">
            <circle cx="95" cy="95" r="91" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4"></circle>
            <circle cx="95" cy="95" r="91" fill="none" stroke="${themeColor}" stroke-width="4" stroke-dasharray="572" stroke-dashoffset="${572 - (572 * (totalDays > 0 ? (totalDays - daysRemaining)/totalDays : 0))}" stroke-linecap="round"></circle>
          </svg>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); padding-top: var(--space-md); border-top: 1px solid rgba(243, 239, 230, 0.08); position: relative; z-index: 1;">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 10px 4px;">
          <span class="text-caption text-tertiary" style="font-size: 10px; letter-spacing: 0.06em;">TARGET WT</span>
          <span style="font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 1.25rem; font-weight: 700; color: var(--color-text); margin-top: 3px;">
            ${phase.targetWeight} <span style="font-size: 11px; font-weight: 400; color: var(--color-text-secondary);">kg</span>
          </span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 10px 4px;">
          <span class="text-caption text-tertiary" style="font-size: 10px; letter-spacing: 0.06em;">DAILY CALS</span>
          <span style="font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 1.25rem; font-weight: 700; color: var(--color-accent-light); margin-top: 3px;">
            ${liveTarget} <span style="font-size: 11px; font-weight: 400; color: var(--color-text-secondary);">kcal</span>
          </span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 10px 4px;">
          <span class="text-caption text-tertiary" style="font-size: 10px; letter-spacing: 0.06em;">PROJ. RATE</span>
          <span style="font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 1.25rem; font-weight: 700; color: ${themeColor}; margin-top: 3px;">
            ${weeklyRate > 0 ? '+' : ''}${weeklyRate} <span style="font-size: 11px; font-weight: 400; color: var(--color-text-secondary);">kg/w</span>
          </span>
        </div>
      </div>
    </div>
  `;

  const el = container.querySelector('.hero-card');
  if (el) {
    el.addEventListener('click', () => {
      openPhaseEditModal(phase);
    });
  }
}

/** Open the phase edit modal */
export function openPhaseEditModal(phase) {
  const tdeeProfile = getCurrentTDEEProfile();
  
  let isCut = phase.type === 'CUT';
  let isMaint = phase.type === 'MAINTENANCE';
  let defaultOffset = isCut ? -500 : (isMaint ? 0 : 300);
  let minOffset = isCut ? -1000 : (isMaint ? -300 : 0);
  let maxOffset = isCut ? 0 : (isMaint ? 300 : 1000);
  let tdeeBase = tdeeProfile.katchTDEE || tdeeProfile.mifflinTDEE || 2500;
  let currentWeight = tdeeProfile.weight || phase.targetWeight || 70;

  let currentOffset = defaultOffset;
  if (phase.cals) {
    const match = phase.cals.match(/(-?\d+)\s*kcal/);
    if (match) currentOffset = parseInt(match[1], 10);
  }

  // Format dates for input type="date"
  const sDate = phase.startDate ? phase.startDate.split('T')[0] : '';
  const eDate = phase.endDate ? phase.endDate.split('T')[0] : '';

  const content = `
    <form id="phase-edit-form" style="display:flex; flex-direction:column; gap: var(--space-md); width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden;">
      
      <div style="display:flex; flex-wrap: wrap; gap: var(--space-sm); width: 100%; box-sizing: border-box;">
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 130px; box-sizing: border-box;">
          <label class="input-label" for="edit-status">Status</label>
          <select class="input-field" id="edit-status" name="status" style="width: 100%; box-sizing: border-box;">
            <option value="UPCOMING" ${phase.status === 'UPCOMING' ? 'selected' : ''}>Upcoming</option>
            <option value="ACTIVE" ${phase.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="COMPLETED" ${phase.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 130px; box-sizing: border-box;">
          <label class="input-label" for="edit-type">Phase Type</label>
          <select class="input-field" id="edit-type" name="type" style="width: 100%; box-sizing: border-box;">
            <option value="CUT" ${phase.type === 'CUT' ? 'selected' : ''}>Cut (Deficit)</option>
            <option value="BULK" ${phase.type === 'BULK' ? 'selected' : ''}>Bulk (Surplus)</option>
            <option value="MAINTENANCE" ${phase.type === 'MAINTENANCE' ? 'selected' : ''}>Maintenance (Reset)</option>
          </select>
        </div>
      </div>

      <div style="display:flex; flex-wrap: wrap; gap: var(--space-sm); width: 100%; box-sizing: border-box;">
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 130px; box-sizing: border-box;">
          <label class="input-label" for="edit-start-date">Start Date</label>
          <input class="input-field" style="width:100%; box-sizing:border-box;" type="date" id="edit-start-date" name="startDate" value="${sDate}">
        </div>
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 130px; box-sizing: border-box;">
          <label class="input-label" for="edit-end-date">End Date</label>
          <input class="input-field" style="width:100%; box-sizing:border-box;" type="date" id="edit-end-date" name="endDate" value="${eDate}">
        </div>
      </div>

      <!-- TDEE & CALORIES SECTION -->
      <div class="card glass-clear" style="padding: var(--space-sm) var(--space-md); width: 100%; box-sizing: border-box; overflow-x: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-xs);">
          <div>
            <h4 class="font-display text-accent" style="margin-bottom: 2px; font-size: 1.05rem;">TDEE Profile</h4>
            <span class="text-caption text-tertiary" style="font-size: 11px;">Based on check-in biometrics</span>
          </div>
          <div style="text-align: right;">
            <div class="text-small">
              <span class="text-accent" style="font-weight: 700;">${tdeeProfile.katchTDEE ? tdeeProfile.katchTDEE + ' kcal' : '?'}</span>
              <span class="text-caption text-tertiary" style="font-size: 10px;">(TDEE)</span>
            </div>
          </div>
        </div>

        <div id="tdee-slider-container" style="width: 100%; box-sizing: border-box;"></div>
        
        <div style="margin-top: var(--space-xs); padding-top: var(--space-xs); border-top: 1px dashed var(--color-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span class="text-small text-secondary" style="font-size: 12px;">Daily Target</span>
            <span id="target-cals-display" class="font-display" style="font-size: 1.25rem; color: ${isCut ? 'var(--color-cut-light)' : (isMaint ? 'var(--color-maintenance-light)' : 'var(--color-bulk-light)')};">
              ${tdeeBase + currentOffset} kcal
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="text-caption text-tertiary" style="font-size: 11px;">Projected Rate</span>
            <span id="projection-display" class="text-caption" style="color: rgba(243, 239, 230, 0.85); font-size: 11px; font-weight: 600;">
              ${isMaint ? '0.00 kg/week (Equilibrium)' : '—'}
            </span>
          </div>
        </div>
      </div>
      
      <div style="display:flex; flex-wrap: wrap; gap: var(--space-sm); width: 100%; box-sizing: border-box;">
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 120px; box-sizing: border-box;">
          <label class="input-label" for="edit-target-weight">Target Wt (kg)</label>
          <input class="input-field" style="width:100%; box-sizing:border-box;" type="number" step="0.1" id="edit-target-weight" name="targetWeight" value="${phase.targetWeight}" inputmode="decimal">
        </div>
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 120px; box-sizing: border-box;">
          <label class="input-label" for="edit-target-bf">Target BF%</label>
          <input class="input-field" style="width:100%; box-sizing:border-box;" type="number" step="0.1" id="edit-target-bf" name="targetBF" value="${phase.targetBF}" inputmode="decimal">
        </div>
      </div>
      
      <div style="display:flex; flex-wrap: wrap; gap: var(--space-sm); width: 100%; box-sizing: border-box;">
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 120px; box-sizing: border-box;">
          <label class="input-label" for="edit-actual-weight">Actual Wt (kg)</label>
          <input class="input-field" style="width:100%; box-sizing:border-box;" type="number" step="0.1" id="edit-actual-weight" name="actualWeight" value="${phase.actualWeight ?? ''}" inputmode="decimal" placeholder="—">
        </div>
        <div class="input-group" style="flex: 1 1 calc(50% - var(--space-sm)); min-width: 120px; box-sizing: border-box;">
          <label class="input-label" for="edit-actual-bf">Actual BF%</label>
          <input class="input-field" style="width:100%; box-sizing:border-box;" type="number" step="0.1" id="edit-actual-bf" name="actualBF" value="${phase.actualBF ?? ''}" inputmode="decimal" placeholder="—">
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap: var(--space-xs); margin-top: var(--space-xs);">
        <button type="submit" class="btn btn-primary w-full" style="padding: var(--space-md); font-size: var(--fs-body);">Save & Recalculate</button>
        ${store.state.phases.length > 1 ? `
          <button type="button" id="btn-delete-phase" class="btn btn-ghost w-full" style="color: var(--color-error); border-color: rgba(224,83,83,0.3); padding: 8px; font-size: 12px;">
            Delete Phase
          </button>
        ` : ''}
      </div>
    </form>
  `;

  const modal = openModal({
    title: `Edit: ${phase.name}`,
    content,
    id: 'phase-edit-modal'
  });

  let selectedOffset = currentOffset;

  // Projection logic
  function updateProjection(offset) {
    const weeklyChange = (offset * 7) / 7700;
    const projDisplay = document.getElementById('projection-display');
    const endDateInput = document.getElementById('edit-end-date');
    const targetW = parseFloat(document.getElementById('edit-target-weight').value) || phase.targetWeight;
    
    if (projDisplay) {
      projDisplay.textContent = `≈ ${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(2)} kg/week`;
    }

    if (Math.abs(weeklyChange) > 0.05) {
      const kgDiff = targetW - currentWeight;
      // Only project if moving in right direction
      if ((isCut && kgDiff < 0 && weeklyChange < 0) || (!isCut && kgDiff > 0 && weeklyChange > 0)) {
        const weeksNeeded = Math.abs(kgDiff / weeklyChange);
        const sDateInput = document.getElementById('edit-start-date');
        const start = sDateInput && sDateInput.value ? new Date(sDateInput.value) : new Date(phase.startDate);
        const projectedEnd = new Date(start);
        projectedEnd.setDate(projectedEnd.getDate() + Math.round(weeksNeeded * 7));
        if (endDateInput) {
          endDateInput.value = projectedEnd.toISOString().split('T')[0];
        }
      }
    }
  }

  // Mount slider
  setTimeout(() => {
    const sliderContainer = document.getElementById('tdee-slider-container');
    if (sliderContainer) {
      const slider = createLiquidSlider({
        min: minOffset,
        max: maxOffset,
        step: 50,
        value: currentOffset,
        label: isCut ? 'Deficit' : 'Surplus',
        formatValue: (v) => {
          const pct = tdeeBase ? Math.round((v / tdeeBase) * 100) : 0;
          return `${v > 0 ? '+' : ''}${v} kcal (${v > 0 ? '+' : ''}${pct}%)`;
        },
        onChange: (v) => {
          selectedOffset = v;
          const targetDisplay = document.getElementById('target-cals-display');
          if (targetDisplay) targetDisplay.textContent = tdeeBase + v;
          updateProjection(v);
        }
      });
      sliderContainer.appendChild(slider.element);
      
      // Listen to target weight changes to update projection too
      const twInput = document.getElementById('edit-target-weight');
      if (twInput) twInput.addEventListener('input', () => updateProjection(selectedOffset));
      
      updateProjection(currentOffset);
    }
  }, 100);

  // Form submit handler
  const form = document.getElementById('phase-edit-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fd = new FormData(form);
    
    const updates = {
      status: fd.get('status'),
      type: fd.get('type') || phase.type,
      targetWeight: parseFloat(fd.get('targetWeight')),
      targetBF: parseFloat(fd.get('targetBF')),
      actualWeight: fd.get('actualWeight') ? parseFloat(fd.get('actualWeight')) : null,
      actualBF: fd.get('actualBF') ? parseFloat(fd.get('actualBF')) : null,
      cals: `${selectedOffset > 0 ? '+' : ''}${selectedOffset} kcal`
    };

    const sD = fd.get('startDate');
    if (sD) updates.startDate = new Date(sD).toISOString();
    
    const eD = fd.get('endDate');
    if (eD) updates.endDate = new Date(eD).toISOString();
    
    if (updates.startDate && updates.endDate) {
      const ms = new Date(updates.endDate) - new Date(updates.startDate);
      const wks = Math.round(ms / (1000 * 60 * 60 * 24 * 7));
      updates.weeks = `${Math.max(1, wks)} Weeks`;
    }
    
    store.updatePhase(phase.id, updates);
    modal.close();
  });

  const deleteBtn = document.getElementById('btn-delete-phase');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      store.deletePhase(phase.id);
      modal.close();
    });
  }
}
