/**
 * Discipline Ring — SVG Circular Progress Indicator
 * Shows 30-day and 90-day rolling consistency percentages.
 */
import { computeDisciplineIndex } from '../discipline-index.js';
import { store } from '../store.js';

/**
 * Render the discipline ring into the given container.
 * @param {HTMLElement} container
 */
export function renderDisciplineRing(container) {
  const checkIns = store.getCheckIns();
  const { thirtyDay, ninetyDay, allTimeCount } = computeDisciplineIndex(checkIns);
  
  const radius30 = 52;
  const radius90 = 42;
  const circumference30 = 2 * Math.PI * radius30;
  const circumference90 = 2 * Math.PI * radius90;
  const offset30 = circumference30 - (thirtyDay / 100) * circumference30;
  const offset90 = circumference90 - (ninetyDay / 100) * circumference90;

  container.innerHTML = `
    <div class="discipline-ring">
      <div class="discipline-ring__chart">
        <svg viewBox="0 0 120 120" class="discipline-ring__svg">
          <!-- Track circles -->
          <circle cx="60" cy="60" r="${radius30}" fill="none" stroke="var(--color-border)" stroke-width="5" />
          <circle cx="60" cy="60" r="${radius90}" fill="none" stroke="var(--color-border)" stroke-width="4" />
          
          <!-- 30-day arc (outer) -->
          <circle cx="60" cy="60" r="${radius30}" fill="none"
            stroke="var(--color-accent)" stroke-width="5"
            stroke-dasharray="${circumference30}"
            stroke-dashoffset="${offset30}"
            stroke-linecap="round"
            transform="rotate(-90 60 60)"
            class="discipline-ring__arc discipline-ring__arc--30"
            style="--ring-circumference: ${circumference30}; --ring-offset: ${offset30};"
          />
          
          <!-- 90-day arc (inner) -->
          <circle cx="60" cy="60" r="${radius90}" fill="none"
            stroke="var(--color-accent-dark)" stroke-width="4"
            stroke-dasharray="${circumference90}"
            stroke-dashoffset="${offset90}"
            stroke-linecap="round"
            transform="rotate(-90 60 60)"
            class="discipline-ring__arc discipline-ring__arc--90"
            style="--ring-circumference: ${circumference90}; --ring-offset: ${offset90};"
          />
          
          <!-- Center count -->
          <text x="60" y="56" text-anchor="middle" 
            class="discipline-ring__count"
            fill="var(--color-text)" 
            font-family="var(--font-display)" 
            font-size="20" font-weight="700">
            ${allTimeCount}
          </text>
          <text x="60" y="72" text-anchor="middle" 
            fill="var(--color-text-tertiary)" 
            font-family="var(--font-body)" 
            font-size="7" 
            letter-spacing="0.1em"
            text-transform="uppercase">
            CHECK-INS
          </text>
        </svg>
      </div>
      <div class="discipline-ring__labels">
        <div class="discipline-ring__label">
          <span class="text-caption text-accent">30d</span>
          <span class="text-small text-tabular">${thirtyDay}%</span>
        </div>
        <div class="discipline-ring__label">
          <span class="text-caption text-tertiary">90d</span>
          <span class="text-small text-tabular">${ninetyDay}%</span>
        </div>
      </div>
    </div>
  `;
}
