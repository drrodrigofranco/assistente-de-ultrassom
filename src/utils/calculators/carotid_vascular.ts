import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise hemodinâmica carotídea e vertebral baseada nas diretrizes SBC/DIC/CBR/SBACV 2023 (Tabela 2 e Tabela 6).');

      let maxStenosisCategoryRight = '';
      let maxStenosisCategoryLeft = '';
      let rightVertebralHypoplasia = false;
      let leftVertebralHypoplasia = false;

      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        // Carotid Evaluation (Right or Left Carotid)
        if (key.includes('carotid') || key.includes('carotida') || key.includes('carótida')) {
          const vpsCi = struct.measurements.vps_ci?.value || 0;
          const vdfCi = struct.measurements.vdf_ci?.value || 0;
          const vpsCc = struct.measurements.vps_cc?.value || 0;
          const vdfCc = struct.measurements.vdf_cc?.value || 0;

          if (vpsCi > 0 || vdfCi > 0) {
            const ratioCiCc = vpsCc > 0 ? (vpsCi / vpsCc) : 0;
            const ratioCiVdfCc = vdfCc > 0 ? (vpsCi / vdfCc) : 0;
            const ratioVdfCiVdfCc = vdfCc > 0 ? (vdfCi / vdfCc) : 0;

            // Classify stenosis degree (Tabela 2 SBC 2023)
            let degree = '< 50%';
            let elementStatus: 'normal' | 'altered' | 'borderline' = 'normal';
            let reasoning = 'Lúmen e fluxogramas normais sem repercussão.';

            if (vpsCi > 400 && vdfCi > 140) {
              degree = '≥ 90% a < Oclusão (NASCET)';
              elementStatus = 'altered';
              reasoning = 'Estenose crítica pré-oclusiva extrema. Velocidades muito elevadas com estreitamento luminal drástico.';
            } else if (vpsCi > 230 && vdfCi > 140) {
              degree = '80 - 89% (NASCET)';
              elementStatus = 'altered';
              reasoning = 'Estenose crítica com VDF significativamente aumentada.';
            } else if (vpsCi > 230 && vdfCi > 100) {
              degree = '70 - 79% (NASCET)';
              elementStatus = 'altered';
              reasoning = 'Estenose grave com repercussão hemodinâmica substancial.';
            } else if (vpsCi >= 140 && vdfCi >= 70) {
              degree = '60 - 69% (NASCET)';
              elementStatus = 'altered';
              reasoning = 'Estenose moderada avançada (diástole aumentada).';
            } else if (vpsCi >= 140 && vdfCi >= 40) {
              degree = '50 - 59% (NASCET)';
              elementStatus = 'altered';
              reasoning = 'Estenose moderada inicial.';
            } else if (vpsCi >= 140) {
              degree = '50 - 69% (NASCET)';
              elementStatus = 'altered';
              reasoning = 'Estenose moderada aproximada em conformidade com critérios de velocidade sistólica.';
            }

            if (key.includes('dir') || key.includes('right')) {
              maxStenosisCategoryRight = degree;
            } else {
              maxStenosisCategoryLeft = degree;
            }

            addEvaluation({
              structureName: name,
              parameterLabel: 'Grau de Estenose de ACI (Tabela 2 SBC 2023)',
              valueObtained: `VPS ACI: ${vpsCi} cm/s | VDF ACI: ${vdfCi} cm/s | Razão CI/CC: ${ratioCiCc.toFixed(2)}`,
              referenceRange: 'VPS < 140 cm/s & VDF < 40 cm/s (Normal)',
              status: elementStatus,
              explanation: `Classificação: ${degree}. ${reasoning}`
            });

            // Extra relationships derived automatically for high precision auditing:
            if (ratioCiCc > 0) {
              const rStatus = ratioCiCc > 4.0 ? 'altered' : ratioCiCc > 2.0 ? 'borderline' : 'normal';
              addEvaluation({
                structureName: `${name} (Relação VPS ACI / VPS ACC)`,
                parameterLabel: 'Relação de Velocidades Sistólicas (ACI/ACC)',
                valueObtained: ratioCiCc.toFixed(2),
                referenceRange: '< 2.0 (Normal) | 2.0 - 4.0 (Moderada) | > 4.0 (Grave) | > 5.0 (Pré-Oclusiva)',
                status: rStatus,
                explanation: ratioCiCc > 5.0
                  ? 'Relação crítica (> 5.0) condizente com estenose pré-oclusiva extrema.'
                  : ratioCiCc > 4.0 
                  ? 'Relação aumentada (> 4.0) condizente com estenose grave (70-89% ou superior).' 
                  : ratioCiCc >= 2.0 
                  ? 'Relação moderada (2.0 a 4.0) indicativa de estenose moderada (50-69%).' 
                  : 'Relação normal.'
              });
            }

            if (ratioCiVdfCc > 0) {
              const rVdfStatus = ratioCiVdfCc > 14.0 ? 'altered' : ratioCiVdfCc > 8.0 ? 'borderline' : 'normal';
              addEvaluation({
                structureName: `${name} (Relação VPS ACI / VDF ACC)`,
                parameterLabel: 'Relação VPS ACI / VDF ACC',
                valueObtained: ratioCiVdfCc.toFixed(2),
                referenceRange: '< 8 (Normal) | 8 - 13 (Moderada) | 14 - 29 (Grave) | > 30 (Pré-Oclusiva)',
                status: rVdfStatus,
                explanation: ratioCiVdfCc > 30
                  ? 'Relação extremamente aumentada (> 30) condizente com estenose pré-oclusiva extrema (Tabela 2 SBC 2023).'
                  : ratioCiVdfCc >= 14
                  ? 'Relação de velocidades aumentada condizente com estenose significativa (70-89%).'
                  : ratioCiVdfCc >= 8
                  ? 'Relação de velocidades limítrofe condizente com estenose moderada (50-69%).'
                  : 'Relação normal.'
              });
            }

            if (ratioVdfCiVdfCc > 0) {
              const rVdfCiVdfCcStatus = ratioVdfCiVdfCc > 5.5 ? 'altered' : ratioVdfCiVdfCc >= 2.6 ? 'borderline' : 'normal';
              addEvaluation({
                structureName: `${name} (Relação VDF ACI / VDF ACC)`,
                parameterLabel: 'Relação VDF ACI / VDF ACC',
                valueObtained: ratioVdfCiVdfCc.toFixed(2),
                referenceRange: '< 2.6 (Normal) | 2.6 - 5.5 (Moderada/Aumentada) | > 5.5 (Crítica)',
                status: rVdfCiVdfCcStatus,
                explanation: ratioVdfCiVdfCc > 5.5
                  ? 'Relação de diástoles crítica (> 5.5) indicando alta resistência distal ou estenose crítica (80-89% ou superior).'
                  : ratioVdfCiVdfCc >= 2.6
                  ? 'Relação de diástoles limítrofe/aumentada correlacionando-se com estenose de 50-59% em conformidade com as diretrizes.'
                  : 'Relação de diástoles conservada.'
              });
            }
          }
        }

        // Vertebral Evaluation
        if (key.includes('vertebral')) {
          const vmax = struct.measurements.vmax?.value || 0;
          const vdf = struct.measurements.vdf?.value || 0;
          const diamV2 = struct.measurements.diametro_v2?.value || 0;
          const ir = struct.measurements.ir?.value || 0;

          if (vmax > 0 || diamV2 > 0) {
            // Check hypoplasia (Tabela 5 SBC 2023)
            let isHypoplastic = false;
            if (diamV2 > 0 && diamV2 <= 2.0 && ir > 0.75) {
              isHypoplastic = true;
              if (key.includes('dir') || key.includes('right')) {
                rightVertebralHypoplasia = true;
              } else {
                leftVertebralHypoplasia = true;
              }
            }

            if (isHypoplastic) {
              addEvaluation({
                structureName: name,
                parameterLabel: 'Hipoplasia de Artéria Vertebral (Tabela 5)',
                valueObtained: `Diâmetro V2: ${diamV2} mm | IR: ${ir}`,
                referenceRange: 'Diâmetro > 2.0 mm | IR ≤ 0.75',
                status: 'borderline',
                explanation: 'Artéria vertebral hipoplásica. Caracterizada por calibre reduzido (≤ 2.0 mm) e resistência aumentada (IR > 0.75), sendo um achado congênito benigno comum.'
              });
            } else if (diamV2 > 0) {
              addEvaluation({
                structureName: `${name} (Calibre)`,
                parameterLabel: 'Diâmetro no Segmento V2',
                valueObtained: `${diamV2} mm`,
                referenceRange: '> 2.0 mm',
                status: 'normal',
                explanation: 'Calibre arterial vertebral conservado (diâmetro adequado).'
              });
            }

            // Classify proximal vertebral stenosis (Tabela 6 Hua / SBC 2023)
            let degree = 'Normal (< 50%)';
            let vStatus: 'normal' | 'altered' | 'borderline' = 'normal';
            let reasoning = 'Fluxo proximal e velocidades na origem preservados.';

            if (vmax >= 210 || vdf >= 55) {
              degree = '70 - 99% (NASCET / Grave-Crítica)';
              vStatus = 'altered';
              reasoning = 'Estenose vertebral proximal crítica. Risco acentuado de hipofluxo vértebro-basilar distal.';
            } else if (vmax >= 140 || vdf >= 35) {
              degree = '50 - 69% (Moderada)';
              vStatus = 'altered';
              reasoning = 'Estenose vertebral proximal de grau moderado.';
            } else if (vmax >= 85 || vdf >= 27) {
              degree = '< 50% (Leve)';
              vStatus = 'borderline';
              reasoning = 'Sinais de estenose leve na origem da vertebral.';
            }

            addEvaluation({
              structureName: name,
              parameterLabel: 'Estenose de Artéria Vertebral Proximal (Tabela 6)',
              valueObtained: `Vmax na Origem: ${vmax} cm/s | Vdf: ${vdf} cm/s`,
              referenceRange: 'Vmax < 85 cm/s | Vdf < 27 cm/s',
              status: vStatus,
              explanation: `Classificação: ${degree}. ${reasoning}`
            });
          }
        }
      });

      // Synthesis and final staging rule (hegemony)
      let diagnosisSummary = 'Fluxometria Doppler Carotídea e Vertebral Normal';
      let managementPlan = 'Seguimento de rotina em 1-2 anos para avaliação preventiva cardiovascular.';
      let priorityClass = 'normal';

      const leftIsGrave = maxStenosisCategoryLeft.includes('70%') || maxStenosisCategoryLeft.includes('80%') || maxStenosisCategoryLeft.includes('90%');
      const rightIsGrave = maxStenosisCategoryRight.includes('70%') || maxStenosisCategoryRight.includes('80%') || maxStenosisCategoryRight.includes('90%');
      const leftIsMod = maxStenosisCategoryLeft.includes('50-59%') || maxStenosisCategoryLeft.includes('60-69%') || maxStenosisCategoryLeft.includes('50%') || maxStenosisCategoryLeft.includes('60%');
      const rightIsMod = maxStenosisCategoryRight.includes('50-59%') || maxStenosisCategoryRight.includes('60-69%') || maxStenosisCategoryRight.includes('50%') || maxStenosisCategoryRight.includes('60%');

      if (leftIsGrave || rightIsGrave) {
        diagnosisSummary = 'Estenose de Artéria Carótida Interna Grave (≥ 70%)';
        managementPlan = 'Encaminhamento prioritário à cirurgia vascular ou cardiologia. Avaliação de elegibilidade para endarterectomia carotídea ou implante de stent. Monitoramento intra/perioperatório recomendado.';
        priorityClass = 'altered';
      } else if (leftIsMod || rightIsMod) {
        diagnosisSummary = 'Estenose de Artéria Carótida Interna Moderada (50-69%)';
        managementPlan = 'Monitoramento ultrassonográfico semestral. Otimização do perfil terapêutico medicamentoso (antiagregantes plaquetários e estatinas de alta potência) e controle de fatores de risco cardiovasculares.';
        priorityClass = 'altered';
      } else if (maxStenosisCategoryLeft === '< 50%' || maxStenosisCategoryRight === '< 50%') {
        diagnosisSummary = 'Irregularidade Parietal / Estenose Carotídea Leve (< 50%)';
        managementPlan = 'Controle estrito de dislipidemia e fatores de risco habituais. Reavaliação anual.';
        priorityClass = 'normal';
      }

      if (rightVertebralHypoplasia || leftVertebralHypoplasia) {
        const affectedSide = rightVertebralHypoplasia && leftVertebralHypoplasia 
          ? 'bilateral' 
          : rightVertebralHypoplasia 
          ? 'à direita' 
          : 'à esquerda';
        diagnosisSummary += ` & Hipoplasia Arterial Vertebral ${affectedSide}`;
      }

      insights.push(`Diagnóstico programático definitivo: ${diagnosisSummary}.`);
      insights.push(`Conduta recomendada: ${managementPlan}`);

      addEvaluation({
        structureName: 'Síntese das Diretrizes Vascular (SBC 2023)',
        parameterLabel: 'Grau de Risco & Conduta Recomendada',
        valueObtained: diagnosisSummary,
        referenceRange: 'Estenose < 50% & Calibre Vertebral Normal',
        status: priorityClass as any,
        explanation: `Resumo do Laudo: ${diagnosisSummary}.\n\nRecomendações e Planejamento Clínico:\n- ${managementPlan}`
      });
}
