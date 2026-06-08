import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando avaliação do sistema morfológico fetal de 2º trimestre.');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key.includes('ventriculo') || key.includes('lateral')) {
          const avl = struct.measurements.value || struct.measurements.diameter;
          if (avl) {
            const val = toMm(avl.value, avl.unit);
            const status = val >= 10.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Átrio Ventricular Lateral (AVL)',
              valueObtained: `${val.toFixed(1)} mm`,
              referenceRange: '< 10.0 mm',
              status,
              explanation: val >= 10.0 
                ? 'Ventriculomegalia fetal moderada/grave detetada.' 
                : 'Cornos ventriculares occipitais conservados.'
            });
          }
        }
      });
}
