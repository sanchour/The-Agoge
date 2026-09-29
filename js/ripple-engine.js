/**
 * Intelligent Ripple-Forward Engine
 * When actuals are logged on phase N, recalculates all downstream
 * phase targets while preserving the planned lean mass gain deltas.
 * 
 * Formula:
 *   expectedDelta = defaultPhase[i].targetLBM - defaultPhase[i-1].targetLBM
 *   newTargetLBM  = prevActualLBM + expectedDelta
 *   newTargetWeight = newTargetLBM / (1 - targetBF/100)
 */

/**
 * Ripple forward from a starting phase index.
 * Pure function — returns a new phases array.
 * 
 * @param {Array} phases - Current phases array (will be cloned)
 * @param {Array} defaultPhases - Original default phases for delta calculation
 * @param {number} startIndex - Index of the phase where actuals were logged
 * @returns {Array} Updated phases array with recalculated downstream targets
 */
export function rippleForward(phases, defaultPhases, startIndex) {
  // Clone to avoid mutation
  const updated = phases.map(p => ({ ...p }));
  const current = updated[startIndex];
  
  // Base for LBM rippling
  let prevLBM = (current.actualLBM != null) ? current.actualLBM : current.targetLBM;
  
  for (let i = startIndex + 1; i < updated.length; i++) {
    const defaultPhase = defaultPhases[i];
    const defaultPrevPhase = defaultPhases[i - 1];
    
    // --- LBM & Weight Rippling ---
    if (defaultPhase && defaultPrevPhase) {
      // Expected LBM gain delta from the original plan
      const expectedDelta = defaultPhase.targetLBM - defaultPrevPhase.targetLBM;
      
      // New target LBM = previous actual/target LBM + expected delta
      const newTargetLBM = prevLBM + expectedDelta;
      updated[i].targetLBM = parseFloat(newTargetLBM.toFixed(1));
      
      // Recalculate total weight from new LBM and existing BF target
      const newTargetWeight = newTargetLBM / (1 - updated[i].targetBF / 100);
      updated[i].targetWeight = parseFloat(newTargetWeight.toFixed(1));
    }
    
    // Set up prevLBM for the NEXT loop iteration
    prevLBM = updated[i].actualLBM != null ? updated[i].actualLBM : updated[i].targetLBM;

    // --- Date Rippling ---
    const prevPhase = updated[i - 1];
    if (prevPhase.endDate) {
      let durationMs = 0;
      if (updated[i].startDate && updated[i].endDate) {
        durationMs = new Date(updated[i].endDate).getTime() - new Date(updated[i].startDate).getTime();
      } else {
        const weeksMatch = updated[i].weeks ? updated[i].weeks.match(/(\d+)/) : null;
        const wks = weeksMatch ? parseInt(weeksMatch[1], 10) : 0;
        durationMs = wks * 7 * 24 * 60 * 60 * 1000;
      }
      
      updated[i].startDate = prevPhase.endDate;
      
      if (durationMs > 0) {
        const startD = new Date(updated[i].startDate);
        startD.setTime(startD.getTime() + durationMs);
        updated[i].endDate = startD.toISOString();
      }
    }
  }
  
  return updated;
}
