import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise clínica programática de Ultrassom de Mamas (BI-RADS 2013).');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;
        if (key === 'breast_birads' || key.includes('mama') || key.includes('birads')) {
          const catElem = struct.measurements.birads_category || struct.measurements.categoria;
          const maxDiamElem = struct.measurements.nodule_max_diameter || struct.measurements.diametro;

          if (catElem) {
            const val = catElem.value;
            let status: 'normal' | 'altered' | 'borderline' = 'normal';
            let expl = "";
            if (val === 0) {
              status = 'altered';
              expl = "Incompleto (BI-RADS 0). Exige exames de imagem complementares para conclusão diagnóstica.";
            } else if (val === 1 || val === 2) {
              status = 'normal';
              expl = `Achados Negativos/Benignos (BI-RADS ${val}). Rastreamento anual de rotina recomendado.`;
            } else if (val === 3) {
              status = 'borderline';
              expl = "Provavelmente Benigno (BI-RADS 3). Controle periódico em 6 meses recomendado para avaliar estabilidade.";
            } else if (val >= 4) {
              status = 'altered';
              expl = `Achado Suspeito (BI-RADS ${val}). Biópsia recomendada para confirmação histopatológica.`;
            }
            addEvaluation({
              structureName: name,
              parameterLabel: 'Categoria BI-RADS',
              valueObtained: `BI-RADS ${val}`,
              referenceRange: 'BI-RADS 1 ou 2',
              status,
              explanation: expl
            });
          }

          if (maxDiamElem) {
            addEvaluation({
              structureName: name,
              parameterLabel: 'Maior Diâmetro do Nódulo',
              valueObtained: `${maxDiamElem.value} ${maxDiamElem.unit}`,
              referenceRange: '≤ 10 mm (se isolado provavelmente benigno)',
              status: maxDiamElem.value > 10 ? 'borderline' : 'normal',
              explanation: maxDiamElem.value > 10 
                ? "Nódulo com maior dimensão > 1.0 cm. Exige correlação integrada com o score BI-RADS global."
                : "Dimensões foliculares/nodulares discretas dentro do padrão aceitável em mamas."
            });
          }
        }
      });
}
