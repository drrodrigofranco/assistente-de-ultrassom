import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando avaliação de Doppler Arterial de MI.');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key.includes('itb') || key.includes('indice')) {
          const itb = struct.measurements.value || struct.measurements.itb;
          if (itb) {
            const val = itb.value;
            const status = (val < 0.90 || val > 1.30) ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Índice Tornozelo-Braço (ITB)',
              valueObtained: val.toFixed(2),
              referenceRange: '0.90 - 1.30',
              status,
              explanation: val < 0.90 
                ? 'Indicação de Doença Arterial Obstrutiva Periférica (DAOP).' 
                : val > 1.30 
                ? 'Artérias calcinadas e incompressíveis (diabetes/doença renal).' 
                : 'ITB normal indicando hemodinâmica das extremidades preservadas.'
            });
          }
        }
      });
}
