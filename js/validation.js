/**
 * Input validation for physiological measurements.
 * Returns structured error objects for inline display.
 */

const RANGES = {
  weight: { min: 30, max: 250, unit: 'kg' },
  bodyFat: { min: 3, max: 60, unit: '%' }
};

/**
 * Validate a weight value.
 * @param {*} value - The input value
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
export function validateWeight(value) {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: 'Enter a valid number' };
  }
  if (num < RANGES.weight.min || num > RANGES.weight.max) {
    return { valid: false, error: `Weight must be between ${RANGES.weight.min}–${RANGES.weight.max} ${RANGES.weight.unit}` };
  }
  return { valid: true, value: parseFloat(num.toFixed(1)) };
}

/**
 * Validate a body fat percentage value.
 * @param {*} value - The input value
 * @param {boolean} optional - If true, empty/null values are accepted
 * @returns {{ valid: boolean, value?: number|null, error?: string }}
 */
export function validateBodyFat(value, optional = false) {
  if (optional && (value === '' || value == null || value === undefined)) {
    return { valid: true, value: null };
  }
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: 'Enter a valid number' };
  }
  if (num < RANGES.bodyFat.min || num > RANGES.bodyFat.max) {
    return { valid: false, error: `Body fat must be between ${RANGES.bodyFat.min}–${RANGES.bodyFat.max}${RANGES.bodyFat.unit}` };
  }
  return { valid: true, value: parseFloat(num.toFixed(1)) };
}

/**
 * Validate a complete check-in entry.
 * @param {{ weight: *, bodyFat: * }} entry
 * @returns {{ valid: boolean, errors: Array<{field: string, message: string}>, values?: {weight: number, bodyFat: number|null} }}
 */
export function validateCheckIn(entry) {
  const errors = [];
  const weightResult = validateWeight(entry.weight);
  const bfResult = validateBodyFat(entry.bodyFat, true);
  
  if (!weightResult.valid) errors.push({ field: 'weight', message: weightResult.error });
  if (!bfResult.valid) errors.push({ field: 'bodyFat', message: bfResult.error });
  
  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, errors: [], values: { weight: weightResult.value, bodyFat: bfResult.value } };
}

/**
 * Validate phase target updates.
 * @param {{ targetWeight: *, targetBF: *, actualWeight: *, actualBF: * }} data
 * @returns {{ valid: boolean, errors: Array<{field: string, message: string}> }}
 */
export function validatePhaseUpdate(data) {
  const errors = [];
  
  if (data.targetWeight != null) {
    const tw = validateWeight(data.targetWeight);
    if (!tw.valid) errors.push({ field: 'targetWeight', message: tw.error });
  }
  if (data.targetBF != null) {
    const tb = validateBodyFat(data.targetBF);
    if (!tb.valid) errors.push({ field: 'targetBF', message: tb.error });
  }
  if (data.actualWeight != null && data.actualWeight !== '') {
    const aw = validateWeight(data.actualWeight);
    if (!aw.valid) errors.push({ field: 'actualWeight', message: aw.error });
  }
  if (data.actualBF != null && data.actualBF !== '') {
    const ab = validateBodyFat(data.actualBF, true);
    if (!ab.valid) errors.push({ field: 'actualBF', message: ab.error });
  }
  
  return { valid: errors.length === 0, errors };
}
