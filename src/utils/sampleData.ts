import { StudyType, StructureData } from '../types';

export interface ClinicalCase {
  id: string;
  title: string;
  description: string;
  studyType: StudyType;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  // Standard preset of structures and measurements that simulator can load instantly
  presetData: StructureData[];
  imageUrl: string; // Base64 or placeholder representing an ultrasound exam monitor
}

export const sampleCases: ClinicalCase[] = [
  {
    id: 'thyroid-case-1',
    title: 'Caso A: Bócio Tireoidiano de Lobo Direito',
    description: 'Bócio glandular assimétrico às custas de aumento expressivo do lobo direito com volume global excedendo o teto fisiológico de referência.',
    studyType: 'thyroid',
    patientName: 'Mariana de Souza Neves',
    patientAge: 46,
    patientGender: 'F',
    presetData: [
      {
        name: 'Lobo Direito da Tireoide',
        key: 'right_lobe',
        measurements: {
          comprimento: { value: 6.2, unit: 'cm', label: 'Comprimento (Eixo Longitudinal)' },
          largura: { value: 3.1, unit: 'cm', label: 'Largura (Eixo Transversal)' },
          espessura: { value: 2.8, unit: 'cm', label: 'Espessura (Eixo Anteroposterior)' }
        }
      },
      {
        name: 'Lobo Esquerdo da Tireoide',
        key: 'left_lobe',
        measurements: {
          comprimento: { value: 4.1, unit: 'cm', label: 'Comprimento (Eixo Longitudinal)' },
          largura: { value: 1.8, unit: 'cm', label: 'Largura (Eixo Transversal)' },
          espessura: { value: 1.5, unit: 'cm', label: 'Espessura (Eixo Anteroposterior)' }
        }
      },
      {
        name: 'Ístmo Tireoidiano',
        key: 'isthmus',
        measurements: {
          espessura: { value: 3.5, unit: 'mm', label: 'Espessura/Diâmetro AP' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'renal-case-2',
    title: 'Caso B: Nefropatia Crônica com Assimetria Renal Unilateral',
    description: 'Assimetria acentuada de comprimento longitudinal com importante redução volumétrica e adelgaçamento do parênquima à esquerda.',
    studyType: 'renal',
    patientName: 'Roberto Alves de Oliveira',
    patientAge: 62,
    patientGender: 'M',
    presetData: [
      {
        name: 'Rim Direito',
        key: 'right_kidney',
        measurements: {
          comprimento: { value: 108.0, unit: 'mm', label: 'Comprimento Longitudinal' },
          largura: { value: 45.0, unit: 'mm', label: 'Largura Renal' },
          espessura_ap: { value: 38.0, unit: 'mm', label: 'Espessura Renal AP' },
          parenquima: { value: 16.0, unit: 'mm', label: 'Espessura Parenquimatosa' }
        }
      },
      {
        name: 'Rim Esquerdo',
        key: 'left_kidney',
        measurements: {
          comprimento: { value: 82.0, unit: 'mm', label: 'Comprimento Longitudinal' },
          largura: { value: 32.0, unit: 'mm', label: 'Largura Renal' },
          espessura_ap: { value: 25.0, unit: 'mm', label: 'Espessura Renal AP' },
          parenquima: { value: 8.5, unit: 'mm', label: 'Espessura Parenquimatosa' }
        }
      },
      {
        name: 'Bexiga Urinária (Parede)',
        key: 'bladder_wall',
        measurements: {
          parede: { value: 3.2, unit: 'mm', label: 'Espessura da Parede' }
        }
      },
      {
        name: 'Bexiga Urinária (Resíduo)',
        key: 'post_void_residual',
        measurements: {
          residuo: { value: 5.0, unit: 'mL', label: 'Resíduo Pós-Miccional' }
        }
      },
      {
        name: 'Bexiga Urinária (Volume/Capacidade)',
        key: 'bladder_volume',
        measurements: {
          volume: { value: 450.0, unit: 'mL', label: 'Capacidade Vesical Total' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gallbladder-case-3',
    title: 'Caso C: Colecistite Crônica Calculosa c/ Espessamento Parietal',
    description: 'Vesícula biliar contraída exibindo espessamento acentuado de suas paredes (parede > 3.0 mm) concomitante a cálculos livres.',
    studyType: 'gallbladder_liver',
    patientName: 'Clarice Mendes Figueira',
    patientAge: 39,
    patientGender: 'F',
    presetData: [
      {
        name: 'Parede da Vesícula Biliar',
        key: 'gallbladder_wall',
        measurements: {
          espessura: { value: 2.2, unit: 'mm', label: 'Espessura da Parede' }
        }
      },
      {
        name: 'Lobo Hepático Direito (Fígado)',
        key: 'liver_size',
        measurements: {
          comprimento: { value: 13.8, unit: 'cm', label: 'Eixo Longitudinal Hemiclavicular' }
        }
      },
      {
        name: 'Via Biliar Principal (Colédoco)',
        key: 'common_bile_duct',
        measurements: {
          diametro: { value: 4.8, unit: 'mm', label: 'Diâmetro Interno do Colédoco' }
        }
      },
      {
        name: 'Baço (Spleen)',
        key: 'spleen',
        measurements: {
          comprimento: { value: 115.0, unit: 'mm', label: 'Comprimento Longitudinal' },
          largura: { value: 58.0, unit: 'mm', label: 'Largura Esplênica' },
          espessura: { value: 36.0, unit: 'mm', label: 'Espessura Esplênica' }
        }
      },
      {
        name: 'Pâncreas',
        key: 'pancreas',
        measurements: {
          cabeca: { value: 2.2, unit: 'cm', label: 'Cabeça do Pâncreas' },
          corpo: { value: 1.4, unit: 'cm', label: 'Corpo do Pâncreas' },
          cauda: { value: 1.6, unit: 'cm', label: 'Cauda do Pâncreas' },
          ducto: { value: 1.2, unit: 'mm', label: 'Ducto de Wirsung' }
        }
      },
      {
        name: 'Veia Porta',
        key: 'portal_vein',
        measurements: {
          diametro: { value: 11.5, unit: 'mm', label: 'Diâmetro da Veia Porta' }
        }
      },
      {
        name: 'Veia Esplênica',
        key: 'splenic_vein',
        measurements: {
          diametro: { value: 7.8, unit: 'mm', label: 'Diâmetro da Veia Esplênica' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'obstetric-case-4',
    title: 'Caso D: Primeiro Trimestre com Bradicardia Fetal & VV Alargada',
    description: 'Gestação inicial de alto risco apresentando feto único viável com frequência correspondendo a bradicardia fetal moderada a severa e vesícula vitelina hidrópica.',
    studyType: 'obstetric',
    patientName: 'Ana Cláudia Prestes',
    patientAge: 29,
    patientGender: 'F',
    presetData: [
      {
        name: 'Feto (Idade Gestacional)',
        key: 'ccn',
        measurements: {
          comprimento: { value: 16.5, unit: 'mm', label: 'Comprimento Cabeça-Nádega (CCN)' }
        }
      },
      {
        name: 'Frequência Cardíaca Fetal',
        key: 'fcf',
        measurements: {
          frequencia: { value: 148.0, unit: 'bpm', label: 'Batimentos Cardíacos (FCF)' }
        }
      },
      {
        name: 'Vesícula Vitelina',
        key: 'yolk_sac',
        measurements: {
          diametro: { value: 4.2, unit: 'mm', label: 'Diâmetro Interno Médio (VV)' }
        }
      },
      {
        name: 'Translucência Nucal',
        key: 'nuchal_translucency',
        measurements: {
          espessura: { value: 1.5, unit: 'mm', label: 'Espessura da Translucência Nucal' }
        }
      },
      {
        name: 'Osso Nasal',
        key: 'nasal_bone_1t',
        measurements: {
          presenca: { value: 0, unit: 'code', label: 'Presença do Osso Nasal (0:Pres, 1:Aus)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'fgr-case-5',
    title: 'Caso E (Barcelona): Pequeno Constitucional (SGA)',
    description: 'Gestação de 34 semanas. Peso fetal estimado reduzido (Percentil 3-10), porém todos os índices de fluxo Doppler (Umbilical, Cerebral, Duto Venoso) e diástole estão estritamente normais.',
    studyType: 'fgr_barcelona',
    patientName: 'Gabriela Vasconcelos',
    patientAge: 31,
    patientGender: 'F',
    presetData: [
      {
        name: 'Idade Gestacional',
        key: 'gestational_age',
        measurements: {
          weeks: { value: 34, unit: 'sem', label: 'Semanas de Gestação' },
          days: { value: 0, unit: 'dias', label: 'Dias de Gestação' }
        }
      },
      {
        name: 'Biometria Fetal',
        key: 'fetal_biometry',
        measurements: {
          hc: { value: 310, unit: 'mm', label: 'Circunferência Cefálica (HC)' },
          ac: { value: 275, unit: 'mm', label: 'Circunferência Abdominal (AC)' },
          fl: { value: 62, unit: 'mm', label: 'Comprimento do Fêmur (FL)' },
          dbp: { value: 84, unit: 'mm', label: 'Diâmetro Biparietal (DBP)' },
          ep: { value: 34, unit: 'mm', label: 'Espessura Placentária (EP)' },
          ila: { value: 12, unit: 'cm', label: 'Líquido Amniótico (ILA)' },
          mbv: { value: 4.8, unit: 'cm', label: 'Maior Bolsão Vertical (MBV)' },
          cerebelo: { value: 38, unit: 'mm', label: 'Cerebelo (DTC)' },
          cisterna_magna: { value: 6.0, unit: 'mm', label: 'Cisterna Magna' },
          atrio_lateral: { value: 5.8, unit: 'mm', label: 'Átrio Ventricular Lateral' },
          pregue_nucal: { value: 4.5, unit: 'mm', label: 'Pregue Nucal' },
          osso_nasal: { value: 0, unit: 'code', label: 'Osso Nasal (0:Pres, 1:Aus)' },
          umero: { value: 61.2, unit: 'mm', label: 'Comprimento do Úmero (HL)' },
          tibia: { value: 53.5, unit: 'mm', label: 'Comprimento da Tíbia (TIB)' }
        }
      },
      {
        name: 'Doppler Arterial',
        key: 'doppler_arterial',
        measurements: {
          ua_pi: { value: 0.95, unit: 'index', label: 'Artéria Umbilical (UA PI)' },
          mca_pi: { value: 1.65, unit: 'index', label: 'Artéria Cerebral Média (MCA PI)' }
        }
      },
      {
        name: 'Doppler Venoso',
        key: 'doppler_venoso',
        measurements: {
          dv_pi: { value: 0.55, unit: 'index', label: 'Ducto Venoso (DV PI)' }
        }
      },
      {
        name: 'Status Qualitativo',
        key: 'qualitative_status',
        measurements: {
          ua_status: { value: 0, unit: 'code', label: 'UA Diástole (0:Nor, 1:AEDF, 2:REDF)' },
          aoi_status: { value: 0, unit: 'code', label: 'Istmo Aórtico (0:Ant, 1:Rev)' },
          dv_a_wave: { value: 0, unit: 'code', label: 'DV Onda "a" (0:Pres, 1:Aus/Rev)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'fgr-case-6',
    title: 'Caso F (Barcelona): Restrição FGR Estágio I (Centralização)',
    description: 'Gestação de 32 semanas e 4 dias. Peso fetal abaixo do Percentil 10, com resistência elevada na umbilical e vasodilatação cerebral (CPR < 1.08), caracterizando FGR Estágio I.',
    studyType: 'fgr_barcelona',
    patientName: 'Juliana Montenegro',
    patientAge: 28,
    patientGender: 'F',
    presetData: [
      {
        name: 'Idade Gestacional',
        key: 'gestational_age',
        measurements: {
          weeks: { value: 32, unit: 'sem', label: 'Semanas de Gestação' },
          days: { value: 4, unit: 'dias', label: 'Dias de Gestação' }
        }
      },
      {
        name: 'Biometria Fetal',
        key: 'fetal_biometry',
        measurements: {
          hc: { value: 295, unit: 'mm', label: 'Circunferência Cefálica (HC)' },
          ac: { value: 250, unit: 'mm', label: 'Circunferência Abdominal (AC)' },
          fl: { value: 58, unit: 'mm', label: 'Comprimento do Fêmur (FL)' },
          dbp: { value: 80, unit: 'mm', label: 'Diâmetro Biparietal (DBP)' },
          ep: { value: 32, unit: 'mm', label: 'Espessura Placentária (EP)' },
          ila: { value: 11, unit: 'cm', label: 'Líquido Amniótico (ILA)' },
          mbv: { value: 4.2, unit: 'cm', label: 'Maior Bolsão Vertical (MBV)' },
          cerebelo: { value: 35, unit: 'mm', label: 'Cerebelo (DTC)' },
          cisterna_magna: { value: 5.5, unit: 'mm', label: 'Cisterna Magna' },
          atrio_lateral: { value: 6.2, unit: 'mm', label: 'Átrio Ventricular Lateral' },
          pregue_nucal: { value: 4.2, unit: 'mm', label: 'Pregue Nucal' },
          osso_nasal: { value: 0, unit: 'code', label: 'Osso Nasal (0:Pres, 1:Aus)' }
        }
      },
      {
        name: 'Doppler Arterial',
        key: 'doppler_arterial',
        measurements: {
          ua_pi: { value: 1.35, unit: 'index', label: 'Artéria Umbilical (UA PI)' },
          mca_pi: { value: 1.10, unit: 'index', label: 'Artéria Cerebral Média (MCA PI)' }
        }
      },
      {
        name: 'Doppler Venoso',
        key: 'doppler_venoso',
        measurements: {
          dv_pi: { value: 0.60, unit: 'index', label: 'Ducto Venoso (DV PI)' }
        }
      },
      {
        name: 'Status Qualitativo',
        key: 'qualitative_status',
        measurements: {
          ua_status: { value: 0, unit: 'code', label: 'UA Diástole (0:Nor, 1:AEDF, 2:REDF)' },
          aoi_status: { value: 0, unit: 'code', label: 'Istmo Aórtico (0:Ant, 1:Rev)' },
          dv_a_wave: { value: 0, unit: 'code', label: 'DV Onda "a" (0:Pres, 1:Aus/Rev)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'fgr-case-7',
    title: 'Caso G (Barcelona): Restrição FGR Estágio III (Incipiente)',
    description: 'Gestação de 29 semanas e 2 dias. Peso fetal gravemente restrito (< Percentil 3), Diástole Reversa na artéria umbilical (REDF) e alteração no Duto Venoso (DV PI > Percentil 95).',
    studyType: 'fgr_barcelona',
    patientName: 'Carla Beatriz Albuquerque',
    patientAge: 34,
    patientGender: 'F',
    presetData: [
      {
        name: 'Idade Gestacional',
        key: 'gestational_age',
        measurements: {
          weeks: { value: 29, unit: 'sem', label: 'Semanas de Gestação' },
          days: { value: 2, unit: 'dias', label: 'Dias de Gestação' }
        }
      },
      {
        name: 'Biometria Fetal',
        key: 'fetal_biometry',
        measurements: {
          hc: { value: 260, unit: 'mm', label: 'Circunferência Cefálica (HC)' },
          ac: { value: 210, unit: 'mm', label: 'Circunferência Abdominal (AC)' },
          fl: { value: 50, unit: 'mm', label: 'Comprimento do Fêmur (FL)' },
          dbp: { value: 72, unit: 'mm', label: 'Diâmetro Biparietal (DBP)' },
          ep: { value: 28, unit: 'mm', label: 'Espessura Placentária (EP)' },
          ila: { value: 5.5, unit: 'cm', label: 'Líquido Amniótico (ILA)' },
          mbv: { value: 1.8, unit: 'cm', label: 'Maior Bolsão Vertical (MBV)' },
          cerebelo: { value: 31, unit: 'mm', label: 'Cerebelo (DTC)' },
          cisterna_magna: { value: 2.2, unit: 'mm', label: 'Cisterna Magna' },
          atrio_lateral: { value: 11.5, unit: 'mm', label: 'Átrio Ventricular Lateral' },
          pregue_nucal: { value: 3.8, unit: 'mm', label: 'Pregue Nucal' },
          osso_nasal: { value: 1, unit: 'code', label: 'Osso Nasal (0:Pres, 1:Aus)' }
        }
      },
      {
        name: 'Doppler Arterial',
        key: 'doppler_arterial',
        measurements: {
          ua_pi: { value: 2.80, unit: 'index', label: 'Artéria Umbilical (UA PI)' },
          mca_pi: { value: 1.02, unit: 'index', label: 'Artéria Cerebral Média (MCA PI)' }
        }
      },
      {
        name: 'Doppler Venoso',
        key: 'doppler_venoso',
        measurements: {
          dv_pi: { value: 1.15, unit: 'index', label: 'Ducto Venoso (DV PI)' }
        }
      },
      {
        name: 'Status Qualitativo',
        key: 'qualitative_status',
        measurements: {
          ua_status: { value: 2, unit: 'code', label: 'UA Diástole (0:Nor, 1:AEDF, 2:REDF)' },
          aoi_status: { value: 1, unit: 'code', label: 'Istmo Aórtico (0:Ant, 1:Rev)' },
          dv_a_wave: { value: 0, unit: 'code', label: 'DV Onda "a" (0:Pres, 1:Aus/Rev)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'carotid-case-8',
    title: 'Caso H (SBC 2023): Estenose Hemodinâmica Crítica de Carótida (80-89%)',
    description: 'Doppler carotídeo evidenciando estenose grave de artéria carótida interna esquerda (ACI) com velocidades sistólicas e diastólicas intensamente elevadas (VPS > 230 cm/s e VDF > 140 cm/s), além de hipoplasia de artéria vertebral direita (< 2.0 mm) conforme Diretrizes 2023.',
    studyType: 'carotid_vascular',
    patientName: 'Armando da Silva Albricker',
    patientAge: 68,
    patientGender: 'M',
    presetData: [
      {
        name: 'Artéria Carótida Direita',
        key: 'right_carotid',
        measurements: {
          vps_ci: { value: 110.0, unit: 'cm/s', label: 'VPS ACI (Pico Sistólico)' },
          vdf_ci: { value: 32.0, unit: 'cm/s', label: 'VDF ACI (Diastólica Final)' },
          vps_cc: { value: 75.0, unit: 'cm/s', label: 'VPS ACC' },
          vdf_cc: { value: 20.0, unit: 'cm/s', label: 'VDF ACC' }
        }
      },
      {
        name: 'Artéria Carótida Esquerda',
        key: 'left_carotid',
        measurements: {
          vps_ci: { value: 295.0, unit: 'cm/s', label: 'VPS ACI (Pico Sistólico)' },
          vdf_ci: { value: 145.0, unit: 'cm/s', label: 'VDF ACI (Diastólica Final)' },
          vps_cc: { value: 70.0, unit: 'cm/s', label: 'VPS ACC' },
          vdf_cc: { value: 18.0, unit: 'cm/s', label: 'VDF ACC' }
        }
      },
      {
        name: 'Artéria Vertebral Direita',
        key: 'right_vertebral',
        measurements: {
          vmax: { value: 45.0, unit: 'cm/s', label: 'Vmax na Origem' },
          vdf: { value: 8.0, unit: 'cm/s', label: 'Vdf' },
          diametro_v2: { value: 1.8, unit: 'mm', label: 'Diâmetro no Segmento V2' },
          ir: { value: 0.78, unit: 'index', label: 'Índice de Resistência (IR)' }
        }
      },
      {
        name: 'Artéria Vertebral Esquerda',
        key: 'left_vertebral',
        measurements: {
          vmax: { value: 65.0, unit: 'cm/s', label: 'Vmax na Origem' },
          vdf: { value: 18.0, unit: 'cm/s', label: 'Vdf' },
          diametro_v2: { value: 4.2, unit: 'mm', label: 'Diâmetro no Segmento V2' },
          ir: { value: 0.58, unit: 'index', label: 'Índice de Resistência (IR)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'echo-case-9',
    title: 'Caso I (ASE 2025): Insuficiência Cardíaca com Fração de Ejeção Preservada (HFpEF)',
    description: 'Ecocardiograma de repouso evidenciando disfunção diastólica significativa Grau 2 com elevação das pressões de enchimento do átrio esquerdo (LAP elevada). Apresenta relaxamento alterado no Doppler tecidual, relação E/e\' média crítica de 17, volume do átrio esquerdo aumentado (LAVi 38 mL/m²), sístole pulmonar elevada (TR 3.1 m/s) e strain do reservatório atrial severamente reduzido (LARS 15%). Corrobora diagnóstico de HFpEF.',
    studyType: 'echocardiogram',
    patientName: 'Clarice Lispector de Oliveira',
    patientAge: 65,
    patientGender: 'F',
    presetData: [
      {
        name: 'Influxo Mitral (Doppler Pulsado)',
        key: 'mitral_inflow',
        measurements: {
          e_vel: { value: 0.85, unit: 'm/s', label: 'Velocidade da Onda E' },
          a_vel: { value: 0.60, unit: 'm/s', label: 'Velocidade da Onda A' },
          ea_ratio: { value: 1.42, unit: 'ratio', label: 'Relação E/A' },
          dt: { value: 180.0, unit: 'ms', label: 'Tempo de Desaceleração de E (DT)' }
        }
      },
      {
        name: 'Doppler Tecidual Mitral (TDI)',
        key: 'tdi_mitral',
        measurements: {
          e_prime_septal: { value: 4.5, unit: 'cm/s', label: 'Velocidade e\' Septal' },
          e_prime_lateral: { value: 5.5, unit: 'cm/s', label: 'Velocidade e\' Lateral' },
          e_prime_average: { value: 5.0, unit: 'cm/s', label: 'Velocidade e\' Média' },
          ee_prime_ratio_average: { value: 17.0, unit: 'ratio', label: 'Relação E/e\' Média' }
        }
      },
      {
        name: 'Estrutura e Deformação do AE / VE',
        key: 'la_remodeling',
        measurements: {
          lavi: { value: 38.0, unit: 'mL/m²', label: 'Índice de Volume do Átrio Esquerdo (LAVi)' },
          lars: { value: 15.0, unit: '%', label: 'Strain do Reservatório Atrial Esquerdo (LARS)' },
          lv_mass_index: { value: 102.0, unit: 'g/m²', label: 'Índice de Massa de VE (LVMi)' }
        }
      },
      {
        name: 'Pressão Sistólica e Relaxamento Pulmonar',
        key: 'pulmonary_pressures',
        measurements: {
          tr_vel: { value: 3.1, unit: 'm/s', label: 'Velocidade de Regurgitação Tricúspide (TR)' },
          pasp: { value: 43.0, unit: 'mmHg', label: 'Pressão Arterial Sistólica Pulmonar' },
          ivrt: { value: 85.0, unit: 'ms', label: 'Tempo de Relaxamento Isovolumétrico (IVRT)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'echo-case-10',
    title: 'Caso J (ASE 2025): Função Diastólica Preservada e Normal de VE',
    description: 'Ecocardiograma de indivíduo jovem e assintomático apresentando velocidades e relações do influxo mitral e Doppler tecidual perfeitamente normais e fisiológicas para a idade (e\' média de 12.5 cm/s, E/e\' de 7.6, LARS de 38% e LAVi de 22 mL/m²). Ausência de disfunção diastólica.',
    studyType: 'echocardiogram',
    patientName: 'Matheus Santos Pedreira',
    patientAge: 32,
    patientGender: 'M',
    presetData: [
      {
        name: 'Influxo Mitral (Doppler Pulsado)',
        key: 'mitral_inflow',
        measurements: {
          e_vel: { value: 0.95, unit: 'm/s', label: 'Velocidade da Onda E' },
          a_vel: { value: 0.45, unit: 'm/s', label: 'Velocidade da Onda A' },
          ea_ratio: { value: 2.11, unit: 'ratio', label: 'Relação E/A' },
          dt: { value: 190.0, unit: 'ms', label: 'Tempo de Desaceleração de E (DT)' }
        }
      },
      {
        name: 'Doppler Tecidual Mitral (TDI)',
        key: 'tdi_mitral',
        measurements: {
          e_prime_septal: { value: 11.0, unit: 'cm/s', label: 'Velocidade e\' Septal' },
          e_prime_lateral: { value: 14.0, unit: 'cm/s', label: 'Velocidade e\' Lateral' },
          e_prime_average: { value: 12.5, unit: 'cm/s', label: 'Velocidade e\' Média' },
          ee_prime_ratio_average: { value: 7.6, unit: 'ratio', label: 'Relação E/e\' Média' }
        }
      },
      {
        name: 'Estrutura e Deformação do AE / VE',
        key: 'la_remodeling',
        measurements: {
          lavi: { value: 22.0, unit: 'mL/m²', label: 'Índice de Volume do Átrio Esquerdo (LAVi)' },
          lars: { value: 38.0, unit: '%', label: 'Strain do Reservatório Atrial Esquerdo (LARS)' },
          lv_mass_index: { value: 80.0, unit: 'g/m²', label: 'Índice de Massa de VE (LVMi)' }
        }
      },
      {
        name: 'Pressão Sistólica e Relaxamento Pulmonar',
        key: 'pulmonary_pressures',
        measurements: {
          tr_vel: { value: 1.9, unit: 'm/s', label: 'Velocidade de Regurgitação Tricúspide (TR)' },
          pasp: { value: 24.0, unit: 'mmHg', label: 'Pressão Arterial Sistólica Pulmonar' },
          ivrt: { value: 75.0, unit: 'ms', label: 'Tempo de Relaxamento Isovolumétrico (IVRT)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'echo-case-11',
    title: 'Caso K (ASE 2025): Disfunção Diastólica Grau 1 (Sensação de Cansaço / LAP Normal)',
    description: 'Ultrassonografia cardíaca revelando disfunção diastólica inicial Grau 1 (relaxamento alterado isolado). Há redução significativa das velocidades teciduais médias (e\' de 6.0 cm/s - Step 1 preenchido), com inversão clássica de velocidades espectrais (E/A de 0.64). Entretanto, as pressões atriais encontram-se plenamente conservadas e normais no momento (E/e\' de 7.5, LAVi de 26 mL/m², TR de 2.2 m/s e LARS de 25%).',
    studyType: 'echocardiogram',
    patientName: 'Alberto Roberto Cavalcante',
    patientAge: 55,
    patientGender: 'M',
    presetData: [
      {
        name: 'Influxo Mitral (Doppler Pulsado)',
        key: 'mitral_inflow',
        measurements: {
          e_vel: { value: 0.45, unit: 'm/s', label: 'Velocidade da Onda E' },
          a_vel: { value: 0.70, unit: 'm/s', label: 'Velocidade da Onda A' },
          ea_ratio: { value: 0.64, unit: 'ratio', label: 'Relação E/A' },
          dt: { value: 220.0, unit: 'ms', label: 'Tempo de Desaceleração de E (DT)' }
        }
      },
      {
        name: 'Doppler Tecidual Mitral (TDI)',
        key: 'tdi_mitral',
        measurements: {
          e_prime_septal: { value: 5.2, unit: 'cm/s', label: 'Velocidade e\' Septal' },
          e_prime_lateral: { value: 6.8, unit: 'cm/s', label: 'Velocidade e\' Lateral' },
          e_prime_average: { value: 6.0, unit: 'cm/s', label: 'Velocidade e\' Média' },
          ee_prime_ratio_average: { value: 7.5, unit: 'ratio', label: 'Relação E/e\' Média' }
        }
      },
      {
        name: 'Estrutura e Deformação do AE / VE',
        key: 'la_remodeling',
        measurements: {
          lavi: { value: 26.0, unit: 'mL/m²', label: 'Índice de Volume do Átrio Esquerdo (LAVi)' },
          lars: { value: 25.0, unit: '%', label: 'Strain do Reservatório Atrial Esquerdo (LARS)' },
          lv_mass_index: { value: 92.0, unit: 'g/m²', label: 'Índice de Massa de VE (LVMi)' }
        }
      },
      {
        name: 'Pressão Sistólica e Relaxamento Pulmonar',
        key: 'pulmonary_pressures',
        measurements: {
          tr_vel: { value: 2.2, unit: 'm/s', label: 'Velocidade de Regurgitação Tricúspide (TR)' },
          pasp: { value: 27.0, unit: 'mmHg', label: 'Pressão Arterial Sistólica Pulmonar' },
          ivrt: { value: 98.0, unit: 'ms', label: 'Tempo de Relaxamento Isovolumétrico (IVRT)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'breast-case-12',
    title: 'Caso L: Ultrassonografia de Mama (BI-RADS 4)',
    description: 'Nódulo mamário sólido, hipoecoico, de margens microlobuladas, localizado no QSE da mama esquerda com maior diâmetro de 14.5 mm, classificado como suspeito.',
    studyType: 'breast_birads',
    patientName: 'Patrícia Pilar de Moura',
    patientAge: 42,
    patientGender: 'F',
    presetData: [
      {
        name: 'Mama Esquerda (Quadrante Superior Externo)',
        key: 'breast_birads',
        measurements: {
          birads_category: { value: 4, unit: 'categoria', label: 'Categoria BI-RADS' },
          nodule_max_diameter: { value: 14.5, unit: 'mm', label: 'Maior Diâmetro do Nódulo' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ovary-case-13',
    title: 'Caso M: Massa Ovariana Complexa (O-RADS 3)',
    description: 'Exame de ultrassom transvaginal mostrando cisto multilocular de paredes finas e lisas, vazio de componentes sólidos, e medindo 45 mm no maior diâmetro.',
    studyType: 'ovary_orads',
    patientName: 'Isabela Silveira Santos',
    patientAge: 35,
    patientGender: 'F',
    presetData: [
      {
        name: 'Ovário Esquerdo (Massa Anexial)',
        key: 'ovary_orads',
        measurements: {
          orads_category: { value: 3, unit: 'categoria', label: 'Categoria O-RADS' },
          ovarian_mass_diameter: { value: 45.0, unit: 'mm', label: 'Diâmetro da Massa Anexial' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'scrotal-case-14',
    title: 'Caso N: Varicocele Esquerda com Hipofunção Volume',
    description: 'Bolsa escrotal revelando evidente dilatação das veias do plexo pampiniforme à esquerda (calibre de 3.2 mm sob manobra de Valsalva, com refluxo de 2.6s) e discreta simetria testicular por redução volumétrica do testículo esquerdo (9.5 mL).',
    studyType: 'scrotal',
    patientName: 'Guilherme Augusto Neto',
    patientAge: 26,
    patientGender: 'M',
    presetData: [
      {
        name: 'Testículo Direito',
        key: 'right_testicle',
        measurements: {
          volume: { value: 15.2, unit: 'mL', label: 'Volume Testicular' },
          comprimento: { value: 4.1, unit: 'cm', label: 'Eixo Longitudinal (Comprimento)' }
        }
      },
      {
        name: 'Testículo Esquerdo',
        key: 'left_testicle',
        measurements: {
          volume: { value: 9.5, unit: 'mL', label: 'Volume Testicular' },
          comprimento: { value: 3.2, unit: 'cm', label: 'Eixo Longitudinal (Comprimento)' }
        }
      },
      {
        name: 'Cabeça do Epidídimo Esquerdo',
        key: 'left_epididymis_head',
        measurements: {
          espessura: { value: 9.8, unit: 'mm', label: 'Espessura da Cabeça do Epidídimo' }
        }
      },
      {
        name: 'Plexo Pampiniforme Esquerdo',
        key: 'doppler_varicocele',
        measurements: {
          varicocele_vein_diameter: { value: 2.6, unit: 'mm', label: 'Diâmetro Venoso em Repouso' },
          post_vals_diameter: { value: 3.2, unit: 'mm', label: 'Diâmetro Venoso sob Valsalva' },
          reflux_seconds: { value: 2.6, unit: 'segundos', label: 'Tempo de Refluxo ao Doppler' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'rheuma-case-15',
    title: 'Caso O: Sinovite Ativa de Punho (OMERACT Grau 2/2)',
    description: 'Ultrassom articular para controle de artrite reumatoide evidenciando hipertrofia sinovial moderada (OMERACT Modo B Grau 2) com sinal hiperêmico confluente ao Color Doppler preenchendo cerca de 30% da área articular (OMERACT Doppler Grau 2), associado a derrame articular presente.',
    studyType: 'rheuma_omeract',
    patientName: 'Teresa de Jesus Cabral',
    patientAge: 51,
    patientGender: 'F',
    presetData: [
      {
        name: 'Recesso Dorsal do Punho Direito',
        key: 'rheuma_omeract',
        measurements: {
          omeract_synovitis_b_mode: { value: 2, unit: 'grau', label: 'OMERACT Modo B (Espessamento)' },
          omeract_synovitis_doppler: { value: 2, unit: 'grau', label: 'OMERACT Power Doppler (Hiperemia)' },
          joint_effusion_presence: { value: 1, unit: 'code', label: 'Derrame Articular (0:Aus, 1:Pres)' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'abdominal_wall-case-16',
    title: 'Caso P: Diástase e Hérnia Umbilical de Parede Abdominal',
    description: 'Avaliação da parede abdominal revelando diástase acentuada dos retos abdominais na região supraumbilical com afastamento de 28 mm, associado a pequena falha hipoecoica na cicatriz umbilical correspondendo a anel herniário de 11 mm.',
    studyType: 'abdominal_wall',
    patientName: 'Eliana Rossi Peixoto',
    patientAge: 44,
    patientGender: 'F',
    presetData: [
      {
        name: 'Afastamento Inter-retal (Região Supraumbilical)',
        key: 'diastase_retos',
        measurements: {
          distancia: { value: 28.5, unit: 'mm', label: 'Afastamento Inter-retal' }
        }
      },
      {
        name: 'Hérnia Umbilical / Defeito Aponeurótico',
        key: 'hernia_umbilical',
        measurements: {
          anel: { value: 11.5, unit: 'mm', label: 'Diâmetro do Anel Herniário' }
        }
      },
      {
        name: 'Músculo Reto Abdominal',
        key: 'musculo_reto',
        measurements: {
          espessura: { value: 8.5, unit: 'mm', label: 'Espessura do Ventre Muscular' }
        }
      },
      {
        name: 'Tecido Adiposo Subcutâneo',
        key: 'gordura_subcutanea',
        measurements: {
          espessura: { value: 22.0, unit: 'mm', label: 'Espessura Subcutânea' }
        }
      }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80'
  }
];

