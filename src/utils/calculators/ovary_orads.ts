import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise clínica programática de Massas Anexiais/Ovarianas (O-RADS 2020).');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;
        if (key === 'ovary_orads' || key.includes('ovario') || key.includes('orads')) {
          const catElem = struct.measurements.orads_category || struct.measurements.categoria;
          const maxDiamElem = struct.measurements.ovarian_mass_diameter || struct.measurements.diametro;

          if (catElem) {
            const val = catElem.value;
            let status: 'normal' | 'altered' | 'borderline' = 'normal';
            let expl = "";
            if (val === 1 || val === 2) {
              status = 'normal';
              expl = `Fisiológico ou Benigno (O-RADS ${val}). Manejo clínico conservador ou expectante. Risco de malignidade < 1%.`;
            } else if (val === 3) {
              status = 'borderline';
              expl = "Baixo Risco (O-RADS 3). Risco de malignidade entre 1% e 10%. Recomendável consulta ginecológica especializada.";
            } else if (val >= 4) {
              status = 'altered';
              expl = `Risco Intermediário ou Alto (O-RADS ${val}). Risco de malignidade ≥ 10%. Recomendável encaminhamento a ginecologista oncológico ou cirurgia especializada.`;
            }
            addEvaluation({
              structureName: name,
              parameterLabel: 'Categoria O-RADS',
              valueObtained: `O-RADS ${val}`,
              referenceRange: 'O-RADS 1 ou 2',
              status,
              explanation: expl
            });
          }

          if (maxDiamElem) {
            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro da Massa Anexial',
              valueObtained: `${maxDiamElem.value} ${maxDiamElem.unit}`,
              referenceRange: '< 10 cm (< 100 mm)',
              status: maxDiamElem.value >= 100 || (maxDiamElem.unit.toLowerCase() === 'cm' && maxDiamElem.value >= 10) ? 'altered' : 'normal',
              explanation: maxDiamElem.value >= 100 || (maxDiamElem.unit.toLowerCase() === 'cm' && maxDiamElem.value >= 10)
                ? "Massa volumosa ≥ 10 cm, o que constitui um critério de risco mais elevado para cirurgia ou complementação diagnóstica."
                : "Massa menor que 10 cm de diâmetro plano."
            });
          }
        }
      });
}
