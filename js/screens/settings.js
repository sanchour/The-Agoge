/**
 * Settings Screen
 * User profile, TDEE metrics, preferences, data management.
 */
import { store, ACCENT_PALETTES, applyAccentColor } from '../store.js';
import { icons } from '../icons.js';
import { openModal } from '../components/modal-sheet.js';

let initialized = false;

const PROFILE_ICONS = [
  { id: 'target', name: 'Focus Target', desc: 'Unyielding precision & focus' },
  { id: 'shield', name: 'Spartan Shield', desc: 'Unbreakable defense & poise' },
  { id: 'swords', name: 'Dual Blades', desc: 'Relentless combat readiness' },
  { id: 'flame', name: 'Prometheus Flame', desc: 'Internal drive & hunger' },
  { id: 'trophy', name: 'Agoge Victor', desc: 'Physique mastery & triumph' },
  { id: 'crown', name: 'Titan Crown', desc: 'Supreme natural strength' },
  { id: 'columns', name: 'Doric Pillar', desc: 'Structural mass & stability' },
  { id: 'user', name: 'Spartan Warrior', desc: 'Embodying the warrior identity' }
];

function openProfileIconModal(currentIcon, onSelect) {
  const iconListHtml = PROFILE_ICONS.map(pi => {
    const isSelected = pi.id === currentIcon;
    const border = isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)';
    const bg = isSelected ? 'rgba(201, 161, 90, 0.15)' : 'var(--color-bg-elevated)';
    const glow = isSelected ? 'box-shadow: 0 0 16px var(--color-accent-glow);' : '';
    return `
      <div class="card glass-clear profile-icon-card" data-icon-id="${pi.id}" style="cursor: pointer; padding: var(--space-md); display: flex; align-items: center; gap: var(--space-md); border: ${border}; background: ${bg}; ${glow}">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-bg); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-accent); flex-shrink: 0;">
          ${icons[pi.id] ? icons[pi.id](28) : icons.target(28)}
        </div>
        <div style="flex: 1; min-width: 0;">
          <h4 class="font-display" style="margin: 0; font-size: var(--fs-body);">${pi.name}</h4>
          <span class="text-caption text-tertiary" style="text-transform: none;">${pi.desc}</span>
        </div>
        ${isSelected ? `<span style="color: var(--color-accent);">${icons.check(20)}</span>` : ''}
      </div>
    `;
  }).join('');

  const modal = openModal({
    title: 'Profile Icon',
    content: `
      <p class="text-secondary text-small" style="margin-bottom: var(--space-md);">Select an icon that reflects your training identity.</p>
      <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
        ${iconListHtml}
      </div>
    `
  });

  setTimeout(() => {
    const cards = document.querySelectorAll('.profile-icon-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const selectedId = card.dataset.iconId;
        onSelect(selectedId);
        modal.close();
      });
    });
  }, 100);
}

export function initSettings() {
  if (initialized) return;
  
  const content = document.getElementById('settings-content');
  if (!content) return;

  renderSettings(content);

  store.subscribe(() => {
    const screen = document.getElementById('screen-settings');
    if (screen && screen.classList.contains('screen--active')) {
      // Re-render settings if needed
    }
  });
  
  initialized = true;
}

function getRankInfo() {
  const checkIns = store.getCheckIns();
  if (!checkIns.length) return { title: 'Neophyte', icon: 'shield' };
  const latest = checkIns[checkIns.length - 1];
  if (!latest.weight || !latest.bodyFat) return { title: 'Neophyte', icon: 'shield' };
  const lbm = latest.weight * (1 - (latest.bodyFat / 100));
  
  const ranks = [
    { title: "Titan Goal", minLBM: 68.5, icon: "trophy" },
    { title: "General", minLBM: 64.0, icon: "trophy" },
    { title: "Commander", minLBM: 61.5, icon: "flame" },
    { title: "Captain", minLBM: 58.0, icon: "columns" },
    { title: "Hoplite", minLBM: 54.0, icon: "shield" },
    { title: "Agoge Cadet", minLBM: 49.0, icon: "stoa" },
    { title: "Neophyte", minLBM: 0, icon: "shield" }
  ];
  return ranks.find(r => lbm >= r.minLBM) || ranks[6];
}

function renderSettings(content) {
  const s = store.state.settings;
  const checkIns = store.getCheckIns();
  const latest = checkIns.length ? checkIns[checkIns.length - 1] : { weight: '-', bodyFat: '-' };
  const rank = getRankInfo();
  const activeIcon = s.profileIcon || 'target';
  const activeAccent = s.accentColor || 'bronze';
  const phases = store.getPhases();
  const activePhase = store.getActivePhase();
  const phaseIdx = phases.findIndex(p => p.id === activePhase?.id);
  
  let lbmVal = null;
  if (latest.weight && latest.bodyFat && latest.weight !== '-' && latest.bodyFat !== '-') {
    lbmVal = (latest.weight * (1 - latest.bodyFat / 100)).toFixed(1);
  }

  content.innerHTML = `
    <!-- PREMIUM MINIMALIST PROFILE CARD -->
    <div class="card glass-regular animate-fade-in" style="margin-bottom: var(--space-md); padding: var(--space-md); border: 1px solid var(--color-border-accent); background: linear-gradient(135deg, rgba(201, 161, 90, 0.08) 0%, rgba(20, 20, 24, 0.85) 100%); border-radius: var(--radius-lg); width: 100%; box-sizing: border-box; overflow: hidden;">
      
      <!-- Top Row: Avatar + Identity + Edit -->
      <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md); width: 100%; box-sizing: border-box;">
        <!-- Avatar Ring -->
        <div id="profile-avatar-btn" style="width: 70px; height: 70px; border-radius: 50%; background: var(--color-bg-elevated); border: 2.5px solid var(--color-accent); display: flex; align-items: center; justify-content: center; color: var(--color-accent); cursor: pointer; position: relative; flex-shrink: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" title="Tap to change profile icon">
          <span id="profile-avatar-icon">${icons[activeIcon] ? icons[activeIcon](36) : icons.target(36)}</span>
          <div style="position: absolute; bottom: 0px; right: 0px; background: var(--color-accent); color: #0A0A0C; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
            ${icons.edit(12)}
          </div>
        </div>

        <!-- Name, Rank & Active Phase -->
        <div style="flex: 1; min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: var(--space-2xs); width: 100%;">
            <input type="text" id="profile-name" value="${s.name || 'Spartan'}" class="font-display" style="font-size: clamp(1.3rem, 4.5vw, 1.75rem); font-weight: 700; background: transparent; border: none; border-bottom: 1px dashed var(--color-border); color: var(--color-text); padding: 0 2px; width: 100%; max-width: 100%; box-sizing: border-box; letter-spacing: 0.02em; min-width: 0;" placeholder="Warrior Name" />
            <span style="color: var(--color-text-tertiary); flex-shrink: 0;">${icons.edit(15)}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
            <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(201, 161, 90, 0.15); border: 1px solid var(--color-border-accent); padding: 2px 8px; border-radius: var(--radius-pill); color: var(--color-accent-light); font-size: 12px; font-weight: 600; flex-shrink: 0;">
              ${icons[rank.icon] ? icons[rank.icon](13) : icons.shield(13)}
              <span>${rank.title}</span>
            </div>
            <span class="text-caption text-secondary" style="font-size: 12px; letter-spacing: 0.02em; white-space: normal; word-break: break-word;">
              ${activePhase ? `${activePhase.name} • Phase ${phaseIdx + 1}/${phases.length}` : 'Agoge Journey'}
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Minimalist Biometrics Bar -->
      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; padding-top: var(--space-sm); border-top: 1px solid rgba(243, 239, 230, 0.1); text-align: center; width: 100%; box-sizing: border-box;">
        <div style="padding: 2px 1px; min-width: 0; overflow: hidden;">
          <span class="text-caption text-tertiary" style="font-size: 10px; display: block; letter-spacing: 0.04em; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">WEIGHT</span>
          <span class="font-display" style="font-size: clamp(1.05rem, 3.6vw, 1.3rem); font-weight: 700; color: var(--color-text); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${latest.weight !== '-' ? `${latest.weight}<span style="font-size: 11px; font-weight: normal; color: var(--color-text-secondary); margin-left: 1px;">kg</span>` : '—'}
          </span>
        </div>
        <div style="padding: 2px 1px; border-left: 1px solid rgba(243, 239, 230, 0.08); min-width: 0; overflow: hidden;">
          <span class="text-caption text-tertiary" style="font-size: 10px; display: block; letter-spacing: 0.04em; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">BODY FAT</span>
          <span class="font-display" style="font-size: clamp(1.05rem, 3.6vw, 1.3rem); font-weight: 700; color: var(--color-text); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${latest.bodyFat !== '-' ? `${latest.bodyFat}<span style="font-size: 11px; font-weight: normal; color: var(--color-text-secondary); margin-left: 1px;">%</span>` : '—'}
          </span>
        </div>
        <div style="padding: 2px 1px; border-left: 1px solid rgba(243, 239, 230, 0.08); min-width: 0; overflow: hidden;">
          <span class="text-caption text-tertiary" style="font-size: 10px; display: block; letter-spacing: 0.04em; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">LEAN MASS</span>
          <span class="font-display" style="font-size: clamp(1.05rem, 3.6vw, 1.3rem); font-weight: 700; color: var(--color-accent-light); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${lbmVal ? `${lbmVal}<span style="font-size: 11px; font-weight: normal; color: var(--color-accent); margin-left: 1px;">kg</span>` : '—'}
          </span>
        </div>
        <div style="padding: 2px 1px; border-left: 1px solid rgba(243, 239, 230, 0.08); min-width: 0; overflow: hidden;">
          <span class="text-caption text-tertiary" style="font-size: 10px; display: block; letter-spacing: 0.04em; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">LOGGED</span>
          <span class="font-display" style="font-size: clamp(1.05rem, 3.6vw, 1.3rem); font-weight: 700; color: var(--color-text); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${checkIns.length}<span style="font-size: 11px; font-weight: normal; color: var(--color-text-secondary); margin-left: 1px;">d</span>
          </span>
        </div>
      </div>

    </div>

    <!-- TDEE & BIOMETRICS -->
    <h3 class="font-display" style="margin-bottom: var(--space-xs); margin-top: 0; color: var(--color-text-secondary); font-size: 1.15rem; text-transform: uppercase; letter-spacing: var(--ls-wider);">Biometrics (TDEE Profile)</h3>
    <div class="settings-list animate-fade-in" style="margin-bottom: var(--space-sm);">
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">Age</span>
        </div>
        <input type="number" id="profile-age" class="input-field" style="width: 75px; max-width: 80px; text-align: right;" value="${s.age || 25}">
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">Height (cm)</span>
        </div>
        <input type="number" id="profile-height" class="input-field" style="width: 75px; max-width: 80px; text-align: right;" value="${s.height || 175}">
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">Biological Sex</span>
        </div>
        <select id="profile-sex" class="input-field" style="width: auto; max-width: 120px;">
          <option value="male" ${s.sex === 'male' ? 'selected' : ''}>Male</option>
          <option value="female" ${s.sex === 'female' ? 'selected' : ''}>Female</option>
        </select>
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">Activity Level</span>
        </div>
        <select id="profile-activity" class="input-field" style="width: auto; max-width: 140px; text-overflow: ellipsis;">
          <option value="1.2" ${s.activityLevel === 1.2 ? 'selected' : ''}>Sedentary (1.2)</option>
          <option value="1.375" ${s.activityLevel === 1.375 ? 'selected' : ''}>Light (1.375)</option>
          <option value="1.55" ${s.activityLevel === 1.55 ? 'selected' : ''}>Moderate (1.55)</option>
          <option value="1.725" ${s.activityLevel === 1.725 ? 'selected' : ''}>Very Active (1.725)</option>
          <option value="1.9" ${s.activityLevel === 1.9 ? 'selected' : ''}>Extreme (1.9)</option>
        </select>
      </div>
    </div>

    <!-- PREFERENCES -->
    <h3 class="font-display" style="margin-bottom: var(--space-xs); margin-top: 0; color: var(--color-text-secondary); font-size: 1.15rem; text-transform: uppercase; letter-spacing: var(--ls-wider);">Preferences</h3>
    <div class="settings-list animate-fade-in" style="margin-bottom: var(--space-sm);">
      <!-- Accent Color Swatches -->
      <div class="settings-item" style="flex-direction: column; align-items: flex-start; gap: var(--space-xs);">
        <div class="settings-item-info" style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
          <span class="settings-item-title">Accent Color</span>
          <span class="text-caption text-accent" id="current-accent-name">${ACCENT_PALETTES[activeAccent]?.name || 'Bronze'}</span>
        </div>
        <div class="accent-swatches-container" style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap; justify-content: flex-start; padding-top: 4px; box-sizing: border-box;">
          ${Object.values(ACCENT_PALETTES).map(pal => {
            const isSel = activeAccent === pal.id;
            const outline = isSel ? 'outline: 2px solid var(--color-text); outline-offset: 2px;' : 'outline: none;';
            const shadow = isSel ? `box-shadow: 0 0 10px ${pal.glow};` : '';
            return `
              <button type="button" class="accent-swatch-btn" data-accent-id="${pal.id}" title="${pal.name}" style="width: 34px; height: 34px; border-radius: 50%; background: ${pal.hex}; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; ${outline} ${shadow} transition: transform 0.15s ease; flex-shrink: 0;" aria-label="${pal.name}">
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">App Icon</span>
        </div>
        <select id="profile-app-icon" class="input-field" style="width: auto; max-width: 130px;">
          <option value="classic" ${s.appIcon === 'classic' ? 'selected' : ''}>Classic Gold</option>
          <option value="stealth" ${s.appIcon === 'stealth' ? 'selected' : ''}>Stealth Black</option>
          <option value="blood" ${s.appIcon === 'blood' ? 'selected' : ''}>Spartan Red</option>
        </select>
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">Light Theme (Marble)</span>
          <span class="settings-item-desc">Switch to a flat light color palette</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggle-theme" ${s.theme === 'light' ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">In-App Reminders</span>
          <span class="settings-item-desc">Show daily banner if check-in is missed</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggle-reminders" ${s.reminderEnabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">Daily Notifications</span>
          <span class="settings-item-desc">Push reminders to log daily metrics</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="toggle-notifications" ${s.notificationsEnabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-item" id="notification-time-row" style="${s.notificationsEnabled ? 'display:flex;' : 'display:none;'}">
        <div class="settings-item-info">
          <span class="settings-item-title">Reminder Time</span>
          <span class="settings-item-desc">Scheduled daily reminder time</span>
        </div>
        <input type="time" id="notification-time" class="input-field" value="${s.notificationTime || '08:00'}" style="width: auto; max-width: 120px; box-sizing: border-box; padding: 6px 10px; font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 16px; text-align: center; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-bg-elevated); color: var(--color-text);">
      </div>
    </div>

    <!-- DATA MANAGEMENT -->
    <h3 class="font-display" style="margin-bottom: var(--space-xs); margin-top: 0; color: var(--color-text-secondary); font-size: 1.2rem; text-transform: uppercase; letter-spacing: var(--ls-wider);">Data Management</h3>
    <div class="settings-list animate-fade-in" style="margin-bottom: var(--space-sm);">
      <div class="settings-item" id="btn-export-data" style="cursor: pointer;">
        <div class="settings-item-info">
          <span class="settings-item-title">Export Data</span>
          <span class="settings-item-desc">Download your data as a JSON file</span>
        </div>
        ${icons.download(20)}
      </div>
      <div class="settings-item" id="btn-import-data" style="cursor: pointer;">
        <div class="settings-item-info">
          <span class="settings-item-title">Import Data</span>
          <span class="settings-item-desc">Restore from a previous backup</span>
        </div>
        ${icons.upload(20)}
      </div>
    </div>
    
    <!-- ACCOUNT -->
    <h3 class="font-display" style="margin-bottom: var(--space-xs); margin-top: 0; color: var(--color-text-secondary); font-size: 1.15rem; text-transform: uppercase; letter-spacing: var(--ls-wider);">Account</h3>
    <div class="settings-list animate-fade-in" style="margin-bottom: var(--space-2xl);">
      <div class="settings-item">
        <div class="settings-item-info">
          <span class="settings-item-title">Version</span>
          <span class="settings-item-desc">AGOGE Spartan Engine</span>
        </div>
        <span class="badge" style="background: rgba(243, 239, 230, 0.08); color: var(--color-text-secondary); font-size: 12px; font-variant-numeric: tabular-nums;">v2.1</span>
      </div>
      <div class="settings-item" id="btn-logout" style="cursor: pointer;">
        <div class="settings-item-info">
          <span class="settings-item-title" style="color: var(--color-error); font-weight: 600;">Log Out</span>
          <span class="settings-item-desc">Sign out and reset all data on this device</span>
        </div>
        <div style="color: var(--color-error); display: flex; align-items: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </div>
      </div>
    </div>
    
    <!-- Hidden file input for import -->
    <input type="file" id="file-import" accept=".json" style="display: none;">
  `;

  bindEvents(content);
}

function bindEvents(content) {
  // Profile Avatar Icon Picker
  const avatarBtn = content.querySelector('#profile-avatar-btn');
  if (avatarBtn) {
    avatarBtn.addEventListener('click', () => {
      const cur = store.state.settings.profileIcon || 'target';
      openProfileIconModal(cur, (newIconId) => {
        store.updateSettings({ profileIcon: newIconId });
        const iconEl = content.querySelector('#profile-avatar-icon');
        if (iconEl && icons[newIconId]) {
          iconEl.innerHTML = icons[newIconId](40);
        }
      });
    });
  }

  // Accent Color Swatches
  content.querySelectorAll('.accent-swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const accId = btn.dataset.accentId;
      applyAccentColor(accId);
      store.updateSettings({ accentColor: accId });
      
      // Update visual outline & glow across swatches immediately
      content.querySelectorAll('.accent-swatch-btn').forEach(b => {
        const isThis = b.dataset.accentId === accId;
        const pal = ACCENT_PALETTES[b.dataset.accentId];
        b.style.outline = isThis ? '2px solid var(--color-text)' : 'none';
        b.style.outlineOffset = isThis ? '3px' : '0';
        b.style.boxShadow = isThis && pal ? `0 0 12px ${pal.glow}` : 'none';
      });
      const nameEl = content.querySelector('#current-accent-name');
      if (nameEl) nameEl.textContent = ACCENT_PALETTES[accId]?.name || 'Bronze';
    });
  });

  // Name
  const nameInput = content.querySelector('#profile-name');
  if (nameInput) {
    nameInput.addEventListener('change', (e) => {
      store.updateSettings({ name: e.target.value });
    });
  }

  // TDEE Profile
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const handleNumericInput = debounce((e, key, fallback) => {
    const raw = e.target.value;
    if (raw.trim() === '') return; // Don't save empty states mid-typing
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val > 0 && val < 400) {
      e.target.style.color = 'inherit';
      store.updateSettings({ [key]: val });
    } else {
      e.target.style.color = 'var(--color-error)';
    }
  }, 500);

  const age = content.querySelector('#profile-age');
  if (age) {
    age.addEventListener('input', e => handleNumericInput(e, 'age'));
    age.addEventListener('blur', e => {
      const val = parseInt(e.target.value, 10);
      if (isNaN(val) || val <= 0 || val >= 400) {
        e.target.value = store.state.settings.age || 25; // Revert
        e.target.style.color = 'inherit';
      }
    });
  }

  const height = content.querySelector('#profile-height');
  if (height) {
    height.addEventListener('input', e => handleNumericInput(e, 'height'));
    height.addEventListener('blur', e => {
      const val = parseInt(e.target.value, 10);
      if (isNaN(val) || val <= 0 || val >= 400) {
        e.target.value = store.state.settings.height || 175;
        e.target.style.color = 'inherit';
      }
    });
  }

  const sex = content.querySelector('#profile-sex');
  if (sex) sex.addEventListener('change', e => store.updateSettings({ sex: e.target.value }));
  
  const activity = content.querySelector('#profile-activity');
  if (activity) activity.addEventListener('change', e => store.updateSettings({ activityLevel: parseFloat(e.target.value) || 1.2 }));

  // App Icon
  const appIcon = content.querySelector('#profile-app-icon');
  if (appIcon) {
    appIcon.addEventListener('change', (e) => {
      store.updateSettings({ appIcon: e.target.value });
      // Changing app icon requires native bridge or meta tags on web, we'll just save it to state.
    });
  }

  // Theme
  const themeToggle = content.querySelector('#toggle-theme');
  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      const isLight = e.target.checked;
      store.updateSettings({ theme: isLight ? 'light' : 'dark' });
      document.body.classList.toggle('theme-light', isLight);
    });
  }

  // Reminders
  const reminderToggle = content.querySelector('#toggle-reminders');
  if (reminderToggle) {
    reminderToggle.addEventListener('change', (e) => {
      store.updateSettings({ reminderEnabled: e.target.checked });
    });
  }

  // Push Notifications
  const notifToggle = content.querySelector('#toggle-notifications');
  const notifTimeRow = content.querySelector('#notification-time-row');
  const notifTimeInput = content.querySelector('#notification-time');

  if (notifToggle) {
    notifToggle.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      if (enabled) {
        if (!('Notification' in window)) {
          alert('Notifications are not supported by this browser or platform.');
          e.target.checked = false;
          return;
        }

        let perm = Notification.permission;
        if (perm !== 'granted') {
          try {
            perm = await Notification.requestPermission();
          } catch (err) {
            console.warn('Error requesting notification permission:', err);
          }
        }

        if (perm === 'granted') {
          store.updateSettings({ notificationsEnabled: true });
          if (notifTimeRow) notifTimeRow.style.display = 'flex';
          try {
            new Notification('AGOGE Protocol', {
              body: 'Daily physical check-in reminders activated.',
              icon: './icon.svg'
            });
          } catch (err) {
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title: 'AGOGE Protocol',
                body: 'Daily physical check-in reminders activated.'
              });
            }
          }
        } else {
          alert('Notification permission was denied. Please allow notifications in device settings.');
          e.target.checked = false;
          store.updateSettings({ notificationsEnabled: false });
          if (notifTimeRow) notifTimeRow.style.display = 'none';
        }
      } else {
        store.updateSettings({ notificationsEnabled: false });
        if (notifTimeRow) notifTimeRow.style.display = 'none';
      }
    });
  }

  if (notifTimeInput) {
    notifTimeInput.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val) {
        store.updateSettings({ notificationTime: val });
      }
    });
  }

  // Export
  const btnExport = content.querySelector('#btn-export-data');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      handleExportData();
    });
  }

  // Import
  const btnImport = content.querySelector('#btn-import-data');
  const fileImport = content.querySelector('#file-import');
  if (btnImport && fileImport) {
    btnImport.addEventListener('click', () => fileImport.click());
    fileImport.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && parsed.phases && parsed.checkIns) {
            localStorage.setItem('agoge_state_v1', JSON.stringify(parsed));
            window.location.reload();
          } else {
            alert('Invalid backup file structure.');
          }
        } catch (err) {
          alert('Failed to parse backup file.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Log Out (Reset)
  const btnLogout = content.querySelector('#btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Log out and reset all data on this device? This cannot be undone.')) {
        localStorage.removeItem('agoge_state_v1');
        sessionStorage.clear();
        window.location.reload();
      }
    });
  }
}

function handleExportData() {
  const stateCopy = JSON.parse(JSON.stringify(store.state));
  const dataStr = JSON.stringify(stateCopy, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `agoge_backup_${dateStr}.json`;
  const blob = new Blob([dataStr], { type: 'application/json' });
  const checkInsCount = stateCopy.checkIns?.length || 0;
  const phasesCount = stateCopy.phases?.length || 0;
  const sizeKb = (blob.size / 1024).toFixed(1);

  const hasShare = typeof navigator !== 'undefined' && !!navigator.share;

  const content = `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div class="card glass-clear" style="padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-weight: 600; font-size: 14px; color: var(--color-text);">AGOGE State Backup</span>
          <span class="badge badge--bulk" style="font-size: 11px;">${sizeKb} KB</span>
        </div>
        <div class="text-caption text-secondary" style="font-size: 12px; text-transform: none; line-height: 1.4;">
          ${checkInsCount} check-in entries, ${phasesCount} protocol phases, and biometrics.
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
        <button type="button" class="btn btn-primary" id="btn-export-download" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
          ${icons.download ? icons.download(18) : ''} Download JSON File
        </button>

        ${hasShare ? `
          <button type="button" class="btn" id="btn-export-share" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(201, 161, 90, 0.14); border: 1px solid rgba(201, 161, 90, 0.3); color: var(--color-accent-light);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Save to Files / Share
          </button>
        ` : ''}

        <button type="button" class="btn" id="btn-export-copy" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--color-bg-elevated); border: 1px solid var(--color-border); color: var(--color-text);">
          ${icons.check ? icons.check(16) : ''} Copy JSON to Clipboard
        </button>
      </div>
    </div>
  `;

  const modal = openModal({
    title: 'Export Backup',
    content
  });

  setTimeout(() => {
    // Download action via safe Blob URL
    const btnDownload = document.getElementById('btn-export-download');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            a.remove();
            URL.revokeObjectURL(url);
          }, 1500);

          btnDownload.innerHTML = `${icons.check ? icons.check(18) : '✓'} Download Started!`;
          store.state.settings.lastExportAt = new Date().toISOString();
          store.saveState();
        } catch (err) {
          console.error('Download failed:', err);
          alert('Download failed. Please use "Copy JSON to Clipboard".');
        }
      });
    }

    // Share action (iOS Save to Files, AirDrop, Messages)
    const btnShare = document.getElementById('btn-export-share');
    if (btnShare) {
      btnShare.addEventListener('click', async () => {
        try {
          if (typeof File !== 'undefined' && navigator.canShare) {
            const file = new File([blob], fileName, { type: 'application/json' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'AGOGE Data Backup',
                text: `AGOGE Spartan physical tracking data (${dateStr})`,
                files: [file]
              });
              store.state.settings.lastExportAt = new Date().toISOString();
              store.saveState();
              modal.close();
              return;
            }
          }
          await navigator.share({
            title: 'AGOGE Data Backup',
            text: dataStr
          });
          store.state.settings.lastExportAt = new Date().toISOString();
          store.saveState();
          modal.close();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('Share error:', err);
          }
        }
      });
    }

    // Copy to clipboard action
    const btnCopy = document.getElementById('btn-export-copy');
    if (btnCopy) {
      btnCopy.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(dataStr);
          } else {
            const ta = document.createElement('textarea');
            ta.value = dataStr;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          btnCopy.innerHTML = `${icons.check ? icons.check(16) : '✓'} Copied to Clipboard!`;
          btnCopy.style.background = 'var(--color-success)';
          btnCopy.style.color = '#FFFFFF';
          store.state.settings.lastExportAt = new Date().toISOString();
          store.saveState();
        } catch (err) {
          console.error('Copy failed:', err);
          alert('Could not copy to clipboard.');
        }
      });
    }
  }, 100);
}

