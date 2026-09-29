/**
 * Calendar View & Daily Log Inspector — Phase 3
 * Allows full inspection of every single day's check-in data,
 * tapping any calendar day to inspect/edit, and a comprehensive daily history log.
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { openModal } from './modal-sheet.js';
import { openQuickLogModal } from './quick-log.js';

let currentDate = new Date();
let viewMode = 'monthly'; // 'monthly' | 'weekly'
let selectedDateStr = null;

/**
 * Format date string (YYYY-MM-DD) into readable format
 */
function formatReadableDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getRelativeDateLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  return null;
}

/**
 * Open detail modal for a specific day
 */
export function openDayDetailModal(dateStr, onUpdateCallback) {
  const checkIns = store.getCheckIns();
  const entryIdx = checkIns.findIndex(c => c.date === dateStr);
  const entry = entryIdx >= 0 ? checkIns[entryIdx] : null;
  const prevEntry = entryIdx > 0 ? checkIns[entryIdx - 1] : null;

  const phases = store.getPhases();
  // Find which phase this date belonged to
  const matchingPhase = phases.find(p => {
    if (!p.startDate || !p.endDate) return false;
    const s = p.startDate.split('T')[0];
    const e = p.endDate.split('T')[0];
    return dateStr >= s && dateStr <= e;
  }) || store.getActivePhase();

  const relLabel = getRelativeDateLabel(dateStr);
  const dateHeading = relLabel ? `${relLabel} (${formatReadableDate(dateStr)})` : formatReadableDate(dateStr);

  let contentHtml = '';

  if (entry) {
    const w = entry.weight != null ? entry.weight : '—';
    const bf = entry.bodyFat != null ? entry.bodyFat : null;
    let lbm = null;
    let fatMass = null;
    if (entry.weight != null && entry.bodyFat != null) {
      lbm = (entry.weight * (1 - entry.bodyFat / 100)).toFixed(1);
      fatMass = (entry.weight * (entry.bodyFat / 100)).toFixed(1);
    }

    let weightDeltaHtml = '';
    if (prevEntry && prevEntry.weight != null && entry.weight != null) {
      const diff = (entry.weight - prevEntry.weight).toFixed(1);
      const sign = diff > 0 ? `+${diff}` : diff;
      const color = diff > 0 ? 'var(--color-accent)' : 'var(--color-cut-light)';
      weightDeltaHtml = `<span style="font-size: 12px; color: ${color}; font-weight: 600; margin-left: 6px;">(${sign} kg)</span>`;
    }

    contentHtml = `
      <div class="day-detail-view" style="display: flex; flex-direction: column; gap: var(--space-md);">
        
        <!-- Header badge: Phase context -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: var(--space-xs); border-bottom: 1px solid var(--color-border);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge ${matchingPhase?.type === 'BULK' ? 'badge--bulk' : 'badge--cut'}" style="font-size: 11px;">
              ${matchingPhase?.name || 'Protocol'}
            </span>
            <span class="text-caption text-secondary" style="font-size: 12px;">${matchingPhase?.type || 'PHASE'}</span>
          </div>
          <span class="text-caption text-tertiary" style="font-variant-numeric: tabular-nums;">${dateStr}</span>
        </div>

        <!-- 2x2 Primary Biometrics Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <!-- Weight Card -->
          <div class="card glass-clear" style="padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: left;">
            <div class="text-caption text-tertiary" style="font-size: 11px; margin-bottom: 4px; letter-spacing: 0.05em;">BODY WEIGHT</div>
            <div style="display: flex; align-items: baseline;">
              <span class="font-display" style="font-size: 1.6rem; font-weight: 700; color: var(--color-text);">${w}</span>
              <span style="font-size: 13px; color: var(--color-text-secondary); margin-left: 4px;">kg</span>
              ${weightDeltaHtml}
            </div>
          </div>

          <!-- Body Fat Card -->
          <div class="card glass-clear" style="padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: left;">
            <div class="text-caption text-tertiary" style="font-size: 11px; margin-bottom: 4px; letter-spacing: 0.05em;">BODY FAT</div>
            <div style="display: flex; align-items: baseline;">
              <span class="font-display" style="font-size: 1.6rem; font-weight: 700; color: ${bf != null ? 'var(--color-accent-light)' : 'var(--color-text-tertiary)'};">
                ${bf != null ? bf : '—'}
              </span>
              ${bf != null ? '<span style="font-size: 13px; color: var(--color-accent); margin-left: 4px;">%</span>' : ''}
            </div>
          </div>

          <!-- Lean Mass Card -->
          <div class="card glass-clear" style="padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: left;">
            <div class="text-caption text-tertiary" style="font-size: 11px; margin-bottom: 4px; letter-spacing: 0.05em;">LEAN MASS</div>
            <div style="display: flex; align-items: baseline;">
              <span class="font-display" style="font-size: 1.45rem; font-weight: 700; color: var(--color-accent);">
                ${lbm != null ? lbm : '—'}
              </span>
              ${lbm != null ? '<span style="font-size: 13px; color: var(--color-accent-light); margin-left: 4px;">kg</span>' : ''}
            </div>
          </div>

          <!-- Fat Mass Card -->
          <div class="card glass-clear" style="padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: left;">
            <div class="text-caption text-tertiary" style="font-size: 11px; margin-bottom: 4px; letter-spacing: 0.05em;">FAT MASS</div>
            <div style="display: flex; align-items: baseline;">
              <span class="font-display" style="font-size: 1.45rem; font-weight: 700; color: var(--color-text-secondary);">
                ${fatMass != null ? fatMass : '—'}
              </span>
              ${fatMass != null ? '<span style="font-size: 13px; color: var(--color-text-tertiary); margin-left: 4px;">kg</span>' : ''}
            </div>
          </div>
        </div>

        <!-- Notes Card -->
        <div class="card glass-clear" style="padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div class="text-caption text-tertiary" style="font-size: 11px; margin-bottom: 6px; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            ${icons.columns ? icons.columns(14) : ''}
            <span>DAILY LOG & NOTES</span>
          </div>
          <div style="font-size: 14px; line-height: 1.5; color: ${entry.notes ? 'var(--color-text)' : 'var(--color-text-tertiary)'}; font-style: ${entry.notes ? 'normal' : 'italic'};">
            ${entry.notes ? entry.notes.replace(/\n/g, '<br>') : 'No notes recorded for this check-in.'}
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; flex-direction: column; gap: var(--space-xs); margin-top: var(--space-xs);">
          <button type="button" class="btn btn-primary" id="btn-modal-edit-checkin" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${icons.edit ? icons.edit(18) : icons.plus(18)} Edit Check-in
          </button>
          <button type="button" class="btn-destructive" id="btn-modal-delete-checkin" style="margin-top: 4px; padding: 10px; font-size: 13px; border-radius: var(--radius-md); background: rgba(140, 47, 47, 0.12); color: var(--color-cut-light); border: 1px solid rgba(140, 47, 47, 0.25);">
            Delete This Check-in
          </button>
        </div>

      </div>
    `;
  } else {
    // No entry for this day
    contentHtml = `
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--space-lg) var(--space-md); gap: var(--space-md);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-bg-elevated); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-text-tertiary);">
          ${icons.calendar ? icons.calendar(28) : icons.target(28)}
        </div>
        <div>
          <h4 class="font-display" style="font-size: 1.25rem; margin-bottom: 4px;">No Check-in Recorded</h4>
          <p class="text-secondary text-small" style="max-width: 260px; margin: 0 auto;">
            No metrics were logged for ${formatReadableDate(dateStr)}.
          </p>
        </div>
        <button type="button" class="btn btn-primary" id="btn-modal-add-checkin" style="width: 100%; max-width: 260px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: var(--space-xs);">
          ${icons.plus ? icons.plus(18) : '+'} Log for This Day
        </button>
      </div>
    `;
  }

  const modal = openModal({
    title: dateHeading,
    content: contentHtml
  });

  setTimeout(() => {
    const editBtn = document.getElementById('btn-modal-edit-checkin');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        modal.close();
        setTimeout(() => {
          openQuickLogModal(dateStr);
        }, 150);
      });
    }

    const addBtn = document.getElementById('btn-modal-add-checkin');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        modal.close();
        setTimeout(() => {
          openQuickLogModal(dateStr);
        }, 150);
      });
    }

    const delBtn = document.getElementById('btn-modal-delete-checkin');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (confirm(`Delete the check-in recorded on ${formatReadableDate(dateStr)}?`)) {
          store.deleteCheckIn(dateStr);
          modal.close();
          if (onUpdateCallback) onUpdateCallback();
        }
      });
    }
  }, 100);
}

/**
 * Render the calendar view and daily history into the given container.
 * @param {HTMLElement} container
 */
export function renderCalendarView(container) {
  if (!container) return;

  const checkIns = store.getCheckIns();
  const loggedDatesMap = new Map();
  checkIns.forEach(c => loggedDatesMap.set(c.date, c));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const loggedToday = loggedDatesMap.has(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  let calendarBody = '';
  if (viewMode === 'monthly') {
    calendarBody = renderMonthlyView(year, month, loggedDatesMap);
  } else {
    calendarBody = renderWeeklyView(currentDate, loggedDatesMap);
  }

  // Render recent check-in list (newest first)
  const sortedHistory = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));

  const historyCardsHtml = sortedHistory.length === 0 ? `
    <div class="card glass-clear" style="padding: var(--space-xl); text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-lg);">
      <div style="color: var(--color-accent); margin-bottom: var(--space-xs);">${icons.target(36)}</div>
      <h4 class="font-display" style="font-size: 1.15rem; margin-bottom: 4px;">No Check-ins Yet</h4>
      <p class="text-secondary text-small" style="margin-bottom: var(--space-md);">Tap below or use the quick log button to record your first daily metrics.</p>
      <button class="btn btn-primary" id="btn-first-log" style="display: inline-flex; align-items: center; gap: 6px;">
        ${icons.plus(18)} Log Today
      </button>
    </div>
  ` : sortedHistory.map(entry => {
    const rel = getRelativeDateLabel(entry.date);
    const dateTitle = rel ? `${rel} • ${formatReadableDate(entry.date)}` : formatReadableDate(entry.date);
    const w = entry.weight != null ? `${entry.weight} kg` : '—';
    const bf = entry.bodyFat != null ? `${entry.bodyFat}%` : null;
    let lbm = null;
    if (entry.weight != null && entry.bodyFat != null) {
      lbm = `${(entry.weight * (1 - entry.bodyFat / 100)).toFixed(1)} kg LBM`;
    }

    return `
      <div class="card glass-clear daily-history-card" data-date="${entry.date}" style="cursor: pointer; padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); transition: all 0.15s ease; margin-bottom: var(--space-xs);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; font-size: 14px; color: ${rel === 'Today' ? 'var(--color-accent-light)' : 'var(--color-text)'};">
              ${dateTitle}
            </span>
            ${rel === 'Today' ? '<span class="badge badge--bulk" style="font-size: 10px; padding: 2px 6px;">TODAY</span>' : ''}
          </div>
          <div style="color: var(--color-text-tertiary); display: flex; align-items: center;">
            ${icons.chevronRight(18)}
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(243, 239, 230, 0.07); padding: 3px 8px; border-radius: var(--radius-pill); font-size: 12.5px; font-weight: 600; color: var(--color-text);">
            ${w}
          </span>
          ${bf ? `
            <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(201, 161, 90, 0.12); border: 1px solid rgba(201, 161, 90, 0.25); padding: 3px 8px; border-radius: var(--radius-pill); font-size: 12.5px; font-weight: 600; color: var(--color-accent-light);">
              ${bf} BF
            </span>
          ` : ''}
          ${lbm ? `
            <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(74, 124, 92, 0.12); padding: 3px 8px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 500; color: var(--color-bulk-light);">
              ${lbm}
            </span>
          ` : ''}
        </div>

        ${entry.notes ? `
          <div style="margin-top: 8px; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 4px; border-left: 2px solid var(--color-border-accent);">
            "${entry.notes}"
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Top Log Action Banner (if today not logged) -->
    ${!loggedToday ? `
      <div class="card glass-regular animate-fade-in" style="margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--color-border-accent); background: linear-gradient(135deg, rgba(201, 161, 90, 0.12) 0%, rgba(20, 20, 24, 0.8) 100%); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; gap: var(--space-md);">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 14.5px; color: var(--color-accent-light); margin-bottom: 2px;">
            Today's Check-in Pending
          </div>
          <div class="text-caption text-secondary" style="font-size: 12px; text-transform: none; letter-spacing: 0;">
            Keep your Spartan streak unbroken. Log today's weight & metrics.
          </div>
        </div>
        <button class="btn btn-primary" id="btn-quick-log-banner" style="flex-shrink: 0; padding: 8px 14px; font-size: 13px; border-radius: var(--radius-pill);">
          ${icons.plus(16)} Log Today
        </button>
      </div>
    ` : ''}

    <!-- Interactive Calendar Card -->
    <div class="calendar-view card glass-regular animate-fade-in" style="margin-bottom: var(--space-lg); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
      <div class="calendar-view__header">
        <div class="calendar-view__nav">
          <button class="btn-icon" id="cal-prev" aria-label="Previous">
            ${icons.chevronLeft(20)}
          </button>
          <h3 class="font-display calendar-view__month" style="font-size: 1.15rem; font-weight: 700;">${monthNames[month]} ${year}</h3>
          <button class="btn-icon" id="cal-next" aria-label="Next">
            ${icons.chevronRight(20)}
          </button>
        </div>
        <div class="segmented-control" id="cal-mode-toggle">
          <button class="segmented-control__option ${viewMode === 'weekly' ? 'segmented-control__option--active' : ''}" data-mode="weekly">Weekly</button>
          <button class="segmented-control__option ${viewMode === 'monthly' ? 'segmented-control__option--active' : ''}" data-mode="monthly">Monthly</button>
        </div>
      </div>
      
      <div class="calendar-view__days-header" style="margin-bottom: 6px;">
        ${dayNames.map(d => `<span class="text-caption text-tertiary" style="font-size: 11px; font-weight: 600;">${d}</span>`).join('')}
      </div>
      
      <div class="calendar-view__grid ${viewMode === 'weekly' ? 'calendar-view__grid--weekly' : ''}">
        ${calendarBody}
      </div>

      <div style="margin-top: var(--space-sm); padding-top: var(--space-xs); border-top: 1px solid rgba(243, 239, 230, 0.08); display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--color-text-tertiary);">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); display: inline-block;"></span>
          <span>Logged Check-in</span>
        </div>
        <span>Tap any date to inspect</span>
      </div>
    </div>

    <!-- Daily Log Feed Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); padding: 0 4px;">
      <h3 class="font-display" style="font-size: 1.15rem; text-transform: uppercase; letter-spacing: var(--ls-wider); color: var(--color-text-secondary); margin: 0;">
        Daily Activity Log (${checkIns.length})
      </h3>
      <button class="btn-icon" id="btn-manual-log-new" title="Log a date" style="color: var(--color-accent);">
        ${icons.plus(20)}
      </button>
    </div>

    <!-- Daily Check-in History Cards -->
    <div class="daily-history-list animate-fade-in" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: var(--space-2xl);">
      ${historyCardsHtml}
    </div>
  `;

  // Attach event handlers
  setupCalendarEventHandlers(container);
}

function setupCalendarEventHandlers(container) {
  // Navigation handlers
  container.querySelector('#cal-prev')?.addEventListener('click', () => {
    if (viewMode === 'monthly') {
      currentDate.setDate(1);
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 7);
    }
    renderCalendarView(container);
  });

  container.querySelector('#cal-next')?.addEventListener('click', () => {
    if (viewMode === 'monthly') {
      currentDate.setDate(1);
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 7);
    }
    renderCalendarView(container);
  });

  // Mode toggle
  container.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      viewMode = btn.dataset.mode;
      renderCalendarView(container);
    });
  });

  // Top banner button
  container.querySelector('#btn-quick-log-banner')?.addEventListener('click', () => {
    openQuickLogModal();
  });

  // Manual new log button
  container.querySelector('#btn-manual-log-new')?.addEventListener('click', () => {
    openQuickLogModal();
  });

  container.querySelector('#btn-first-log')?.addEventListener('click', () => {
    openQuickLogModal();
  });

  // Day Cell Clicks
  container.querySelectorAll('.calendar-cell[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.dataset.date;
      if (!dateStr) return;
      selectedDateStr = dateStr;
      
      // Highlight cell visually
      container.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('calendar-cell--selected'));
      cell.classList.add('calendar-cell--selected');

      openDayDetailModal(dateStr, () => {
        renderCalendarView(container);
      });
    });
  });

  // History Card Clicks
  container.querySelectorAll('.daily-history-card[data-date]').forEach(card => {
    card.addEventListener('click', () => {
      const dateStr = card.dataset.date;
      if (!dateStr) return;
      openDayDetailModal(dateStr, () => {
        renderCalendarView(container);
      });
    });
  });
}

function renderMonthlyView(year, month, loggedDatesMap) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Monday-based week (0=Mon, 6=Sun)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  let cells = '';
  
  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    cells += '<div class="calendar-cell calendar-cell--empty"></div>';
  }
  
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = loggedDatesMap.get(dateStr);
    const hasData = !!entry;
    const isToday = dateStr === todayStr;
    const isFuture = new Date(dateStr) > today;
    const isSelected = dateStr === selectedDateStr;
    
    cells += `
      <div class="calendar-cell ${hasData ? 'calendar-cell--has-data' : ''} ${isToday ? 'calendar-cell--today' : ''} ${isFuture ? 'calendar-cell--future' : ''} ${isSelected ? 'calendar-cell--selected' : ''}" 
           data-date="${dateStr}"
           title="${dateStr}${hasData ? ` • ${entry.weight}kg` : ''}">
        <span class="calendar-cell__day">${day}</span>
        ${hasData ? '<span class="calendar-cell__dot"></span>' : '<span style="height:6px;"></span>'}
      </div>
    `;
  }
  
  return cells;
}

function renderWeeklyView(date, loggedDatesMap) {
  // Get Monday of the current week
  const monday = new Date(date);
  const dow = monday.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  monday.setDate(monday.getDate() + diff);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  let cells = '';
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = loggedDatesMap.get(dateStr);
    const hasData = !!entry;
    const isToday = dateStr === todayStr;
    const isFuture = d > today;
    const isSelected = dateStr === selectedDateStr;
    
    cells += `
      <div class="calendar-cell calendar-cell--weekly ${hasData ? 'calendar-cell--has-data' : ''} ${isToday ? 'calendar-cell--today' : ''} ${isFuture ? 'calendar-cell--future' : ''} ${isSelected ? 'calendar-cell--selected' : ''}"
           data-date="${dateStr}"
           title="${dateStr}${hasData ? ` • ${entry.weight}kg` : ''}">
        <span class="calendar-cell__day">${d.getDate()}</span>
        ${hasData ? `
          <span class="calendar-cell__dot"></span>
          <span style="font-size: 11px; font-weight: 600; color: var(--color-accent); font-variant-numeric: tabular-nums;">
            ${entry.weight}k
          </span>
        ` : '<span style="height:6px;"></span>'}
      </div>
    `;
  }
  
  return cells;
}
