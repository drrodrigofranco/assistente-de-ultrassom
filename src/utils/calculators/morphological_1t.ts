import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando rastreamento de morfologia de 1º trimestre (Cromossomopatias).');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key.includes('tn') || key.includes('nucal') || key.includes('translucencia')) {
          const tn = struct.measurements.translucency || struct.measurements.value;
          if (tn) {
            const val = toMm(tn.value, tn.unit);
            const status = val > 2.5 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Translucência Nucal (TN)',
              valueObtained: `${val.toFixed(1)} mm`,
              referenceRange: '≤ 2.5 mm',
              status,
              explanation: val > 2.5 
                ? 'TN de espessura aumentada (Avançar para aconselhamento genético).' 
                : 'TN normal e regular de baixo risco fisiológico.'
            });
          }
        }
      });
}
