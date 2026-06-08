import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando avaliação de Ecocardiografia Fetal.');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key.includes('miocardio') || key.includes('espessura') || key.includes('septo')) {
          const esp = struct.measurements.thickness || struct.measurements.value;
          if (esp) {
            const val = toMm(esp.value, esp.unit);
            const status = val > 4.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Espessura Miocárdica Fetal',
              valueObtained: `${val.toFixed(1)} mm`,
              referenceRange: '≤ 4.0 mm',
              status,
              explanation: val > 4.0 
                ? 'Presença de hipertrofia miocárdica intrauterina significativa.' 
                : 'Ecovelocidades e septação livres e normais.'
            });
          }
        }
      });
}
