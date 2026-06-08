export type StudyType = 'thyroid' | 'renal' | 'gallbladder_liver' | 'obstetric' | 'fgr_barcelona' | 'carotid_vascular' | 'echocardiogram' | 'breast_birads' | 'ovary_orads' | 'scrotal' | 'rheuma_omeract' | 'abdomen_total' | 'pelvic' | 'abdomen_superior' | 'prostate' | 'transvaginal' | 'obstetric_doppler' | 'morphological_1t' | 'morphological_2t' | 'fetal_echocardiogram' | 'venous_lower_limbs' | 'arterial_lower_limbs' | 'general_dermatology' | 'abdominal_wall';

export interface StructureData {
  name: string; // e.g. "Lobo Direito", "Rim Esquerdo", "Parede da Vesícula"
  key: string;  // standardized key for mapping, e.g. "right_lobe", "left_kidney", "gallbladder_wall"
  measurements: {
    [key: string]: {
      value: number; // raw numeric value
      unit: string;  // 'mm', 'cm', 'bpm', 'mL', etc.
      label: string; // e.g. "Comprimento", "Espessura", "Volume", "FCF"
    };
  };
}

export interface NormalityDetail {
  structureName: string;
  parameterLabel: string;
  valueObtained: string;
  referenceRange: string;
  status: 'normal' | 'altered' | 'borderline';
  explanation: string;
}

export interface CalculationResult {
  studyType: StudyType;
  patientGender?: 'M' | 'F';
  patientAge?: number;
  structuresEvaluated: NormalityDetail[];
  overallStatus: 'normal' | 'altered' | 'borderline';
  mathematicalInsights: string[]; // Step-by-step checks completed programmatically
}

export interface ExamReport {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  studyType: StudyType;
  rawExtractedData: StructureData[];
  calculatedNormality: CalculationResult;
  modelGeneratedLaudo?: string;
  createdAt: string;
}

export interface SavedLaudo {
  id: string;
  patientName: string;
  patientAge: number | '';
  patientGender: 'M' | 'F';
  studyType: StudyType;
  studyTypeLabel: string;
  generatedLaudo: string;
  extractedData: StructureData[];
  date: string;
}
