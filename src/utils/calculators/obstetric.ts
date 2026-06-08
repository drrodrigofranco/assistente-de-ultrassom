import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise biométrica de Gravidez Precoce do Primeiro Trimestre (Base de cálculo Hadlock semplificada para Idade Gestacional por CCN, normal fcf: 110 - 170 bpm).');

      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        // CCN (Crown-Rump Length)
        if (key.includes('ccn') || key.includes('crl') || key.includes('comprimento_cabeca_nadega')) {
          const ccnElem = struct.measurements.comprimento || struct.measurements.ccn || struct.measurements.value || struct.measurements.valor;
          if (ccnElem) {
            const ccnMm = toMm(ccnElem.value, ccnElem.unit);
            // Hadlock estimation or simplified first-trimester formula: Age in days = CCN (mm) + 42
            const ageDays = ccnMm + 42;
            const weeks = Math.floor(ageDays / 7);
            const remainingDays = Math.round(ageDays % 7);

            const isAltered = ccnMm < 2.0 || ccnMm > 84.0; // Standard CRL range in first trimester
            const exp = isAltered
              ? 'CCN fora dos limites usuais de medição de primeiro trimestre (2.0 mm a 84.0 mm, equivalente a 6-14 semanas). Verificar viabilidade ou solicitar ultrassonografia morfológica/fetal padrão.'
              : `Idade Gestacional estimada de ${weeks} semanas e ${remainingDays} dias calculada rigorosamente por algoritmo de regressão linear baseado em CCN.`;

            addEvaluation({
              structureName: name,
              parameterLabel: 'Idade Gestacional Equivalente (CCN)',
              valueObtained: `${ccnMm.toFixed(1)} mm → ${weeks} Semanas e ${remainingDays} Dias`,
              referenceRange: '2.0 - 84.0 mm',
              status: isAltered ? 'borderline' : 'normal',
              explanation: exp
            });
            insights.push(`Biometria Fetal: CCN de ${ccnMm.toFixed(1)} mm estimado em ${weeks} semanas e ${remainingDays} dias.`);
          }
        }

        // Heart Rate (FCF)
        if (key.includes('fcf') || key.includes('frequencia') || key.includes('frequência') || key.includes('fetal_heart') || key.includes('bpm')) {
          const fcfElem = struct.measurements.frequencia || struct.measurements.fcf || struct.measurements.frequencia_cardiaca || struct.measurements.valor;
          if (fcfElem) {
            const fcfValue = fcfElem.value;
            let fcfStatus: 'normal' | 'altered' | 'borderline' = 'normal';
            let exp = 'Batimentos cardíacos fetais rítmicos e normofrequentes.';

            if (fcfValue < 110) {
              fcfStatus = 'altered';
              exp = 'Bradicardia fetal severa identificada. Alerta imediato para equipe médica de ginecologia por sofrimento ou viabilidade fetal sob risco.';
            } else if (fcfValue > 170) {
              fcfStatus = 'altered';
              exp = 'Taquicardia fetal detectada (acima de 170 bpm). Necessita de acompanhamento clínico.';
            } else if (fcfValue >= 110 && fcfValue < 120) {
              fcfStatus = 'borderline';
              exp = 'Frequência cardíaca fetal limítrofe inferior. Monitorar com cautela.';
            }

            addEvaluation({
              structureName: name,
              parameterLabel: 'Frequência Cardíaca Fetal (FCF)',
              valueObtained: `${fcfValue.toFixed(0)} bpm`,
              referenceRange: '110 - 170 bpm',
              status: fcfStatus,
              explanation: exp
            });
            insights.push(`Frequência Cardíaca Fetal medida: ${fcfValue.toFixed(0)} bpm.`);
          }
        }

        // Vesícula Vitelina
        if (key.includes('vesicula_vitelina') || key.includes('yolk_sac') || key.includes('vesícula_vitelina') || key.includes('vitelina')) {
          const vvElem = struct.measurements.diametro || struct.measurements.espessura || struct.measurements.vv || struct.measurements.valor;
          if (vvElem) {
            const vvMm = toMm(vvElem.value, vvElem.unit);
            let vvStatus: 'normal' | 'altered' | 'borderline' = 'normal';
            let exp = 'Vesícula vitelina com forma e tamanho regulares.';

            if (vvMm < 3.0) {
              vvStatus = 'altered';
              exp = 'Vesícula vitelina hipoplásica (menor que 3 mm), fator de risco associado a perda gestacional precoce.';
            } else if (vvMm > 6.0) {
              vvStatus = 'altered';
              exp = 'Vesícula vitelina hidrópica/megavesícula vitelina (maior que 6 mm), correlacionada estatisticamente com prognósticos gestacionais desfavoráveis ou anomalias cromossômicas.';
            }

            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro Interno Médio',
              valueObtained: `${vvMm.toFixed(1)} mm`,
              referenceRange: '3.0 - 6.0 mm',
              status: vvStatus,
              explanation: exp
            });
            insights.push(`Anexos Embrionários: Vesícula vitelina mede ${vvMm.toFixed(1)} mm.`);
          }
        }

        // Translucência Nucal (TN) - EURP p. 14
        if (key.includes('tn') || key.includes('translucencia_nucal') || key.includes('translucência_nucal') || key.includes('dobra_nucal_1t') || key === 'nuchal_translucency') {
          const tnElem = struct.measurements.espessura || struct.measurements.valor || struct.measurements.value || struct.measurements.tn || struct.measurements.nuchal_translucency;
          if (tnElem) {
            const tnMm = toMm(tnElem.value, tnElem.unit);
            const status = tnMm > 2.5 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Translucência Nucal (EURP p. 14)',
              valueObtained: `${tnMm.toFixed(2)} mm`,
              referenceRange: '≤ 2.5 mm',
              status,
              explanation: status === 'altered'
                ? 'Translucência Nucal aumentada (> 2.5 mm). Forte associação estatística com aneuploidias (ex: Síndrome de Down, Edwards) ou cardiopatias. Recomendado rastreamento genético / amniocêntese.'
                : 'Medida da Translucência Nucal dentro dos limites fisiológicos normais de primeiro trimestre.'
            });
            insights.push(`Translucência Nucal (TN) avaliada em ${tnMm.toFixed(2)} mm.`);
          }
        }

        // Osso Nasal (ON) 1º Trimestre - EURP p. 15
        if (key.includes('osso_nasal') || key.includes('nasal_bone') || key.includes('hipoplasia_nasal')) {
          const onElem = struct.measurements.presenca || struct.measurements.valor || struct.measurements.value || struct.measurements.osso_nasal;
          if (onElem) {
            let onVal = onElem.value;
            let onLabel = '';
            let status: 'normal' | 'altered' = 'normal';
            let exp = '';

            // Could be a code (0: Presente, 1: Ausente) or a length in mm
            if (onElem.unit === 'code' || onVal === 0 || onVal === 1) {
              status = onVal === 1 ? 'altered' : 'normal';
              onLabel = onVal === 0 ? 'Presente' : 'Ausente';
              exp = status === 'altered'
                ? 'Ausência/Não-visualização de osso osso nasal no primeiro trimestre. Marcador secundário importante de aneuploidias.'
                : 'Osso nasal presente e bem visualizado.';
            } else {
              const onMm = toMm(onVal, onElem.unit);
              status = onMm < 2.5 ? 'altered' : 'normal';
              onLabel = `${onMm.toFixed(1)} mm (${onMm >= 2.5 ? 'Presente' : 'Hipoplásico'})`;
              exp = status === 'altered'
                ? `Osso nasal hipoplásico (${onMm.toFixed(1)} mm). Sugere atenção morfológica.`
                : 'Osso nasal com comprimento adequado.';
            }

            addEvaluation({
              structureName: name,
              parameterLabel: 'Osso Nasal (EURP p. 15)',
              valueObtained: onLabel,
              referenceRange: 'Presente (ou ≥ 2.5 mm)',
              status,
              explanation: exp
            });
            insights.push(`Osso Nasal avaliado: ${onLabel}.`);
          }
        }

        // Saco Gestacional / Diâmetro Sacolar Médio (EURP p. 10)
        if (key.includes('saco_gestacional') || key.includes('mean_sac_diameter') || key.includes('msd') || key.includes('sac_diameter')) {
          const sgElem = struct.measurements.diametro || struct.measurements.valor || struct.measurements.value || struct.measurements.msd || struct.measurements.saco_gestacional;
          if (sgElem) {
            const sgMm = toMm(sgElem.value, sgElem.unit);
            // GA from MSD: days = MSD + 30
            const ageDays = sgMm + 30;
            const weeks = Math.floor(ageDays / 7);
            const remainingDays = Math.round(ageDays % 7);
            
            const isAltered = sgMm < 2.0 || sgMm > 60.0;
            let exp = `Saco gestacional bem implantado em cavidade uterina, compatível com idade gestacional estimada de ${weeks} semanas e ${remainingDays} dias.`;
            
            if (sgMm >= 10.0) {
              exp += " Nota: Em diâmetros sacolares médios ≥ 10.0 mm, espera-se a visualização nítida de vesícula vitelina.";
            }
            if (sgMm >= 25.0) {
              exp += " Nota: Em diâmetros sacolares médios ≥ 25.0 mm, o embrião com batimentos cardíacos fetais rítmicos deve ser obrigatoriamente reconhecido e mapeado.";
            }
            
            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro Sacolar Médio (EURP p. 10)',
              valueObtained: `${sgMm.toFixed(1)} mm → ${weeks} Semanas e ${remainingDays} Dias`,
              referenceRange: '2.0 - 60.0 mm',
              status: isAltered ? 'borderline' : 'normal',
              explanation: exp
            });
            insights.push(`Biometria Precoce: Saco Gestacional com diâmetro médio de ${sgMm.toFixed(1)} mm, correspondente a ${weeks}w${remainingDays}d.`);
          }
        }

        // Doppler das Artérias Uterinas PI Média (EURP p. 16)
        if (key.includes('arteria_uterina') || key.includes('artéria_uterina') || key.includes('uterine_artery') || key === 'uta' || key === 'uta_pi') {
          const utaElem = struct.measurements.uta_pi || struct.measurements.value || struct.measurements.valor || struct.measurements.average_pi;
          if (utaElem) {
            const utaPi = utaElem.value;
            const status = utaPi > 1.45 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Doppler de Artérias Uterinas (EURP p. 16)',
              valueObtained: utaPi.toFixed(2),
              referenceRange: '≤ 1.45 (PI Médio)',
              status,
              explanation: status === 'altered'
                ? `Resistência média aumentada nas artérias uterinas (${utaPi.toFixed(2)}) no primeiro trimestre. Marcador de alta sensibilidade para risco aumentado de pré-eclâmpsia e de crescimento fetal restrito (RCF). Aconselhado profilaxia oportuna.`
                : 'Impedância de fluxo normal e simétrica nas artérias uterinas para o primeiro trimestre gestacional.'
            });
            insights.push(`Doppler Precoce: Média do PI das Artérias Uterinas avaliado em ${utaPi.toFixed(2)}.`);
          }
        }
      });
}
