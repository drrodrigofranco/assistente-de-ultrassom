import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando avaliação do sistema reprodutor ginecológico.');
      structures.forEach(struct => {
        const key = struct.key ? struct.key.toLowerCase() : '';
        const name = struct.name;

        // Utero (Volume)
        if (key.includes('utero') || key.includes('uterus')) {
          const vol = struct.measurements.volume;
          const comp = struct.measurements.comprimento || struct.measurements.length;
          const larg = struct.measurements.largura || struct.measurements.width;
          const esp = struct.measurements.espessura || struct.measurements.thickness;

          let volValue = 0;
          if (vol) {
            volValue = vol.value;
          } else if (comp && larg && esp) {
            const compMm = toMm(comp.value, comp.unit);
            const largMm = toMm(larg.value, larg.unit);
            const espMm = toMm(esp.value, esp.unit);
            const compCm = compMm / 10;
            const largCm = largMm / 10;
            const espCm = espMm / 10;
            volValue = compCm * largCm * espCm * 0.523;
          }

          if (volValue > 0) {
            const status = volValue > 90 ? 'altered' : volValue < 30 ? 'borderline' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Volume Uterino',
              valueObtained: `${volValue.toFixed(1)} cm³ (mL)`,
              referenceRange: '30.0 - 90.0 cm³',
              status,
              explanation: volValue > 90 
                ? 'Aumento de volume uterino, correlacionar com miomatose ou adenomiose.' 
                : volValue < 30 
                ? 'Volume uterino reduzido (compatível com hipoplasia ou pós-menopausa).' 
                : 'Volume uterino com dimensões normais.'
            });
          }
        }

        // Endometrio
        if (key.includes('endometro') || key.includes('endometrium')) {
          const esp = struct.measurements.espessura || struct.measurements.thickness || struct.measurements.value;
          if (esp) {
            const val = toMm(esp.value, esp.unit);
            const refMax = 14.0; 
            const status = val > refMax ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Espessura Endometrial',
              valueObtained: `${val.toFixed(1)} mm`,
              referenceRange: `≤ ${refMax.toFixed(1)} mm`,
              status,
              explanation: val > refMax 
                ? 'Espessamento endometrial fora dos parâmetros, correlacionar com fase menstrual ou hiperplasia.' 
                : 'Eco endometrial de espessura e ecotextura normais.'
            });
          }
        }

        // Ovarios
        if (key.includes('ovario') || key.includes('ovary')) {
          const vol = struct.measurements.volume;
          if (vol) {
            const status = vol.value > 9.0 ? 'altered' : 'normal';
            addEvaluation({
              structureName: name,
              parameterLabel: 'Volume Ovariano',
              valueObtained: `${vol.value.toFixed(1)} cm³`,
              referenceRange: '≤ 9.0 cm³',
              status,
              explanation: vol.value > 9.0 
                ? 'Volume ovariano aumentado, suspeita de ovulação ativa, cisto ou ovários policísticos.' 
                : 'Volume ovariano preservado.'
            });
          }
        }
      });
}
