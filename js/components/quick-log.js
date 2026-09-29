/**
 * Quick Log — Floating Action Button
 * Two taps to log today's weight/BF: tap FAB → enter data → tap Log.
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { openModal } from './modal-sheet.js';
import { validateCheckIn } from '../validation.js';
import { createLiquidSlider } from './liquid-slider.js';

/**
 * Initialize the quick log FAB.
 */
export function initQuickLog() {
  const fabContainer = document.getElementById('fab-container');
  if (!fabContainer) return;
  
  fabContainer.innerHTML = `
    <button class="quick-log-fab glass-clear" id="quick-log-btn" aria-label="Quick log check-in">
      ${icons.plus(24)}
    </button>
  `;

  document.getElementById('quick-log-btn').addEventListener('click', openQuickLogModal);
}

export function openQuickLogModal(targetDate = null) {
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = targetDate || today;
  
  // Look for existing check-in for this specific date
  const checkIns = store.getCheckIns();
  const existing = checkIns.find(c => c.date === selectedDate);
  const latest = store.getLatestCheckIn();
  
  let wVal = existing?.weight != null ? existing.weight : (latest?.weight != null ? latest.weight : 70.0);
  let bfVal = existing?.bodyFat != null ? existing.bodyFat : (latest?.bodyFat != null ? latest.bodyFat : 15.0);
  let notesVal = existing?.notes || '';
  const isEditing = !!existing;

  const content = `
    <form id="quick-log-form" class="flex flex-col gap-md">
      <div class="input-group">
        <label class="input-label">Date</label>
        <input class="input-field" type="date" value="${selectedDate}" id="ql-date" name="date" style="opacity: 0.9;">
      </div>
      
      <div class="input-group">
        <label class="input-label" for="ql-weight">Weight (kg)</label>
        <div id="ql-weight-slider"></div>
        <input class="input-field" type="number" step="0.1" id="ql-weight" name="weight" value="${wVal}" style="display:none;">
      </div>
      
      <div class="input-group">
        <label class="input-label" for="log-bf">Body Fat % (Optional)</label>
        <div id="ql-bf-slider"></div>
        <input class="input-field" type="number" step="0.1" id="log-bf" name="bodyFat" value="${bfVal}" style="display:none;">
      </div>
      
      <div class="input-group">
        <label class="input-label" for="ql-notes">Notes <span class="text-tertiary">(optional)</span></label>
        <input class="input-field" type="text" id="ql-notes" name="notes" value="${notesVal.replace(/"/g, '&quot;')}" placeholder="How are you feeling?">
      </div>
      <button type="submit" class="btn btn-primary w-full">
        ${icons.check(18)} ${isEditing ? 'Update Check-in' : 'Log Check-in'}
      </button>
    </form>
  `;

  const modal = openModal({
    title: isEditing ? 'Edit Check-in' : 'Log Check-in',
    content,
    id: 'quick-log-modal'
  });

  setTimeout(() => {
    const wContainer = document.getElementById('ql-weight-slider');
    const bfContainer = document.getElementById('ql-bf-slider');
    const wInput = document.getElementById('ql-weight');
    const bfInput = document.getElementById('log-bf');

    if (wContainer) {
      const wSlider = createLiquidSlider({
        min: Math.floor(wVal - 5),
        max: Math.ceil(wVal + 5),
        step: 0.1,
        value: wVal,
        label: 'Slide to adjust',
        formatValue: v => v.toFixed(1) + ' kg',
        onChange: v => { wInput.value = v.toFixed(1); }
      });
      wContainer.appendChild(wSlider.element);
    }
    
    if (bfContainer) {
      const bfSlider = createLiquidSlider({
        min: Math.floor(bfVal - 3),
        max: Math.ceil(bfVal + 3),
        step: 0.1,
        value: bfVal,
        label: 'Slide to adjust',
        formatValue: v => v.toFixed(1) + '%',
        onChange: v => { bfInput.value = v.toFixed(1); }
      });
      bfContainer.appendChild(bfSlider.element);
    }
  }, 100);

  const form = document.getElementById('quick-log-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Clear errors
    form.querySelectorAll('.input-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.input-field--error').forEach(el => el.classList.remove('input-field--error'));
    
    const result = validateCheckIn({
      weight: form.weight.value,
      bodyFat: form.bodyFat.value
    });
    
    if (!result.valid) {
      result.errors.forEach(err => {
        const errorEl = form.querySelector(`[data-error="${err.field}"]`);
        const inputEl = form.querySelector(`[name="${err.field}"]`);
        if (errorEl) errorEl.textContent = err.message;
        if (inputEl) inputEl.classList.add('input-field--error');
      });
      return;
    }
    
    store.addCheckIn({
      date: form.date.value,
      weight: result.values.weight,
      bodyFat: result.values.bodyFat,
      notes: form.notes.value || ''
    });
    
    // Success feedback — brief check icon flash
    const btn = form.querySelector('[type="submit"]');
    btn.innerHTML = `${icons.check(18)} ${isEditing ? 'Updated!' : 'Logged!'}`;
    btn.disabled = true;
    btn.style.background = 'var(--color-success)';
    
    setTimeout(() => modal.close(), 600);
  });
}
