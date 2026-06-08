import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise de espessamento articular sinovial (OMERACT).');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key === 'rheuma_omeract' || key.includes('sinovia') || key.includes('omeract')) {
          const bMode = struct.measurements.omeract_synovitis_b_mode;
          const doppler = struct.measurements.omeract_synovitis_doppler;
          const effusion = struct.measurements.joint_effusion_presence;

          if (bMode) {
            const val = bMode.value;
            const status = val === 0 ? 'normal' : val === 1 ? 'borderline' : 'altered';
            addEvaluation({
              structureName: name,
              parameterLabel: 'OMERACT Modo B (Espessamento Sinovial)',
              valueObtained: `Grau ${val}`,
              referenceRange: 'Grau 0',
              status,
              explanation: val === 0 
                ? "Sinóvia normal, sem espessamento patológico."
                : val === 1 
                ? "Espessamento sinovial leve (Grau 1). Pode representar alterações degenerativas iniciais ou inflamação moderada."
                : `Sinovite moderada a acentuada (Grau ${val}). Distensão capsular articular evidente.`
            });
          }

          if (doppler) {
            const val = doppler.value;
            const status = val === 0 ? 'normal' : val === 1 ? 'borderline' : 'altered';
            addEvaluation({
              structureName: name,
              parameterLabel: 'OMERACT Power Doppler (Atividade Vascular)',
              valueObtained: `Grau ${val}`,
              referenceRange: 'Grau 0',
              status,
              explanation: val === 0 
                ? "Ausência de sinal vascular ao Doppler (sem neoangiogênese inflamatória activa)."
                : val === 1 
                ? "Atividade vascular sinovial mínima/discreta (Grau 1)."
                : `Sinal vascular moderado/severo (Grau ${val}) indicando inflamação articular ativa moderada/alta.`
            });
          }

          if (effusion) {
            const status = effusion.value > 0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Derrame Articular',
              valueObtained: effusion.value > 0 ? 'PRESENTE' : 'AUSENTE',
              referenceRange: 'AUSENTE',
              status,
              explanation: effusion.value > 0 
                ? "Presença de líquido livre intra-articular aumentado condizente com efusão inflamatória ativa."
                : "Sem efusão líquida na articulação examinada."
            });
          }
        }
      });
}
