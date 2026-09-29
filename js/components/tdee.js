/**
 * TDEE Calculator Module (Phase 3.3)
 */
import { store } from '../store.js';

/**
 * Calculates Lean Body Mass (LBM).
 * LBM = Weight * (1 - BF / 100)
 */
export function calculateLBM(weight, bodyFat) {
  if (!weight || !bodyFat) return null;
  return weight * (1 - (bodyFat / 100));
}

/**
 * Katch-McArdle Formula (Primary)
 * BMR = 370 + (21.6 * LBM)
 */
export function calculateBMRKatch(weight, bodyFat) {
  const lbm = calculateLBM(weight, bodyFat);
  if (!lbm) return null;
  return 370 + (21.6 * lbm);
}

/**
 * Mifflin-St Jeor Formula (Secondary cross-check)
 * Men: BMR = (10 * weight) + (6.25 * height) - (5 * age) + 5
 * Women: BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161
 */
export function calculateBMRMifflin(weight, height, age, sex) {
  if (!weight || !height || !age || !sex) return null;
  
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (sex === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return bmr;
}

/**
 * Calculates total daily energy expenditure.
 * TDEE = BMR * ActivityMultiplier
 */
export function calculateTDEE(bmr, activityLevel) {
  if (!bmr || !activityLevel) return null;
  return bmr * activityLevel;
}

/**
 * Computes a full profile of TDEE values based on current store settings and latest check-in.
 */
export function getCurrentTDEEProfile() {
  const s = store.state.settings;
  const checkIns = store.getCheckIns();
  
  if (checkIns.length === 0) {
    return {
      katchTDEE: null,
      mifflinTDEE: null,
      activityLevel: s.activityLevel || 1.2
    };
  }

  const latest = checkIns[checkIns.length - 1];
  
  const bmrKatch = calculateBMRKatch(latest.weight, latest.bodyFat);
  const bmrMifflin = calculateBMRMifflin(latest.weight, s.height, s.age, s.sex);
  
  const activityLevel = s.activityLevel || 1.2;

  return {
    katchBMR: bmrKatch,
    katchTDEE: bmrKatch ? Math.round(calculateTDEE(bmrKatch, activityLevel)) : null,
    mifflinBMR: bmrMifflin,
    mifflinTDEE: bmrMifflin ? Math.round(calculateTDEE(bmrMifflin, activityLevel)) : null,
    weight: latest.weight,
    bodyFat: latest.bodyFat,
    activityLevel
  };
}
