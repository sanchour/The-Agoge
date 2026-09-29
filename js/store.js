/**
 * AGOGE State Store
 * Central state management with localStorage persistence,
 * versioned schema, and JSON export/import.
 */

import { rippleForward } from './ripple-engine.js';

const STORAGE_KEY = 'agoge_state_v1';
const SCHEMA_VERSION = 1;

/** Default protocol phases — preserved from Project Leonidas */
const DEFAULT_PHASES = [
  { id: 0, name: 'Mini-Cut', type: 'CUT', period: 'Jun → Aug 2026', weeks: '10 Weeks', targetWeight: 57.0, targetBF: 11.0, targetLBM: 49.5, actualWeight: null, actualBF: null, actualLBM: null, status: 'ACTIVE', rate: '−0.4 to −0.5 kg / wk', cals: '400–600 kcal deficit below TDEE', desc: 'Initial reset phase. Drop visceral fat and optimize insulin sensitivity before embarking on Bulk I.', notes: '' },
  { id: 1, name: 'Bulk I', type: 'BULK', period: 'Sep 2026 → Mar 2027', weeks: '28 Weeks', targetWeight: 67.5, targetBF: 18.0, targetLBM: 55.0, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '+0.3 to +0.4 kg / wk', cals: 'Start at listed surplus, add +100-150 kcal if weight stalls 2-3 wks', desc: 'First primary muscle foundation block. Controlled gain to minimize fat gain strictly under 18% ceiling.', notes: '' },
  { id: 2, name: 'Cut I', type: 'CUT', period: 'Apr → Jul 2027', weeks: '13 Weeks', targetWeight: 62.0, targetBF: 11.0, targetLBM: 54.7, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '−0.4 to −0.5 kg / wk', cals: '400–600 kcal deficit below TDEE', desc: 'Strip fat gained during Bulk I while preserving all newly forged lean muscle tissue.', notes: '' },
  { id: 3, name: 'Bulk II', type: 'BULK', period: 'Jul 2027 → Feb 2028', weeks: '30 Weeks', targetWeight: 73.5, targetBF: 18.0, targetLBM: 59.2, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '+0.3 to +0.4 kg / wk', cals: 'Start at listed surplus, add +100-150 kcal if weight stalls 2-3 wks', desc: 'Second major expansion block building formidable intermediate muscular frame size.', notes: '' },
  { id: 4, name: 'Cut II', type: 'CUT', period: 'Mar → Jun 2028', weeks: '14 Weeks', targetWeight: 67.0, targetBF: 11.0, targetLBM: 58.9, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '−0.4 to −0.5 kg / wk', cals: '400–600 kcal deficit below TDEE', desc: 'Reveal deep abdominal etching and vascularity. Never diet in deficit over 14 straight weeks.', notes: '' },
  { id: 5, name: 'Bulk III', type: 'BULK', period: 'Jun 2028 → Feb 2029', weeks: '32 Weeks', targetWeight: 79.0, targetBF: 18.0, targetLBM: 62.4, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '+0.3 to +0.35 kg / wk', cals: 'Start at listed surplus, add +100-150 kcal if weight stalls 2-3 wks', desc: 'Heavy compound loading campaign. Focus on progressive overload on all foundational lifts.', notes: '' },
  { id: 6, name: 'Cut III', type: 'CUT', period: 'Feb → May 2029', weeks: '14 Weeks', targetWeight: 72.0, targetBF: 11.0, targetLBM: 62.1, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '−0.4 to −0.5 kg / wk', cals: '400–600 kcal deficit below TDEE', desc: 'Shred down to lean peak condition while maintaining heavy lifting intensity.', notes: '' },
  { id: 7, name: 'Bulk IV (Final)', type: 'BULK', period: 'Jun 2029 → Feb 2030', weeks: '34 Weeks', targetWeight: 82.5, targetBF: 18.0, targetLBM: 64.6, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '+0.25 to +0.35 kg / wk', cals: 'Start at listed surplus, add +100-150 kcal if weight stalls 2-3 wks', desc: 'The final mass accretion campaign pushing total frame weight over the 80kg titan threshold.', notes: '' },
  { id: 8, name: 'Final Titan Cut', type: 'CUT', period: 'Feb → May 2030', weeks: '14 Weeks', targetWeight: 77.5, targetBF: 10.0, targetLBM: 69.0, actualWeight: null, actualBF: null, actualLBM: null, status: 'UPCOMING', rate: '−0.4 to −0.5 kg / wk', cals: '400–600 kcal deficit below TDEE', desc: 'The ultimate culmination: 77.5kg @ 10% BF (+18.2kg pure lean muscle). Final goal unlocked.', notes: '' }
];

export const ACCENT_PALETTES = {
  bronze: {
    id: 'bronze',
    name: 'Bronze (Default)',
    hex: '#C9A15A',
    light: '#D4B06A',
    dark: '#A8843F',
    glow: 'rgba(201, 161, 90, 0.25)',
    border: 'rgba(201, 161, 90, 0.3)'
  },
  oxblood: {
    id: 'oxblood',
    name: 'Oxblood Crimson',
    hex: '#B33939',
    light: '#CD4B4B',
    dark: '#8E2828',
    glow: 'rgba(179, 57, 57, 0.25)',
    border: 'rgba(179, 57, 57, 0.3)'
  },
  laurel: {
    id: 'laurel',
    name: 'Laurel Green',
    hex: '#4A7C5C',
    light: '#5E9973',
    dark: '#365D44',
    glow: 'rgba(74, 124, 92, 0.25)',
    border: 'rgba(74, 124, 92, 0.3)'
  },
  aegean: {
    id: 'aegean',
    name: 'Aegean Blue',
    hex: '#3A6EA5',
    light: '#4F85C2',
    dark: '#2A517D',
    glow: 'rgba(58, 110, 165, 0.25)',
    border: 'rgba(58, 110, 165, 0.3)'
  },
  silver: {
    id: 'silver',
    name: 'Marble Silver',
    hex: '#D1D5DB',
    light: '#E5E7EB',
    dark: '#9CA3AF',
    glow: 'rgba(209, 213, 219, 0.25)',
    border: 'rgba(209, 213, 219, 0.3)'
  }
};

export function applyAccentColor(accentId) {
  const palette = ACCENT_PALETTES[accentId] || ACCENT_PALETTES.bronze;
  const root = document.documentElement;
  root.style.setProperty('--color-accent', palette.hex);
  root.style.setProperty('--color-accent-light', palette.light);
  root.style.setProperty('--color-accent-dark', palette.dark);
  root.style.setProperty('--color-accent-glow', palette.glow);
  root.style.setProperty('--color-border-accent', palette.border);
}

/** Create default state */
function createDefaultState() {
  const initialPhases = JSON.parse(JSON.stringify(DEFAULT_PHASES));
  
  // Initialize start/end dates
  let currentDate = new Date();
  initialPhases.forEach(p => {
    p.startDate = currentDate.toISOString();
    const weeksMatch = p.weeks.match(/(\d+)/);
    const wks = weeksMatch ? parseInt(weeksMatch[1], 10) : 0;
    const end = new Date(currentDate);
    end.setDate(end.getDate() + (wks * 7));
    p.endDate = end.toISOString();
    currentDate = new Date(end);
  });

  return {
    version: SCHEMA_VERSION,
    phases: initialPhases,
    activePhaseId: 0,
    activeProtocol: null,
    checkIns: [],
    settings: {
      theme: 'dark',
      reminderEnabled: false,
      notificationsEnabled: false,
      notificationTime: '08:00',
      units: 'metric',
      createdAt: new Date().toISOString(),
      lastExportAt: null,
      name: 'Spartan',
      profileIcon: 'target',
      accentColor: 'bronze',
      appIcon: 'classic',
      avatar: null,
      age: 25,
      height: 175,
      sex: 'male',
      activityLevel: 1.55 // Moderately active
    },
    onboardingComplete: false
  };
}

class Store {
  constructor() {
    this.state = null;
    this.listeners = new Set();
    this.defaultPhases = JSON.parse(JSON.stringify(DEFAULT_PHASES));
  }

  /** Initialize store, loading from localStorage */
  init() {
    this.state = this.loadState();
    if (this.state.settings && this.state.settings.accentColor) {
      applyAccentColor(this.state.settings.accentColor);
    }
    return this.state;
  }

  /** Load state from localStorage with validation */
  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== SCHEMA_VERSION) {
        console.warn('[Store] Schema version mismatch, using defaults');
        return createDefaultState();
      }
      // Ensure required fields exist
      if (!Array.isArray(parsed.phases) || !Array.isArray(parsed.checkIns)) {
        return createDefaultState();
      }
      const def = createDefaultState();
      const state = {
        ...def,
        ...parsed,
        settings: { ...def.settings, ...(parsed.settings || {}) },
        onboardingComplete: parsed.onboardingComplete || false
      };
      
      if (!state.settings.profileIcon) state.settings.profileIcon = 'target';
      if (!state.settings.accentColor) state.settings.accentColor = 'bronze';
      
      // Backward compatibility: inject start/endDate if missing
      let cd = new Date();
      state.phases.forEach(p => {
        if (!p.startDate) p.startDate = cd.toISOString();
        const wMatch = p.weeks ? p.weeks.match(/(\d+)/) : null;
        const wks = wMatch ? parseInt(wMatch[1], 10) : 0;
        const e = new Date(p.startDate);
        e.setDate(e.getDate() + (wks * 7));
        if (!p.endDate) p.endDate = e.toISOString();
        cd = new Date(p.endDate);
      });

      return state;
    } catch (e) {
      console.error('[Store] Failed to load state:', e);
      return createDefaultState();
    }
  }

  /** Persist state to localStorage */
  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('[Store] Failed to save state:', e);
    }
  }

  /** Subscribe to state changes */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /** Notify all subscribers */
  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // --- Phase Operations ---

  getPhases() { return this.state.phases; }
  
  getActivePhase() {
    return this.state.phases.find(p => p.id === this.state.activePhaseId) || this.state.phases[0];
  }

  getPhaseById(id) {
    return this.state.phases.find(p => p.id === id);
  }

  updateSettings(updates) {
    Object.assign(this.state.settings, updates);
    this.saveState();
    this.notify();
  }

  updatePhase(id, updates) {
    const idx = this.state.phases.findIndex(p => p.id === id);
    if (idx === -1) return;
    
    const phase = this.state.phases[idx];
    Object.assign(phase, updates);
    
    // Recompute LBM values if they were updated
    if (updates.targetWeight != null && updates.targetBF != null) {
      phase.targetLBM = parseFloat((updates.targetWeight * (1 - updates.targetBF / 100)).toFixed(1));
    }
    if (updates.actualWeight != null && updates.actualBF != null) {
      phase.actualLBM = parseFloat((updates.actualWeight * (1 - updates.actualBF / 100)).toFixed(1));
    } else if (updates.actualWeight === null || updates.actualBF === null) {
      phase.actualLBM = null; // Clear if either becomes null
    }
    
    // Handle status changes
    if (updates.status === 'ACTIVE') {
      this.state.activePhaseId = id;
      this.state.phases.forEach((p, i) => {
        if (i < idx) p.status = 'COMPLETED';
        else if (i > idx) p.status = 'UPCOMING';
      });
    }
    
    // Ripple forward if actuals or dates were updated
    if (updates.actualWeight !== undefined || updates.actualBF !== undefined || updates.startDate !== undefined || updates.endDate !== undefined) {
      this.state.phases = rippleForward(this.state.phases, this.defaultPhases, idx);
    }
    
    this.saveState();
  }

  setActivePhase(id) {
    const idx = this.state.phases.findIndex(p => p.id === id);
    if (idx === -1) return;
    this.state.activePhaseId = id;
    this.state.phases.forEach((p, i) => {
      if (i < idx) p.status = 'COMPLETED';
      else if (i === idx) p.status = 'ACTIVE';
      else p.status = 'UPCOMING';
    });
    this.saveState();
  }

  insertMaintenancePhase(afterPhaseId, durationWeeks = 2) {
    const idx = this.state.phases.findIndex(p => p.id === afterPhaseId);
    if (idx === -1) return;

    const prevPhase = this.state.phases[idx];
    const startDate = prevPhase.endDate || new Date().toISOString();
    const endD = new Date(startDate);
    endD.setDate(endD.getDate() + (durationWeeks * 7));
    const endDate = endD.toISOString();

    const newId = Date.now();
    const maintenancePhase = {
      id: newId,
      name: `Maintenance (${durationWeeks}W)`,
      type: 'MAINTENANCE',
      period: `${durationWeeks} Wks`,
      weeks: `${durationWeeks} Weeks`,
      startDate,
      endDate,
      targetWeight: prevPhase.targetWeight,
      targetBF: prevPhase.targetBF,
      targetLBM: prevPhase.targetLBM,
      actualWeight: null,
      actualBF: null,
      actualLBM: null,
      status: 'UPCOMING',
      rate: '0.0 kg / wk',
      cals: '0 kcal (exact TDEE maintenance)',
      desc: `Structured ${durationWeeks}-week caloric equilibrium block to reset metabolic rate, restore hormonal balance, and solidify newly forged body composition.`,
      notes: ''
    };

    this.state.phases.splice(idx + 1, 0, maintenancePhase);
    
    // Ripple downstream dates from the newly inserted phase
    this.state.phases = rippleForward(this.state.phases, this.state.phases, idx + 1);
    this.saveState();
    return maintenancePhase;
  }

  startImmediateMaintenance(durationWeeks = 2) {
    const now = new Date();
    const startDate = now.toISOString();
    const endD = new Date(now);
    endD.setDate(endD.getDate() + (durationWeeks * 7));
    const endDate = endD.toISOString();

    const activeIdx = this.state.phases.findIndex(p => p.id === this.state.activePhaseId);
    const activePhase = activeIdx >= 0 ? this.state.phases[activeIdx] : null;

    const checkIns = this.getCheckIns();
    const latest = checkIns.length ? checkIns[checkIns.length - 1] : null;
    const curWeight = latest?.weight || activePhase?.targetWeight || 70;
    const curBF = latest?.bodyFat || activePhase?.targetBF || 14;
    const curLBM = parseFloat((curWeight * (1 - curBF / 100)).toFixed(1));

    if (activePhase && activePhase.type === 'MAINTENANCE') {
      activePhase.weeks = `${durationWeeks} Weeks`;
      activePhase.period = `${durationWeeks} Wks`;
      activePhase.endDate = endDate;
      this.state.phases = rippleForward(this.state.phases, this.state.phases, activeIdx);
      this.saveState();
      return activePhase;
    }

    const newId = Date.now();
    const maintenancePhase = {
      id: newId,
      name: `Maintenance (${durationWeeks}W)`,
      type: 'MAINTENANCE',
      period: `${durationWeeks} Wks`,
      weeks: `${durationWeeks} Weeks`,
      startDate,
      endDate,
      targetWeight: curWeight,
      targetBF: curBF,
      targetLBM: curLBM,
      actualWeight: null,
      actualBF: null,
      actualLBM: null,
      status: 'ACTIVE',
      rate: '0.0 kg / wk',
      cals: '0 kcal (exact TDEE maintenance)',
      desc: `Active ${durationWeeks}-week caloric equilibrium block to reset metabolic rate, restore hormonal balance, and solidify newly forged body composition.`,
      notes: ''
    };

    if (activePhase) {
      activePhase.status = 'COMPLETED';
      activePhase.endDate = startDate;
      this.state.phases.splice(activeIdx + 1, 0, maintenancePhase);
      this.state.activePhaseId = newId;
      this.state.phases = rippleForward(this.state.phases, this.state.phases, activeIdx + 1);
    } else {
      this.state.phases.unshift(maintenancePhase);
      this.state.activePhaseId = newId;
      this.state.phases = rippleForward(this.state.phases, this.state.phases, 0);
    }

    this.saveState();
    return maintenancePhase;
  }

  deletePhase(id) {
    if (this.state.phases.length <= 1) return;
    const idx = this.state.phases.findIndex(p => p.id === id);
    if (idx === -1) return;

    this.state.phases.splice(idx, 1);
    if (idx < this.state.phases.length) {
      this.state.phases = rippleForward(this.state.phases, this.state.phases, Math.max(0, idx - 1));
    }
    this.saveState();
  }

  reorderPhases(newOrder) {
    // newOrder is array of phase IDs in desired order
    const phaseMap = new Map(this.state.phases.map(p => [p.id, p]));
    this.state.phases = newOrder.map((id, i) => {
      const p = phaseMap.get(id);
      p.id = i; // Reassign sequential IDs
      return p;
    });
    this.saveState();
  }

  // --- Check-in Operations ---

  getCheckIns() { return this.state.checkIns; }

  addCheckIn(entry) {
    // entry: { date: 'YYYY-MM-DD', weight: number, bodyFat: number|null, notes: string }
    // Deduplicate by date — latest wins
    const existingIdx = this.state.checkIns.findIndex(c => c.date === entry.date);
    if (existingIdx >= 0) {
      this.state.checkIns[existingIdx] = entry;
    } else {
      this.state.checkIns.push(entry);
      // Keep sorted by date
      this.state.checkIns.sort((a, b) => a.date.localeCompare(b.date));
    }
    this.saveState();
  }

  getCheckInsInRange(startDate, endDate) {
    return this.state.checkIns.filter(c => c.date >= startDate && c.date <= endDate);
  }

  getLatestCheckIn() {
    if (this.state.checkIns.length === 0) return null;
    return this.state.checkIns[this.state.checkIns.length - 1];
  }

  deleteCheckIn(date) {
    const idx = this.state.checkIns.findIndex(c => c.date === date);
    if (idx >= 0) {
      this.state.checkIns.splice(idx, 1);
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Onboarding ---

  isOnboardingComplete() { return this.state.onboardingComplete; }

  completeOnboarding(startingWeight, startingBF) {
    this.state.onboardingComplete = true;
    const today = new Date().toISOString().split('T')[0];
    this.addCheckIn({
      date: today,
      weight: startingWeight,
      bodyFat: startingBF,
      notes: 'Starting baseline'
    });
    this.saveState();
  }

  // --- Export/Import ---

  exportJSON() {
    this.state.settings.lastExportAt = new Date().toISOString();
    this.saveState();
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agoge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async importJSON(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Validate schema
      if (!data.version || !Array.isArray(data.phases) || !Array.isArray(data.checkIns)) {
        throw new Error('Invalid AGOGE backup file format');
      }
      this.state = data;
      this.state.version = SCHEMA_VERSION; // Ensure current version
      this.saveState();
      return { success: true };
    } catch (e) {
      console.error('[Store] Import failed:', e);
      return { success: false, error: e.message };
    }
  }

  /** Full state reset to defaults */
  resetToDefaults() {
    this.state = createDefaultState();
    this.saveState();
  }

  /** Wipes phases and checkIns back to baseline */
  resetToBaseline() {
    this.state.phases = JSON.parse(JSON.stringify(this.defaultPhases));
    this.state.checkIns = [];
    this.state.activePhaseId = 0;
    this.state.activeProtocol = null;
    this.saveState();
  }

  /** Set active protocol */
  setActiveProtocol(protocol) {
    this.state.activeProtocol = protocol;
    this.saveState();
  }

  /** Update settings partially and persist */
  updateSettings(partial) {
    if (!this.state.settings) this.state.settings = {};
    Object.assign(this.state.settings, partial);
    if (partial.accentColor) {
      applyAccentColor(partial.accentColor);
    }
    this.saveState();
  }

  /** Get settings object */
  getSettings() {
    return this.state.settings || {};
  }
}

// Singleton export
export const store = new Store();
