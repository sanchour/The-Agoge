/**
 * Statistics Screen (Merged Trends, Calendar, Roadmap) - Phase 3
 */
import { store } from '../store.js';
import { icons } from '../icons.js';
import { renderCalendarView } from '../components/calendar-view.js';
import { openPhaseEditModal } from '../components/hero-card.js';
import { createLiquidSlider } from '../components/liquid-slider.js';

let chartJsLoaded = false;
let loadPromise = null;

async function loadChartJs() {
  if (chartJsLoaded || window.Chart) {
    chartJsLoaded = true;
    return;
  }
  if (loadPromise) return loadPromise;
  
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
    script.onload = () => { chartJsLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return loadPromise;
}

let initialized = false;
let currentTab = 'roadmap';

export async function initStatistics() {
  const content = document.getElementById('statistics-content');
  if (!content) return;

  if (window.__AGOGE_INITIAL_STAT_TAB) {
    currentTab = window.__AGOGE_INITIAL_STAT_TAB;
    window.__AGOGE_INITIAL_STAT_TAB = null;
  } else {
    currentTab = 'roadmap';
  }

  renderBaseLayout(content);

  if (!initialized) {
    store.subscribe(() => {
      const screen = document.getElementById('screen-statistics');
      if (screen && screen.classList.contains('screen--active')) {
        renderActiveTab(content);
      }
    });
    initialized = true;
  }
}

function renderBaseLayout(content) {
  content.innerHTML = `
    <header class="home-layout__header" style="margin-bottom: var(--space-md);">
      <h1 class="font-display">Statistics</h1>
    </header>

    <div class="glass-segmented-control-container" style="width: 100%; margin-bottom: var(--space-lg); overflow: hidden;">
      <div class="glass-segmented-control" id="stats-segmented-control" style="
        display: flex;
        position: relative;
        width: 100%;
        background: rgba(22, 22, 28, 0.85);
        backdrop-filter: blur(28px) saturate(200%);
        -webkit-backdrop-filter: blur(28px) saturate(200%);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 9999px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        padding: 5px;
        gap: 4px;
        touch-action: none;
        -webkit-touch-callout: none;
        user-select: none;
        -webkit-user-select: none;
      ">
        <div class="glass-segmented-control__indicator" id="stats-segment-indicator" style="
          position: absolute;
          top: 5px;
          bottom: 5px;
          left: 0;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 9999px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.28);
          z-index: 1;
          pointer-events: none;
          transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1), width 320ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, width, background, box-shadow;
        "></div>
        <button class="glass-segmented-control__option ${currentTab === 'roadmap' ? 'glass-segmented-control__option--active' : ''}" data-tab="roadmap" style="
          position: relative; z-index: 2; flex: 1; min-width: 64px; padding: 10px 10px; border: none; background: transparent; color: ${currentTab === 'roadmap' ? '#FFFFFF' : 'rgba(243, 239, 230, 0.55)'}; font-family: var(--font-body); font-size: 13.5px; font-weight: ${currentTab === 'roadmap' ? '600' : '500'}; text-align: center; cursor: pointer; border-radius: 9999px; transition: color 250ms ease;
        ">Roadmap</button>
        <button class="glass-segmented-control__option ${currentTab === 'timeline' ? 'glass-segmented-control__option--active' : ''}" data-tab="timeline" style="
          position: relative; z-index: 2; flex: 1; min-width: 64px; padding: 10px 10px; border: none; background: transparent; color: ${currentTab === 'timeline' ? '#FFFFFF' : 'rgba(243, 239, 230, 0.55)'}; font-family: var(--font-body); font-size: 13.5px; font-weight: ${currentTab === 'timeline' ? '600' : '500'}; text-align: center; cursor: pointer; border-radius: 9999px; transition: color 250ms ease;
        ">Timeline</button>
        <button class="glass-segmented-control__option ${currentTab === 'trends' ? 'glass-segmented-control__option--active' : ''}" data-tab="trends" style="
          position: relative; z-index: 2; flex: 1; min-width: 64px; padding: 10px 10px; border: none; background: transparent; color: ${currentTab === 'trends' ? '#FFFFFF' : 'rgba(243, 239, 230, 0.55)'}; font-family: var(--font-body); font-size: 13.5px; font-weight: ${currentTab === 'trends' ? '600' : '500'}; text-align: center; cursor: pointer; border-radius: 9999px; transition: color 250ms ease;
        ">Trends</button>
        <button class="glass-segmented-control__option ${currentTab === 'calendar' ? 'glass-segmented-control__option--active' : ''}" data-tab="calendar" style="
          position: relative; z-index: 2; flex: 1; min-width: 64px; padding: 10px 10px; border: none; background: transparent; color: ${currentTab === 'calendar' ? '#FFFFFF' : 'rgba(243, 239, 230, 0.55)'}; font-family: var(--font-body); font-size: 13.5px; font-weight: ${currentTab === 'calendar' ? '600' : '500'}; text-align: center; cursor: pointer; border-radius: 9999px; transition: color 250ms ease;
        ">Log</button>
      </div>
    </div>

    <div id="statistics-tab-content" style="background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; border: none !important; box-shadow: none !important; padding: 0 !important;"></div>
  `;

  const control = content.querySelector('#stats-segmented-control');
  const indicator = content.querySelector('#stats-segment-indicator');
  const options = content.querySelectorAll('.glass-segmented-control__option');
  const STAT_TABS = ['roadmap', 'timeline', 'trends', 'calendar'];

  let segDragActive = false;
  let segPointerId = null;
  let currentSegHoveredTab = null;
  let segHoverTimer = null;

  const updateIndicator = (btn, animate = true) => {
    if (!btn || !indicator || !control) return;
    indicator.style.transition = animate ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), width 320ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    indicator.style.width = btn.offsetWidth + 'px';
    indicator.style.transform = `translate3d(${btn.offsetLeft}px, 0, 0)`;
    indicator.style.background = 'rgba(255, 255, 255, 0.18)';
    indicator.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.45)';
  };

  const switchToTab = (tabId, animate = true) => {
    if (!STAT_TABS.includes(tabId)) return;
    currentTab = tabId;
    let activeBtn = null;
    options.forEach(b => {
      const isThis = b.dataset.tab === tabId;
      b.classList.toggle('glass-segmented-control__option--active', isThis);
      b.style.color = isThis ? '#FFFFFF' : 'rgba(243, 239, 230, 0.55)';
      b.style.fontWeight = isThis ? '600' : '500';
      if (isThis) activeBtn = b;
    });
    if (activeBtn && animate) updateIndicator(activeBtn, true);
    renderActiveTab(content);
  };

  options.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      switchToTab(tab, true);
    });
  });

  function getStatTabUnderPoint(clientX) {
    const barRect = control.getBoundingClientRect();
    if (barRect.width <= 0) return null;
    const segWidth = barRect.width / STAT_TABS.length;
    const clampedX = Math.max(barRect.left, Math.min(barRect.right - 1, clientX));
    const idx = Math.floor((clampedX - barRect.left) / segWidth);
    const safeIdx = Math.max(0, Math.min(STAT_TABS.length - 1, idx));
    const tabId = STAT_TABS[safeIdx];
    const btn = control.querySelector(`[data-tab="${tabId}"]`);
    return {
      tabId,
      btn,
      index: safeIdx,
      barRect,
      segWidth
    };
  }

  function resetSegOptionStyles() {
    options.forEach(opt => {
      opt.style.transform = '';
      opt.style.textShadow = '';
      opt.style.transition = 'color 250ms ease';
    });
  }

  function updateSegThumbFeedback(hit, clientX) {
    if (!hit) return;

    // 1. Fluid liquid indicator tracking finger
    const segWidth = hit.segWidth;
    const pillWidth = Math.max(56, segWidth - 8);
    const relativeX = clientX - hit.barRect.left;
    const targetLeft = Math.max(4, Math.min(hit.barRect.width - pillWidth - 4, relativeX - pillWidth / 2));

    indicator.style.transition = 'none';
    indicator.style.width = `${pillWidth}px`;
    indicator.style.transform = `translate3d(${targetLeft}px, 0, 0)`;
    indicator.style.background = 'rgba(255, 255, 255, 0.25)';
    indicator.style.boxShadow = '0 0 16px rgba(201, 161, 90, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.5)';

    // 2. Button hover effect
    if (hit.tabId !== currentSegHoveredTab) {
      resetSegOptionStyles();
      currentSegHoveredTab = hit.tabId;

      if (hit.btn) {
        hit.btn.style.transform = 'scale(1.12)';
        hit.btn.style.color = '#FFFFFF';
        hit.btn.style.textShadow = '0 0 14px rgba(255, 255, 255, 0.9), 0 0 8px rgba(201, 161, 90, 0.8)';
        hit.btn.style.transition = 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), color 0.16s ease, text-shadow 0.16s ease';
      }

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }

      // 3. Hover dwell select after 75ms
      clearTimeout(segHoverTimer);
      segHoverTimer = setTimeout(() => {
        if (segDragActive && currentSegHoveredTab) {
          if (currentTab !== currentSegHoveredTab) {
            switchToTab(currentSegHoveredTab, false);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(12);
            }
          }
        }
      }, 75);
    }
  }

  function startSegInteraction(clientX, clientY, pointerId = null) {
    segDragActive = true;
    segPointerId = pointerId;
    indicator.style.transition = 'none';

    const hit = getStatTabUnderPoint(clientX);
    if (hit) {
      updateSegThumbFeedback(hit, clientX);
    }
  }

  function moveSegInteraction(clientX, clientY) {
    if (!segDragActive) return;
    const hit = getStatTabUnderPoint(clientX);
    if (hit) {
      updateSegThumbFeedback(hit, clientX);
    }
  }

  function finishSegInteraction() {
    if (!segDragActive) return;
    segDragActive = false;
    segPointerId = null;
    clearTimeout(segHoverTimer);

    const finalTab = currentSegHoveredTab || currentTab;
    resetSegOptionStyles();

    if (finalTab) {
      switchToTab(finalTab, true);
    }
  }

  // Pointer Events (Modern iOS 13+, Android, Desktop)
  if (window.PointerEvent) {
    control.addEventListener('pointerdown', (e) => {
      try { control.setPointerCapture(e.pointerId); } catch (_) {}
      startSegInteraction(e.clientX, e.clientY, e.pointerId);
    });

    control.addEventListener('pointermove', (e) => {
      if (segDragActive && (segPointerId === null || segPointerId === e.pointerId)) {
        moveSegInteraction(e.clientX, e.clientY);
      }
    });

    control.addEventListener('pointerup', (e) => {
      try { control.releasePointerCapture(e.pointerId); } catch (_) {}
      finishSegInteraction();
    });

    control.addEventListener('pointercancel', (e) => {
      try { control.releasePointerCapture(e.pointerId); } catch (_) {}
      finishSegInteraction();
    });
  } else {
    control.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        startSegInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    control.addEventListener('touchmove', (e) => {
      if (segDragActive && e.touches.length > 0) {
        e.preventDefault();
        moveSegInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    control.addEventListener('touchend', () => finishSegInteraction(), { passive: true });
    control.addEventListener('touchcancel', () => finishSegInteraction(), { passive: true });
  }

  // Initial positioning after rendering
  requestAnimationFrame(() => {
    const activeBtn = content.querySelector('.glass-segmented-control__option--active');
    updateIndicator(activeBtn, false);
    
    setTimeout(() => {
      const activeBtn = content.querySelector('.glass-segmented-control__option--active');
      updateIndicator(activeBtn, false);
    }, 100);
    setTimeout(() => {
      const activeBtn = content.querySelector('.glass-segmented-control__option--active');
      updateIndicator(activeBtn, false);
    }, 350);
  });

  // Handle resizing
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      const activeBtn = content.querySelector('.glass-segmented-control__option--active');
      updateIndicator(activeBtn, false);
    });
    ro.observe(control);
  }

  renderActiveTab(content);
}

let activeCharts = [];

function destroyCharts() {
  activeCharts.forEach(c => {
    try { c.destroy(); } catch (e) {}
  });
  activeCharts = [];
}

function renderActiveTab(content) {
  const container = content.querySelector('#statistics-tab-content');
  if (!container) return;

  if (currentTab !== 'trends') {
    destroyCharts();
  }

  if (currentTab === 'trends') renderTrends(container);
  else if (currentTab === 'calendar') renderCalendar(container);
  else if (currentTab === 'roadmap') renderRoadmap(container);
  else if (currentTab === 'timeline') renderTimeline(container);
}

// ==========================================
// TRENDS VIEW
// ==========================================
async function renderTrends(container) {
  const checkIns = store.getCheckIns();
  const hasEnoughData = checkIns.length >= 2;
  
  if (!hasEnoughData) {
    destroyCharts();
    container.innerHTML = `
      <div class="empty-chart-state animate-fade-in">
        <div class="card empty-chart-card">
          <div class="empty-chart-card__icon">${icons.barChart(48)}</div>
          <h3 class="font-display empty-chart-card__title">Not Enough Data</h3>
          <p class="text-secondary text-small">Log at least 2 check-ins to view trends.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div id="weight-chart-container" class="chart-section animate-fade-in" style="animation-delay: 0ms;">
      <h3 class="text-caption text-secondary chart-section__title">Weight Trend</h3>
      <div class="chart-wrapper"><canvas id="weight-chart"></canvas></div>
    </div>
    <div id="bf-chart-container" class="chart-section animate-fade-in" style="animation-delay: 50ms;">
      <h3 class="text-caption text-secondary chart-section__title">Body Fat % Trend</h3>
      <div class="chart-wrapper"><canvas id="bf-chart"></canvas></div>
    </div>
    <div id="lbm-chart-container" class="chart-section animate-fade-in" style="animation-delay: 100ms;">
      <h3 class="text-caption text-secondary chart-section__title">LBM Progression</h3>
      <div class="chart-wrapper"><canvas id="lbm-chart"></canvas></div>
    </div>
  `;

  await loadChartJs();
  initCharts(checkIns);
}

function initCharts(checkIns) {
  destroyCharts();

  const labels = checkIns.map(c => {
    const d = new Date(c.date);
    return `${d.getDate()}/${d.getMonth()+1}`;
  });
  const weights = checkIns.map(c => c.weight);
  const bfs = checkIns.map(c => c.bodyFat);
  const lbms = checkIns.map(c => c.weight && c.bodyFat ? (c.weight * (1 - c.bodyFat/100)).toFixed(1) : null);
  
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#C9A15A';

  const commonOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { color: 'rgba(243,239,230,0.5)', maxTicksLimit: 6 } },
      y: { grid: { color: 'rgba(243,239,230,0.05)', drawBorder: false }, ticks: { color: 'rgba(243,239,230,0.5)' } }
    },
    elements: {
      point: { radius: 0, hitRadius: 10, hoverRadius: 4 }
    }
  };

  // Weight Area Chart
  const wc = new Chart(document.getElementById('weight-chart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: weights,
        borderColor: accentColor,
        backgroundColor: 'rgba(201,161,90,0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: commonOptions
  });

  // BF Line Chart
  const bc = new Chart(document.getElementById('bf-chart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: bfs,
        borderColor: '#8C2F2F',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }]
    },
    options: commonOptions
  });

  // LBM Line Chart
  const lc = new Chart(document.getElementById('lbm-chart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: lbms,
        borderColor: '#4A7C5C',
        backgroundColor: 'rgba(74,124,92,0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: commonOptions
  });

  activeCharts.push(wc, bc, lc);
}

// ==========================================
// CALENDAR VIEW
// ==========================================
function renderCalendar(container) {
  container.innerHTML = `<div id="calendar-container" class="animate-fade-in"></div>`;
  renderCalendarView(document.getElementById('calendar-container'));
}

// ==========================================
// ROADMAP VIEW (Phase 3 & 4 Rebuild)
// ==========================================
async function renderRoadmap(container) {
  const phases = store.state.phases;
  const checkIns = store.getCheckIns();
  const latestCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
  
  // Calculate LBM progress towards Titan (77.5 kg)
  let currentLBM = 68.0;
  let currentWeight = 70.0;
  let currentBF = 14.0;
  if (latestCheckIn && latestCheckIn.weight && latestCheckIn.bodyFat) {
    currentWeight = latestCheckIn.weight;
    currentBF = latestCheckIn.bodyFat;
    currentLBM = parseFloat((currentWeight * (1 - currentBF / 100)).toFixed(1));
  }
  const titanGoal = 77.5;
  const titanProgressPct = Math.min(100, Math.max(10, Math.round((currentLBM / titanGoal) * 100)));
  const lbmRemaining = Math.max(0, (titanGoal - currentLBM).toFixed(1));

  const activePhase = store.getActivePhase();

  // Format date helper
  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const phaseItemsHtml = phases.map((phase, idx) => {
    const isCut = phase.type === 'CUT';
    const isMaint = phase.type === 'MAINTENANCE';
    const isBulk = phase.type === 'BULK';
    const isActive = activePhase && phase.id === activePhase.id;
    const isCompleted = phase.status === 'COMPLETED';

    // Chained starting stats
    const startWeight = idx === 0 ? currentWeight : (phases[idx - 1].targetWeight || currentWeight);
    const startBF = idx === 0 ? currentBF : (phases[idx - 1].targetBF || currentBF);
    const endWeight = phase.targetWeight;
    const endBF = phase.targetBF;

    let badgeClass = isCut ? 'badge--cut' : (isMaint ? 'badge--maintenance' : 'badge--bulk');
    let themeColor = isCut ? 'var(--color-cut-light)' : (isMaint ? 'var(--color-maintenance-light)' : 'var(--color-bulk-light)');
    let glow = isActive ? `box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 0 24px rgba(212,175,55,0.25); border: 1.5px solid var(--color-accent); background: rgba(212,175,55,0.06);` : 'box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);';

    let dateRange = '';
    if (phase.startDate && phase.endDate) {
      dateRange = `${fmtDate(phase.startDate)} → ${fmtDate(phase.endDate)}`;
    } else {
      dateRange = phase.period || '';
    }

    // Node icon / number
    let nodeIcon = isCompleted 
      ? (icons.check ? icons.check(14) : '✓')
      : (isActive ? '<div style="width:10px; height:10px; background:#0A0A0C; border-radius:50%"></div>' : `<span style="font-size:11px; font-weight:700; color:var(--color-text-tertiary); font-family:var(--font-body); font-variant-numeric:tabular-nums;">${idx + 1}</span>`);

    // Check if next phase is different type and not maintenance, offering quick maintenance insertion
    const nextPhase = phases[idx + 1];
    const canInsertMaint = nextPhase && nextPhase.type !== 'MAINTENANCE' && phase.type !== 'MAINTENANCE' && phase.type !== nextPhase.type;

    return `
      <div style="position: relative; margin-bottom: var(--space-sm);">
        <div class="card glass-regular animate-slide-up roadmap-item" style="${glow} cursor: pointer; display:flex; gap: var(--space-md); position: relative; overflow: hidden; border-radius: var(--radius-lg); padding: var(--space-md) var(--space-md); transition: transform 0.15s ease, box-shadow 0.15s ease;" data-phase-id="${phase.id}">
          
          <!-- Timeline Track & Node -->
          <div style="display:flex; flex-direction:column; align-items:center; width: 34px; flex-shrink: 0; position: relative; z-index: 2;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isActive ? 'var(--color-accent)' : (isCompleted ? 'var(--color-success)' : 'var(--color-bg-elevated)')}; border: 2px solid ${isActive ? 'var(--color-accent-light)' : (isCompleted ? 'var(--color-success)' : 'rgba(255,255,255,0.15)')}; display:flex; align-items:center; justify-content:center; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              ${nodeIcon}
            </div>
            ${idx < phases.length - 1 ? `<div style="position: absolute; top: 32px; bottom: -20px; width: 2px; background: ${isCompleted ? 'var(--color-success)' : 'rgba(255,255,255,0.1)'};"></div>` : ''}
          </div>

          <!-- Phase Content -->
          <div style="flex: 1; min-width: 0; position: relative; z-index: 2;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 4px; gap: 6px;">
              <div>
                <div style="display:flex; align-items:center; gap: 6px; flex-wrap: wrap;">
                  <h4 class="font-display" style="font-size: 1.15rem; font-weight: 700; color: ${isActive ? 'var(--color-accent)' : 'var(--color-text)'}; margin: 0;">${phase.name}</h4>
                  ${isActive ? '<span style="background:var(--color-accent); color:#0A0A0C; font-size:9px; font-weight:800; padding:2px 6px; border-radius:999px; letter-spacing:0.06em;">YOU ARE HERE</span>' : ''}
                  ${isCompleted ? '<span style="background:var(--color-success); color:#FFF; font-size:9px; font-weight:700; padding:2px 6px; border-radius:999px;">COMPLETED</span>' : ''}
                </div>
                <span class="text-caption text-tertiary" style="font-size: 11px; margin-top: 2px; display: block;">${dateRange} · ${phase.weeks || ''}</span>
              </div>
              <span class="badge ${badgeClass}" style="font-size: 9.5px; padding: 2px 7px; font-weight: 700; flex-shrink: 0;">${phase.type}</span>
            </div>

            <!-- Transition Metrics: Start -> End -->
            <div style="display:flex; align-items:center; justify-content:space-between; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: var(--radius-sm); padding: 8px 10px; margin-top: 6px;">
              <div>
                <span class="text-caption text-tertiary" style="font-size: 9px; display:block; letter-spacing: 0.05em;">START</span>
                <span style="font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 600; color: var(--color-text-secondary);">
                  ${startWeight}kg <span style="font-size: 10px; opacity: 0.7;">(${startBF}%)</span>
                </span>
              </div>
              <div style="color: ${themeColor}; font-size: 14px; font-weight: 700;">→</div>
              <div style="text-align: right;">
                <span class="text-caption text-tertiary" style="font-size: 9px; display:block; letter-spacing: 0.05em;">TARGET</span>
                <span style="font-family: var(--font-body); font-variant-numeric: tabular-nums; font-size: 13px; font-weight: 700; color: ${themeColor};">
                  ${endWeight}kg <span style="font-size: 10px; opacity: 0.85;">(${endBF}%)</span>
                </span>
              </div>
            </div>

            </div>
          </div>

          ${isActive ? `<div style="position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--color-accent);"></div>` : ''}
        </div>

        <!-- Quick Action: Insert Maintenance Phase Between Opposing Blocks -->
        ${canInsertMaint ? `
          <div style="display:flex; justify-content:center; margin: 4px 0;">
            <button class="btn-insert-maint" data-after-id="${phase.id}" style="background: rgba(245, 158, 11, 0.1); border: 1px dashed rgba(245, 158, 11, 0.4); color: var(--color-maintenance-light); border-radius: 999px; padding: 4px 12px; font-size: 10.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: transform 0.15s ease;">
              <span>+</span> Insert 1–2 Wk Maintenance
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="animate-fade-in" style="position: relative; margin-bottom: var(--space-2xl); width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden;">

      <!-- Roadmap Header & Immediate Maintenance Trigger -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 8px;">
        <div>
          <h3 class="font-display" style="font-size: 1.2rem; font-weight: 700; margin: 0;">Transformation Journey</h3>
          <span class="text-caption text-tertiary" style="font-size: 11px;">Chronological phase blueprint</span>
        </div>
        <button id="btn-start-immediate-maint" style="background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.45); color: var(--color-maintenance-light); border-radius: 999px; padding: 6px 14px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 0 12px rgba(245, 158, 11, 0.18); transition: transform 0.15s ease;">
          <span>⚡</span> Start Maintenance Now
        </button>
      </div>

      <!-- Chronological Phase Timeline -->
      <div id="roadmap-list-container" style="width: 100%; box-sizing: border-box;">
        ${phaseItemsHtml}
      </div>

      <!-- Apex Ultimate Goal Card -->
      <div class="card glass-regular animate-slide-up" style="margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--radius-lg); border: 1.5px solid var(--color-accent); background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(20,20,26,0.9) 100%); text-align: center;">
        <span class="text-caption text-accent" style="font-size: 10px; letter-spacing: 0.15em; font-weight: 800;">ULTIMATE TRANSFORMATION APEX</span>
        <h3 class="font-display text-accent" style="font-size: 1.4rem; font-weight: 700; margin: 4px 0 6px;">77.5kg LBM @ 10% Body Fat</h3>
        <p class="text-caption text-secondary" style="font-size: 11.5px; line-height: 1.4; margin: 0;">
          Culmination of the AGOGE protocol: an intermediate muscular titan frame (+18kg lean muscle gained).
        </p>
      </div>
      
      <!-- Multi-Year Milestones (Interactive) -->
      <div style="margin-top: var(--space-xl); padding-top: var(--space-md); border-top: 1px dashed rgba(255,255,255,0.12);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-sm);">
          <h3 class="font-display text-accent" style="font-size: 1.15rem; font-weight:700; margin: 0;">Multi-Year Milestones</h3>
          <span class="text-caption text-tertiary" style="font-size: 10.5px;">Long-term doctrine</span>
        </div>
        
        <div class="card glass-regular animate-slide-up milestone-card" data-milestone="1" style="margin-bottom: var(--space-xs); border-left: 3px solid ${currentLBM >= 68 ? 'var(--color-success)' : 'rgba(255,255,255,0.2)'}; padding: var(--space-sm) var(--space-md); cursor: pointer; border-radius: var(--radius-sm); transition: transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items: baseline;">
            <div style="display:flex; align-items:center; gap: 6px;">
              <span class="font-display" style="font-size: 1.05rem; font-weight: 600;">Year 1: Foundation</span>
              ${currentLBM >= 68 ? '<span style="background:var(--color-success); color:#fff; font-size:9px; font-weight:700; padding:1px 5px; border-radius:999px;">ACHIEVED</span>' : ''}
            </div>
            <span style="font-family:var(--font-body); font-variant-numeric:tabular-nums; font-weight:700; font-size:12px; color:var(--color-text-secondary);">68kg LBM</span>
          </div>
          <p class="text-caption text-tertiary" style="margin-top:4px; line-height: 1.4; font-size: 11px; margin-bottom: 0;">Mastery of energy balance, strict compliance, and consistent progressive volume.</p>
        </div>
        
        <div class="card glass-regular animate-slide-up milestone-card" data-milestone="2" style="margin-bottom: var(--space-xs); border-left: 3px solid ${currentLBM >= 72 ? 'var(--color-success)' : 'rgba(255,255,255,0.3)'}; padding: var(--space-sm) var(--space-md); cursor: pointer; border-radius: var(--radius-sm); transition: transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items: baseline;">
            <div style="display:flex; align-items:center; gap: 6px;">
              <span class="font-display" style="font-size: 1.05rem; font-weight: 600;">Year 2: Density</span>
              ${currentLBM >= 72 ? '<span style="background:var(--color-success); color:#fff; font-size:9px; font-weight:700; padding:1px 5px; border-radius:999px;">ACHIEVED</span>' : ''}
            </div>
            <span style="font-family:var(--font-body); font-variant-numeric:tabular-nums; font-weight:700; font-size:12px; color:var(--color-text-secondary);">72kg LBM</span>
          </div>
          <p class="text-caption text-tertiary" style="margin-top:4px; line-height: 1.4; font-size: 11px; margin-bottom: 0;">Muscle tissue maturation, higher mechanical tension, structured mini-cuts and lean surpluses.</p>
        </div>
        
        <div class="card glass-regular animate-slide-up milestone-card" data-milestone="3" style="margin-bottom: var(--space-xs); border-left: 3px solid var(--color-accent); padding: var(--space-sm) var(--space-md); cursor: pointer; border-radius: var(--radius-sm); transition: transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items: baseline;">
            <div style="display:flex; align-items:center; gap: 6px;">
              <span class="font-display text-accent" style="font-size: 1.05rem; font-weight: 700;">Year 3: Titan Goal</span>
              ${currentLBM >= 77.5 ? '<span style="background:var(--color-accent); color:#0A0A0C; font-size:9px; font-weight:800; padding:1px 5px; border-radius:999px;">APEX WARRIOR</span>' : ''}
            </div>
            <span style="font-family:var(--font-body); font-variant-numeric:tabular-nums; font-weight:700; font-size:12px; color:var(--color-accent);">77.5kg LBM</span>
          </div>
          <p class="text-caption text-tertiary" style="margin-top:4px; line-height: 1.4; font-size: 11px; margin-bottom: 0;">The apex physical identity. 87.5kg at 11% body fat. Unbreakable discipline and athletic power.</p>
        </div>
      </div>
    </div>
  `;

  // Attach interactive phase editing
  container.querySelectorAll('.roadmap-item').forEach(el => {
    el.addEventListener('click', () => {
      const p = store.getPhaseById(parseInt(el.dataset.phaseId));
      if (p) openPhaseEditModal(p);
    });
  });

  // Attach immediate maintenance button handler
  const btnStartMaint = container.querySelector('#btn-start-immediate-maint');
  if (btnStartMaint) {
    btnStartMaint.addEventListener('click', () => {
      const weeksChoice = prompt("Start Transition Maintenance Immediately:\nEnter duration in weeks (1 or 2):", "2");
      if (weeksChoice === null) return;
      const durationWeeks = (weeksChoice && weeksChoice.trim() === '1') ? 1 : 2;
      store.startImmediateMaintenance(durationWeeks);
      renderActiveTab(document.getElementById('statistics-content'));
    });
  }

  // Attach insert maintenance button handler
  container.querySelectorAll('.btn-insert-maint').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const afterId = parseInt(btn.dataset.afterId);
      const weeksChoice = prompt("Insert Maintenance Phase:\nEnter duration in weeks (1 or 2):", "2");
      const durationWeeks = (weeksChoice && weeksChoice.trim() === '1') ? 1 : 2;
      store.insertMaintenancePhase(afterId, durationWeeks);
      renderActiveTab(document.getElementById('statistics-content'));
    });
  });

  container.querySelectorAll('.milestone-card').forEach(card => {
    card.addEventListener('click', () => {
      card.style.transform = 'scale(0.98)';
      setTimeout(() => { card.style.transform = 'none'; }, 150);
    });
  });
}

let selectedTimelineYear = 'auto';

async function renderTimeline(container) {
  const phases = store.getPhases();
  
  if (!phases.length || !phases[0].startDate) {
    container.innerHTML = '<p class="text-secondary text-center" style="margin-top:var(--space-xl)">No timeline data available.</p>';
    return;
  }

  // Get absolute start and end dates
  const minDate = new Date(phases[0].startDate);
  const maxDate = new Date(phases[phases.length - 1].endDate);
  
  // Build a map of days to phases
  const daysMap = new Map();
  phases.forEach(p => {
    if (!p.startDate || !p.endDate) return;
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      daysMap.set(d.toISOString().split('T')[0], p);
    }
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Group months by year
  const yearsMap = new Map();
  let curr = new Date(minDate);
  curr.setDate(1);

  while (curr <= maxDate) {
    const yr = curr.getFullYear();
    const mo = curr.getMonth();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const startDayOfWeek = new Date(yr, mo, 1).getDay(); // 0 = Sun

    const activePhasesInMonth = new Set();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(yr, mo, day);
      const iso = d.toISOString().split('T')[0];
      const phase = daysMap.get(iso);
      if (phase) activePhasesInMonth.add(phase);
      days.push({ day, phase });
    }

    if (!yearsMap.has(yr)) {
      yearsMap.set(yr, []);
    }
    yearsMap.get(yr).push({
      year: yr,
      month: mo,
      monthName: monthNames[mo],
      startDayOfWeek,
      daysInMonth,
      days,
      activePhases: Array.from(activePhasesInMonth)
    });

    curr.setMonth(curr.getMonth() + 1);
  }

  const allYears = Array.from(yearsMap.keys()).sort((a, b) => a - b);
  const activePhase = store.getActivePhase();
  const currentActiveYear = activePhase && activePhase.startDate ? new Date(activePhase.startDate).getFullYear() : allYears[0];

  if (selectedTimelineYear === 'auto' || (!yearsMap.has(selectedTimelineYear) && selectedTimelineYear !== 'all')) {
    selectedTimelineYear = currentActiveYear || allYears[0];
  }

  let html = '<div class="animate-fade-in" style="margin-bottom: var(--space-2xl);">';

  // Year Navigation Selector Pills
  html += '<div class="timeline-year-nav" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: var(--space-md); scrollbar-width: none;">';
  allYears.forEach(yr => {
    const isSel = selectedTimelineYear === yr;
    html += `
      <button type="button" class="btn-year-pill ${isSel ? 'btn-year-pill--active' : ''}" data-year="${yr}" style="
        padding: 6px 14px;
        border-radius: var(--radius-pill);
        border: 1px solid ${isSel ? 'var(--color-accent)' : 'var(--color-border)'};
        background: ${isSel ? 'var(--color-accent)' : 'var(--color-bg-elevated)'};
        color: ${isSel ? '#0A0A0C' : 'var(--color-text)'};
        font-weight: ${isSel ? '600' : '400'};
        font-size: var(--fs-small);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;
      ">
        ${yr}
      </button>
    `;
  });
  const isAll = selectedTimelineYear === 'all';
  html += `
    <button type="button" class="btn-year-pill ${isAll ? 'btn-year-pill--active' : ''}" data-year="all" style="
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      border: 1px solid ${isAll ? 'var(--color-accent)' : 'var(--color-border)'};
      background: ${isAll ? 'var(--color-accent)' : 'var(--color-bg-elevated)'};
      color: ${isAll ? '#0A0A0C' : 'var(--color-text)'};
      font-weight: ${isAll ? '600' : '400'};
      font-size: var(--fs-small);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    ">
      All
    </button>
  </div>`;

  // Years to render
  const yearsToRender = selectedTimelineYear === 'all' ? allYears : [selectedTimelineYear];

  yearsToRender.forEach(yr => {
    const months = yearsMap.get(yr) || [];
    
    // Collect unique phases in this year
    const yearPhaseMap = new Map();
    months.forEach(m => {
      m.activePhases.forEach(p => {
        if (!yearPhaseMap.has(p.id)) yearPhaseMap.set(p.id, p);
      });
    });
    const yearPhases = Array.from(yearPhaseMap.values());

    let monthCardsHtml = '';
    months.forEach(m => {
      let daysHtml = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: var(--space-xs);">';
      
      // Empty slots for days before start day
      for (let i = 0; i < m.startDayOfWeek; i++) {
        daysHtml += '<div></div>';
      }
      
      m.days.forEach(d => {
        let bg = 'rgba(243, 239, 230, 0.04)';
        if (d.phase) {
          bg = d.phase.type === 'CUT' ? 'var(--color-cut)' : 'var(--color-bulk)';
        }
        daysHtml += `<div style="aspect-ratio: 1; background: ${bg}; border-radius: 2px;"></div>`;
      });
      daysHtml += '</div>';

      // Phase interactive tags for this month
      let phaseBlocks = '';
      if (m.activePhases.length > 0) {
        phaseBlocks += '<div style="display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-xs);">';
        m.activePhases.forEach(phase => {
          const isCut = phase.type === 'CUT';
          const bg = isCut ? 'rgba(140, 47, 47, 0.15)' : 'rgba(47, 74, 60, 0.15)';
          const border = isCut ? 'var(--color-cut-light)' : 'var(--color-bulk-light)';
          
          const diffText = (phase.actualWeight && phase.targetWeight) 
              ? Math.abs(phase.actualWeight - phase.targetWeight).toFixed(1) + 'kg left' 
              : `Tgt: ${phase.targetWeight}kg`;

          phaseBlocks += `
            <div class="card timeline-phase-card" data-phase-id="${phase.id}" style="cursor: pointer; background: ${bg}; border-left: 3px solid ${border}; padding: 6px var(--space-sm); display: flex; justify-content: space-between; align-items: center; transition: transform 0.2s ease;">
              <div>
                <h4 class="font-display" style="color: ${border}; margin: 0; font-size: 12px;">${phase.name}</h4>
              </div>
              <div style="text-align: right;">
                <span class="text-caption text-secondary" style="display: block; font-size: 11px;">${diffText}</span>
              </div>
            </div>
          `;
        });
        phaseBlocks += '</div>';
      }

      monthCardsHtml += `
        <div style="min-width: 250px; max-width: 270px; scroll-snap-align: start; flex-shrink: 0; background: var(--color-bg-elevated); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
            <span class="font-display text-accent" style="font-size: var(--fs-small); font-weight: 600;">${m.monthName} ${yr}</span>
            <span class="text-caption text-tertiary" style="font-size: 10px;">${m.daysInMonth}d</span>
          </div>
          
          <!-- Day of week headers -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; text-align: center;">
            <span class="text-caption text-tertiary" style="font-size: 9px; opacity: 0.5;">S</span>
            <span class="text-caption text-tertiary" style="font-size: 9px; opacity: 0.5;">M</span>
            <span class="text-caption text-tertiary" style="font-size: 9px; opacity: 0.5;">T</span>
            <span class="text-caption text-tertiary" style="font-size: 9px; opacity: 0.5;">W</span>
            <span class="text-caption text-tertiary" style="font-size: 9px; opacity: 0.5;">T</span>
            <span class="text-caption text-tertiary" style="font-size: 9px; opacity: 0.5;">F</span>
            <span class="text-caption text-tertiary" style="font-size: 9px; opacity: 0.5;">S</span>
          </div>

          ${daysHtml}
          ${phaseBlocks}
        </div>
      `;
    });

    html += `
      <div class="timeline-year-group" style="margin-bottom: var(--space-xl);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); padding-bottom: 4px; border-bottom: 1px solid var(--color-border);">
          <div style="display: flex; align-items: baseline; gap: var(--space-sm);">
            <span class="font-display text-accent" style="font-size: 1.35rem; font-weight: bold; letter-spacing: 0.05em;">${yr}</span>
            <span class="text-caption text-tertiary">${months.length} Months</span>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
            ${yearPhases.map(p => `
              <span class="badge ${p.type === 'CUT' ? 'badge--cut' : 'badge--bulk'}" style="font-size: 10px; padding: 2px 6px;">${p.name}</span>
            `).join('')}
          </div>
        </div>

        <!-- Horizontal scroll of month cards for THIS year -->
        <div style="display: flex; overflow-x: auto; gap: var(--space-md); padding-bottom: var(--space-md); scroll-snap-type: x mandatory; margin: 0 calc(var(--space-md) * -1); padding-left: var(--space-md); padding-right: var(--space-md); scrollbar-width: thin;">
          ${monthCardsHtml}
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;

  // Add click handlers for Year Pills
  container.querySelectorAll('.btn-year-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const yrVal = e.currentTarget.dataset.year;
      selectedTimelineYear = yrVal === 'all' ? 'all' : parseInt(yrVal, 10);
      renderTimeline(container);
    });
  });

  // Add click interactivity for phase cards
  container.querySelectorAll('.timeline-phase-card').forEach(card => {
    card.addEventListener('click', () => {
      const p = store.getPhaseById(parseInt(card.dataset.phaseId));
      if (p) {
        import('../components/hero-card.js').then(module => {
          module.openPhaseEditModal(p);
        });
      }
    });
  });
}
