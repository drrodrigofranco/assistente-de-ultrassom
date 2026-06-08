import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando avaliação do volume prostático.');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key.includes('prostata') || key.includes('prostate')) {
          const vol = struct.measurements.volume;
          if (vol) {
            const status = vol.value > 30.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Volume Prostático',
              valueObtained: `${vol.value.toFixed(1)} g (cm³)`,
              referenceRange: '≤ 30.0 g',
              status,
              explanation: vol.value > 30.0 
                ? 'Hiperplasia Prostática Benigna (HPB) volumétrica.' 
                : 'Volume prostático conservado dentro de limites fisiológicos.'
            });
          }
        }
        
        if (key.includes('resid') || key.includes('post_void')) {
          const resid = struct.measurements.residuo || struct.measurements.volume || struct.measurements.value;
          if (resid) {
            const status = resid.value > 30 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Resíduo Pós-Miccional',
              valueObtained: `${resid.value.toFixed(1)} mL`,
              referenceRange: '< 30.0 mL',
              status,
              explanation: resid.value > 30 
                ? 'Retenção urinária / esvaziamento vesical incompleto detetado.' 
                : 'Resíduo pós-miccional desprezível / normal.'
            });
          }
        }
      });
}
