import { StudyType, StructureData, CalculationResult, NormalityDetail } from '../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from './normalityCalculatorShared';

// Import all sub-calculators
import * as thyroid from './calculators/thyroid';
import * as renal from './calculators/renal';
import * as gallbladder_liver from './calculators/gallbladder_liver';
import * as obstetric from './calculators/obstetric';
import * as fgr_barcelona from './calculators/fgr_barcelona';
import * as carotid_vascular from './calculators/carotid_vascular';
import * as echocardiogram from './calculators/echocardiogram';
import * as breast_birads from './calculators/breast_birads';
import * as ovary_orads from './calculators/ovary_orads';
import * as scrotal from './calculators/scrotal';
import * as rheuma_omeract from './calculators/rheuma_omeract';
import * as abdomen_total from './calculators/abdomen_total';
import * as pelvic from './calculators/pelvic';
import * as prostate from './calculators/prostate';
import * as morphological_1t from './calculators/morphological_1t';
import * as morphological_2t from './calculators/morphological_2t';
import * as fetal_echocardiogram from './calculators/fetal_echocardiogram';
import * as venous_lower_limbs from './calculators/venous_lower_limbs';
import * as arterial_lower_limbs from './calculators/arterial_lower_limbs';
import * as general_dermatology from './calculators/general_dermatology';
import * as abdominal_wall from './calculators/abdominal_wall';

// Re-export shared helpers and data structures to prevent any import breakage in other files
export { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef, eurpCurves } from './normalityCalculatorShared';

/**
 * Main switchboard that routes calculations to the specific module for the selected study type.
 */
export function calculateNormality(
  studyType: StudyType,
  structures: StructureData[],
  patientGender: 'M' | 'F' = 'F',
  patientAge?: number
): CalculationResult {
  const evaluated: NormalityDetail[] = [];
  const insights: string[] = [];
  let overallStatus: 'normal' | 'altered' | 'borderline' = 'normal';

  // Core callback helper passed to individual calculators to track parameters
  const addEvaluation = (detail: NormalityDetail) => {
    evaluated.push(detail);
    if (detail.status === 'altered') {
      overallStatus = 'altered';
    } else if (detail.status === 'borderline' && overallStatus === 'normal') {
      overallStatus = 'borderline';
    }
  };

  // Route to the appropriate sub-calculator module
  switch (studyType) {
    case 'thyroid':
      thyroid.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'renal':
      renal.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'gallbladder_liver':
      gallbladder_liver.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'obstetric':
    case 'obstetric_doppler':
    case 'fgr_barcelona':
    case 'morphological_1t':
    case 'morphological_2t':
    case 'fetal_echocardiogram':
      fgr_barcelona.calculate(structures, patientGender, patientAge, addEvaluation, insights, studyType);
      break;
    case 'carotid_vascular':
      carotid_vascular.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'echocardiogram':
      echocardiogram.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'breast_birads':
      breast_birads.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'ovary_orads':
      ovary_orads.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'scrotal':
      scrotal.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'rheuma_omeract':
      rheuma_omeract.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'abdomen_total':
    case 'abdomen_superior':
      abdomen_total.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'pelvic':
    case 'transvaginal':
      pelvic.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'prostate':
      prostate.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'venous_lower_limbs':
      venous_lower_limbs.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'arterial_lower_limbs':
      arterial_lower_limbs.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'general_dermatology':
      general_dermatology.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    case 'abdominal_wall':
      abdominal_wall.calculate(structures, patientGender, patientAge, addEvaluation, insights);
      break;
    default:
      break;
  }

  // Fallback if no structures match reference checking logic
  if (evaluated.length === 0) {
    overallStatus = 'normal';
    insights.push('Nenhuma estrutura métrica catalogada foi encontrada para o tipo de estudo selecionado. Executando classificação de conformidade nominal básica.');
    
    structures.forEach(struct => {
      Object.keys(struct.measurements).forEach(mKey => {
        const item = struct.measurements[mKey];
        evaluated.push({
          structureName: struct.name,
          parameterLabel: item.label || mKey,
          valueObtained: `${item.value} ${item.unit}`,
          referenceRange: 'Sujeito à avaliação clínica',
          status: 'normal',
          explanation: `Parâmetro extraído do exame sem regra matemática determinística associada no módulo.`
        });
      });
    });
  }

  return {
    studyType,
    patientGender,
    patientAge,
    structuresEvaluated: evaluated,
    overallStatus,
    mathematicalInsights: insights
  };
}
