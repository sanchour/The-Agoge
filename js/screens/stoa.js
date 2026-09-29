/**
 * The Stoa (Phase 2.3 & 3.0)
 * Doctrine and Protocols Hub.
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { openModal } from '../components/modal-sheet.js';

let legacyData = null;
let initialized = false;

export async function initStoa() {
  const content = document.getElementById('stoa-content');
  if (!content) return;
  
  if (!legacyData) {
    try {
      const res = await fetch('data/legacy-content.json');
      legacyData = await res.json();
    } catch (err) {
      console.error('Failed to load Stoa data', err);
      content.innerHTML = '<p class="text-error">Doctrine failed to load.</p>';
      return;
    }
  }

  renderStoa(content);
  initialized = true;
}

function renderStoa(content) {
  content.innerHTML = `
    <header class="home-layout__header" style="margin-bottom: var(--space-md); display: flex; flex-direction: column; align-items: center; text-align: center;">
      <div style="margin-bottom: 2px; color: var(--color-accent); display: flex; align-items: center; justify-content: center;">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="4" rx="1"/>
          <rect x="4" y="18" width="16" height="4" rx="1"/>
          <path d="M6 6v12"/><path d="M10 6v12"/><path d="M14 6v12"/><path d="M18 6v12"/>
        </svg>
      </div>
      <h1 class="font-display text-accent" style="letter-spacing: 0.12em; font-size: 1.75rem; margin: 0;">STOA</h1>
      <p class="text-secondary" style="font-size: 12px; margin-top: 2px; margin-bottom: 0;">Doctrine, principles, and protocols.</p>
    </header>

    <div class="stoa-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      
      <div class="card glass-regular stoa-tile" data-section="manual" style="grid-column: 1 / -1; cursor: pointer; padding: 16px 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.1); border-top: 2.5px solid rgba(72, 186, 130, 0.6); border-radius: var(--radius-lg); box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25); transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(72, 186, 130, 0.12); border: 1.5px solid rgba(72, 186, 130, 0.45); display: flex; align-items: center; justify-content: center; color: #48BA82; box-shadow: 0 0 14px rgba(72, 186, 130, 0.25);">
          ${icons.activity(24)}
        </div>
        <h3 class="font-display" style="font-size: 16px; margin-top: 4px; margin-bottom: 0; letter-spacing: 0.02em;">Field Manual</h3>
        <p class="text-tertiary text-caption" style="text-transform: none; font-size: 12px; margin: 0;">Practical training & nutrition doctrine</p>
      </div>

      <div class="card glass-regular stoa-tile" data-section="rank" style="cursor: pointer; padding: 16px 12px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.1); border-top: 2.5px solid rgba(212, 175, 55, 0.6); border-radius: var(--radius-lg); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22); transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="width: 46px; height: 46px; border-radius: 50%; background: rgba(212, 175, 55, 0.12); border: 1.5px solid rgba(212, 175, 55, 0.45); display: flex; align-items: center; justify-content: center; color: var(--color-accent-light); box-shadow: 0 0 14px rgba(212, 175, 55, 0.25);">
          ${icons.trophy ? icons.trophy(22) : icons.activity(22)}
        </div>
        <h3 class="font-display" style="font-size: 15px; margin-top: 4px; margin-bottom: 0;">Rank Ladder</h3>
        <p class="text-tertiary text-caption" style="text-transform: none; font-size: 11.5px; margin: 0;">Physique milestones</p>
      </div>
      
      <div class="card glass-regular stoa-tile" data-section="principles" style="cursor: pointer; padding: 16px 12px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.1); border-top: 2.5px solid rgba(79, 133, 194, 0.6); border-radius: var(--radius-lg); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22); transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="width: 46px; height: 46px; border-radius: 50%; background: rgba(79, 133, 194, 0.12); border: 1.5px solid rgba(79, 133, 194, 0.45); display: flex; align-items: center; justify-content: center; color: #7CA1D8; box-shadow: 0 0 14px rgba(79, 133, 194, 0.25);">
          ${icons.scroll ? icons.scroll(22) : icons.activity(22)}
        </div>
        <h3 class="font-display" style="font-size: 15px; margin-top: 4px; margin-bottom: 0;">Principles</h3>
        <p class="text-tertiary text-caption" style="text-transform: none; font-size: 11.5px; margin: 0;">The 7 Core Rules</p>
      </div>

      <div class="card glass-regular stoa-tile" data-section="quiz" style="cursor: pointer; padding: 16px 12px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.1); border-top: 2.5px solid rgba(255, 167, 38, 0.6); border-radius: var(--radius-lg); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22); transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="width: 46px; height: 46px; border-radius: 50%; background: rgba(255, 167, 38, 0.12); border: 1.5px solid rgba(255, 167, 38, 0.45); display: flex; align-items: center; justify-content: center; color: #FFA726; box-shadow: 0 0 14px rgba(255, 167, 38, 0.25);">
          ${icons.alertCircle ? icons.alertCircle(22) : icons.activity(22)}
        </div>
        <h3 class="font-display" style="font-size: 15px; margin-top: 4px; margin-bottom: 0;">Diagnostic</h3>
        <p class="text-tertiary text-caption" style="text-transform: none; font-size: 11.5px; margin: 0;">Phase readiness</p>
      </div>

      <div class="card glass-regular stoa-tile" data-section="protocols" style="cursor: pointer; padding: 16px 12px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.1); border-top: 2.5px solid rgba(224, 83, 83, 0.6); border-radius: var(--radius-lg); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22); transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="width: 46px; height: 46px; border-radius: 50%; background: rgba(224, 83, 83, 0.12); border: 1.5px solid rgba(224, 83, 83, 0.45); display: flex; align-items: center; justify-content: center; color: #E05353; box-shadow: 0 0 14px rgba(224, 83, 83, 0.25);">
          ${icons.shield ? icons.shield(22) : icons.activity(22)}
        </div>
        <h3 class="font-display" style="font-size: 15px; margin-top: 4px; margin-bottom: 0;">Contingency</h3>
        <p class="text-tertiary text-caption" style="text-transform: none; font-size: 11.5px; margin: 0;">Travel & disruptions</p>
      </div>

      <div class="card glass-regular stoa-tile" data-section="motivation" style="grid-column: 1 / -1; cursor: pointer; padding: 16px 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid rgba(255, 160, 30, 0.25); border-top: 2.5px solid rgba(255, 160, 30, 0.7); background: linear-gradient(135deg, rgba(255, 130, 20, 0.08) 0%, rgba(201, 161, 90, 0.04) 100%); position: relative; overflow: hidden; border-radius: var(--radius-lg); box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25); transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 0%, rgba(255, 160, 30, 0.09) 0%, transparent 70%);"></div>
        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 140, 20, 0.12); border: 1.5px solid rgba(255, 140, 20, 0.45); display: flex; align-items: center; justify-content: center; color: #FFA020; box-shadow: 0 0 14px rgba(255, 140, 20, 0.25); position: relative; z-index: 1;">
          ${icons.flame ? icons.flame(24) : icons.activity(24)}
        </div>
        <h3 class="font-display" style="font-size: 16px; margin-top: 4px; margin-bottom: 0; position: relative; z-index: 1; letter-spacing: 0.02em;">My Motivation</h3>
        <p class="text-tertiary text-caption" style="text-transform: none; font-size: 12px; margin: 0; position: relative; z-index: 1;">The reason I fight</p>
      </div>

    </div>
  `;

  content.querySelectorAll('.stoa-tile').forEach(tile => {
    tile.addEventListener('click', (e) => {
      const section = e.currentTarget.dataset.section;
      openStoaSection(section);
    });
  });
}

export function openStoaSection(sectionKey) {
  if (sectionKey === 'manual') openFieldManualModal();
  else if (sectionKey === 'rank') openRankModal();
  else if (sectionKey === 'principles') openPrinciplesModal();
  else if (sectionKey === 'quiz') openQuizModal();
  else if (sectionKey === 'protocols') openProtocolsModal();
  else if (sectionKey === 'motivation') openMotivationModal();
}

function openRankModal(opts = {}) {
  const ranks = legacyData.spartanRanks || [];
  
  // Calculate current LBM
  let currentLbm = 0;
  const checkIns = store.getCheckIns();
  if (checkIns.length > 0) {
    const latest = checkIns[checkIns.length - 1];
    if (latest.weight && latest.bodyFat) {
      currentLbm = latest.weight * (1 - (latest.bodyFat / 100));
    }
  }
  if (!currentLbm) {
    const activePhase = store.getActivePhase();
    if (activePhase && activePhase.targetWeight && activePhase.targetBF) {
      currentLbm = activePhase.targetWeight * (1 - (activePhase.targetBF / 100));
    } else {
      currentLbm = 52.0;
    }
  }

  // Find user's current rank index
  let currentRankIdx = 0;
  ranks.forEach((r, i) => {
    if (currentLbm >= r.minLBM) currentRankIdx = i;
  });

  const currentRank = ranks[currentRankIdx];
  const nextRank = currentRankIdx < ranks.length - 1 ? ranks[currentRankIdx + 1] : null;
  const lbmToNext = nextRank ? Math.max(0, nextRank.minLBM - currentLbm).toFixed(1) : 0;
  
  const titanApexLbm = 68.5;
  const totalAscentPct = Math.min(100, Math.max(0, Math.round((currentLbm / titanApexLbm) * 100)));

  // Generate Rank rows along continuous expedition spine
  let rowsHtml = '';
  ranks.forEach((r, i) => {
    const isAchieved = currentLbm >= r.minLBM;
    const isCurrent = i === currentRankIdx;
    const isNext = i === currentRankIdx + 1;
    const isLast = i === ranks.length - 1;

    // Medallion state
    let medallionClass = 'rank-medallion--locked';
    if (isAchieved) medallionClass = 'rank-medallion--achieved';
    if (isCurrent) medallionClass = 'rank-medallion--current';
    else if (isNext) medallionClass = 'rank-medallion--next';

    // Spine line state
    let spineClass = '';
    if (isAchieved && i < currentRankIdx) spineClass = 'rank-spine-line--achieved';
    else if (isCurrent) spineClass = 'rank-spine-line--active';

    // Progress percentage inside current rank toward next
    let progressHtml = '';
    if (isCurrent && nextRank) {
      const prevLbm = r.minLBM;
      const stepTotal = nextRank.minLBM - prevLbm;
      const stepDone = Math.max(0, currentLbm - prevLbm);
      const stepPct = Math.min(100, Math.max(0, Math.round((stepDone / stepTotal) * 100)));
      progressHtml = `
        <div style="margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 10.5px; margin-bottom: 4px;">
            <span style="color: var(--color-accent); font-weight: 600;">Ascent to ${nextRank.title}</span>
            <span style="color: var(--color-accent-light); font-weight: 700; font-family: var(--font-body); font-variant-numeric: tabular-nums;">${lbmToNext} kg remaining</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">
            <div style="width: ${stepPct}%; height: 100%; background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light)); border-radius: 999px; box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);"></div>
          </div>
        </div>
      `;
    }

    rowsHtml += `
      <div class="rank-row ${isCurrent ? 'rank-row--current' : ''}" ${isCurrent ? 'id="current-rank-card"' : ''}>
        <!-- Spine & Medallion -->
        <div class="rank-spine-col">
          ${!isLast ? `<div class="rank-spine-line ${spineClass}"></div>` : ''}
          <div class="rank-medallion ${medallionClass}">
            ${icons[r.icon] ? icons[r.icon](24) : icons.shield(24)}
            ${isAchieved ? `
              <div style="position: absolute; bottom: -2px; right: -2px; width: 17px; height: 17px; border-radius: 50%; background: var(--color-success); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">✓</div>
            ` : ''}
          </div>
        </div>

        <!-- Rank Information Card -->
        <div class="rank-card ${isCurrent ? 'rank-card--current' : (isAchieved ? 'rank-card--achieved' : 'rank-card--locked')}">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.1em; padding: 2px 6px; border-radius: 4px; background: ${isAchieved ? 'rgba(74, 124, 92, 0.2)' : (isCurrent ? 'rgba(201, 161, 90, 0.25)' : 'rgba(255, 255, 255, 0.06)')}; color: ${isAchieved ? 'var(--color-success)' : (isCurrent ? 'var(--color-accent-light)' : 'var(--color-text-tertiary)')}; text-transform: uppercase;">
                RANK ${r.rank}
              </span>
              ${isCurrent ? `
                <span style="background: var(--color-accent); color: #0A0A0C; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 999px; letter-spacing: 0.06em;">YOU ARE HERE</span>
              ` : (isAchieved ? `
                <span style="color: var(--color-success); font-size: 9.5px; font-weight: 700;">ACHIEVED</span>
              ` : (isNext ? `
                <span style="color: var(--color-accent); font-size: 9.5px; font-weight: 700;">NEXT GOAL</span>
              ` : ''))}
            </div>

            <span style="font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 700; color: ${isAchieved ? 'var(--color-success)' : (isCurrent ? 'var(--color-accent-light)' : 'var(--color-text-tertiary)')};">
              ${r.minLBM} kg LBM
            </span>
          </div>

          <h4 class="font-display" style="font-size: 16px; font-weight: 700; margin: 2px 0 3px; color: ${isAchieved || isCurrent ? 'var(--color-text)' : 'var(--color-text-secondary)'}; letter-spacing: 0.02em;">
            ${r.title}
          </h4>
          
          <p style="font-size: 11.5px; color: var(--color-text-secondary); line-height: 1.4; margin: 0;">
            ${r.desc}
          </p>

          ${progressHtml}
        </div>
      </div>
    `;
  });

  openModal({
    title: 'Spartan Rank Ladder',
    id: 'rank-modal',
    content: `
      <div class="rank-expedition">
        <!-- Mountain Summit Header / Progress HUD -->
        <div class="rank-expedition__summit">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="text-align: left;">
              <span class="text-caption text-accent" style="font-size: 9.5px; letter-spacing: 0.14em; font-weight: 800; display: block;">CURRENT STANDING</span>
              <h3 class="font-display" style="font-size: 18px; margin: 2px 0 0; color: var(--color-text); font-weight: 700;">Rank ${currentRank.rank} · ${currentRank.title}</h3>
            </div>
            <div style="text-align: right;">
              <span class="text-caption text-secondary" style="font-size: 9.5px; letter-spacing: 0.1em; font-weight: 600; display: block;">LEAN BODY MASS</span>
              <strong style="color: var(--color-accent-light); font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 18px; font-weight: 800;">${currentLbm.toFixed(1)} <span style="font-size: 12px; font-weight: 500;">kg</span></strong>
            </div>
          </div>

          <!-- Overall Mountain Ascent Bar -->
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; margin-bottom: 5px;">
              <span style="color: var(--color-text-secondary);">Ascent to Titan Apex (68.5kg)</span>
              <span style="color: var(--color-accent-light); font-weight: 700; font-family: var(--font-body); font-variant-numeric: tabular-nums;">${totalAscentPct}% Complete</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.3); border-radius: 999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
              <div style="width: ${totalAscentPct}%; height: 100%; background: linear-gradient(90deg, var(--color-success) 0%, var(--color-accent) 70%, var(--color-accent-light) 100%); border-radius: 999px; box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);"></div>
            </div>
          </div>
        </div>

        <!-- Expedition Trail -->
        <div style="width: 100%; position: relative;">
          ${rowsHtml}
        </div>

        <!-- Apex Culmination Marker -->
        <div style="text-align: center; margin-top: 12px; padding: 14px; background: rgba(201,161,90,0.08); border: 1px dashed rgba(201,161,90,0.3); border-radius: var(--radius-md);">
          <div style="color: var(--color-accent-light); margin-bottom: 2px;">👑</div>
          <strong style="color: var(--color-accent-light); font-family: var(--font-display); font-size: 14px; letter-spacing: 0.04em; display: block;">THE TITAN PINNACLE</strong>
          <span class="text-caption text-secondary" style="font-size: 10px; margin-top: 2px; display: block;">77.5kg @ 10% BF · 68.5kg LBM · Apex Spartan Identity</span>
        </div>
      </div>
    `,
    ...opts
  });

  // Auto-scroll to current rank
  requestAnimationFrame(() => {
    setTimeout(() => {
      const currentEl = document.getElementById('current-rank-card');
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  });
}

function openPrinciplesModal(opts = {}) {
  const principles = legacyData.corePrinciples || [];
  
  const html = principles.map((p, idx) => `
    <div class="card glass-regular animate-slide-up" style="margin-bottom: var(--space-xs); padding: var(--space-sm) var(--space-md); border-left: 3px solid var(--color-accent); animation-delay: ${idx * 60}ms; position: relative; overflow: hidden; display: flex; align-items: center; gap: var(--space-sm);">
      <div style="font-size: 2.2rem; font-family: var(--font-display); font-weight: 900; color: rgba(201, 161, 90, 0.2); pointer-events: none; line-height: 1; min-width: 32px; text-align: center;">${p.number}</div>
      <div style="flex: 1; min-width: 0;">
        <h4 class="font-display text-accent" style="margin-bottom: 2px; font-size: 1.05rem;">${p.title}</h4>
        <p class="text-secondary text-small" style="line-height: 1.45; font-size: 11.5px; margin: 0;">${p.description}</p>
      </div>
    </div>
  `).join('');

  openModal({
    title: 'Core Principles',
    id: 'principles-modal',
    content: html,
    ...opts
  });
}

function openFieldManualModal(opts = {}) {
  const manual = legacyData.fieldManual || [];
  const iconSet = ['info', 'target', 'shield', 'flame', 'columns'];
  
  const html = manual.map((p, idx) => {
    const iconKey = iconSet[idx % iconSet.length];
    return `
      <div class="card glass-clear animate-slide-up" style="margin-bottom: var(--space-xs); padding: var(--space-sm) var(--space-md); border: 1px solid var(--color-border); border-left: 3px solid var(--color-text-secondary); transition: transform 0.15s ease, border-color 0.15s ease; cursor: default; animation-delay: ${idx * 40}ms;">
        <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: 4px;">
          <span style="color: var(--color-accent); opacity: 0.85;">
            ${icons[iconKey] ? icons[iconKey](16) : icons.info(16)}
          </span>
          <h4 class="font-display" style="margin: 0; color: var(--color-text); font-size: 13.5px;">${p.title}</h4>
        </div>
        <p class="text-secondary text-small" style="line-height: 1.4; padding-left: 22px; margin: 0; font-size: 11.5px;">${p.content}</p>
      </div>
    `;
  }).join('');

  openModal({
    title: 'Field Manual',
    id: 'manual-modal',
    content: '<p class="text-caption text-tertiary" style="margin-bottom: var(--space-sm); text-align: center; font-size: 11px;">Tactical advice for the journey ahead.</p>' + html,
    ...opts
  });
}

function openQuizModal() {
  const quiz = legacyData.diagnosticQuiz || { cuttingStopSignals: [], bulkingStopSignals: [] };
  const phase = store.getActivePhase();
  const isCut = phase && phase.type === 'CUT';
  const signals = isCut ? quiz.cuttingStopSignals : quiz.bulkingStopSignals;
  const modeName = isCut ? 'CUT' : 'BULK';
  const oppMode = isCut ? 'BULK' : 'CUT';
  const modeColor = isCut ? 'var(--color-cut-light)' : 'var(--color-bulk-light)';

  // Interactive state
  let checkedCount = 0;
  
  const updateGauge = (modalEl) => {
    const gaugeFill = modalEl.querySelector('#quiz-gauge-fill');
    const gaugeText = modalEl.querySelector('#quiz-gauge-text');
    const conclusion = modalEl.querySelector('#quiz-conclusion');
    
    if (!gaugeFill || !gaugeText || !conclusion) return;
    
    const max = signals.length;
    const pct = (checkedCount / max) * 100;
    
    gaugeFill.style.width = `${pct}%`;
    
    if (checkedCount >= 3) {
      gaugeFill.style.background = modeColor;
      gaugeText.textContent = `${checkedCount}/${max} - TRANSITION RECOMMENDED`;
      gaugeText.style.color = modeColor;
      conclusion.innerHTML = `<div style="padding: var(--space-md); background: ${isCut ? 'var(--color-cut-bg)' : 'var(--color-bulk-bg)'}; border: 1px solid ${modeColor}; border-radius: var(--radius-sm); margin-top: var(--space-md);">
        <strong style="color: ${modeColor}; display:block; margin-bottom: 4px;">Time to transition to ${oppMode}.</strong>
        <span class="text-small text-secondary">You have hit ${checkedCount} stop signals. Schedule a 2-week maintenance break immediately.</span>
      </div>`;
    } else {
      gaugeFill.style.background = 'var(--color-accent)';
      gaugeText.textContent = `${checkedCount}/${max} Signals Active`;
      gaugeText.style.color = 'var(--color-accent)';
      conclusion.innerHTML = `<div style="padding: var(--space-md); background: var(--color-bg-elevated); border: 1px dashed var(--color-border); border-radius: var(--radius-sm); margin-top: var(--space-md);">
        <strong style="color: var(--color-text); display:block; margin-bottom: 4px;">Stay the course.</strong>
        <span class="text-small text-secondary">Continue your ${modeName} phase. Re-evaluate in 2 weeks.</span>
      </div>`;
    }
  };

  const contentStr = `
    <div id="quiz-container">
      <p class="text-small text-secondary" style="margin-bottom: var(--space-md);">
        You are currently in a <strong>${modeName}</strong> phase. Check any signals you are experiencing right now.
      </p>
      
      <!-- Live Gauge -->
      <div style="margin-bottom: var(--space-lg); padding: var(--space-sm); background: var(--color-bg-glass); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span class="text-caption text-tertiary">CONFIDENCE METER</span>
          <span id="quiz-gauge-text" class="text-caption text-accent">0/${signals.length} Signals Active</span>
        </div>
        <div style="height: 8px; background: var(--color-bg-elevated); border-radius: var(--radius-pill); overflow:hidden;">
          <div id="quiz-gauge-fill" style="height: 100%; width: 0%; background: var(--color-accent); transition: width 0.3s ease, background 0.3s ease;"></div>
        </div>
      </div>

      <!-- Questions -->
      <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
        ${signals.map((s, i) => `
          <label class="card glass-clear" style="display:flex; gap:var(--space-md); padding:var(--space-md); cursor:pointer; align-items:center;">
            <input type="checkbox" class="quiz-cb" style="width:20px; height:20px; accent-color: var(--color-accent);">
            <span class="text-small" style="flex:1;">${s.label}</span>
          </label>
        `).join('')}
      </div>
      <div id="quiz-conclusion"></div>
    </div>
  `;

  const modal = openModal({
    title: 'Diagnostic Quiz',
    content: contentStr
  });

  const modalEl = document.querySelector('.modal-sheet');
  if (modalEl) {
    const checkboxes = modalEl.querySelectorAll('.quiz-cb');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        checkedCount = Array.from(checkboxes).filter(c => c.checked).length;
        updateGauge(modalEl);
      });
    });
  }
}

function openProtocolsModal(opts = {}) {
  const protocols = legacyData.contingencyProtocols || [];
  
  const html = protocols.map((p, idx) => `
    <div class="card glass-regular animate-slide-up" style="margin-bottom: var(--space-xs); padding: var(--space-sm) var(--space-md); border-left: 3px solid var(--color-cut-light); animation-delay: ${idx * 60}ms;">
      <h4 class="font-display" style="margin-bottom: 2px; font-size: 1rem; color: var(--color-text);">${p.situation}</h4>
      <p class="text-secondary text-small" style="line-height: 1.4; margin: 0; font-size: 11.5px;">${p.action}</p>
    </div>
  `).join('');

  openModal({
    title: 'Contingency Protocols',
    id: 'protocols-modal',
    content: html,
    ...opts
  });
}

function openMotivationModal() {
  const lines = [
    { text: "To become the strongest I know.", delay: 0 },
    { text: "To feel safe, secure and confident knowing I am strong and can defend myself.", delay: 150 },
    { text: "To feel, think and act like a different person.", delay: 300 },
    { text: "Someone who is strong, who knows how to fight.", delay: 450 },
    { text: "A big, strong dude, something which is now not at all in my identity.", delay: 550 },
    { text: "I want to build this identity because I know it will give me profound development and confidence.", delay: 600 },
    { text: "I want it.", delay: 720 },
    { text: "I will have it.", delay: 800 },
  ];

  const linesHtml = lines.map((l, i) => {
    const isCTA = l.text === 'I will have it.';
    const isWant = l.text === 'I want it.';
    if (isCTA) {
      return `
        <div class="motiv-line animate-slide-up" data-delay="${l.delay}" style="opacity: 0; animation-delay: ${l.delay}ms; margin: var(--space-xl) 0 var(--space-md); text-align: center;">
          <div style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, rgba(255,140,20,0.18), rgba(201,161,90,0.12)); border: 1.5px solid rgba(255,140,20,0.5); border-radius: 999px; box-shadow: 0 0 28px rgba(255,140,20,0.2); position: relative; overflow: hidden;">
            <div style="position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(255,160,30,0.1), transparent 70%); pointer-events: none;"></div>
            <span class="font-display" style="font-size: 1.5rem; font-weight: 700; color: #FFA020; letter-spacing: 0.03em; position: relative; z-index: 1;">${l.text}</span>
          </div>
        </div>
      `;
    }
    if (isWant) {
      return `
        <div class="motiv-line animate-slide-up" data-delay="${l.delay}" style="opacity: 0; animation-delay: ${l.delay}ms; text-align: center; margin: var(--space-md) 0 0;">
          <span class="font-display" style="font-size: 1.15rem; color: var(--color-accent-light); letter-spacing: 0.04em; font-style: italic;">${l.text}</span>
        </div>
      `;
    }
    return `
      <div class="motiv-line animate-slide-up" data-delay="${l.delay}" style="opacity: 0; animation-delay: ${l.delay}ms; padding: var(--space-sm) 0; border-bottom: 1px solid rgba(243,239,230,0.06);">
        <p style="margin: 0; line-height: 1.65; font-size: ${i === 0 ? '1.25rem' : '1rem'}; color: ${i === 0 ? 'var(--color-text)' : 'var(--color-text-secondary)'}; font-weight: ${i === 0 ? '600' : '400'};">${l.text}</p>
      </div>
    `;
  }).join('');

  openModal({
    title: 'My Motivation',
    content: `
      <div id="motivation-container" style="padding-bottom: var(--space-xl);">
        <!-- Flame header -->
        <div style="text-align: center; margin-bottom: var(--space-xl);">
          <div id="motiv-flame-icon" style="display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: rgba(255,140,20,0.12); border: 1.5px solid rgba(255,140,20,0.4); color: #FFA020; box-shadow: 0 0 32px rgba(255,140,20,0.25); margin-bottom: var(--space-md); animation: motivFlame 2s ease-in-out infinite;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
            </svg>
          </div>
          <h2 class="font-display" style="font-size: 1.1rem; color: var(--color-text-secondary); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 400;">Why I Train</h2>
        </div>

        <!-- Motivation lines -->
        <div style="display: flex; flex-direction: column; gap: 0;">
          ${linesHtml}
        </div>

        <!-- Pulse bar at bottom -->
        <div style="margin-top: var(--space-2xl); text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <div style="height: 2px; flex: 1; background: linear-gradient(to right, transparent, rgba(255,140,20,0.4));"></div>
            <span style="color: rgba(255,140,20,0.5); font-size: 18px;">⚔</span>
            <div style="height: 2px; flex: 1; background: linear-gradient(to left, transparent, rgba(255,140,20,0.4));"></div>
          </div>
          <p class="text-caption text-tertiary" style="margin-top: var(--space-md); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">AGOGE — Discipline is Destiny</p>
        </div>
      </div>

      <style>
        @keyframes motivFlame {
          0%, 100% { box-shadow: 0 0 20px rgba(255,140,20,0.2), 0 0 40px rgba(255,140,20,0.08); transform: scale(1); }
          50% { box-shadow: 0 0 36px rgba(255,140,20,0.35), 0 0 64px rgba(255,140,20,0.12); transform: scale(1.04); }
        }
        .motiv-line {
          animation-fill-mode: forwards !important;
        }
      </style>
    `
  });
}
