/**
 * Discipline Index Computation
 * Rolling consistency percentage — not a streak.
 * A missed day dents the percentage slightly but never resets to zero.
 */

/**
 * Compute discipline index metrics.
 * @param {Array<{date: string}>} checkIns - Array of check-in objects with ISO date strings
 * @returns {{ thirtyDay: number, ninetyDay: number, allTimeCount: number }}
 */
export function computeDisciplineIndex(checkIns) {
  if (!checkIns || checkIns.length === 0) {
    return { thirtyDay: 0, ninetyDay: 0, allTimeCount: 0 };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get unique dates from check-ins
  const uniqueDates = new Set(checkIns.map(c => c.date));
  
  // Count days with data in the 30-day window
  let count30 = 0;
  let count90 = 0;
  
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    if (uniqueDates.has(dateStr)) {
      if (i < 30) count30++;
      count90++;
    }
  }
  
  return {
    thirtyDay: Math.round((count30 / 30) * 100),
    ninetyDay: Math.round((count90 / 90) * 100),
    allTimeCount: checkIns.length
  };
}
