import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando conformidade e avaliação das estruturas do abdômen superior e vias biliares.');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;
        
        // Figado
        if (key.includes('figado') || key.includes('liver') || key.includes('hepato')) {
          const compElem = struct.measurements.comprimento || struct.measurements.length || struct.measurements.height;
          if (compElem) {
            const mm = toMm(compElem.value, compElem.unit);
            const status = mm > 150 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Eixo Longitudinal do Fígado',
              valueObtained: `${(mm/10).toFixed(1)} cm`,
              referenceRange: '≤ 15.0 cm',
              status,
              explanation: mm > 150 
                ? 'Hepatomegalia configurada pelo diâmetro longitudinal.' 
                : 'Dimensões do lóbulo hepático direito preservadas.'
            });
          }
        }
        
        // Vesicula
        if (key.includes('vesicula') || key.includes('gallbladder')) {
          const parede = struct.measurements.parede || struct.measurements.thickness || struct.measurements.espessura;
          if (parede) {
            const val = toMm(parede.value, parede.unit);
            const status = val > 3.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Espessura da Parede da Vesícula Biliar',
              valueObtained: `${val.toFixed(1)} mm`,
              referenceRange: '≤ 3.0 mm',
              status,
              explanation: val > 3.0 
                ? 'Espessamento parietal patológico (edema, colecistite ou reacional).' 
                : 'Parede fina, regular e de aspecto fisiológico.'
            });
          }
        }

        // Bile Duct / Coledoco
        if (key.includes('coledoco') || key.includes('common_bile_duct')) {
          const diam = struct.measurements.diametro || struct.measurements.diameter;
          if (diam) {
            const val = toMm(diam.value, diam.unit);
            const status = val > 6.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Calibre do Colédoco',
              valueObtained: `${val.toFixed(1)} mm`,
              referenceRange: '≤ 6.0 mm (dilata dps dos 60a/colecistectomia)',
              status,
              explanation: val > 6.0 
                ? 'Ectasia ou calibração anormal da via biliar comum.' 
                : 'Lúmen normal sem evidência de dilatação obstrutiva.'
            });
          }
        }

        // Splenometria / Baco
        if (key.includes('baco') || key.includes('spleen')) {
          const comp = struct.measurements.comprimento || struct.measurements.length || struct.measurements.height;
          if (comp) {
            const mm = toMm(comp.value, comp.unit);
            const status = mm > 120 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Diâmetro Longitudinal do Baço',
              valueObtained: `${(mm/10).toFixed(1)} cm`,
              referenceRange: '≤ 12.0 cm',
              status,
              explanation: mm > 120 
                ? 'Esplenomegalia configurada pelo diâmetro esplênico máximo.' 
                : 'Esplenometria normal e ecotextura homogênea.'
            });
          }
        }
      });
}
