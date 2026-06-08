import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise biométrica renal e de vias urinárias (comprimento normal do rim: 90-120 mm, parede da bexiga < 4.0 mm repletada, resíduo pós-miccional < 30 mL).');
      let rightLen: number | null = null;
      let leftLen: number | null = null;

      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        if (key.includes('rim') || key.includes('kidney')) {
          const compElem = struct.measurements.comprimento || struct.measurements.length || struct.measurements.comp;
          const parElem = struct.measurements.parenquima || struct.measurements.parenchyma || struct.measurements.espessura;
          const largElem = struct.measurements.largura || struct.measurements.width || struct.measurements.larg;
          const espElem = struct.measurements.espessura_ap || struct.measurements.esp_ap || struct.measurements.thickness_ap || struct.measurements.espessura || struct.measurements.thickness;

          if (compElem) {
            const compMm = toMm(compElem.value, compElem.unit);
            if (key.includes('dir') || key.includes('right')) rightLen = compMm;
            if (key.includes('esq') || key.includes('left')) leftLen = compMm;

            let kidneyStatus: 'normal' | 'altered' | 'borderline' = 'normal';
            let exp = 'Comprimento renal normal.';

            if (compMm < 90) {
              kidneyStatus = 'altered';
              exp = 'Rim diminuído de tamanho (nefropatia crônica, estenose de artéria renal ou hipoplasia).';
            } else if (compMm > 120) {
              kidneyStatus = compMm > 125 ? 'altered' : 'borderline';
              exp = compMm > 125 
                ? 'Rim aumentado de tamanho (nefromegalia por edema, processos inflamatórios agudos ou rim vicariante).' 
                : 'Comprimento renal no limite superior.';
            }

            addEvaluation({
              structureName: name,
              parameterLabel: 'Comprimento Longitudinal',
              valueObtained: `${compMm.toFixed(1)} mm`,
              referenceRange: '90.0 - 120.0 mm',
              status: kidneyStatus,
              explanation: exp
            });
            insights.push(`${name}: Comprimento longitudinal medido de ${compMm.toFixed(1)} mm.`);
          }

          if (largElem) {
            const largMm = toMm(largElem.value, largElem.unit);
            const largStatus = (largMm < 40 || largMm > 60) ? 'borderline' : 'normal';
            addEvaluation({
              structureName: `${name} (Largura)`,
              parameterLabel: 'Largura Renal (EURP Tabela 92)',
              valueObtained: `${largMm.toFixed(1)} mm`,
              referenceRange: '40.0 - 60.0 mm',
              status: largStatus,
              explanation: largMm > 60 ? 'Largura renal aumentada de tamanho.' : largMm < 40 ? 'Largura renal diminuída.' : 'Largura renal dentro dos padrões habituais.'
            });
          }

          if (espElem && espElem !== parElem) {
            const espMm = toMm(espElem.value, espElem.unit);
            const espStatus = (espMm < 30 || espMm > 50) ? 'borderline' : 'normal';
            addEvaluation({
              structureName: `${name} (Espessura)`,
              parameterLabel: 'Espessura Renal AP (EURP Tabela 92)',
              valueObtained: `${espMm.toFixed(1)} mm`,
              referenceRange: '30.0 - 50.0 mm',
              status: espStatus,
              explanation: espMm > 50 ? 'Espessura AP renal aumentada.' : espMm < 30 ? 'Espessura AP renal diminuída.' : 'Espessura renal adequada.'
            });
          }

          if (parElem) {
            const parMm = toMm(parElem.value, parElem.unit);
            const parStatus = parMm < 10.0 ? 'altered' : 'normal';
            const exp = parMm < 10.0
              ? 'Adelgaçamento do parênquima renal (comumente observado em nefropatias crônicas ou senilidade renal).'
              : 'Espessura do parênquima preservada.';

            addEvaluation({
              structureName: `${name} (Parênquima)`,
              parameterLabel: 'Espessura Parenquimatosa',
              valueObtained: `${parMm.toFixed(1)} mm`,
              referenceRange: '≥ 10.0 mm',
              status: parStatus,
              explanation: exp
            });
            insights.push(`${name} (Parênquima): Espessura medida de ${parMm.toFixed(1)} mm.`);
          }
        }

        // Urinary Bladder elements (EURP Tabela 99)
        if (key.includes('bexiga') || key.includes('bladder')) {
          const wallElem = struct.measurements.parede || struct.measurements.espessura || struct.measurements.wall || struct.measurements.valor;
          const resElem = struct.measurements.residuo || struct.measurements.residuo_pos_miccional || struct.measurements.post_void || typeof struct.measurements.valor !== 'undefined' ? struct.measurements.valor : undefined;
          const volElem = struct.measurements.volume || struct.measurements.bexiga_volume || typeof struct.measurements.valor !== 'undefined' ? struct.measurements.valor : undefined;

          if (wallElem && (key.includes('parede') || key.includes('wall'))) {
            const wallMm = toMm(wallElem.value, wallElem.unit);
            let wallStatus: 'normal' | 'altered' | 'borderline' = 'normal';
            let exp = 'Espessura de parede vesical conservada dentro dos limites fisiológicos da EURP.';
            if (wallMm > 8.0) {
              wallStatus = 'altered';
              exp = 'Espessamento severo difuso detrusor / parede vesical. Compatível com cistite crônica, bexiga de esforço ou obstrução infravesical cronificada.';
            } else if (wallMm > 4.0) {
              wallStatus = 'borderline';
              exp = 'Parede vesical limítrofe (aceitável com repleção parcial. Se bexiga cheia, sugere espessamento detrusor leve a moderado).';
            }
            addEvaluation({
              structureName: name,
              parameterLabel: 'Espessura da Parede (EURP Tabela 99)',
              valueObtained: `${wallMm.toFixed(1)} mm`,
              referenceRange: '≤ 4.0 mm (Cheia) | ≤ 8.0 mm (Vazia)',
              status: wallStatus,
              explanation: exp
            });
            insights.push(`Bexiga: Parede de ${wallMm.toFixed(1)} mm medida.`);
          }

          if (resElem && (key.includes('residuo') || key.includes('resíduo') || key.includes('void') || key.includes('miccional'))) {
            const resMl = resElem.value;
            const resStatus = resMl > 30.0 ? 'altered' : 'normal';
            const exp = resStatus === 'altered'
              ? `Resíduo pós-miccional patológico elevado de ${resMl.toFixed(1)} mL. Indica esvaziamento incompleto (bexiga neurogênica, obstrução uretroprostática, etc.).`
              : `Resíduo pós-miccional fisiológico insignificante (${resMl.toFixed(1)} mL, limite adequado < 30 mL).`;

            addEvaluation({
              structureName: name,
              parameterLabel: 'Resíduo Pós-Miccional (EURP Tabela 99)',
              valueObtained: `${resMl.toFixed(1)} mL`,
              referenceRange: '< 30.0 mL',
              status: resStatus,
              explanation: exp
            });
            insights.push(`Bexiga: Resíduo pós-miccional de ${resMl.toFixed(1)} mL.`);
          }

          if (volElem && (key.includes('volume') || key.includes('capacidade') || !key.includes('parede') && !key.includes('residuo'))) {
            const volMl = volElem.value;
            const maxVolLimit = patientGender === 'M' ? 750.0 : 550.0;
            const volStatus = volMl > maxVolLimit ? 'altered' : 'normal';
            const exp = volStatus === 'altered'
              ? `Capacidade vesical hiperdistendida de ${volMl.toFixed(1)} mL (excede o teto fisiológico EURP de ${maxVolLimit.toFixed(0)} mL).`
              : `Volume vesical repletado de ${volMl.toFixed(1)} mL está adequado.`;

            addEvaluation({
              structureName: name,
              parameterLabel: 'Capacidade Vesical (EURP Tabela 99)',
              valueObtained: `${volMl.toFixed(1)} mL`,
              referenceRange: `≤ ${maxVolLimit.toFixed(0)} mL`,
              status: volStatus,
              explanation: exp
            });
            insights.push(`Bexiga: Capacidade total de ${volMl.toFixed(1)} mL.`);
          }
        }
      });

      // Simetry check if both are extracted
      if (rightLen !== null && leftLen !== null) {
        const diff = Math.abs(rightLen - leftLen);
        const simStatus = diff >= 15 ? 'altered' : 'normal';
        const exp = diff >= 15
          ? `Assimetria renal significativa detectada. Diferença de ${diff.toFixed(1)} mm excede a tolerância de 15 mm. Pode sugerir atrofia renal unilateral.`
          : `Simetria preservada. Diferença de ${diff.toFixed(1)} mm está dentro da variação anatômica normal (tolerado até 15 mm).`;

        addEvaluation({
          structureName: 'Índice de Simetria Renal',
          parameterLabel: 'Delta de Comprimento R Dir / R Esq',
          valueObtained: `${diff.toFixed(1)} mm`,
          referenceRange: '< 15.0 mm',
          status: simStatus,
          explanation: exp
        });
        insights.push(`Diferença de comprimento renal calculada: ${diff.toFixed(1)} mm.`);
      }
}
