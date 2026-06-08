import { StructureData, NormalityDetail } from '../../types';
import { toMm, formatVal, getPercentileFromZ, getBiometryPercentile, getOfdRef, getEurpRef } from '../normalityCalculatorShared';

export function calculate(
  structures: StructureData[],
  patientGender: 'M' | 'F',
  patientAge: number | undefined,
  addEvaluation: (detail: NormalityDetail) => void,
  insights: string[]
): void {
  insights.push('Iniciando análise multiparamétrica da Função Diastólica de VE de acordo com as Diretrizes ASE Julho 2025.');

      let E_vel: number | undefined;
      let A_vel: number | undefined;
      let EA_ratio: number | undefined;
      let DT: number | undefined;
      
      let e_prime_septal: number | undefined;
      let e_prime_lateral: number | undefined;
      let e_prime_average: number | undefined;
      let ee_prime_ratio_average: number | undefined;
      let ee_prime_ratio_septal: number | undefined;
      
      let lavi: number | undefined;
      let lars: number | undefined;
      let lv_mass_index: number | undefined;
      
      let tr_vel: number | undefined;
      let pasp: number | undefined;
      let ivrt: number | undefined;

      // Aorta & AE Dimensions
      let seios_valsalva: number | undefined;
      let seios_valsalva_index: number | undefined;
      let aorta_ascendente: number | undefined;
      let aorta_ascendente_index: number | undefined;
      let atrio_esquerdo_ap: number | undefined;
      let atrio_esquerdo_ap_index: number | undefined;

      // VE Volumes
      let lvedv: number | undefined;
      let lvedvi: number | undefined;
      let lvesv: number | undefined;
      let lvesvi: number | undefined;

      // VE Linear
      let lvidd: number | undefined;
      let lviddi: number | undefined;
      let lvidd_height: number | undefined;
      let lvids: number | undefined;
      let ivsd: number | undefined;
      let pwd: number | undefined;
      let mve_cubo: number | undefined;
      let mve_altura: number | undefined;
      let rwt: number | undefined;

      // Outros
      let teichholz_fe: number | undefined;
      let base_tricuspide: number | undefined;
      let grad_reg_t: number | undefined;
      let tapse: number | undefined;

      structures.forEach(struct => {
        const m = struct.measurements || {};
        
        if (m.e_vel) E_vel = m.e_vel.value;
        else if (m.e) E_vel = m.e.value;
        
        if (m.a_vel) A_vel = m.a_vel.value;
        else if (m.a) A_vel = m.a.value;
        
        if (m.ea_ratio) EA_ratio = m.ea_ratio.value;
        else if (m.ea) EA_ratio = m.ea.value;
        
        if (m.dt) DT = m.dt.value;
        
        if (m.e_prime_septal) e_prime_septal = m.e_prime_septal.value;
        if (m.e_prime_lateral) e_prime_lateral = m.e_prime_lateral.value;
        if (m.e_prime_average) e_prime_average = m.e_prime_average.value;
        
        if (m.ee_prime_ratio_average) ee_prime_ratio_average = m.ee_prime_ratio_average.value;
        else if (m.ee_prime) ee_prime_ratio_average = m.ee_prime.value;
        if (m.ee_prime_septal) ee_prime_ratio_septal = m.ee_prime_septal.value;

        if (m.lavi) lavi = m.lavi.value;
        if (m.lars) lars = m.lars.value;
        if (m.lv_mass_index) lv_mass_index = m.lv_mass_index.value;
        else if (m.lvmi) lv_mass_index = m.lvmi.value;
        
        if (m.tr_vel) tr_vel = m.tr_vel.value;
        else if (m.tr) tr_vel = m.tr.value;
        else if (m.v_reg_t) tr_vel = m.v_reg_t.value;
        
        if (m.pasp) pasp = m.pasp.value;
        if (m.ivrt) ivrt = m.ivrt.value;

        // Aorta & AE
        if (m.seios_valsalva) seios_valsalva = m.seios_valsalva.value;
        if (m.seios_valsalva_index) seios_valsalva_index = m.seios_valsalva_index.value;
        if (m.aorta_ascendente) aorta_ascendente = m.aorta_ascendente.value;
        if (m.aorta_ascendente_index) aorta_ascendente_index = m.aorta_ascendente_index.value;
        if (m.atrio_esquerdo_ap) atrio_esquerdo_ap = m.atrio_esquerdo_ap.value;
        if (m.atrio_esquerdo_ap_index) atrio_esquerdo_ap_index = m.atrio_esquerdo_ap_index.value;

        // VE Volumes
        if (m.lvedv) lvedv = m.lvedv.value;
        if (m.lvedvi) lvedvi = m.lvedvi.value;
        if (m.lvesv) lvesv = m.lvesv.value;
        if (m.lvesvi) lvesvi = m.lvesvi.value;

        // VE Linear
        if (m.lvidd) lvidd = m.lvidd.value;
        if (m.lviddi) lviddi = m.lviddi.value;
        if (m.lvidd_height) lvidd_height = m.lvidd_height.value;
        if (m.lvids) lvids = m.lvids.value;
        if (m.ivsd) ivsd = m.ivsd.value;
        if (m.pwd) pwd = m.pwd.value;
        if (m.mve_cubo) mve_cubo = m.mve_cubo.value;
        if (m.mve_altura) mve_altura = m.mve_altura.value;
        if (m.rwt) rwt = m.rwt.value;
        else if (m.erp) rwt = m.erp.value;

        // Outros
        if (m.teichholz_fe) teichholz_fe = m.teichholz_fe.value;
        if (m.base_tricuspide) base_tricuspide = m.base_tricuspide.value;
        if (m.grad_reg_t) grad_reg_t = m.grad_reg_t.value;
        if (m.tapse) tapse = m.tapse.value;
      });

      // Conversão inteligente de unidades
      if (tr_vel !== undefined && tr_vel > 10.0) {
        tr_vel = tr_vel / 100.0; // cm/s para m/s, ex: 219 -> 2.19
      }
      if (e_prime_septal !== undefined && e_prime_septal < 1.0) {
        e_prime_septal *= 100.0; // m/s para cm/s, ex: 0.08 -> 8.0
      }
      if (e_prime_lateral !== undefined && e_prime_lateral < 1.0) {
        e_prime_lateral *= 100.0; // m/s para cm/s, ex: 0.11 -> 11.0
      }
      if (e_prime_average !== undefined && e_prime_average < 1.0) {
        e_prime_average *= 100.0;
      }

      // Compilando relações não calculadas explicitamente na extração bruta
      if (E_vel !== undefined && A_vel !== undefined && A_vel > 0) {
        EA_ratio ??= E_vel / A_vel;
      }
      if (e_prime_septal !== undefined && e_prime_lateral !== undefined) {
        e_prime_average ??= (e_prime_septal + e_prime_lateral) / 2;
      }
      if (E_vel !== undefined && e_prime_average !== undefined && e_prime_average > 0) {
        const E_cm = E_vel < 3.0 ? E_vel * 100 : E_vel;
        ee_prime_ratio_average ??= E_cm / e_prime_average;
      }
      if (E_vel !== undefined && e_prime_septal !== undefined && e_prime_septal > 0) {
        const E_cm = E_vel < 3.0 ? E_vel * 100 : E_vel;
        ee_prime_ratio_septal ??= E_cm / e_prime_septal;
      }

      const age = patientAge ?? 45;
      let refGroup = '40-60';
      if (age < 40) refGroup = '20-39';
      else if (age > 60) refGroup = '60-80';

      insights.push(`Paciente de faixa etária ${refGroup} anos (Idade: ${age}). Carregando normativas de percentis populacionais.`);

      if (E_vel !== undefined) {
        let minE = 0.47, maxE = 1.02;
        if (refGroup === '20-39') { minE = 0.54; maxE = 1.11; }
        else if (refGroup === '60-80') { minE = 0.39; maxE = 0.92; }
        
        const isAltered = E_vel < minE || E_vel > maxE;
        addEvaluation({
          structureName: 'Fluxo Mitral (Doppler Pulsado)',
          parameterLabel: 'Velocidade da Onda E',
          valueObtained: `${E_vel.toFixed(2)} m/s`,
          referenceRange: `${minE.toFixed(2)} - ${maxE.toFixed(2)} m/s (Ref: ${refGroup}a)`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Pico sistólico inicial fora da faixa esperada para a idade (${refGroup}a).`
            : `Pico sistólico inicial dentro dos limites normativos para a idade (${refGroup}a).`
        });
      }

      if (A_vel !== undefined) {
        let minA = 0.33, maxA = 0.82;
        if (refGroup === '20-39') { minA = 0.24; maxA = 0.68; }
        else if (refGroup === '60-80') { minA = 0.43; maxA = 0.97; }
        
        const isAltered = A_vel < minA || A_vel > maxA;
        addEvaluation({
          structureName: 'Fluxo Mitral (Doppler Pulsado)',
          parameterLabel: 'Velocidade da Onda A',
          valueObtained: `${A_vel.toFixed(2)} m/s`,
          referenceRange: `${minA.toFixed(2)} - ${maxA.toFixed(2)} m/s (Ref: ${refGroup}a)`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Pico da sístole atrial fora dos limites saudáveis para a idade (${refGroup}a).`
            : `Sístole atrial ativa fisiológica para a idade (${refGroup}a).`
        });
      }

      if (EA_ratio !== undefined) {
        let minEA = 0.69, maxEA = 2.07;
        if (refGroup === '20-39') { minEA = 0.88; maxEA = 2.73; }
        else if (refGroup === '60-80') { minEA = 0.50; maxEA = 1.40; }
        
        const isAltered = EA_ratio < minEA || EA_ratio > maxEA;
        addEvaluation({
          structureName: 'Fluxo Mitral (Doppler Pulsado)',
          parameterLabel: 'Relação E/A',
          valueObtained: EA_ratio.toFixed(2),
          referenceRange: `${minEA.toFixed(2)} - ${maxEA.toFixed(2)} (Ref: ${refGroup}a)`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Relação E/A alterada (${EA_ratio.toFixed(2)}). Menor que o limite sugere relaxamento decrescente. Maior que o limite pode denotar fluxo hiperdinâmico ou pseudonormalização.`
            : `Relação E/A conservada para a faixa etária (${refGroup}a).`
        });
      }

      if (e_prime_average !== undefined) {
        let minEprime = 6.7;
        if (refGroup === '20-39') minEprime = 8.7;
        else if (refGroup === '60-80') minEprime = 4.7;
        
        const isAltered = e_prime_average < minEprime;
        addEvaluation({
          structureName: 'Anel Mitral (TDI)',
          parameterLabel: 'Velocidade e\' Média',
          valueObtained: `${e_prime_average.toFixed(1)} cm/s`,
          referenceRange: `≥ ${minEprime.toFixed(1)} cm/s (Ref: ${refGroup}a)`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Velocidade tecidual do anel reduzida, indicando de forma precoce relaxamento ventricular lentificado.`
            : `Velocidade tecidual média do anel robusta e preservada.`
        });
      }

      if (ee_prime_ratio_average !== undefined) {
        let maxEE = 11.5;
        if (refGroup === '20-39') maxEE = 9.1;
        else if (refGroup === '60-80') maxEE = 14.0;
        
        const isAltered = ee_prime_ratio_average > 14.0;
        const status = ee_prime_ratio_average > 14.0 ? 'altered' : (ee_prime_ratio_average > maxEE ? 'borderline' : 'normal');
        addEvaluation({
          structureName: 'Anel Mitral (TDI)',
          parameterLabel: 'Relação E/e\' Média',
          valueObtained: ee_prime_ratio_average.toFixed(1),
          referenceRange: `≤ 14.0 (Aceitável por idade: ≤ ${maxEE.toFixed(1)})`,
          status,
          explanation: ee_prime_ratio_average > 14.0
            ? `Relação E/e' de ${ee_prime_ratio_average.toFixed(1)} é superior ao limite crítico do consenso de 14.0, correlacionando-se intimamente com pressões atriais esquerdas aumentadas.`
            : `Relação E/e' normal de ${ee_prime_ratio_average.toFixed(1)}, sugerindo pressões de enchimento normais a repouso.`
        });
      }

      if (lavi !== undefined) {
        const isAltered = lavi > 34.0;
        addEvaluation({
          structureName: 'Remodelamento de AE',
          parameterLabel: 'Índice de Volume de AE (LAVi)',
          valueObtained: `${lavi.toFixed(1)} mL/m²`,
          referenceRange: `≤ 34.0 mL/m² (Limiar Crítico)`,
          status: isAltered ? 'altered' : 'normal',
          explanation: isAltered
            ? `Volume atrial esquerdo aumentado (${lavi.toFixed(1)} mL/m²), indicando remodelamento anatômico crônico decorrente de pressões atriais esquerdas cronicamente aumentadas.`
            : `Dimensões e volume do átrio esquerdo normais.`
        });
      }

      if (lars !== undefined) {
        let minLars = 26.8;
        if (refGroup === '20-39') minLars = 29.5;
        else if (refGroup === '60-80') minLars = 24.1;
        
        const isAltered = lars <= 18.0;
        const isBorderline = !isAltered && lars < minLars;
        const status = isAltered ? 'altered' : (isBorderline ? 'borderline' : 'normal');
        addEvaluation({
          structureName: 'Remodelamento de AE',
          parameterLabel: 'Strain Reservatório Atrial (LARS)',
          valueObtained: `${lars.toFixed(1)}%`,
          referenceRange: `> 18.0% (Saudável por idade: ≥ ${minLars.toFixed(1)}%)`,
          status,
          explanation: lars <= 18.0
            ? `LARS severamente reduzido de ${lars.toFixed(1)}% (≤ 18%), marcador altamente específico do consenso de 2025 para disfunção diastólica e aumento agudo de pressões.`
            : isBorderline 
            ? `Strain de reservatório do AE levemente reduzido para a idade.`
            : `Strain reservatório do AE plenamente íntegro e normal.`
        });
      }

      if (tr_vel !== undefined) {
        const isAltered = tr_vel >= 2.8;
        addEvaluation({
          structureName: 'Hemodinâmica Pulmonar',
          parameterLabel: 'Velocidade do Refluxo Tricúspide (TR)',
          valueObtained: `${tr_vel.toFixed(2)} m/s`,
          referenceRange: `< 2.80 m/s`,
          status: isAltered ? 'altered' : 'normal',
          explanation: isAltered
            ? `Velocidade da regurgitação tricúspide de ${tr_vel.toFixed(2)} m/s (≥ 2.8 m/s), indicativa de hipertensão pulmonar retrógrada passiva secundária às pressões esquerdas críticas.`
            : `Velocidade tricúspide dentro da faixa normal, indicando padrão pressórico pulmonar normal.`
        });
      }

      // --- EXTRA PARAMETERS VALUATION MATCHING CLINICA VIVARE REPORT ---
      const gender = patientGender || 'female';

      // 1. AORTA & ÁTRIO ESQUERDO
      if (seios_valsalva !== undefined) {
        const limitRange = gender === 'female' ? { min: 26, max: 37 } : { min: 30, max: 40 };
        const isAltered = seios_valsalva < limitRange.min || seios_valsalva > limitRange.max;
        addEvaluation({
          structureName: 'Aorta',
          parameterLabel: 'Seios de Valsalva',
          valueObtained: `${seios_valsalva.toFixed(1)} mm`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Dimensão dos seios de Valsalva fora da faixa de referência habitual de ${limitRange.min}-${limitRange.max} mm.`
            : `Dimensão dos seios de Valsalva conservada.`
        });
      }

      if (seios_valsalva_index !== undefined) {
        const isAltered = seios_valsalva_index > 22.0 || seios_valsalva_index < 1.0;
        addEvaluation({
          structureName: 'Aorta',
          parameterLabel: 'Seios de Valsalva (Indexados)',
          valueObtained: `${seios_valsalva_index.toFixed(1)} ${seios_valsalva_index > 10 ? 'mm/m²' : 'cm/m²'}`,
          referenceRange: seios_valsalva_index > 10 ? '15.0 - 21.0 mm/m²' : '1.5 - 2.1 cm/m²',
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Relação dos seios de Valsalva indexados pela superfície corporal do paciente.`
        });
      }

      if (aorta_ascendente !== undefined) {
        const limitMax = gender === 'female' ? 36.0 : 38.0;
        const isAltered = aorta_ascendente > limitMax;
        addEvaluation({
          structureName: 'Aorta',
          parameterLabel: 'Aorta Ascendente',
          valueObtained: `${aorta_ascendente.toFixed(1)} mm`,
          referenceRange: `≤ ${limitMax.toFixed(1)} mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Dilatação discreta na aorta ascendente (diâmetro de ${aorta_ascendente.toFixed(1)} mm).`
            : `Aorta ascendente de calibre conservado.`
        });
      }

      if (aorta_ascendente_index !== undefined) {
        addEvaluation({
          structureName: 'Aorta',
          parameterLabel: 'Aorta Ascendente (Indexada)',
          valueObtained: `${aorta_ascendente_index.toFixed(1)} ${aorta_ascendente_index > 10 ? 'mm/m²' : 'cm/m²'}`,
          referenceRange: aorta_ascendente_index > 10 ? '15.0 - 18.0 mm/m²' : '1.5 - 1.8 cm/m²',
          status: 'normal',
          explanation: `Calibre da aorta ascendente proporcionalizado.`
        });
      }

      if (atrio_esquerdo_ap !== undefined) {
        const limitRange = gender === 'female' ? { min: 27, max: 38 } : { min: 30, max: 40 };
        const isAltered = atrio_esquerdo_ap < limitRange.min || atrio_esquerdo_ap > limitRange.max;
        addEvaluation({
          structureName: 'Átrio Esquerdo',
          parameterLabel: 'Diâmetro Ântero-Posterior',
          valueObtained: `${atrio_esquerdo_ap.toFixed(1)} mm`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Átrio Esquerdo antero-posterior aumentado (${atrio_esquerdo_ap.toFixed(1)} mm).`
            : `Dimensão antero-posterior de átrio esquerdo normal.`
        });
      }

      if (atrio_esquerdo_ap_index !== undefined) {
        const isAltered = atrio_esquerdo_ap_index > 22.0 || atrio_esquerdo_ap_index < 1.0; 
        addEvaluation({
          structureName: 'Átrio Esquerdo',
          parameterLabel: 'Diâmetro AP (Indexador)',
          valueObtained: `${atrio_esquerdo_ap_index.toFixed(1)} ${atrio_esquerdo_ap_index > 10 ? 'mm/m²' : 'cm/m²'}`,
          referenceRange: atrio_esquerdo_ap_index > 10 ? '≤ 23.0 mm/m²' : '≤ 2.3 cm/m²',
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Proporção indexada de diâmetro AP do átrio esquerdo.`
        });
      }

      // 2. V.E. DIMENSÕES LINEARES
      if (lvidd !== undefined) {
        const limitRange = gender === 'female' ? { min: 38.0, max: 52.2 } : { min: 42.0, max: 58.4 };
        const isAltered = lvidd < limitRange.min || lvidd > limitRange.max;
        addEvaluation({
          structureName: 'Ventrículo Esquerdo (Medidas Lineares)',
          parameterLabel: 'Diâmetro Diastólico (LVIDd)',
          valueObtained: `${lvidd.toFixed(1)} mm`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Dimensão diastólica da câmara do VE fora da faixa ideal de referência de ${limitRange.min}-${limitRange.max} mm.`
            : `Diâmetro diastólico do VE conservado.`
        });
      }

      if (lviddi !== undefined) {
        const isAltered = lviddi > 3.2 && lviddi <= 10 ? true : (lviddi > 32);
        addEvaluation({
          structureName: 'Ventrículo Esquerdo (Medidas Lineares)',
          parameterLabel: 'Diâmetro Diastólico (Index)',
          valueObtained: `${lviddi.toFixed(1)} ${lviddi > 10 ? 'mm/m²' : 'cm/m²'}`,
          referenceRange: lviddi > 10 ? '≤ 32.0 mm/m²' : '≤ 3.2 cm/m²',
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Diâmetro diastólico de VE proporcional pela superfície corporal.`
        });
      }

      if (lvidd_height !== undefined) {
        const isAltered = lvidd_height > 33.0;
        addEvaluation({
          structureName: 'Ventrículo Esquerdo (Medidas Lineares)',
          parameterLabel: 'Diâmetro Diastólico / Altura',
          valueObtained: `${lvidd_height.toFixed(1)} mm/m`,
          referenceRange: `≤ 33.0 mm/m`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Relação diastólica proporcional à altura linear do paciente.`
        });
      }

      if (lvids !== undefined) {
        const limitRange = gender === 'female' ? { min: 21.6, max: 34.8 } : { min: 25.0, max: 40.0 };
        const isAltered = lvids < limitRange.min || lvids > limitRange.max;
        addEvaluation({
          structureName: 'Ventrículo Esquerdo (Medidas Lineares)',
          parameterLabel: 'Diâmetro Sistólico (LVIDs)',
          valueObtained: `${lvids.toFixed(1)} mm`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Dimensão sistólica de VE fora do esperado faixa de ${limitRange.min}-${limitRange.max} mm.`
            : `Diâmetro sistólico de VE conservado.`
        });
      }

      if (ivsd !== undefined) {
        const limitRange = { min: 6.0, max: 10.0 };
        const isAltered = ivsd < limitRange.min || ivsd > limitRange.max;
        addEvaluation({
          structureName: 'Ventrículo Esquerdo (Medidas Lineares)',
          parameterLabel: 'Espessura do Septo (IVSd)',
          valueObtained: `${ivsd.toFixed(1)} mm`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Espessura do septo interventricular aumentada (${ivsd.toFixed(1)} mm), indicando hipertrofia parietal.`
            : `Espessura do septo interventricular normal.`
        });
      }

      if (pwd !== undefined) {
        const limitRange = { min: 6.0, max: 10.0 };
        const isAltered = pwd < limitRange.min || pwd > limitRange.max;
        addEvaluation({
          structureName: 'Ventrículo Esquerdo (Medidas Lineares)',
          parameterLabel: 'Parede Posterior Diastólica (PWd)',
          valueObtained: `${pwd.toFixed(1)} mm`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Espessura da parede posterior aumentada (${pwd.toFixed(1)} mm).`
            : `Espessura da parede posterior de VE normal.`
        });
      }

      if (mve_cubo !== undefined) {
        const limitMax = gender === 'female' ? 162.0 : 224.0;
        const isAltered = mve_cubo > limitMax;
        addEvaluation({
          structureName: 'Cálculo de Massa do VE',
          parameterLabel: 'Massa de VE (Cubo / ASE)',
          valueObtained: `${mve_cubo.toFixed(1)} g`,
          referenceRange: `≤ ${limitMax.toFixed(1)} g`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Massa do ventrículo esquerdo absoluta aumentada (${mve_cubo.toFixed(1)} g).`
            : `Massa ventricular esquerda absoluta normal.`
        });
      }

      if (lv_mass_index !== undefined) {
        const limitMax = gender === 'female' ? 95.0 : 115.0;
        const isAltered = lv_mass_index > limitMax;
        addEvaluation({
          structureName: 'Cálculo de Massa do VE',
          parameterLabel: 'Índice de Massa de VE (LVMi)',
          valueObtained: `${lv_mass_index.toFixed(1)} g/m²`,
          referenceRange: `≤ ${limitMax.toFixed(1)} g/m²`,
          status: isAltered ? 'altered' : 'normal',
          explanation: isAltered 
            ? `Hipertrofia Ventricular Esquerda confirmada por índice de massa aumentado de ${lv_mass_index.toFixed(1)} g/m².`
            : `Índice de massa ventricular normal.`
        });
      }

      if (mve_altura !== undefined) {
        const limitMax = gender === 'female' ? 110.0 : 121.0;
        const isAltered = mve_altura > limitMax;
        addEvaluation({
          structureName: 'Cálculo de Massa do VE',
          parameterLabel: 'Massa de VE / Altura',
          valueObtained: `${mve_altura.toFixed(1)} g/cm`,
          referenceRange: `≤ ${limitMax.toFixed(1)} g/cm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Proporção de massa de VE indexada à altura.`
        });
      }

      if (rwt !== undefined) {
        const isAltered = rwt > 0.42;
        let geometryText = "Geometria Normal";
        let geomStatus: 'normal' | 'borderline' | 'altered' = 'normal';
        if (rwt > 0.42) {
          const isMassElevated = lv_mass_index ? (lv_mass_index > (gender === 'female' ? 95.0 : 115.0)) : false;
          if (isMassElevated) {
            geometryText = "Hipertrofia Concêntrica de VE";
            geomStatus = 'altered';
          } else {
            geometryText = "Remodelamento Concêntrico de VE";
            geomStatus = 'borderline';
          }
        } else {
          const isMassElevated = lv_mass_index ? (lv_mass_index > (gender === 'female' ? 95.0 : 115.0)) : false;
          if (isMassElevated) {
            geometryText = "Hipertrofia Excêntrica de VE";
            geomStatus = 'altered';
          }
        }

        addEvaluation({
          structureName: 'Geometria Ventricular',
          parameterLabel: 'Espessura Relativa da Parede (ERP / RWT)',
          valueObtained: `${rwt.toFixed(2)}`,
          referenceRange: `≤ 0.42`,
          status: geomStatus,
          explanation: `ERP de ${rwt.toFixed(2)} classifica o VE como: **${geometryText}**.`
        });
      }

      // 3. VE VOLUMES e FUNÇÃO SISTÓLICA
      if (lvedv !== undefined) {
        const limitRange = gender === 'female' ? { min: 56.0, max: 104.0 } : { min: 62.0, max: 150.0 };
        const isAltered = lvedv < limitRange.min || lvedv > limitRange.max;
        addEvaluation({
          structureName: 'VE Volumes (Teichholz)',
          parameterLabel: 'Vol Diastólico Final VE (LVEDV)',
          valueObtained: `${lvedv.toFixed(1)} mL`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mL`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Volume diastólico final acumulado pelo ventrículo esquerdo.`
        });
      }

      if (lvedvi !== undefined) {
        const isAltered = lvedvi > 90.0;
        addEvaluation({
          structureName: 'VE Volumes (Teichholz)',
          parameterLabel: 'Vol Diastólico Final Index (LVEDVi)',
          valueObtained: `${lvedvi.toFixed(1)} mL/m²`,
          referenceRange: `≤ 90.0 mL/m²`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Volume diastólico do VE indexado.`
        });
      }

      if (lvesv !== undefined) {
        const limitRange = gender === 'female' ? { min: 20.0, max: 50.0 } : { min: 21.0, max: 61.0 };
        const isAltered = lvesv < limitRange.min || lvesv > limitRange.max;
        addEvaluation({
          structureName: 'VE Volumes (Teichholz)',
          parameterLabel: 'Vol Sistólico Final VE (LVESV)',
          valueObtained: `${lvesv.toFixed(1)} mL`,
          referenceRange: `${limitRange.min.toFixed(1)} - ${limitRange.max.toFixed(1)} mL`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Volume sistólico final acumulado pelo ventrículo esquerdo.`
        });
      }

      if (lvesvi !== undefined) {
        const isAltered = lvesvi > 35.0;
        addEvaluation({
          structureName: 'VE Volumes (Teichholz)',
          parameterLabel: 'Vol Sistólico Final Index (LVESVi)',
          valueObtained: `${lvesvi.toFixed(1)} mL/m²`,
          referenceRange: `≤ 35.0 mL/m²`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: `Volume residual do VE indexado.`
        });
      }

      if (teichholz_fe !== undefined) {
        const isAltered = teichholz_fe < 52.0;
        addEvaluation({
          structureName: 'Função Sistólica Global',
          parameterLabel: 'Fração de Ejeção (Teichholz)',
          valueObtained: `${teichholz_fe.toFixed(1)}%`,
          referenceRange: `≥ 52.0%`,
          status: isAltered ? 'altered' : 'normal',
          explanation: isAltered 
            ? `Disfunção sistólica global discreta de VE (FE de ${teichholz_fe.toFixed(1)}% < 52%).`
            : `Fração de ejeção sistólica global de VE preservada (${teichholz_fe.toFixed(1)}%).`
        });
      }

      // 4. CORAÇÃO DIREITO E OUTRAS PRESSÕES
      if (base_tricuspide !== undefined) {
        const isAltered = base_tricuspide > 41.0;
        addEvaluation({
          structureName: 'Coração Direito',
          parameterLabel: 'Base Tricúspide (Diâmetro do VD)',
          valueObtained: `${base_tricuspide.toFixed(1)} mm`,
          referenceRange: `≤ 41.0 mm`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Dimensão basal de ventrículo direito dilatada (${base_tricuspide.toFixed(1)} mm).`
            : `Dimensão do ventrículo direito basal dentro dos limites da normalidade.`
        });
      }

      if (grad_reg_t !== undefined) {
        const isAltered = grad_reg_t >= 31.0;
        addEvaluation({
          structureName: 'Hemodinâmica Pulmonar',
          parameterLabel: 'Gradiente Regurgitação Tricúspide (GradRegT)',
          valueObtained: `${grad_reg_t.toFixed(1)} mmHg`,
          referenceRange: `< 31.0 mmHg`,
          status: isAltered ? 'borderline' : 'normal',
          explanation: isAltered 
            ? `Gradiente máximo sob regurgitação tricúspide elevado (${grad_reg_t.toFixed(1)} mmHg).`
            : `Gradiente máximo sob regurgitação tricúspide normal.`
        });
      }

      if (tapse !== undefined) {
        const isAltered = tapse < 17.0;
        addEvaluation({
          structureName: 'Coração Direito',
          parameterLabel: 'Excursão Sistólica do Anel Tricúspide (TAPSE)',
          valueObtained: `${tapse.toFixed(1)} mm`,
          referenceRange: `≥ 17.0 mm`,
          status: isAltered ? 'altered' : 'normal',
          explanation: isAltered 
            ? `Redução da função sistólica de VD (TAPSE ${tapse.toFixed(1)} mm < 17.0 mm).`
            : `Função sistólica longitudinal de VD (TAPSE) preservada.`
        });
      }

      // Executar lógica programática do Consenso ASE Julho 2025 para graduação da Função Diastólica e LAP
      let impairedRelaxation = false;
      if (e_prime_average !== undefined && e_prime_average <= 6.5) impairedRelaxation = true;
      if (e_prime_septal !== undefined && e_prime_septal <= 6.0) impairedRelaxation = true;
      if (e_prime_lateral !== undefined && e_prime_lateral <= 7.0) impairedRelaxation = true;

      // Classificar parâmetros do Step 2 (Marcadores de LAP elevada):
      let larsAbnormal = lars !== undefined && lars <= 18.0;
      let e_ep_Abnormal = ee_prime_ratio_average !== undefined && ee_prime_ratio_average > 14.0;
      let laviAbnormal = lavi !== undefined && lavi > 34.0;
      let eaAbnormal = EA_ratio !== undefined && (EA_ratio <= 0.8 || EA_ratio >= 2.0);
      let trAbnormal = tr_vel !== undefined && tr_vel >= 2.8;

      let scoreStep2 = 0;
      let totalMarkersChecked = 0;
      if (ee_prime_ratio_average !== undefined) { totalMarkersChecked++; if (e_ep_Abnormal) scoreStep2++; }
      if (lars !== undefined) { totalMarkersChecked++; if (larsAbnormal) scoreStep2++; }
      if (lavi !== undefined) { totalMarkersChecked++; if (laviAbnormal) scoreStep2++; }
      if (EA_ratio !== undefined) { totalMarkersChecked++; if (eaAbnormal) scoreStep2++; }
      if (tr_vel !== undefined) { totalMarkersChecked++; if (trAbnormal) scoreStep2++; }

      let diastolicGrade = 'Indeterminado';
      let laPressure = 'Indeterminada';
      let managementPlan = '';
      let priorityClass = 'normal';
      let logicPath = '';

      const countAbnormalMain = (impairedRelaxation ? 1 : 0) + (e_ep_Abnormal ? 1 : 0) + (trAbnormal ? 1 : 0);

      if (countAbnormalMain === 0) {
        diastolicGrade = 'Função Diastólica Normal';
        laPressure = 'Pressão Atrial Normal (LAP Normal)';
        priorityClass = 'normal';
        managementPlan = 'Manutenção do acompanhamento preventivo regular. Sem sinais de congestão pulmonar ou remodelamento celular.';
        logicPath = 'Todos os 3 parâmetros fundamentais normativos (e\', E/e\', velocidade TR) encontram-se preservados.';
      } else if (countAbnormalMain === 1 && impairedRelaxation) {
        if (EA_ratio !== undefined && EA_ratio <= 0.8) {
          diastolicGrade = 'Disfunção Diastólica Grau 1';
          laPressure = 'Pressão Atrial Normal (LAP Normal)';
          priorityClass = 'borderline';
          managementPlan = 'Relaxamento ventricular lenificado. Controle rígido de fatores cardiometabólicos de base e Hipertensão.';
          logicPath = 'Apenas relaxamento tecidual alterado, mas com influxo mitral E/A ≤ 0.8 e ausência de congestão atrial.';
        } else {
          let hasAdditional = larsAbnormal || laviAbnormal || (ivrt !== undefined && ivrt <= 70.0);
          if (!hasAdditional) {
            diastolicGrade = 'Disfunção Diastólica Grau 1';
            laPressure = 'Pressão Atrial Normal (LAP Normal)';
            priorityClass = 'borderline';
            managementPlan = 'Relaxamento lenificado inicial. Seguir vigilância clínica de sintomas de cansaço aos esforços.';
            logicPath = 'Anel tecidual com relaxamento tardio, mas sem preencher nenhum marcador de pressão atrial ou volume cronicamente aumentados.';
          } else {
            priorityClass = 'altered';
            managementPlan = 'Disfunção diastólica significativa com elevação pressórica. Tratamento clínico otimizado de HFpEF com Inibidores de SGLT2 (Empagliflozina ou Dapagliflozina) e controle de congestão facultativo.';
            if (EA_ratio !== undefined && EA_ratio < 2.0) {
              diastolicGrade = 'Disfunção Diastólica Grau 2';
              laPressure = 'Pressão Atrial Aumentada (LAP Elevada)';
              logicPath = 'Relaxamento tecidual alterado associado a marcadores adicionais positivos (remodelamento de AE ou LARS crítico). Relação E/A < 2.0 caracteriza Grau 2.';
            } else {
              diastolicGrade = 'Disfunção Diastólica Grau 3';
              laPressure = 'Pressão Atrial Aumentada (LAP Elevada)';
              logicPath = 'Relaxamento tecidual alterado acompanhado por preenchimento severo de volume sob estresse. Relação E/A ≥ 2.0 define Grau 3 (Restritivo).';
            }
          }
        }
      } else if (countAbnormalMain >= 3) {
        priorityClass = 'altered';
        laPressure = 'Pressão Atrial Aumentada (LAP Elevada)';
        managementPlan = 'Instituir protocolo de tratamento para IC com Fração de Ejeção Preservada (HFpEF) - Classe I (Inibidores SGLT2), controle de volume com diuréticos de alça e vigilância periódica.';
        if (EA_ratio !== undefined && EA_ratio >= 2.0) {
          diastolicGrade = 'Disfunção Diastólica Grau 3';
          logicPath = 'Presença de todos os 3 parâmetros patológicos principais com inversão extrema de fluxo mitral (E/A ≥ 2.0), definindo Grau 3 restritivo.';
        } else {
          diastolicGrade = 'Disfunção Diastólica Grau 2';
          logicPath = 'Os 3 pilares diagnósticos chave estão alterados simultaneamente (e\' reduzido, E/e\' elevado, TR elevado), definindo Grau 2.';
        }
      } else {
        let hasAdditional = larsAbnormal || laviAbnormal || (ivrt !== undefined && ivrt <= 70.0);
        if (hasAdditional) {
          priorityClass = 'altered';
          laPressure = 'Pressão Atrial Aumentada (LAP Elevada)';
          managementPlan = 'Iniciar iSGLT2 para prevenção de reinternações por HFpEF, rastrear comorbidades associadas de sístole e otimização pressórica estrita.';
          if (EA_ratio !== undefined && EA_ratio >= 2.0) {
            diastolicGrade = 'Disfunção Diastólica Grau 3';
            logicPath = 'Disfunção avançada baseada em 2 parâmetros chave positivos sustentados por deformidade estrutural de AE (LARS/LAVi). Influxo restritivo (E/A ≥ 2.0) indica Grau 3.';
          } else {
            diastolicGrade = 'Disfunção Diastólica Grau 2';
            logicPath = 'Evidência de sobrecarga de pressão sustentada por remodelamento secundário de AE (Volume volumétrico ou LARS críticos). Determina Grau 2.';
          }
        } else {
          priorityClass = 'borderline';
          laPressure = 'Pressão Atrial Normal (LAP Normal)';
          managementPlan = 'Manter controle clínico de fatores hemodinâmicos. Realizar ecocardiograma sob estresse diastólico físico se houver dispneia aos esforços inexplicada.';
          if (impairedRelaxation) {
            diastolicGrade = 'Disfunção Diastólica Grau 1';
            logicPath = 'Critérios de pressão limítrofes, mas sem sinais de sobrecarga crônica de volume ou complacência de AE (LARS e LAVi normais). Caracteriza disfunção Grau 1.';
          } else {
            diastolicGrade = 'Função Diastólica Preservada de VE';
            logicPath = 'Alterações hemodinâmicas esporádicas de velocidades sem sinais de remodelamento orgânico real de átrio ou relaxamento alterado de VE.';
          }
        }
      }

      insights.push(`Resultado da análise programática: ${diastolicGrade} | ${laPressure}.`);
      insights.push(`Caminho lógico trilhado: ${logicPath}`);

      addEvaluation({
        structureName: 'Síntese de Função Diastólica (ASE 2025)',
        parameterLabel: 'Diagnóstico & Pressão Atrial Esquerda (LAP)',
        valueObtained: `${diastolicGrade} (${laPressure})`,
        referenceRange: 'Função Normal & Pressão Atrial Normal',
        status: priorityClass as any,
        explanation: `Laudo Estruturado e Conclusivo (Consenso ASE Julho 2025):\n` +
          `- **Classificação**: ${diastolicGrade}\n` +
          `- **Status de Pressão (LAP)**: ${laPressure}\n` +
          `- **Caminho Decisório**: ${logicPath}\n` +
          `- **Score dos Marcadores do Step 2**: ${scoreStep2} positivo(s) de ${totalMarkersChecked} avaliados.\n\n` +
          `Planejamento Clínico Orientado por Diretrizes:\n` +
          `- ${managementPlan}`
      });
}
