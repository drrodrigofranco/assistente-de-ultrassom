import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando avaliação de Doppler Venoso.');
      structures.forEach(struct => {
        const name = struct.name;
        const refl = struct.measurements.refluxo || struct.measurements.value;
        if (refl) {
          const val = refl.value;
          const status = val > 0.5 ? 'altered' : 'normal';
          addEvaluation({
            structureName: name,
            parameterLabel: 'Tempo de Refluxo Venoso',
            valueObtained: `${val.toFixed(2)} s`,
            referenceRange: '< 0.5 s',
            status,
            explanation: val > 0.5 
              ? 'Insuficiência venosa superficial/profunda ativa com refluxo prolongado.' 
              : 'Fluxo contínuo sem refluxo patológico significativo.'
          });
        }
      });
}
