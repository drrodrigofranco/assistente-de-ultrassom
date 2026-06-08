import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise biométrica e doppler de Bolsa Escrotal.');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key.includes('testicle') || key.includes('testiculo') || key === 'right_testicle' || key === 'left_testicle') {
          const volElem = struct.measurements.volume;
          const compElem = struct.measurements.comprimento || struct.measurements.length;

          if (volElem) {
            const val = volElem.value;
            const status = (val < 12) ? 'borderline' : (val > 25) ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Volume Testicular',
              valueObtained: `${val} ${volElem.unit}`,
              referenceRange: '12.0 - 25.0 cm³ (mL)',
              status,
              explanation: val < 12 
                ? "Volume reduzido (hipoplasia/atrofia testicular relativa)."
                : val > 25 
                ? "Aumento de volume testicular, suspeita de orquiepididimite, processos expansivos ou congestões."
                : "Volume testicular dentro da faixa normal de referência."
            });
          }
          if (compElem) {
            const val = compElem.value;
            const compMm = toMm(val, compElem.unit);
            const status = (compMm < 30) ? 'borderline' : (compMm > 50) ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Eixo Longitudinal (Comprimento)',
              valueObtained: `${val} ${compElem.unit}`,
              referenceRange: '30.0 - 50.0 mm',
              status,
              explanation: compMm < 30 ? "Comprimento reduzido" : compMm > 50 ? "Comprimento aumentado" : "Padrão normal."
            });
          }
        }

        if (key.includes('epididymis') || key.includes('epididimo') || key === 'right_epididymis_head' || key === 'left_epididymis_head') {
          const espElem = struct.measurements.espessura || struct.measurements.thickness;
          if (espElem) {
            const val = espElem.value;
            const espMm = toMm(val, espElem.unit);
            const status = espMm > 12 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Espessura da Cabeça do Epidídimo',
              valueObtained: `${val} ${espElem.unit}`,
              referenceRange: '≤ 12.0 mm',
              status,
              explanation: espMm > 12 
                ? "Espessamento epididimário. Comum em epididimites ou cistos epididimários associados."
                : "Espessura fisiológica normal."
            });
          }
        }

        if (key.includes('varicocele') || key.includes('pampiniforme') || key === 'doppler_varicocele') {
          const vDiam = struct.measurements.varicocele_vein_diameter || struct.measurements.diametro;
          const pDiam = struct.measurements.post_vals_diameter;
          const refSeconds = struct.measurements.reflux_seconds;

          if (vDiam) {
            const status = vDiam.value >= 2.5 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro Venoso em Repouso',
              valueObtained: `${vDiam.value} ${vDiam.unit}`,
              referenceRange: '< 2.5 mm',
              status,
              explanation: vDiam.value >= 2.5 
                ? "Ectasia de veias do plexo pampiniforme em repouso, condizente anatômica com varicocele."
                : "Calibre venoso em repouso normal."
            });
          }

          if (pDiam) {
            const status = pDiam.value >= 3.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro Venoso sob Valsalva',
              valueObtained: `${pDiam.value} ${pDiam.unit}`,
              referenceRange: '< 3.0 mm',
              status,
              explanation: pDiam.value >= 3.0 
                ? "Ectasia venosa signficativa sob esforço de Valsalva."
                : "Acomodação venosa aceitável sob esforço."
            });
          }

          if (refSeconds) {
            const status = refSeconds.value >= 2.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Tempo de Refluxo ao Doppler',
              valueObtained: `${refSeconds.value} ${refSeconds.unit}`,
              referenceRange: '< 2.0 s',
              status,
              explanation: refSeconds.value >= 2.0 
                ? `Refluxo sistólico prolongado de ${refSeconds.value} segundos. Confirma varicocele hemodinamicamente ativa.`
                : "Sem refluxo significativo ou refluxo fisiológico de curtíssima duração."
            });
          }
        }

        if (key.includes('hydrocele') || key.includes('hidrocele') || key === 'hydrocele_volume') {
          const volElem = struct.measurements.hydrocele_volume || struct.measurements.volume;
          if (volElem) {
            const status = volElem.value > 2.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Volume de Hidrocele',
              valueObtained: `${volElem.value} ${volElem.unit}`,
              referenceRange: '≤ 2.0 mL (película fisiológica)',
              status,
              explanation: volElem.value > 2.0 
                ? "Acúmulo de líquido escrotal aumentado confirmando hidrocele anormal."
                : "Líquido escrotal nos limites normais de lubrificação peritoneal."
            });
          }
        }
      });
}
