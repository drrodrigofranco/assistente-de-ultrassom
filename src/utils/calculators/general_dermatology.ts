import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise morfométrica e vascular de Ultrassonografia Dermatológica (Geral).');

  structures.forEach(struct => {
    const key = struct.key ? struct.key.toLowerCase() : '';
    const name = struct.name;

    // 1. Epidermal/Dermal Thickness
    if (key.includes('derme') || key.includes('epiderme') || key.includes('espessura_pele') || key.includes('skin_thickness')) {
      const espElem = struct.measurements.espessura || struct.measurements.value || struct.measurements.valor;
      if (espElem) {
        const espMm = toMm(espElem.value, espElem.unit);
        let status: 'normal' | 'altered' | 'borderline' = 'normal';
        let exp = 'Espessura cutânea dentro dos limites esperados para a derme/epiderme em região anatômica padrão.';

        if (espMm > 3.0) {
          status = 'borderline';
          exp = `Aumento localizado da espessura cutânea (obtido: ${espMm.toFixed(1)} mm > 3.0 mm). Sugere edema subdérmico, processo inflamatório agudo/crônico ou hipertrofia fibroelástica local.`;
        } else if (espMm < 0.5) {
          status = 'borderline';
          exp = `Espessura cutânea reduzida (obtido: ${espMm.toFixed(1)} mm < 0.5 mm). Correlacionar com atrofia cutânea local, envelhecimento actínico ou uso prolongado de corticosteroides tópicos.`;
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Espessura da Derme/Epiderme',
          valueObtained: `${espMm.toFixed(1)} mm`,
          referenceRange: '0.5 - 3.0 mm',
          status,
          explanation: exp
        });
        insights.push(`Dermatológico: Espessura da pele avaliada em ${espMm.toFixed(1)} mm.`);
      }
    }

    // 2. Lesion Dimensions / Nodule Diameter
    if (key.includes('lesao') || key.includes('lesão') || key.includes('nodulo') || key.includes('nódulo') || key.includes('tumor') || key.includes('placa')) {
      const compElem = struct.measurements.comprimento || struct.measurements.value || struct.measurements.valor || struct.measurements.maior_diametro;
      const largElem = struct.measurements.largura || struct.measurements.profundidade;
      
      if (compElem) {
        const compMm = toMm(compElem.value, compElem.unit);
        let status: 'normal' | 'borderline' | 'altered' = 'normal';
        let exp = `Dimensão da lesão cutânea detectada dentro de parâmetros sob observação clínica.`;

        if (compMm >= 20.0) {
          status = 'altered';
          exp = `Lesão dermatológica de dimensões macroscópicas consideráveis (maior diâmetro: ${compMm.toFixed(1)} mm ≥ 20.0 mm). Requer correlação com histopatologia para descartar malignidade ou crescimento tumoral expansivo local.`;
        } else if (compMm >= 10.0) {
          status = 'borderline';
          exp = `Lesão dermatológica de diâmetro intermediário (maior diâmetro: ${compMm.toFixed(1)} mm). Recomendado acompanhamento de crescimento ou mapeamento tridimensional periódico.`;
        }

        let sizeStr = `${compMm.toFixed(1)} mm`;
        if (largElem) {
          const largMm = toMm(largElem.value, largElem.unit);
          sizeStr += ` x ${largMm.toFixed(1)} mm`;
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Dimensões da Lesão Cutânea',
          valueObtained: sizeStr,
          referenceRange: '< 10.0 mm (Sugerido para monitoramento)',
          status,
          explanation: exp
        });
        insights.push(`Dermatológico: Lesão detectada medindo ${sizeStr}.`);
      }
    }

    // 3. Neovascularization / Doppler Assessment
    if (key.includes('doppler_lesao') || key.includes('vacularizacao') || key.includes('vascularização') || key === 'doppler' || key.includes('fluxo')) {
      const vascularElem = struct.measurements.grau || struct.measurements.fluxo || struct.measurements.value || struct.measurements.valor;
      if (vascularElem) {
        const val = vascularElem.value; // typically 0 = sem fluxo, 1 = fluxo periférico, 2 = fluxo intranodal/central, 3 = hipervascularizado
        let status: 'normal' | 'altered' | 'borderline' = 'normal';
        let labelStr = 'Sem fluxo detectado';
        let exp = 'Ausência de sinais vasculares internos ou periféricos ao estudo Doppler de alta frequência. Compatível com lesões císticas, inertes ou de baixo metabolismo celular (benignidade presumida).';

        if (val === 1) {
          status = 'normal';
          labelStr = 'Fluxo periférico leve';
          exp = 'Presença de discretos vasos arteriais ou venosos em periferia da lesão. Padrão comum em cistos inflamatórios leves ou hemangiomas estáveis.';
        } else if (val === 2) {
          status = 'borderline';
          labelStr = 'Fluxo central intermediário';
          exp = 'Identificados microvasos em derme profunda direcionados ao centro da lesão. Exige correlação clínica com processos inflamatórios ativos ou tumores benignos vascularizados (ex: pilomatricoma).';
        } else if (val >= 3) {
          status = 'altered';
          labelStr = 'Hipervascularização / Fluxo Caótico';
          exp = 'Hipervascularização abundante de padrão caótico/desorganizado interna e periférica. Marcador clássico de processos neoplásicos malignos ativos (ex: Carcinoma Basocelular espesso ou Melanoma infiltrativo). Requer biópsia urgente.';
        }

        addEvaluation({
          structureName: name,
          parameterLabel: 'Estudo Doppler de Alta Frequência (Vascularização)',
          valueObtained: labelStr,
          referenceRange: 'Grau 0 ou 1 (Sem fluxo proeminente)',
          status,
          explanation: exp
        });
        insights.push(`Dermatológico: Vascularização ao Doppler classificada como "${labelStr}".`);
      }
    }
  });
}
