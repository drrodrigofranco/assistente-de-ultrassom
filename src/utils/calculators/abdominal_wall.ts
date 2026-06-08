import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise biométrica e de conformidade da Parede Abdominal.');

  structures.forEach(struct => {
    const key = struct.key ? struct.key.toLowerCase() : '';
    const name = struct.name;

    // 1. Diástase dos Músculos Retos Abdominais
    if (key.includes('diastase') || key.includes('diastasis') || key.includes('afastamento_reto') || key.includes('distancia_reto')) {
      const distElem = struct.measurements.distancia || struct.measurements.afastamento || struct.measurements.value || struct.measurements.valor;
      if (distElem) {
        const distMm = toMm(distElem.value, distElem.unit);
        let status: 'normal' | 'altered' | 'borderline' = 'normal';
        let referenceRange = '≤ 22 mm (Supraumbilical) / ≤ 16 mm (Infraumbilical) [Beer, 2009]';
        let limitVal = 20.0;
        let studyRef = 'Rath et al. (1996)';

        const isSupra = key.includes('supra') || name.toLowerCase().includes('supra');
        const isInfra = key.includes('infra') || name.toLowerCase().includes('infra');
        const isUmbilical = key.includes('umbilical') || key.includes('umbigo') || name.toLowerCase().includes('umbilic') || name.toLowerCase().includes('umbigo');

        if (isSupra) {
          limitVal = 22.0;
          referenceRange = '≤ 22.0 mm [Beer et al., 2009]';
          studyRef = 'Beer et al. (2009) para a região a 3 cm acima da cicatriz umbilical';
        } else if (isInfra) {
          limitVal = 16.0;
          referenceRange = '≤ 16.0 mm [Beer et al., 2009]';
          studyRef = 'Beer et al. (2009) para a região a 2 cm abaixo da cicatriz umbilical';
        } else if (isUmbilical) {
          limitVal = 27.0;
          referenceRange = '≤ 27.0 mm [Rath et al., 1996]';
          studyRef = 'Rath et al. (1996) para o nível da cicatriz umbilical';
        } else {
          limitVal = 20.0; // Geralmente adotado na rotina geral (Ranney / Rath)
          referenceRange = '≤ 20.0 mm [Padrão Geral / Rath]';
          studyRef = 'critérios gerais de Rath et al. / Ranney';
        }

        let exp = `Afastamento dos retos retos abdominais conservado (${distMm.toFixed(1)} mm dentro do limite fisiológico de ${referenceRange}), sem evidência de diástase patológica.`;

        if (distMm > limitVal + 5.0) {
          status = 'altered';
          exp = `Afastamento inter-retal acentuadamente aumentado (obtido: ${distMm.toFixed(1)} mm, limite normal: ${referenceRange}). Caracteriza diástase patológica dos retos abdominais de acordo com ${studyRef}. Associado freqüentemente a maior complacência aponeurótica da linha alba.`;
        } else if (distMm > limitVal) {
          status = 'borderline';
          exp = `Afastamento inter-retal limítrofe/levemente aumentado (obtido: ${distMm.toFixed(1)} mm, limite normal: ${referenceRange}). Sugere diástase incipiente de acordo com ${studyRef}. Recomendável correlação clínica e fortalecimento muscular.`;
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Distância Inter-Retal (Diástase)',
          valueObtained: `${distMm.toFixed(1)} mm`,
          referenceRange,
          status,
          explanation: exp
        });
        insights.push(`Parede Abdominal (Diástase): Distância de ${distMm.toFixed(1)} mm analisada contra limite de ${limitVal.toFixed(1)} mm (${referenceRange}).`);
      }
    }

    // 2. Hérnia Abdominal / Anel Herniário
    if (key.includes('hernia') || key.includes('hérnia') || key.includes('anel_herniario') || key.includes('colo_herniario') || key.includes('saco_herniario')) {
      const anelElem = struct.measurements.anel || struct.measurements.colo || struct.measurements.value || struct.measurements.valor || struct.measurements.diametro;
      if (anelElem) {
        const anelMm = toMm(anelElem.value, anelElem.unit);
        let status: 'normal' | 'altered' | 'borderline' = 'altered'; // Qualitativamente, qualquer hérnia presente é alterada
        let exp = `Falha aponeurótica parietal detectada com anel herniário medindo ${anelMm.toFixed(1)} mm. Risco de encarceramento ou estrangulamento de conteúdo peritoneal (como gordura pré-peritoneal ou alça intestinal). Necessita correlação clínico-cirúrgica.`;

        if (anelMm > 15.0) {
          status = 'altered';
          exp = `Hérnia volumosa com amplo anel herniário medindo ${anelMm.toFixed(1)} mm. Há risco proporcional de protrusão de maior volume de conteúdo intra-abdominal. Sugere avaliação por cirurgia geral para conduta reparadora.`;
        } else if (anelMm < 8.0) {
          status = 'borderline';
          exp = `Discreta falha parietal / hérnia de pequenas dimensões (anel herniário: ${anelMm.toFixed(1)} mm). Sugere hérnia incipiente ou pequeno defeito aponeurótico local, frequentemente assintomático, mas que requer vigilância.`;
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Diâmetro do Anel Herniário',
          valueObtained: `${anelMm.toFixed(1)} mm`,
          referenceRange: 'Ausente (Falhas parjetais patológicas)',
          status,
          explanation: exp
        });
        insights.push(`Parede Abdominal: Hérnia identificada com anel de ${anelMm.toFixed(1)} mm.`);
      }
    }

    // 3. Nódulos ou Lesões de Parede Abdominal (Lipoma, Endometrioma, Cisto, etc.)
    if (key.includes('nodulo') || key.includes('nódulo') || key.includes('lesao') || key.includes('lesão') || key.includes('lipoma') || key.includes('endometrioma')) {
      const compElem = struct.measurements.comprimento || struct.measurements.value || struct.measurements.valor || struct.measurements.maior_diametro;
      const largElem = struct.measurements.largura || struct.measurements.profundidade;
      
      if (compElem) {
        const compMm = toMm(compElem.value, compElem.unit);
        let status: 'normal' | 'borderline' | 'altered' = 'normal';
        let exp = 'Nódulo/lesão sólida de parede abdominal de dimensões estáveis e limites bem definidos, sugerindo etiologia benigna (como lipoma subcutâneo ou cisto sebáceo).';

        if (compMm >= 30.0) {
          status = 'altered';
          exp = `Formação nodular de dimensões expandidas na parede abdominal (maior diâmetro: ${compMm.toFixed(1)} mm). Requer correlação clínica estreita com sintomas locais e, eventualmente, estudo histopatológico para afastar lesões infiltrativas ou sarcomatosas.`;
        } else if (compMm >= 15.0) {
          status = 'borderline';
          exp = `Formação nodular subcutânea de dimensões intermediárias na parede abdominal (maior diâmetro: ${compMm.toFixed(1)} mm). Recomendado controle ultrassonográfico em de 6 a 12 meses para monitorar estabilidade volumétrica.`;
        }

        let sizeStr = `${compMm.toFixed(1)} mm`;
        if (largElem) {
          const largMm = toMm(largElem.value, largElem.unit);
          sizeStr += ` x ${largMm.toFixed(1)} mm`;
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Maior Diâmetro da Lesão / Nódulo',
          valueObtained: sizeStr,
          referenceRange: '< 15.0 mm (Sugerido para controle)',
          status,
          explanation: exp
        });
        insights.push(`Parede Abdominal: Nódulo/Lesão detectada medindo ${sizeStr}.`);
      }
    }

    // 4. Espessura da Tecido Subcutâneo (Gordura)
    if (key.includes('gordura') || key.includes('subcutaneo') || key.includes('subcutâneo') || key.includes('fat_layer')) {
      const espElem = struct.measurements.espessura || struct.measurements.value || struct.measurements.valor;
      if (espElem) {
        const espMm = toMm(espElem.value, espElem.unit);
        let status: 'normal' | 'borderline' | 'altered' = 'normal';
        let exp = 'Espessura do panículo adiposo subcutâneo dentro dos limites de distribuição adiposa corporal normotrófica.';

        if (espMm > 40.0) {
          status = 'borderline';
          exp = `Espessura aumentada do panículo adiposo subcutâneo (obtido: ${espMm.toFixed(1)} mm > 40.0 mm). Achado comumente associado a sobrepeso, obesidade centralizada ou lipodistrofia local.`;
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Espessura do Tecido Subcutâneo',
          valueObtained: `${espMm.toFixed(1)} mm`,
          referenceRange: '< 40.0 mm (Variável com IMC)',
          status,
          explanation: exp
        });
        insights.push(`Parede Abdominal: Espessura subcutânea de ${espMm.toFixed(1)} mm.`);
      }
    }

    // 5. Espessura do Músculo Reto Abdominal
    if (key.includes('musculo') || key.includes('músculo') || key.includes('rectus_muscle') || key.includes('espessura_reto')) {
      const espElem = struct.measurements.espessura || struct.measurements.value || struct.measurements.valor;
      if (espElem) {
        const espMm = toMm(espElem.value, espElem.unit);
        let status: 'normal' | 'borderline' | 'altered' = 'normal';
        let exp = 'Trofismo preservado do músculo reto abdominal, com espessura simétrica e fibras musculares de aspecto preservado.';

        if (espMm < 4.0) {
          status = 'borderline';
          exp = `Espessura reduzida do músculo reto abdominal (obtido: ${espMm.toFixed(1)} mm < 4.0 mm). Sugere hipotrofia ou atrofia muscular por desuso, sarcopenia ou processo cicatricial/pós-cirúrgico.`;
        } else if (espMm > 20.0) {
          status = 'normal';
          exp = `Musculatura reto-abdominal bem desenvolvida (obtido: ${espMm.toFixed(1)} mm), comum em pacientes jovens, ativos ou atletas de alto desempenho.`;
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Espessura do Músculo Reto Abdominal',
          valueObtained: `${espMm.toFixed(1)} mm`,
          referenceRange: '5.0 - 15.0 mm',
          status,
          explanation: exp
        });
        insights.push(`Parede Abdominal: Espessura muscular do reto abdominal de ${espMm.toFixed(1)} mm.`);
      }
    }
  });
}
