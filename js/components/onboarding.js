/**
 * Onboarding — First-Run Empty State
 * Guides the user to set their starting weight/BF% and first phase.
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { validateCheckIn } from '../validation.js';

/**
 * Render the onboarding card into the given container.
 * Returns true if onboarding was shown, false if already complete.
 * @param {HTMLElement} container
 * @param {function} onComplete - Called when onboarding finishes
 * @returns {boolean}
 */
export function renderOnboarding(container, onComplete) {
  if (store.isOnboardingComplete()) return false;

  container.innerHTML = `
    <div class="onboarding animate-fade-in">
      <div class="card card--accent onboarding__card">
        <div class="onboarding__icon">
          ${icons.shield(48)}
        </div>
        <h1 class="font-display onboarding__title">Begin Your Discipline</h1>
        <p class="text-secondary onboarding__subtitle">Set your starting weight and body fat to forge your first phase.</p>
        
        <form id="onboarding-form" class="flex flex-col gap-md" style="margin-top: var(--space-lg); width: 100%;">
          <div class="input-group">
            <label class="input-label" for="ob-weight">Starting Weight (kg)</label>
            <input class="input-field" type="number" step="0.1" id="ob-weight" name="weight" 
              inputmode="decimal" placeholder="e.g. 62.0" required autofocus>
            <span class="input-error" data-error="weight"></span>
          </div>
          <div class="input-group">
            <label class="input-label" for="ob-bf">Starting Body Fat %</label>
            <input class="input-field" type="number" step="0.1" id="ob-bf" name="bodyFat" 
              inputmode="decimal" placeholder="e.g. 18.0" required>
            <span class="input-error" data-error="bodyFat"></span>
          </div>
          <button type="submit" class="btn btn-primary w-full" style="margin-top: var(--space-sm);">
            ${icons.arrowRight(18)} Begin
          </button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('onboarding-form');
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
    
    store.completeOnboarding(result.values.weight, result.values.bodyFat);
    if (onComplete) onComplete();
  });

  return true;
}
