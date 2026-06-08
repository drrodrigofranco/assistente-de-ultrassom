import { StudyType, StructureData, CalculationResult, NormalityDetail } from '../types';

/**
 * Normalizes a value to millimeters (mm) if in centimeters (cm) for easy calculation.
 */
export function toMm(val: number, unit: string | undefined): number {
  if (!unit) return val;
  const normalized = unit.toString().trim().toLowerCase();
  if (normalized === 'cm') {
    return val * 10;
  }
  return val;
}

/**
 * Normalizes a weight to grams (g). If in kilograms (kg), multiplies by 1000.
 */
export function toGrams(val: number, unit: string | undefined): number {
  if (!unit) return val;
  const normalized = unit.toString().trim().toLowerCase();
  if (normalized === 'kg') {
    return val * 1000;
  }
  return val;
}

/**
 * Formats a value with its original or target unit.
 */
export function formatVal(value: number, unit: string): string {
  return `${Number(value.toFixed(2))} ${unit}`;
}

/**
 * Calculates standard percentile from a Z-score.
 * High-precision rational approximation of the cumulative normal distribution function.
 */
export function getPercentileFromZ(z: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const q = c * Math.exp(-absZ * absZ / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  const pct = z >= 0.0 ? (1.0 - q) : q;
  return Math.min(99.9, Math.max(0.1, pct * 100)); // clamp between 0.1% and 99.9%
}

/**
 * Maps a biometric measurement to its corresponding percentile and z-score
 * using a split-normal (two-piece normal) distribution to handle asymmetric biological tables.
 */
export function getBiometryPercentile(value: number, min: number, mean: number, max: number): { percentile: number; zScore: number } {
  const diffMean = value - mean;
  let sd = 1;
  if (diffMean < 0) {
    sd = (mean - min) / 1.645;
  } else {
    sd = (max - mean) / 1.645;
  }
  if (sd <= 0) sd = 1;

  const zScore = diffMean / sd;
  const percentile = getPercentileFromZ(zScore);
  return { percentile, zScore };
}

/**
 * Derives Occipitofrontal Diameter (OFD) references (min, mean, max) dynamically
 * from the EURP Head Circumference (cc) and BPD (dbp) reference curves.
 */
export function getOfdRef(gestDecimal: number) {
  const ccRef = getEurpRef(gestDecimal, 'cc');
  const dbpRef = getEurpRef(gestDecimal, 'dbp');
  if (!ccRef || !dbpRef) return null;

  // Ellipse perimeter relation: HC = 1.57 * (BPD + OFD) => OFD = (2 * HC / pi) - BPD
  const mean = (2 * ccRef.mean / Math.PI) - dbpRef.mean;
  const min = (2 * ccRef.min / Math.PI) - dbpRef.max;
  const max = (2 * ccRef.max / Math.PI) - dbpRef.min;

  return { min, mean, max };
}


interface EurpWeekData {
  dbp: { min: number; mean: number; max: number };
  cc: { min: number; mean: number; max: number };
  ca: { min: number; mean: number; max: number };
  cf: { min: number; mean: number; max: number };
  ep: { min: number; mean: number; max: number };
  ila: { min: number; mean: number; max: number };
}

export const eurpCurves: { [week: number]: EurpWeekData } = {
  15: {
    dbp: { min: 28.9, mean: 32.7, max: 36.5 },
    cc: { min: 108.2, mean: 122.0, max: 135.8 },
    ca: { min: 100.3, mean: 111.8, max: 123.3 },
    cf: { min: 16.5, mean: 20.0, max: 23.5 },
    ep: { min: 15.0, mean: 17.5, max: 20.0 },
    ila: { min: 80.0, mean: 140.0, max: 200.0 }
  },
  16: {
    dbp: { min: 31.9, mean: 35.7, max: 39.6 },
    cc: { min: 117.0, mean: 131.7, max: 146.4 },
    ca: { min: 109.2, mean: 120.8, max: 132.4 },
    cf: { min: 19.3, mean: 22.8, max: 26.3 },
    ep: { min: 15.7, mean: 18.5, max: 21.2 },
    ila: { min: 80.0, mean: 140.0, max: 200.0 }
  },
  17: {
    dbp: { min: 34.8, mean: 38.8, max: 42.7 },
    cc: { min: 126.5, mean: 142.2, max: 157.9 },
    ca: { min: 118.8, mean: 130.5, max: 142.2 },
    cf: { min: 22.2, mean: 25.7, max: 29.2 },
    ep: { min: 16.5, mean: 19.5, max: 22.5 },
    ila: { min: 80.0, mean: 140.0, max: 200.0 }
  },
  18: {
    dbp: { min: 37.8, mean: 41.8, max: 45.8 },
    cc: { min: 136.8, mean: 153.5, max: 170.2 },
    ca: { min: 129.3, mean: 141.0, max: 152.6 },
    cf: { min: 25.0, mean: 28.5, max: 32.0 },
    ep: { min: 17.2, mean: 20.4, max: 23.7 },
    ila: { min: 80.0, mean: 140.0, max: 200.0 }
  },
  19: {
    dbp: { min: 40.7, mean: 44.8, max: 48.9 },
    cc: { min: 147.9, mean: 165.7, max: 183.5 },
    ca: { min: 140.7, mean: 152.3, max: 163.9 },
    cf: { min: 27.8, mean: 31.3, max: 34.8 },
    ep: { min: 17.9, mean: 21.4, max: 24.9 },
    ila: { min: 80.0, mean: 140.0, max: 200.0 }
  },
  20: {
    dbp: { min: 44.0, mean: 47.9, max: 51.8 },
    cc: { min: 159.7, mean: 176.6, max: 193.4 },
    ca: { min: 148.7, mean: 160.6, max: 172.5 },
    cf: { min: 30.3, mean: 34.1, max: 38.0 },
    ep: { min: 18.7, mean: 22.7, max: 26.8 },
    ila: { min: 90.0, mean: 150.0, max: 220.0 }
  },
  21: {
    dbp: { min: 47.4, mean: 51.1, max: 54.8 },
    cc: { min: 172.4, mean: 188.2, max: 203.8 },
    ca: { min: 157.1, mean: 169.3, max: 181.5 },
    cf: { min: 32.8, mean: 37.0, max: 41.2 },
    ep: { min: 19.4, mean: 24.0, max: 28.6 },
    ila: { min: 90.0, mean: 150.0, max: 220.0 }
  },
  22: {
    dbp: { min: 50.7, mean: 54.2, max: 57.7 },
    cc: { min: 186.2, mean: 200.5, max: 214.8 },
    ca: { min: 166.1, mean: 178.5, max: 190.9 },
    cf: { min: 35.2, mean: 39.8, max: 44.3 },
    ep: { min: 20.2, mean: 25.3, max: 30.5 },
    ila: { min: 90.0, mean: 150.0, max: 220.0 }
  },
  23: {
    dbp: { min: 54.0, mean: 57.3, max: 60.6 },
    cc: { min: 201.0, mean: 213.7, max: 226.4 },
    ca: { min: 175.5, mean: 188.2, max: 200.9 },
    cf: { min: 37.7, mean: 42.6, max: 47.5 },
    ep: { min: 20.9, mean: 26.6, max: 32.3 },
    ila: { min: 137.7, mean: 150.0, max: 162.3 }
  },
  24: {
    dbp: { min: 57.3, mean: 60.5, max: 63.7 },
    cc: { min: 212.0, mean: 224.1, max: 236.2 },
    ca: { min: 185.8, mean: 198.8, max: 211.7 },
    cf: { min: 40.5, mean: 45.1, max: 49.6 },
    ep: { min: 22.4, mean: 27.3, max: 32.2 },
    ila: { min: 134.0, mean: 147.2, max: 160.5 }
  },
  25: {
    dbp: { min: 60.5, mean: 63.6, max: 66.7 },
    cc: { min: 223.5, mean: 234.9, max: 246.3 },
    ca: { min: 196.8, mean: 209.9, max: 223.0 },
    cf: { min: 43.3, mean: 47.5, max: 51.7 },
    ep: { min: 24.0, mean: 28.1, max: 32.2 },
    ila: { min: 130.3, mean: 144.5, max: 158.6 }
  },
  26: {
    dbp: { min: 63.8, mean: 66.8, max: 69.8 },
    cc: { min: 235.7, mean: 246.3, max: 256.9 },
    ca: { min: 208.4, mean: 221.7, max: 234.9 },
    cf: { min: 46.1, mean: 50.0, max: 53.8 },
    ep: { min: 25.5, mean: 28.8, max: 32.1 },
    ila: { min: 126.6, mean: 141.7, max: 156.8 }
  },
  27: {
    dbp: { min: 67.0, mean: 69.9, max: 72.8 },
    cc: { min: 248.6, mean: 258.3, max: 268.0 },
    ca: { min: 220.7, mean: 234.1, max: 247.5 },
    cf: { min: 48.9, mean: 52.4, max: 55.9 },
    ep: { min: 27.0, mean: 29.5, max: 32.0 },
    ila: { min: 122.9, mean: 138.9, max: 154.9 }
  },
  28: {
    dbp: { min: 69.4, mean: 72.3, max: 75.3 },
    cc: { min: 256.7, mean: 266.5, max: 276.3 },
    ca: { min: 230.3, mean: 243.8, max: 257.3 },
    cf: { min: 51.5, mean: 54.7, max: 57.8 },
    ep: { min: 27.6, mean: 30.6, max: 33.6 },
    ila: { min: 118.1, mean: 135.1, max: 152.1 }
  },
  29: {
    dbp: { min: 71.8, mean: 74.8, max: 77.8 },
    cc: { min: 265.1, mean: 275.0, max: 284.8 },
    ca: { min: 240.4, mean: 254.0, max: 267.5 },
    cf: { min: 54.1, mean: 56.9, max: 59.8 },
    ep: { min: 28.1, mean: 31.6, max: 35.1 },
    ila: { min: 113.3, mean: 123.6, max: 149.2 }
  },
  30: {
    dbp: { min: 74.1, mean: 77.2, max: 80.2 },
    cc: { min: 273.8, mean: 283.7, max: 293.6 },
    ca: { min: 250.9, mean: 264.5, max: 278.2 },
    cf: { min: 56.6, mean: 59.2, max: 61.7 },
    ep: { min: 28.7, mean: 32.7, max: 36.7 },
    ila: { min: 108.5, mean: 127.4, max: 146.4 }
  },
  31: {
    dbp: { min: 76.5, mean: 79.6, max: 82.7 },
    cc: { min: 282.8, mean: 292.7, max: 302.6 },
    ca: { min: 261.8, mean: 275.5, max: 289.2 },
    cf: { min: 59.2, mean: 61.4, max: 63.6 },
    ep: { min: 29.2, mean: 33.7, max: 38.2 },
    ila: { min: 103.7, mean: 119.4, max: 133.9 }
  },
  32: {
    dbp: { min: 78.8, mean: 81.9, max: 85.0 },
    cc: { min: 289.2, mean: 299.5, max: 309.8 },
    ca: { min: 271.7, mean: 285.8, max: 299.8 },
    cf: { min: 61.3, mean: 63.6, max: 65.9 },
    ep: { min: 30.4, mean: 34.3, max: 38.2 },
    ila: { min: 101.9, mean: 121.5, max: 141.1 }
  },
  33: {
    dbp: { min: 81.2, mean: 84.2, max: 87.3 },
    cc: { min: 295.7, mean: 306.4, max: 317.2 },
    ca: { min: 282.0, mean: 296.4, max: 310.8 },
    cf: { min: 63.4, mean: 65.8, max: 68.2 },
    ep: { min: 31.6, mean: 34.9, max: 38.2 },
    ila: { min: 100.1, mean: 119.4, max: 138.7 }
  },
  34: {
    dbp: { min: 83.5, mean: 86.5, max: 89.5 },
    cc: { min: 302.3, mean: 313.5, max: 324.8 },
    ca: { min: 292.7, mean: 307.4, max: 322.2 },
    cf: { min: 65.5, mean: 68.0, max: 70.5 },
    ep: { min: 32.8, mean: 35.5, max: 38.2 },
    ila: { min: 98.3, mean: 117.3, max: 136.3 }
  },
  35: {
    dbp: { min: 85.8, mean: 88.8, max: 91.8 },
    cc: { min: 309.1, mean: 32.08 * 10, max: 332.5 },
    ca: { min: 303.8, mean: 318.9, max: 334.0 },
    cf: { min: 67.6, mean: 70.2, max: 72.8 },
    ep: { min: 34.0, mean: 36.1, max: 38.2 },
    ila: { min: 96.5, mean: 115.2, max: 133.9 }
  },
  36: {
    dbp: { min: 86.9, mean: 89.9, max: 92.8 },
    cc: { min: 312.6, mean: 323.4, max: 334.3 },
    ca: { min: 310.5, mean: 324.0, max: 337.4 },
    cf: { min: 68.9, mean: 71.4, max: 73.9 },
    ep: { min: 34.0, mean: 36.2, max: 38.4 },
    ila: { min: 92.2, mean: 111.8, max: 131.3 }
  },
  37: {
    dbp: { min: 88.0, mean: 90.9, max: 93.9 },
    cc: { min: 316.1, mean: 326.1, max: 336.1 },
    ca: { min: 314.4, mean: 329.2, max: 340.9 },
    cf: { min: 70.1, mean: 72.5, max: 74.9 },
    ep: { min: 34.1, mean: 36.4, max: 38.7 },
    ila: { min: 87.9, mean: 108.3, max: 128.7 }
  },
  38: {
    dbp: { min: 89.0, mean: 92.0, max: 94.9 },
    cc: { min: 319.7, mean: 328.8, max: 337.9 },
    ca: { min: 324.4, mean: 334.4, max: 344.4 },
    cf: { min: 71.4, mean: 73.7, max: 76.0 },
    ep: { min: 34.1, mean: 36.5, max: 38.9 },
    ila: { min: 83.6, mean: 104.9, max: 126.1 }
  },
  39: {
    dbp: { min: 90.1, mean: 93.0, max: 95.9 },
    cc: { min: 323.3, mean: 331.5, max: 339.7 },
    ca: { min: 33.16 * 10, mean: 33.98 * 10, max: 348.0 },
    cf: { min: 72.6, mean: 74.8, max: 77.0 },
    ep: { min: 34.1, mean: 36.6, max: 39.1 },
    ila: { min: 79.3, mean: 101.4, max: 123.5 }
  }
};

/**
 * Interpolates EURP reference values (mean, min, max) for a specific gestational age in decimal weeks.
 */
export function getEurpRef(gestDecimal: number, paramKey: 'dbp' | 'cc' | 'ca' | 'cf' | 'ep' | 'ila') {
  const wInt = Math.min(Math.max(gestDecimal, 15), 39);
  const floorWeekIndex = Math.floor(wInt);
  const ceilWeekIndex = Math.ceil(wInt);
  const fractWeek = wInt - floorWeekIndex;

  const dFloor = eurpCurves[floorWeekIndex];
  const dCeil = eurpCurves[ceilWeekIndex];
  if (!dFloor || !dCeil) return null;
  
  const fVal = dFloor[paramKey];
  const cVal = dCeil[paramKey];
  if (!fVal || !cVal) return null;

  return {
    min: fVal.min + fractWeek * (cVal.min - fVal.min),
    mean: fVal.mean + fractWeek * (cVal.mean - fVal.mean),
    max: fVal.max + fractWeek * (cVal.max - fVal.max)
  };
}

