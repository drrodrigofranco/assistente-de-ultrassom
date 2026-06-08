import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise biométrica hepatobiliar (Normal: parede de vesícula ≤ 3.0mm, diâmetro colédoco ≤ 6.0mm na ausência de colecistectomia prévia, comprimento do fígado ≤ 150mm).');

      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        // Gallbladder Wall
        if (key.includes('parede') || key.includes('vesicula') || key.includes('gallbladder') || key.includes('parede_vesicula')) {
          // Gallbladder wall is small, measured in mm usually. Make sure it's correct.
          const wallElem = struct.measurements.espessura || struct.measurements.thickness || struct.measurements.parede || struct.measurements.valor;
          if (wallElem) {
            const wallMm = toMm(wallElem.value, wallElem.unit);
            const isAltered = wallMm > 3.0;
            const exp = isAltered
              ? 'Espessamento parietal da vesícula biliar (sinal clássico de colecistite aguda/crônica ou secundário a hepatopatias/cardiopatias).'
              : 'Espessura parietal da vesícula normal, sem sinais inflamatórios primários detectáveis por esta métrica.';

            addEvaluation({
              structureName: name,
              parameterLabel: 'Espessura da Parede',
              valueObtained: `${wallMm.toFixed(1)} mm`,
              referenceRange: '≤ 3.0 mm',
              status: isAltered ? 'altered' : 'normal',
              explanation: exp
            });
            insights.push(`Vesícula Biliar: Espessura da parede avaliada em ${wallMm.toFixed(1)} mm.`);
          }
        }

        // Liver Size
        if (key.includes('figado') || key.includes('fígado') || key.includes('liver') || key.includes('lobo_direito') || key.includes('hemitireoide_lobodireito')) {
          const compElem = struct.measurements.comprimento || struct.measurements.length || struct.measurements.comp || struct.measurements.lhch;
          if (compElem) {
            const compMm = toMm(compElem.value, compElem.unit);
            const compCm = compMm / 10;
            const isAltered = compMm > 150; // > 15cm is abnormal
            const exp = isAltered
              ? `Hepatomegalia detectada. O comprimento lobar de ${compCm.toFixed(1)} cm excede o limite anatômico fisiológico de 15 cm.`
              : `Morfometria lobar hepática preservada. O diâmetro longitudinal de ${compCm.toFixed(1)} cm está dentro dos limites normais.`;

            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro Longitudinal Hemiclavicular',
              valueObtained: `${compCm.toFixed(1)} cm (${compMm.toFixed(0)} mm)`,
              referenceRange: '≤ 15.0 cm (150 mm)',
              status: isAltered ? 'altered' : 'normal',
              explanation: exp
            });
            insights.push(`Fígado: Comprimento medido na linha hemiclavicular de ${compCm.toFixed(1)} cm.`);
          }
        }

        // Common Bile Duct (Colédoco)
        if (key.includes('coledoco') || key.includes('colédoco') || key.includes('bile_duct')) {
          const diamElem = struct.measurements.diametro || struct.measurements.diameter || struct.measurements.espessura || struct.measurements.coledoco;
          if (diamElem) {
            const diamMm = toMm(diamElem.value, diamElem.unit);
            
            // Adjust limit for older patients or previous surgical contexts (colecistectomia)
            const baseLimit = patientAge && patientAge > 60 ? 8.0 : 6.0;
            const isAltered = diamMm > baseLimit;

            const exp = isAltered
              ? `Dilatação do duto biliar comum (colédoco). Diâmetro de ${diamMm.toFixed(1)} mm excede o limite ajustado para a idade (${baseLimit.toFixed(1)} mm), indicando possível obstrução ou estase biliar.`
              : `Colédoco com calibre de ${diamMm.toFixed(1)} mm preservado (diâmetro adequado para idade e estrutura ductal).`;

            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro Interno',
              valueObtained: `${diamMm.toFixed(1)} mm`,
              referenceRange: `≤ ${baseLimit.toFixed(1)} mm`,
              status: isAltered ? 'altered' : 'normal',
              explanation: exp
            });
            insights.push(`Via biliar principal (Colédoco): Diâmetro de ${diamMm.toFixed(1)} mm.`);
          }
        }

        // Baço (Spleen) - EURP Tabela 93
        if (key.includes('baco') || key.includes('baço') || key.includes('spleen')) {
          const compElem = struct.measurements.comprimento || struct.measurements.length || struct.measurements.comp || struct.measurements.valor;
          const largElem = struct.measurements.largura || struct.measurements.width || struct.measurements.larg;
          const espElem = struct.measurements.espessura || struct.measurements.thickness || struct.measurements.esp;

          if (compElem) {
            const compMm = toMm(compElem.value, compElem.unit);
            const compCm = compMm / 10;
            let status: 'normal' | 'borderline' | 'altered' = 'normal';
            let exp = 'Esplenometria longitudinal normal.';

            if (compCm > 13.0) {
              status = 'altered';
              exp = `Esplenomegalia significativa detectada (${compCm.toFixed(1)} cm). Pode sugerir hipertensão portal, processos infecciosos, hematológicos ou congestivos.`;
            } else if (compCm > 12.0) {
              status = 'borderline';
              exp = `Comprimento esplênico limítrofe superior (${compCm.toFixed(1)} cm). Monitorar clinicamente.`;
            }

            addEvaluation({
              structureName: name,
              parameterLabel: 'Comprimento Esplênico (EURP Tabela 93)',
              valueObtained: `${compCm.toFixed(1)} cm`,
              referenceRange: '≤ 12.0 cm (120 mm)',
              status,
              explanation: exp
            });
            insights.push(`Baço: Eixo longitudinal medido de ${compCm.toFixed(1)} cm.`);
          }

          if (largElem) {
            const largMm = toMm(largElem.value, largElem.unit);
            const largCm = largMm / 10;
            const status = largCm > 7.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: `${name} (Largura)`,
              parameterLabel: 'Largura Esplênica (EURP Tabela 93)',
              valueObtained: `${largCm.toFixed(1)} cm`,
              referenceRange: '≤ 7.0 cm',
              status,
              explanation: status === 'altered' ? 'Largura esplêmica aumentada (> 7.0 cm) acusando possível esplenomegalia transversal.' : 'Largura esplênica normal.'
            });
          }

          if (espElem) {
            const espMm = toMm(espElem.value, espElem.unit);
            const espCm = espMm / 10;
            const status = espCm > 4.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: `${name} (Espessura)`,
              parameterLabel: 'Espessura Esplênica (EURP Tabela 93)',
              valueObtained: `${espCm.toFixed(1)} cm`,
              referenceRange: '≤ 4.0 cm',
              status,
              explanation: status === 'altered' ? 'Espessura esplênica aumentada AP (> 4.0 cm).' : 'Espessura esplênica normal.'
            });
          }
        }

        // Pâncreas - EURP Tabela 91
        if (key.includes('pancreas') || key.includes('pâncreas')) {
          const headElem = struct.measurements.cabeca || struct.measurements.head;
          const bodyElem = struct.measurements.corpo || struct.measurements.body;
          const tailElem = struct.measurements.cauda || struct.measurements.tail;
          const ductElem = struct.measurements.ducto || struct.measurements.duct || struct.measurements.wirsung;

          if (headElem) {
            const headMm = toMm(headElem.value, headElem.unit);
            const headCm = headMm / 10;
            const status = headCm > 3.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: `${name} (Cabeça)`,
              parameterLabel: 'Cabeça do Pâncreas (EURP Tabela 91)',
              valueObtained: `${headCm.toFixed(1)} cm`,
              referenceRange: '< 3.0 cm',
              status,
              explanation: status === 'altered' ? 'Cabeça do pâncreas aumentada de tamanho (sinal de edema ou processo expansivo).' : 'Cabeça do pâncreas de calibre regular.'
            });
          }

          if (bodyElem) {
            const bodyMm = toMm(bodyElem.value, bodyElem.unit);
            const bodyCm = bodyMm / 10;
            const status = bodyCm > 2.5 ? 'altered' : 'normal';
            addEvaluation({
              structureName: `${name} (Corpo)`,
              parameterLabel: 'Corpo do Pâncreas (EURP Tabela 91)',
              valueObtained: `${bodyCm.toFixed(1)} cm`,
              referenceRange: '< 2.5 cm',
              status,
              explanation: status === 'altered' ? 'Corpo do pâncreas aumentado (> 2.5 cm).' : 'Corpo do pâncreas de dimensões habituais.'
            });
          }

          if (tailElem) {
            const tailMm = toMm(tailElem.value, tailElem.unit);
            const tailCm = tailMm / 10;
            const status = tailCm > 2.5 ? 'altered' : 'normal';
            addEvaluation({
              structureName: `${name} (Cauda)`,
              parameterLabel: 'Cauda do Pâncreas (EURP Tabela 91)',
              valueObtained: `${tailCm.toFixed(1)} cm`,
              referenceRange: '< 2.5 cm',
              status,
              explanation: status === 'altered' ? 'Cauda pancreática aumentada (> 2.5 cm).' : 'Cauda pancreática de aspecto habitual.'
            });
          }

          if (ductElem) {
            const ductMm = toMm(ductElem.value, ductElem.unit);
            const status = ductMm > 2.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: `${name} (Ducto de Wirsung)`,
              parameterLabel: 'Ducto Pancreático Principal (EURP)',
              valueObtained: `${ductMm.toFixed(1)} mm`,
              referenceRange: '≤ 2.0 mm',
              status,
              explanation: status === 'altered' ? 'Dilatação patológica do ducto pancreático principal (Wirsung).' : 'Ducto pancreático principal com calibre anatômico preservado.'
            });
          }
        }

        // Sistema Portal & Veias - EURP Tabela 101
        if (key.includes('porta') || key.includes('portal') || key.includes('veia_porta') || key.includes('esplenica_veia') || key.includes('veia_esplenica') || key.includes('cava')) {
          const diamElem = struct.measurements.diametro || struct.measurements.diameter || struct.measurements.valor || struct.measurements.espessura || struct.measurements.coledoco;
          if (diamElem) {
            const diamMm = toMm(diamElem.value, diamElem.unit);
            
            if (key.includes('porta') || key.includes('portal')) {
              const status = diamMm > 13.0 ? 'altered' : 'normal';
              addEvaluation({
                structureName: name,
                parameterLabel: 'Diâmetro da Veia Porta (EURP Tabela 101)',
                valueObtained: `${diamMm.toFixed(1)} mm`,
                referenceRange: '10.0 - 13.0 mm',
                status,
                explanation: status === 'altered' 
                  ? 'Ecobactéria/Diâmetro aumentado da Veia Porta (sugerindo Hipertensão Portal).' 
                  : 'Calibre da veia porta preservatativo.'
              });
            } else if (key.includes('esplenica') || key.includes('splenic') || key.includes('esplênica')) {
              const status = diamMm > 10.0 ? 'altered' : 'normal';
              addEvaluation({
                structureName: name,
                parameterLabel: 'Diâmetro da Veia Esplênica (EURP Tabela 101)',
                valueObtained: `${diamMm.toFixed(1)} mm`,
                referenceRange: '≤ 10.0 mm',
                status,
                explanation: status === 'altered'
                  ? 'Veia esplênica ectasiada / calibre aumentado. Associado a congestão ou hipertensão portal.'
                  : 'Veia esplênica com calibre fisiológico preservado.'
              });
            } else if (key.includes('cava')) {
              const status = diamMm > 20.0 ? 'altered' : 'normal';
              addEvaluation({
                structureName: name,
                parameterLabel: 'Diâmetro da Veia Cava Inferior (EURP Tabela 101)',
                valueObtained: `${diamMm.toFixed(1)} mm`,
                referenceRange: '≤ 20.0 mm',
                status,
                explanation: status === 'altered'
                  ? 'Veia cava inferior ectasiada (sinal sugestivo de congestão sistêmica ou insuficiência cardíaca direita).'
                  : 'Veia cava inferior dentro dos diâmetros anatômicos normais.'
              });
            }
          }
        }
      });
}
