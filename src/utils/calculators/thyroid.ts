import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando cálculo morfométrico da Glândula Tireoide (Fórmula Eliptóide: Comprimento x Largura x Espessura x 0.523).');
      
      let totalVolume = 0;
      let hasRightLobe = false;
      let hasLeftLobe = false;

      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        // Thyroid Lobes
        if (key.includes('direito') || key.includes('right') || key.includes('esquerdo') || key.includes('left') || key.includes('lobo')) {
          const compElem = struct.measurements.comprimento || struct.measurements.length || struct.measurements.comp;
          const largElem = struct.measurements.largura || struct.measurements.width || struct.measurements.larg;
          const espElem = struct.measurements.espessura || struct.measurements.thickness || struct.measurements.esp || struct.measurements.profundidade;
          const volElem = struct.measurements.volume;

          if (compElem && largElem && espElem) {
            const compMm = toMm(compElem.value, compElem.unit);
            const largMm = toMm(largElem.value, largElem.unit);
            const espMm = toMm(espElem.value, espElem.unit);

            // Volume in cm³ (mL) = (L mm/10) * (W mm/10) * (H mm/10) * 0.5233
            const compCm = compMm / 10;
            const largCm = largMm / 10;
            const espCm = espMm / 10;
            const calculatedVol = compCm * largCm * espCm * 0.523;
            totalVolume += calculatedVol;

            if (key.includes('direito') || key.includes('right')) hasRightLobe = true;
            if (key.includes('esquerdo') || key.includes('left')) hasLeftLobe = true;

            const referenceMax = patientGender === 'M' ? 15.0 : 12.0; // individual lobe limit placeholder
            const lobeStatus = calculatedVol > referenceMax ? 'altered' : calculatedVol < 0.5 ? 'altered' : 'normal';

            addEvaluation({
              structureName: name,
              parameterLabel: 'Volume Lobar (Fórmula Eliptóide)',
              valueObtained: `${calculatedVol.toFixed(2)} cm³ (mL)`,
              referenceRange: `0.5 - ${referenceMax.toFixed(1)} cm³`,
              status: lobeStatus,
              explanation: `Volume calculado via fórmula programática (C: ${compCm.toFixed(1)}cm x L: ${largCm.toFixed(1)}cm x E: ${espCm.toFixed(1)}cm x 0.523).`
            });

            // EURP Table 97 individual axis comparisons:
            // Length: 40 - 70 mm, Width: 10 - 30 mm, Thickness: 10 - 20 mm
            const compStatus = (compMm < 40 || compMm > 70) ? 'borderline' : 'normal';
            addEvaluation({
              structureName: `${name} (Comprimento)`,
              parameterLabel: 'Eixo Longitudinal (EURP Tabela 97)',
              valueObtained: `${compMm.toFixed(1)} mm`,
              referenceRange: '40.0 - 70.0 mm',
              status: compStatus,
              explanation: compMm > 70 
                ? 'Eixo longitudinal aumentado.' 
                : compMm < 40 
                ? 'Eixo longitudinal diminuído.' 
                : 'Diâmetro longitudinal normal.'
            });

            const largStatus = (largMm < 10 || largMm > 30) ? 'borderline' : 'normal';
            addEvaluation({
              structureName: `${name} (Largura)`,
              parameterLabel: 'Eixo Transversal (EURP Tabela 97)',
              valueObtained: `${largMm.toFixed(1)} mm`,
              referenceRange: '10.0 - 30.0 mm',
              status: largStatus,
              explanation: largMm > 30 
                ? 'Eixo transversal aumentado.' 
                : largMm < 10 
                ? 'Eixo transversal diminuído.' 
                : 'Diâmetro transversal normal.'
            });

            const espStatus = (espMm < 10 || espMm > 20) ? 'borderline' : 'normal';
            addEvaluation({
              structureName: `${name} (Espessura AP)`,
              parameterLabel: 'Eixo Anteroposterior (EURP Tabela 97)',
              valueObtained: `${espMm.toFixed(1)} mm`,
              referenceRange: '10.0 - 20.0 mm',
              status: espStatus,
              explanation: espMm > 20 
                ? 'Espessura/AP aumentada.' 
                : espMm < 10 
                ? 'Espessura/AP diminuída.' 
                : 'Diâmetro anteroposterior normal.'
            });

            insights.push(`Cálculo de volume para ${name}: ${calculatedVol.toFixed(2)} mL.`);
          } else if (volElem) {
            // Volume was parsed directly
            totalVolume += volElem.value;
            const referenceMax = patientGender === 'M' ? 15.0 : 12.0;
            addEvaluation({
              structureName: name,
              parameterLabel: 'Volume Informado',
              valueObtained: `${volElem.value.toFixed(2)} ${volElem.unit}`,
              referenceRange: `0.5 - ${referenceMax.toFixed(1)} ${volElem.unit}`,
              status: volElem.value > referenceMax ? 'altered' : 'normal',
              explanation: `Mapeado diretamente do exame.`
            });
          }
        }

        // Thyroid Isthmus
        if (key.includes('istmo') || key.includes('isthmus')) {
          const espElem = struct.measurements.espessura || struct.measurements.thickness || struct.measurements.diametro || struct.measurements.esp;
          if (espElem) {
            const espMm = toMm(espElem.value, espElem.unit);
            const isAltered = espMm > 5.0; // > 5mm is abnormal/increased index

            addEvaluation({
              structureName: name,
              parameterLabel: 'Espessura do Ístmo',
              valueObtained: `${espMm.toFixed(1)} mm`,
              referenceRange: '≤ 5.0 mm',
              status: isAltered ? 'altered' : 'normal',
              explanation: isAltered ? 'Ístmo espessado (sinal associado a tireoidite de Hashimoto ou bócio difuso).' : 'Espessura do ístmo dentro dos limites anatômicos normais.'
            });
            insights.push(`Espessura do Ístmo avaliada: ${espMm.toFixed(1)} mm.`);
          }
        }
      });

      // Total Thyroid Volume Evaluation
      if (hasRightLobe || hasLeftLobe) {
        const totalMaxRef = patientGender === 'M' ? 18.0 : 15.0;
        const totalMinRef = 2.0;
        let totalStatus: 'normal' | 'altered' | 'borderline' = 'normal';
        let explanation = 'Bócio glandular ausente, volume tireoidiano total dentro dos padrões de normalidade.';

        if (totalVolume > totalMaxRef) {
          totalStatus = 'altered';
          explanation = `Bócio difuso detectado: Volume tireoidiano total de ${totalVolume.toFixed(2)} mL excede o teto de normalidade (${totalMaxRef} mL para sexo ${patientGender === 'M' ? 'Masculino' : 'Feminino'}).`;
        } else if (totalVolume < totalMinRef && totalVolume > 0) {
          totalStatus = 'altered';
          explanation = `Volume global reduzido (${totalVolume.toFixed(2)} mL), sugerindo atrofia tireoidiana primária ou fase crônica descompensada de tireoidite.`;
        } else if (totalVolume >= totalMaxRef - 1.5 && totalVolume <= totalMaxRef) {
          totalStatus = 'borderline';
          explanation = `Volume global limítrofe superior (${totalVolume.toFixed(2)} mL). Monitoramento recomendado.`;
        }

        addEvaluation({
          structureName: 'Volume Total da Glândula',
          parameterLabel: 'Soma dos Lobos',
          valueObtained: `${totalVolume.toFixed(2)} cm³ (mL)`,
          referenceRange: `${totalMinRef.toFixed(1)} - ${totalMaxRef.toFixed(1)} cm³`,
          status: totalStatus,
          explanation: explanation
        });
        insights.push(`Soma volumétrica total avaliada: ${totalVolume.toFixed(2)} mL.`);
      }
}
