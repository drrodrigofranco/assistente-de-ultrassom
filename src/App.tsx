import { useState, useEffect, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { 
  Activity, 
  Upload, 
  Check, 
  AlertTriangle, 
  Copy, 
  Printer, 
  FileText, 
  Download, 
  Trash2, 
  Heart, 
  RefreshCw, 
  Layers, 
  Plus, 
  Sliders, 
  Eye, 
  ChevronRight, 
  Sparkles,
  User,
  Calendar,
  Layers2,
  BookmarkCheck,
  Search,
  Scale,
  Clock,
  Lock,
  LogOut
} from 'lucide-react';
import { StudyType, StructureData, CalculationResult, ExamReport, SavedLaudo } from './types';
import { sampleCases, ClinicalCase } from './utils/sampleData';
import { calculateNormality } from './utils/normalityCalculator';
import { eurpReferencesDb } from './utils/eurpReferences';

const getStudyTypeLabel = (type: StudyType): string => {
  switch (type) {
    case 'thyroid': return 'Tireoide com e sem Doppler';
    case 'renal': return 'Rins / Vias Urinárias';
    case 'gallbladder_liver': return 'Hepatobiliar';
    case 'obstetric': return 'Obstétrico de Rotina';
    case 'fgr_barcelona': return 'Obstétrico com Doppler';
    case 'carotid_vascular': return 'Carótidas';
    case 'echocardiogram': return 'Ecocardiograma';
    case 'breast_birads': return 'Mama';
    case 'ovary_orads': return 'Anexos / Ovários (O-RADS)';
    case 'scrotal': return 'Bolsa Escrotal';
    case 'rheuma_omeract': return 'Sinovite Articular';
    case 'abdomen_total': return 'Abdômen Total';
    case 'pelvic': return 'Pélvico';
    case 'abdomen_superior': return 'Abdômen Superior';
    case 'prostate': return 'Próstata';
    case 'transvaginal': return 'Transvaginal';
    case 'obstetric_doppler': return 'Obstétrico com Doppler';
    case 'morphological_1t': return 'Morfológico de 1º Trimestre';
    case 'morphological_2t': return 'Morfológico de 2º Trimestre';
    case 'fetal_echocardiogram': return 'Ecocardiograma Fetal';
    case 'venous_lower_limbs': return 'Venoso de Membros Inferiores';
    case 'arterial_lower_limbs': return 'Arterial de Membros Inferiores';
    case 'general_dermatology': return 'Geral (Dermatológico)';
    case 'abdominal_wall': return 'Parede Abdominal';
    default: return type || 'Tireoide';
  }
};

export default function App() {
  // Technical Audit Log Interface and States
  interface AuditLog {
    id: string;
    timestamp: string;
    type: 'success' | 'warning' | 'error' | 'info';
    action: string;
    status: string;
    details: string;
    payload?: string;
  }

  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('audit_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [auditFilter, setAuditFilter] = useState<'all' | 'error' | 'warning' | 'success'>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const addAuditLog = (
    type: 'success' | 'warning' | 'error' | 'info',
    action: string,
    status: string,
    details: string,
    payload?: any
  ) => {
    const timestamp = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newLog: AuditLog = {
      id: String(Date.now()) + Math.random().toString(36).substring(2, 7),
      timestamp,
      type,
      action,
      status,
      details,
      payload: payload ? (typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)) : undefined
    };

    setAuditLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50); // limit to last 50 entries
      try {
        localStorage.setItem('audit_logs_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving audit logs', e);
      }
      return updated;
    });
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    try {
      localStorage.removeItem('audit_logs_v1');
    } catch (e) {
      console.error('Error clearing audit logs', e);
    }
  };

  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [loginUser, setLoginUser] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginUser.trim().toLowerCase() === 'rodrigofranco' && loginPass === 'Grasislaine79') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      setLoginError('');
      addAuditLog('success', 'Acesso ao Sistema', 'Sucesso', `Usuário ${loginUser.trim()} logado com sucesso. Sessão iniciada.`);
    } else {
      setLoginError('Credenciais inválidas. Por favor, tente novamente.');
      addAuditLog('error', 'Acesso ao Sistema', 'Negado', `Tentativa de login malsucedida para usuário: ${loginUser.trim()}`);
    }
  };

  const handleLogout = () => {
    addAuditLog('info', 'Acesso ao Sistema', 'Encerrado', 'O usuário encerrou a sessão ativa manualmente.');
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setLoginUser('');
    setLoginPass('');
    setLoginError('');
  };

  // Navigation & UI States
  const [studyType, setStudyType] = useState<StudyType>('thyroid');
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'M' | 'F'>('F');
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(36);
  const [gestationalDays, setGestationalDays] = useState<number>(0);
  const [examFindings, setExamFindings] = useState<string>('');
  
  // Laudo History and Drawer overlay open/close
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [laudoHistory, setLaudoHistory] = useState<SavedLaudo[]>(() => {
    try {
      const saved = localStorage.getItem('laudo_history_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync history to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('laudo_history_v2', JSON.stringify(laudoHistory));
    } catch (e) {
      console.error('Error saving history to localStorage', e);
    }
  }, [laudoHistory]);

  // Current loaded case (if any)
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Data flow states
  const [extractedData, setExtractedData] = useState<StructureData[]>([]);
  const [calculatedNormality, setCalculatedNormality] = useState<CalculationResult | null>(null);
  const [generatedLaudo, setGeneratedLaudo] = useState<string>('');
  const [previewTab, setPreviewTab] = useState<'a4' | 'raw'>('a4');
  
  // Loading & Feedback
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingLaudo, setIsGeneratingLaudo] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Batch Image Processing States
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchFiles, setBatchFiles] = useState<{
    id: string;
    file: File;
    name: string;
    preview: string;
    progress: number;
    status: 'pending' | 'analyzing' | 'completed' | 'error';
    errorMsg?: string;
    extractedCount?: number;
    detectedType?: StudyType;
  }[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(-1);

  // Manual inputs structure management
  const [manualStructureName, setManualStructureName] = useState<string>('');
  const [manualStructureKey, setManualStructureKey] = useState<string>('');

  // EURP Interactive Reference Directory state
  const [showReferencesModal, setShowReferencesModal] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [refSearchQuery, setRefSearchQuery] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reference tables for UI reference card
  const referenceRanges = {
    thyroid: [
      { param: 'Volume Total da Glândula', ref: 'Feminino: 2.0 - 15.0 cm³ | Masculino: 2.0 - 18.0 cm³', formula: 'C x L x E x 0.523 por lobo' },
      { param: 'Dimensões dos Lobos (Eixos)', ref: 'Comp: 40-70 mm | Larg: 10-30 mm | Espessura: 10-20 mm', formula: 'Eixos individuais de lobos (EURP Tabela 97)' },
      { param: 'Espessura do Ístmo', ref: '≤ 5.0 mm', formula: 'Medição Anteroposterior' }
    ],
    renal: [
      { param: 'Comprimento Longitudinal', ref: '90.0 - 120.0 mm', formula: 'Eixo Longitudinal Renal Máximo' },
      { param: 'Largura e Espessura Renal', ref: 'Largura: 40.0 - 60.0 mm | Espessura AP: 30.0 - 50.0 mm', formula: 'Eixos renais adicionais (EURP Tabela 92)' },
      { param: 'Espessura Parenquimatosa', ref: '≥ 10.0 mm', formula: 'Região Média Corticomedular' },
      { param: 'Diferença de Simetria (Delta)', ref: '< 15.0 mm', formula: '|Comp. Rim Dir - Comp. Rim Esq|' },
      { param: 'Bexiga (Parede, Resíduo, Vol)', ref: 'Parede: ≤ 4mm (cheia) | Resíduo: < 30 mL | Vol: M ≤ 750 / F ≤ 550 mL', formula: 'Regulamento vesical (EURP Tabela 99)' }
    ],
    gallbladder_liver: [
      { param: 'Espessura da Parede Vesícula', ref: '≤ 3.0 mm', formula: 'Parede Anterior em corte transversal' },
      { param: 'Diâmetro do Fígado', ref: '≤ 15.0 cm (150 mm)', formula: 'Eixo Hemiclavicular Longitudinal' },
      { param: 'Calibre do Colédoco (Dutor)', ref: '≤ 6.0 mm (até 8.0 mm se idoso > 60 anos)', formula: 'Lúmen Interno Livre' },
      { param: 'Esplenometria (Baço)', ref: 'Comprimento: ≤ 12.0 cm | Largura: ≤ 7.0 cm | Espessura: ≤ 4.0 cm', formula: 'Dimensões esplênicas individuais (EURP Tabela 93)' },
      { param: 'Pâncreas (Eixos e Wirsung)', ref: 'Cabeça: < 3.0 cm | Corpo: < 2.5 cm | Cauda: < 2.5 cm | Ducto: ≤ 2.0 mm', formula: 'Calibres pancreáticos e ducto de Wirsung (EURP Tabela 91)' },
      { param: 'Sistema Vascular Visceral', ref: 'Veia Porta: 10-13mm | Veia Esplênica: ≤ 10mm | Cava Inf: ≤ 20mm', formula: 'Ectasias vasculares abdominais (EURP Tabela 101)' }
    ],
    obstetric: [
      { param: 'CCN (Comprimento Cabeça-Nádega)', ref: '2.0 - 84.0 mm', formula: 'Estimativa de Idade Gestacional (CCN mm + 42 dias)' },
      { param: 'Diâmetro Sacolar Médio (MSD)', ref: '2.0 - 60.0 mm', formula: 'GA em dias = Saco (mm) + 30 (EURP p. 10)' },
      { param: 'Frequência Cardíaca (FCF)', ref: '110 - 170 bpm', formula: 'Contagem eletrônica por M-Mode no Ultrassom' },
      { param: 'Diâmetro da Vesícula Vitelina', ref: '3.0 - 6.0 mm', formula: 'Diâmetro Interno Máximo' },
      { param: 'Translucência Nucal (TN)', ref: '≤ 2.5 mm', formula: 'Rastreamento neonatal do 1º trimestre (EURP p. 14)' },
      { param: 'Osso Nasal (ON)', ref: 'Presente / bem visualizado', formula: 'Marcador de prognóstico e aneuploidia (EURP p. 15)' },
      { param: 'Doppler de Artérias Uterinas', ref: '≤ 1.45 (PI Médio)', formula: 'Rastreamento precoce de pré-eclâmpsia (EURP p. 16)' }
    ],
    fgr_barcelona: [
      { param: 'Peso Fetal Estimado (EFW)', ref: 'P3 - P10 para Idade Gestacional', formula: 'Fórmula de Hadlock (HC, AC, FL em cm)' },
      { param: 'Relação Cérebro-Placentária (CPR)', ref: 'Normal: ≥ 1.08', formula: 'MCA PI / UA PI' },
      { param: 'Artéria Umbilical (UA PI)', ref: 'Normal: ≤ Percentil 95', formula: 'Fetal Placental Flow Impedance' },
      { param: 'Artéria Cerebral Média (MCA PI)', ref: 'Normal: ≥ Percentil 5', formula: 'Brain sparing vasodilator index' },
      { param: 'Ducto Venoso (DV PI / Onda "a")', ref: 'Normal: ≤ Percentil 95 / Onda "a" presente', formula: 'Early cardiac failure parameter' },
      { param: 'Ossos Longos Fetais (Membros)', ref: 'Úmero, Tíbia, Fíbula, Rádio, Ulna ± 5 mm', formula: 'Estimativas lineares baseadas nas curvas (EURP Tabela 35)' },
      { param: 'Doppler de Artérias Uterinas', ref: '≤ 1.40 (PI Médio)', formula: 'Indício de invasão trofoblástica uteroplacentária' },
      { param: 'Medida do Colo Uterino', ref: 'Normal: ≥ 25.0 mm', formula: 'Avaliação de encurtamento / risco prematuro (EURP p. 24)' },
      { param: 'Maior Bolsão Vertical (MBV)', ref: 'Normal: 2.0 - 8.0 cm', formula: 'Avaliação de Volume de Líquido Amniótico (SDP/MVP)' },
      { param: 'Aparato Morfológico (Cerebelo, Cisterna Magna, Átrio Ventricular)', ref: 'DTC: Semanas ± 3mm | CM: 3-10mm | AVL: < 10mm', formula: 'Fossa posterior e sistema ventricular cerebral' },
      { param: 'Osso Nasal & Pregue Nucal', ref: 'Osso Nasal: Presente | Pregue: ≤ 6.0 mm', formula: 'Marcadores de aneuploidias e síndromes cromossômicas' }
    ],
    carotid_vascular: [
      { param: 'ACI (Estenose < 50%)', ref: 'VPS < 140 cm/s & VDF < 40 cm/s', formula: 'Consenso SBC/DIC 2023' },
      { param: 'ACI (Estenose 50 - 69%)', ref: 'VPS: 140 - 230 cm/s | VDF: 40 - 100 cm/s', formula: 'Razão CI/CC de 2.0 a 4.0' },
      { param: 'ACI (Estenose ≥ 70%)', ref: 'VPS > 230 cm/s | VDF > 100 cm/s', formula: 'Razão CI/CC > 4.0' },
      { param: 'ACI (Estenose ≥ 90%)', ref: 'VPS > 400 cm/s | VDF > 140 cm/s', formula: 'Razão CI/CC > 5.0' },
      { param: 'Artéria Vertebral (Estenose)', ref: 'Normal: Vmax < 85 | Mod: ≥ 140 | Grave: ≥ 210 cm/s', formula: 'Origem da Vertebral (Tabela 6)' },
      { param: 'Hipoplasia de Vertebral', ref: 'Diâmetro ≤ 2.0 mm (no V2) com IR > 0.75', formula: 'Tabela 5 (SBC 2023)' }
    ],
    echocardiogram: [
      { param: 'Onda E (Fluxo Mitral Doppler)', ref: 'Normal por Idade (20-39: 0.54-1.11 | 40-60: 0.47-1.02 | 60-80: 0.39-0.92 m/s)', formula: 'Doppler Pulsado sobre pontas dos folhetos' },
      { param: 'Onda A (Fluxo Mitral Doppler)', ref: 'Normal por Idade (20-39: 0.24-0.68 | 40-60: 0.33-0.82 | 60-80: 0.43-0.97 m/s)', formula: 'Doppler Pulsado sobre sístole atrial' },
      { param: 'Relação E/A', ref: 'Normal por Idade (20-39: 0.88-2.73 | 40-60: 0.69-2.07 | 60-80: 0.50-1.40)', formula: 'Cálculo de Influxo Mitral Direto' },
      { param: 'Velocidade e\' Média', ref: 'Normal por Idade (20-39: ≥ 8.7 | 40-60: ≥ 6.7 | 60-80: ≥ 4.7 cm/s)', formula: 'Média de e\' Septal e e\' Lateral no Doppler Tecidual' },
      { param: 'Relação E/e\' Média', ref: 'Normal: ≤ 14.0', formula: 'Indicativo de Pressão de Enchimento Atrial Esquerda (LAP)' },
      { param: 'LAVi (Volume Indexado de AE)', ref: 'Normal: ≤ 34.0 mL/m²', formula: 'Medição Biplana em 4 e 2 Câmaras' },
      { param: 'LARS (Strain Reservatório de AE)', ref: 'Normal: > 18.0% (Saudável por idade: ≥ 24.1 - 29.5%)', formula: 'Deformação miocárdica de AE na fase de enchimento' },
      { param: 'Velocidade TR (Refluxo Tricúspide)', ref: 'Normal: < 2.80 m/s', formula: 'Gradiente de regurgitação ventricular-atrial direito' }
    ],
    breast_birads: [
      { param: 'Categorias BI-RADS', ref: 'BI-RADS 1 e 2: Normal/Benigno | BI-RADS 3: Controle 6m | BI-RADS 4 e 5: Biópsia', formula: 'Consenso ACR BI-RADS 2013' },
      { param: 'Diâmetro Máximo Nódulo', ref: '≤ 10.0 mm (se isolado provavelmente benigno)', formula: 'Eixo transversal máximo em mm' }
    ],
    ovary_orads: [
      { param: 'Categorias O-RADS', ref: 'O-RADS 1 e 2: Normal/Benigno | O-RADS 3: Baixo risco | O-RADS 4/5: Alto', formula: 'Consenso ACR O-RADS 2020' },
      { param: 'Massa Anexial Cística/Sólida', ref: '< 10.0 cm (< 100 mm) de maior diâmetro', formula: 'Massa anexial / cistos ovarianos' }
    ],
    scrotal: [
      { param: 'Volume Testicular Adulto', ref: '12.0 - 25.0 cm³ (mL)', formula: 'C x L x E x 0.523' },
      { param: 'Cabeça do Epidídimo', ref: '≤ 12.0 mm de espessura', formula: 'Diâmetro anteroposterior' },
      { param: 'Plexo Pampiniforme (Repouso)', ref: '< 2.5 mm de diâmetro interno', formula: 'Calibres normativos de repouso' },
      { param: 'Plexo Pampiniforme (Valsalva)', ref: '< 3.0 mm de diâmetro interno', formula: 'Refluxo < 2.0s ao Doppler Espectral' },
      { param: 'Volume Hidrocele', ref: '≤ 2.0 mL (Película líquida protetiva fisiológica)', formula: 'Pesquisa quantitativa de hidrocele' }
    ],
    rheuma_omeract: [
      { param: 'OMERACT Modo B (Espessamento)', ref: 'Grau 0: Normal | Grau 1: Leve | Grau 2: Moderado | Grau 3: Grave', formula: 'Fisiopatologia de espessamento sinovial' },
      { param: 'OMERACT Power Doppler (Hiperemia)', ref: 'Grau 0: Normal | Grau 1: Leve | Grau 2: Moderado | Grau 3: Grave', formula: 'Vascularizações sinoviais ativas' },
      { param: 'Derrame Articular', ref: 'Ausente', formula: 'Presença de efusões anecoicas livres' }
    ],
    abdomen_total: [
      { param: 'Fígado (Dimensões)', ref: 'Eixo longitudinal: ≤ 150.0 mm (15.0 cm)', formula: 'Lóbulo Hepático Direito Hemiclavicular' },
      { param: 'Parede da Vesícula Biliar', ref: '≤ 3.0 mm', formula: 'Lúmen livre sem espessamento' },
      { param: 'Bexiga (Resíduo e Parede)', ref: 'Parede ≤ 4.0 mm | Resíduo < 30.0 mL', formula: 'Lúmen vesical e resíduo pós-miccional' },
      { param: 'Baço e Pâncreas', ref: 'Comprimento Baço ≤ 12.0 cm | Wirsung ≤ 2.0 mm', formula: 'Diâmetros esplênico e pancreático standard' }
    ],
    pelvic: [
      { param: 'Útero (Volume)', ref: 'Volume: 30.0 - 90.0 cm³ (ml)', formula: 'C x L x E x 0.523' },
      { param: 'Espessura Endometrial', ref: 'Menacme ≤ 14.0 mm | Menopausa ≤ 5.0 mm', formula: 'Incisão anteroposterior máxima' },
      { param: 'Volume Ovariano', ref: '≤ 9.0 cm³ (ml)', formula: 'Volume bidirecional de controle ovariano' }
    ],
    abdomen_superior: [
      { param: 'Fígado e Vias Biliares', ref: 'Fígado ≤ 15.0 cm | Colédoco ≤ 6.0 mm', formula: 'Eixos e vias excretoras biliares de rotina' },
      { param: 'Vesícula Biliar', ref: 'Parede ≤ 3.0 mm | Sem cálculos', formula: 'Medição de parede anterior em corte transversal' },
      { param: 'Eixos do Pâncreas e Baço', ref: 'Cabeça do Pâncreas < 3.0 cm | Baço ≤ 12.0 cm', formula: 'Anatomia pancreática e esplenometria standard' }
    ],
    prostate: [
      { param: 'Volume da Próstata', ref: '≤ 30.0 g (cm³)', formula: 'C x L x E x 0.523' },
      { param: 'Resíduo Pós-Miccional', ref: '< 30.0 mL', formula: 'Estimativa de retenção urinária volumétrica' },
      { param: 'Parede Detrusora/Vesical', ref: '≤ 4.0 mm', formula: 'Medição com bexiga sob repleção adequada' }
    ],
    transvaginal: [
      { param: 'Volume Uterino / Posição (RVF / AVF)', ref: '30.0 - 90.0 cm³ (ml)', formula: 'Cálculo tridimensional elipsoidal' },
      { param: 'Endométrio Medido no Eco Endometrial', ref: 'Menacme: ≤ 14.0 mm | Pós-menopausa ≤ 5.0 mm', formula: 'Eixo anteroposterior máximo em corte sagital' },
      { param: 'Volume Ovariano Bilateral', ref: 'Normal: ≤ 9.0 cm³ por ovário', formula: 'Diâmetros de ovários direito e esquerdo' }
    ],
    obstetric_doppler: [
      { param: 'Frequência Cardíaca Fetal (FCF)', ref: '110 - 170 bpm', formula: 'M-Mode / Doppler Pulsado nas cavidades cardíacas' },
      { param: 'Índice de Pulsatilidade Umbilical (UA PI)', ref: '< Percentil 95 por Idade Gestacional', formula: 'Impedância placentária' },
      { param: 'Índice de Pulsatilidade Cerebral (MCA PI)', ref: '> Percentil 5 por Idade Gestacional', formula: 'Efeito protetor cerebral ("brain sparing")' },
      { param: 'Relação Cérebro-Placentária (CPR)', ref: 'Normal: ≥ 1.08', formula: 'MCA PI / UA PI (Consenso de Barcelona)' }
    ],
    morphological_1t: [
      { param: 'Translucência Nucal (TN)', ref: '≤ 2.5 mm', formula: 'Rastreamento neonatal (Fetal Medicine Foundation)' },
      { param: 'Osso Nasal (ON)', ref: 'Presente / bem visualizado', formula: 'Marcador prognóstico cromossômico' },
      { param: 'Ducto Venoso (IP & Onda a)', ref: 'IP < P95 | Onda "a" positiva', formula: 'Avaliação cardíaca funcional precoce' }
    ],
    morphological_2t: [
      { param: 'Átrio Ventricular Lateral (AVL)', ref: '< 10.0 mm', formula: 'Rastreamento de ventriculomegalia' },
      { param: 'Cisterna Magna (CM) e Pregue Nucal', ref: 'Cisterna: 3.0 - 10.0 mm | Pregue ≤ 6.0 mm', formula: 'Marcadores morfológicos da fossa posterior' },
      { param: 'Cerebelo (DTC)', ref: 'DTC em mm corresponde às semanas gestacionais', formula: 'Diâmetro transcerebelar neonatal' }
    ],
    fetal_echocardiogram: [
      { param: 'Frequência & Arritmias Fetais', ref: '110 - 160 bpm com ritmo regular (Arritmia: Ausente)', formula: 'Doppler espectral em átrio/ventrículo simultâneo' },
      { param: 'Espessura de Miocárdio Fetal', ref: 'Parede Livre Ventricular/Septo ≤ 4.0 mm', formula: 'Pesquisa de hipertrofia miocárdica intrauterina' },
      { param: 'Conexões Cavitárias Fetais', ref: '4 câmaras e vias de saída de VE e VD preservadas', formula: 'Morfologia cardíaca ecocardiográfica estrutural' }
    ],
    venous_lower_limbs: [
      { param: 'Compressibilidade de Veias Profundas', ref: 'Completa e simétrica em todos os segmentos', formula: 'Critério de exclusão de Trombose Venosa Profunda (TVP)' },
      { param: 'Tempo de Refluxo (V. Superficiais)', ref: 'Normal: < 0.5 s (Refluxo patológico se ≥ 0.5 s)', formula: 'Doppler espectral de refluxo de veia safena magna/parva' },
      { param: 'Tempo de Refluxo (V. Profundas)', ref: 'Normal: < 1.0 s (Refluxo patológico se ≥ 1.0 s)', formula: 'Doppler espectral em veia femoral ou poplítea' }
    ],
    arterial_lower_limbs: [
      { param: 'Índice Tornozelo-Braço (ITB)', ref: 'Normal: 0.90 - 1.30 (Doença obstrutiva se < 0.90)', formula: 'Razão Pressão Tornozelo / Pressão Braquial' },
      { param: 'Padrão de Onda de Fluxo', ref: 'Fluxo trifásico (ou bifásico de alta resistência)', formula: 'Perfis de doppler em tibial anterior, posterior e pediosa' },
      { param: 'Razão de Velocidades da Estenose (VPS)', ref: 'Sem estenose hemodinamicamente significativa', formula: 'Análise de estenose arterial obstrutiva obedece velocidades locais' }
    ],
    general_dermatology: [
      { param: 'Espessura da Derme/Epiderme', ref: '0.5 - 3.0 mm', formula: 'Dermatologia Geral e de Alta Frequência' },
      { param: 'Dimensões da Lesão Cutânea', ref: '< 10.0 mm (Sugerido para monitoramento)', formula: 'Maior eixo linear por corte transversal' },
      { param: 'Estudo Doppler (Vascularização)', ref: 'Grau 0 ou 1 (Sem fluxo proeminente ou periférico leve)', formula: 'Power/Color Doppler de Alta Frequência (20-70 MHz)' }
    ],
    abdominal_wall: [
      { param: 'Distância Inter-Retal (Diástase)', ref: '≤ 22 mm (Supraumbilical) / ≤ 16 mm (Infraumbilical) [Beer, 2009] / ≤ 27 mm (Umbilical) [Rath, 1996]', formula: 'Mensuração transversal entre os bordos internos dos ventres musculares dos retos abdominais' },
      { param: 'Anel Herniário (Defeito Parietal)', ref: 'Ausente (Falhas aponeuróticas patológicas)', formula: 'Diâmetro do colo/anel do defeito parietal durante manobra de Valsalva' },
      { param: 'Espessura do Músculo Reto Abdominal', ref: 'Normal: 5.0 - 15.0 mm', formula: 'Espessura do ventre muscular no plano transversal médio' },
      { param: 'Lesões / Nódulos Subcutâneos', ref: 'Ausentes (Controle referencial se < 15.0 mm)', formula: 'Mensuração ortogonal tridimensional da lesão focal (ex: lipoma)' }
    ]
  };

  // Load preset case on init (disabled so workspace on startup is blank for patient detail identification card)
  useEffect(() => {
    // Left empty per user request to start blank
  }, []);

  // Synchronize state when extractedData gets new values from AI extraction
  useEffect(() => {
    const gestAgeStruct = extractedData.find(d => d.key === 'gestational_age');
    if (gestAgeStruct) {
      const w = gestAgeStruct.measurements.weeks?.value;
      const d = gestAgeStruct.measurements.days?.value;
      if (typeof w === 'number') setGestationalWeeks(w);
      if (typeof d === 'number') setGestationalDays(d);
    }
  }, [extractedData]);

  // Recalculate whenever structures or patient demographic variables change (DEMONSTRATING DIRECT DETERMINISTIC CODED LOGIC FOR USER)
  useEffect(() => {
    if (extractedData.length > 0) {
      const mergedData = [...extractedData];
      const hasGestAge = mergedData.some(d => d.key === 'gestational_age');
      
      const gestStruct = {
        name: "Idade Gestacional",
        key: "gestational_age",
        measurements: {
          weeks: { value: gestationalWeeks, unit: "sem", label: "Semanas" },
          days: { value: gestationalDays, unit: "dias", label: "Dias" }
        }
      };

      if (hasGestAge) {
        const idx = mergedData.findIndex(d => d.key === 'gestational_age');
        mergedData[idx] = gestStruct;
      } else {
        mergedData.push(gestStruct);
      }

      const result = calculateNormality(studyType, mergedData, patientGender, patientAge === '' ? undefined : patientAge);
      setCalculatedNormality(result);
    } else {
      setCalculatedNormality(null);
    }
  }, [extractedData, studyType, patientGender, patientAge, gestationalWeeks, gestationalDays]);

  // Load preset case
  const loadCasePreset = (caseObj: ClinicalCase) => {
    setSelectedCaseId(caseObj.id);
    setStudyType(caseObj.studyType);
    setPatientName(caseObj.patientName);
    setPatientAge(caseObj.patientAge);
    setPatientGender(caseObj.patientGender);
    setImagePreview(caseObj.imageUrl);
    setExamFindings(caseObj.description);
    setExtractedData(JSON.parse(JSON.stringify(caseObj.presetData))); // deep copy
    setGeneratedLaudo('');
    showStatus(`Caso clínico de teste "${caseObj.title}" carregado com sucesso!`, 'success');
  };

  // Start/Reset workspace for a New Exam (Novo Exame)
  const handleNewExam = () => {
    setPatientName('');
    setPatientAge('');
    setPatientGender('F');
    setGestationalWeeks(36);
    setGestationalDays(0);
    setExamFindings('');
    setExtractedData([]);
    setGeneratedLaudo('');
    setSelectedCaseId('');
    setImagePreview('');
    setImageFile(null);
    setBatchFiles([]);
    setIsBatchMode(false);
    showStatus('Nova sessão de exame iniciada! Todos os campos limpos.', 'success');
  };

  // Review a saved Report from history
  const handleReviewHistoryItem = (item: SavedLaudo) => {
    setStudyType(item.studyType);
    setPatientName(item.patientName === 'Paciente Anônimo' ? '' : item.patientName);
    setPatientAge(item.patientAge);
    setPatientGender(item.patientGender);
    setExtractedData(JSON.parse(JSON.stringify(item.extractedData)));
    setGeneratedLaudo(item.generatedLaudo);
    setIsHistoryOpen(false);
    showStatus(`Laudo de ${item.patientName || 'Paciente Anônimo'} carregado no workspace para revisão!`, 'success');
  };

  // Delete matching history item
  const handleDeleteHistoryItem = (id: string) => {
    setLaudoHistory(prev => prev.filter(item => item.id !== id));
    showStatus('Laudo apagado do histórico com sucesso.', 'info');
  };

  // Toast Helper
  const showStatus = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Drag and drop setup
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files.length > 1 || isBatchMode) {
        addFilesToBatch(files);
      } else {
        processSelectedFile(files[0]);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length > 1 || isBatchMode) {
        addFilesToBatch(files);
      } else {
        processSelectedFile(files[0]);
      }
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showStatus('Apenas arquivos de imagem de exames de ultrassom são permitidos.', 'error');
      return;
    }
    setImageFile(file);
    setSelectedCaseId(''); // clear active preset
    setIsBatchMode(false); // fall back to single mode

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      showStatus('Imagem individual carregada! Pronto para mapeamento IA.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Batch operations
  const addFilesToBatch = (filesList: FileList) => {
    const allowedFiles: File[] = [];
    for (let i = 0; i < filesList.length; i++) {
      if (filesList[i].type.startsWith('image/')) {
        allowedFiles.push(filesList[i]);
      }
    }

    if (allowedFiles.length === 0) {
      showStatus('Apenas arquivos de imagem são aceitos para processamento.', 'error');
      return;
    }

    let loadedCount = 0;
    const itemsToAppend: typeof batchFiles = [];

    allowedFiles.forEach((file) => {
      const id = 'batch-file-' + Math.random().toString(36).substring(2, 11);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        itemsToAppend.push({
          id,
          file,
          name: file.name,
          preview: reader.result as string,
          progress: 0,
          status: 'pending'
        });

        loadedCount++;
        if (loadedCount === allowedFiles.length) {
          setBatchFiles(prev => [...prev, ...itemsToAppend]);
          setIsBatchMode(true);
          setSelectedCaseId(''); // Desmarcar caso clinic de teste
          showStatus(`${allowedFiles.length} imagens adicionadas ao lote! Pronto para análise sequencial de consenso.`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveBatchFile = (id: string) => {
    setBatchFiles(prev => prev.filter(f => f.id !== id));
    showStatus('Imagem removida do lote.', 'info');
  };

  const handleRetryFile = async (fileId: string) => {
    const index = batchFiles.findIndex(item => item.id === fileId);
    if (index === -1) return;

    setIsBatchProcessing(true);
    showStatus('Re-processando imagem específica via IA...', 'info');

    const fileItem = batchFiles[index];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let success = false;
    let attempt = 0;
    const maxAttempts = 5;
    let currentDelay = 3000;

    addAuditLog('info', 'Re-processamento Individual (Lote)', 'Iniciado', `Iniciando re-processamento para o arquivo: ${fileItem.name}.`, {
      fileName: fileItem.name,
      fileSize: fileItem.file.size,
      mimeType: fileItem.file.type || 'image/jpeg'
    });

    while (attempt < maxAttempts && !success) {
      attempt++;
      
      setBatchFiles(prev => prev.map((item, idx) => {
        if (idx === index) {
          return { 
            ...item, 
            status: 'analyzing', 
            progress: Math.min(30 + attempt * 20, 90),
            errorMsg: attempt > 1 ? `Re-tentando (Tentativa ${attempt}/${maxAttempts})...` : undefined
          };
        }
        return item;
      }));

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: fileItem.preview,
            studyType: studyType,
            mimeType: fileItem.file.type || 'image/jpeg',
            examFindings: null
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorMsg = data.error || 'Erro inesperado na análise da imagem.';
          const isRateLimit = response.status === 429 || 
                              errorMsg.includes('429') || 
                              errorMsg.toLowerCase().includes('rate limit') || 
                              errorMsg.toLowerCase().includes('quota') || 
                              errorMsg.toLowerCase().includes('resource exhausted');

          if (isRateLimit && attempt < maxAttempts) {
            addAuditLog('warning', 'Re-processamento Individual (Lote)', `Rate Limit (Tentativa ${attempt}/${maxAttempts})`, `Erro 429 retornado. Aguardando backoff exponencial de ${currentDelay}ms.`, { error: errorMsg, file: fileItem.name });
            await delay(currentDelay);
            currentDelay *= 2.5;
            continue;
          }
          throw new Error(errorMsg);
        }

        const returnedExtracted = Array.isArray(data.extractedData) ? data.extractedData : [];
        const detectedType = data.studyType;

        // Auto-extract and populate patient data if retrieved from image header
        if (data.patientName) {
          setPatientName(data.patientName);
        }
        if (typeof data.patientAge === 'number' && data.patientAge > 0) {
          setPatientAge(data.patientAge);
        }
        if (data.patientGender === 'M' || data.patientGender === 'F') {
          setPatientGender(data.patientGender);
        }
        if (typeof data.gestationalWeeks === 'number' && data.gestationalWeeks > 0) {
          setGestationalWeeks(data.gestationalWeeks);
        }
        if (typeof data.gestationalDays === 'number' && data.gestationalDays >= 0) {
          setGestationalDays(data.gestationalDays);
        }

        if (returnedExtracted.length > 0) {
          // Merge to the current accumulated result
          setExtractedData(prev => mergeExtractedData(prev, returnedExtracted));

          if (detectedType && detectedType !== studyType) {
            setStudyType(detectedType);
          }

          setBatchFiles(prev => prev.map((item, idx) => {
            if (idx === index) {
              return { 
                ...item, 
                status: 'completed', 
                progress: 100, 
                extractedCount: returnedExtracted.length,
                detectedType: detectedType,
                errorMsg: undefined
              };
            }
            return item;
          }));
        } else {
          setBatchFiles(prev => prev.map((item, idx) => {
            if (idx === index) {
              return { 
                ...item, 
                status: 'completed', 
                progress: 100, 
                extractedCount: 0,
                detectedType: detectedType,
                errorMsg: undefined
              };
            }
            return item;
          }));
        }
        
        addAuditLog('success', 'Re-processamento Individual (Lote)', 'Concluído', `Sucesso! Extraídas ${returnedExtracted.length} estruturas biométricas do arquivo ${fileItem.name}.`, {
          fileName: fileItem.name,
          extractedCount: returnedExtracted.length,
          detectedType,
          patientName: data.patientName || undefined,
          patientAge: data.patientAge || undefined
        });

        success = true;
        showStatus('Imagem re-processada com sucesso!', 'success');

      } catch (err: any) {
        addAuditLog('warning', 'Re-processamento Individual (Lote)', `Tentativa ${attempt} Falhou`, `Erro na tentativa ${attempt} do arquivo ${fileItem.name}: ${err.message}`);
        if (attempt >= maxAttempts) {
          console.error(`Erro definitivo ao re-processar arquivo: ${fileItem.name}`, err);
          addAuditLog('error', 'Re-processamento Individual (Lote)', 'Falha Definitiva', `O arquivo falhou após todas as ${maxAttempts} tentativas.`, {
            fileName: fileItem.name,
            error: err.message
          });
          setBatchFiles(prev => prev.map((item, idx) => {
            if (idx === index) {
              return { 
                ...item, 
                status: 'error', 
                progress: 100, 
                errorMsg: err.message || 'Erro inesperado na IA' 
              };
            }
            return item;
          }));
          showStatus(`Erro ao re-processar imagem: ${err.message || 'Erro desconhecido'} (ver logs no rodapé)`, 'error');
        } else {
          await delay(1800);
        }
      }
    }
    
    setIsBatchProcessing(false);
  };

  const handleClearBatch = () => {
    setBatchFiles([]);
    setIsBatchMode(false);
    setActiveBatchIndex(-1);
    setIsBatchProcessing(false);
    showStatus('Lote de processamento cancelado.', 'info');
  };

  const mergeExtractedData = (existing: StructureData[], incoming: StructureData[]): StructureData[] => {
    const result = JSON.parse(JSON.stringify(existing)) as StructureData[];
    for (const group of incoming) {
      const match = result.find(x => x.key === group.key);
      if (match) {
        // Merge measurements key-by-key
        for (const mKey of Object.keys(group.measurements)) {
          match.measurements[mKey] = group.measurements[mKey];
        }
      } else {
        result.push(JSON.parse(JSON.stringify(group)));
      }
    }
    return result;
  };

  const handleProcessBatch = async () => {
    if (batchFiles.length === 0) {
      showStatus('Não existem imagens no lote para processar.', 'error');
      return;
    }

    setIsBatchProcessing(true);
    setExtractedData([]); // Iniciar lote limpo para acumular dados extraídos
    setGeneratedLaudo('');
    showStatus('Analisando imagens sequencialmente via IA. Cada exame será processado passo a passo para garantir integridade e contornar limites...', 'info');

    addAuditLog('info', 'Processamento em Lote', 'Iniciado', `Iniciando análise sequencial de ${batchFiles.length} imagens dо lote.`, {
      batchSize: batchFiles.length,
      studyType
    });

    let accumulatedData: StructureData[] = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let index = 0; index < batchFiles.length; index++) {
      const fileItem = batchFiles[index];
      
      // Se for a partir do segundo item, insere um adequado atraso preventivo de 3.5s
      if (index > 0) {
        await delay(3500);
      }

      setActiveBatchIndex(index);

      let success = false;
      let attempt = 0;
      const maxAttempts = 5;
      let currentDelay = 3000;

      while (attempt < maxAttempts && !success) {
        attempt++;
        
        // Update item status in queue to 'analyzing'
        setBatchFiles(prev => prev.map((item, idx) => {
          if (idx === index) {
            return { 
              ...item, 
              status: 'analyzing', 
              progress: Math.min(30 + attempt * 20, 90),
              errorMsg: attempt > 1 ? `Re-tentando (Tentativa ${attempt}/${maxAttempts})...` : undefined
            };
          }
          return item;
        }));

        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64: fileItem.preview,
              studyType: studyType,
              mimeType: fileItem.file.type || 'image/jpeg',
              examFindings: null // Puramente estrutural na análise em lote
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            const errorMsg = data.error || 'Erro inesperado na análise da imagem.';
            const isRateLimit = response.status === 429 || 
                                errorMsg.includes('429') || 
                                errorMsg.toLowerCase().includes('rate limit') || 
                                errorMsg.toLowerCase().includes('quota') || 
                                errorMsg.toLowerCase().includes('resource exhausted');

            if (isRateLimit && attempt < maxAttempts) {
              console.warn(`[Lote] Rate limit atingido para o item ${index + 1}. Aguardando ${currentDelay}ms antes de tentar novamente...`);
              addAuditLog('warning', 'Processamento em Lote', `Rate Limit (Item ${index + 1}/${batchFiles.length}, Tentativa ${attempt}/${maxAttempts})`, `Erro 429 retornado para o arquivo: ${fileItem.name}. Aguardando backoff exponencial de ${currentDelay}ms.`, { error: errorMsg });
              await delay(currentDelay);
              currentDelay *= 2.5; // Backoff exponencial
              continue;
            }
            throw new Error(errorMsg);
          }

          const returnedExtracted = Array.isArray(data.extractedData) ? data.extractedData : [];
          const detectedType = data.studyType;

          // Auto-extract and populate patient data if retrieved from image header in batch items
          if (data.patientName) {
            setPatientName(data.patientName);
          }
          if (typeof data.patientAge === 'number' && data.patientAge > 0) {
            setPatientAge(data.patientAge);
          }
          if (data.patientGender === 'M' || data.patientGender === 'F') {
            setPatientGender(data.patientGender);
          }
          if (typeof data.gestationalWeeks === 'number' && data.gestationalWeeks > 0) {
            setGestationalWeeks(data.gestationalWeeks);
          }
          if (typeof data.gestationalDays === 'number' && data.gestationalDays >= 0) {
            setGestationalDays(data.gestationalDays);
          }

          if (returnedExtracted.length > 0) {
            // Merge to the current accumulated result
            accumulatedData = mergeExtractedData(accumulatedData, returnedExtracted);
            setExtractedData([...accumulatedData]);

            if (detectedType && detectedType !== studyType) {
              setStudyType(detectedType);
            }

            // Mark item as completed
            setBatchFiles(prev => prev.map((item, idx) => {
              if (idx === index) {
                return { 
                  ...item, 
                  status: 'completed', 
                  progress: 100, 
                  extractedCount: returnedExtracted.length,
                  detectedType: detectedType,
                  errorMsg: undefined
                };
              }
              return item;
            }));
          } else {
            // Processed but nothing found
            setBatchFiles(prev => prev.map((item, idx) => {
              if (idx === index) {
                return { 
                  ...item, 
                  status: 'completed', 
                  progress: 100, 
                  extractedCount: 0,
                  detectedType: detectedType,
                  errorMsg: undefined
                };
              }
              return item;
            }));
          }
          
          addAuditLog('success', 'Processamento em Lote', 'Sucesso Parcial', `Item ${index + 1}/${batchFiles.length} (${fileItem.name}) processado com sucesso. Extraídos ${returnedExtracted.length} dados biométricos.`, {
            fileName: fileItem.name,
            extractedCount: returnedExtracted.length,
            detectedType,
            patientName: data.patientName || undefined,
            patientAge: data.patientAge || undefined
          });

          success = true;

        } catch (err: any) {
          addAuditLog('warning', 'Processamento em Lote', `Tentativa ${attempt} Falhou`, `Erro na tentativa ${attempt} do arquivo ${fileItem.name}: ${err.message}`);
          if (attempt >= maxAttempts) {
            console.error(`Erro definitivo ao analisar arquivo: ${fileItem.name}`, err);
            addAuditLog('error', 'Processamento em Lote', 'Falha no Item', `Falha definitiva no item ${index + 1}/${batchFiles.length} (${fileItem.name}) após todas as ${maxAttempts} tentativas: ${err.message}`, { error: err.stack || err.message });
            setBatchFiles(prev => prev.map((item, idx) => {
              if (idx === index) {
                return { 
                  ...item, 
                  status: 'error', 
                  progress: 100, 
                  errorMsg: err.message || 'Erro inesperado na IA' 
                };
              }
              return item;
            }));
          } else {
            console.warn(`[Lote] Erro temporário na tentativa ${attempt} do arquivo ${index + 1}:`, err);
            await delay(1800);
          }
        }
      }
    }

    setIsBatchProcessing(false);
    setActiveBatchIndex(-1);
    addAuditLog('success', 'Processamento em Lote', 'Concluído', `Lote finalizado. Total de estruturas anatômicas acumuladas: ${accumulatedData.length}.`, {
      totalStructuresSaved: accumulatedData.length
    });
    showStatus(`Processamento finalizado! No total, ${accumulatedData.length} estruturas anatômicas foram integradas aos algoritmos clínicos.`, 'success');
  };

  // Trigger Gemini vision parsing to extract structure metrics
  const handleExtractWithAI = async () => {
    if (!imagePreview && !examFindings.trim()) {
      showStatus('Por favor, faça upload de uma imagem do exame ou insira o nome do exame e anotações clínicas na caixa de texto para extração.', 'error');
      return;
    }

    setIsAnalyzing(true);
    showStatus('Analisando imagens e anotações médicas com inteligência artificial para mapeamento de dados...', 'info');

    addAuditLog('info', 'Extração via IA', 'Iniciado', 'Processando imagem ou texto clínico com o modelo de extração óptica.', {
      hasImage: !!imagePreview,
      imageMimeType: imageFile ? imageFile.type : null,
      hasTextFindings: !!examFindings.trim(),
      textSnippet: examFindings.trim() ? examFindings.trim().slice(0, 300) : null,
      studyType
    });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imagePreview || null,
          studyType: studyType,
          mimeType: imageFile ? imageFile.type : 'image/jpeg',
          examFindings: examFindings.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro inesperado na extração via inteligência artificial.');
      }

      if (data.extractedData && data.extractedData.length > 0) {
        const oldType = studyType;
        const newType = data.studyType;

        // Auto-extract and populate patient metadata if retrieved from image header
        if (data.patientName) {
          setPatientName(data.patientName);
        }
        if (typeof data.patientAge === 'number' && data.patientAge > 0) {
          setPatientAge(data.patientAge);
        }
        if (data.patientGender === 'M' || data.patientGender === 'F') {
          setPatientGender(data.patientGender);
        }
        if (typeof data.gestationalWeeks === 'number' && data.gestationalWeeks > 0) {
          setGestationalWeeks(data.gestationalWeeks);
        }
        if (typeof data.gestationalDays === 'number' && data.gestationalDays >= 0) {
          setGestationalDays(data.gestationalDays);
        }

        addAuditLog('success', 'Extração via IA', 'Sucesso', `Extração bem sucedida! Mapeados ${data.extractedData.length} parâmetros biométricos.`, {
          detectedStudyType: data.studyType,
          patientName: data.patientName || undefined,
          patientAge: data.patientAge || undefined,
          patientGender: data.patientGender || undefined,
          extractedStructures: data.extractedData.map((d: any) => ({
            name: d.name,
            key: d.key,
            measurements: Object.keys(d.measurements || {}).map(m => `${m}: ${d.measurements[m].value}${d.measurements[m].unit}`)
          }))
        });

        if (newType && newType !== oldType) {
          setStudyType(newType);
          setExtractedData(data.extractedData);
          setGeneratedLaudo('');
          showStatus(`Direcionado automaticamente de "${getStudyTypeLabel(oldType)}" para a calculadora "${getStudyTypeLabel(newType)}"! Dados biométricos mapeados com sucesso.`, 'success');
        } else {
          setExtractedData(data.extractedData);
          setGeneratedLaudo('');
          showStatus('Perfeito! Dados biométricos extraídos com sucesso para o exame ativo. Módulo matemático de consenso ativado.', 'success');
        }
      } else {
        throw new Error('Nenhuma medida reconhecida na imagem ou anotações. Verifique se o exame possui dados biométricos válidos.');
      }

    } catch (err: any) {
      console.error(err);
      addAuditLog('error', 'Extração via IA', 'Falha Técnica', `Erro na resposta: ${err.message}`, {
        error: err.stack || err.message,
        formData: {
          studyType,
          hasImage: !!imagePreview,
          textLength: examFindings.trim().length
        }
      });
      showStatus(`Falha técnica: ${err.message} (ver log de Auditoria no rodapé)`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Edit structure data values manually (Calculations run instantly via useEffect)
  const handleUpdateMeasurement = (structIndex: number, paramKey: string, newValue: number) => {
    const updated = [...extractedData];
    if (updated[structIndex] && updated[structIndex].measurements[paramKey]) {
      updated[structIndex].measurements[paramKey].value = isNaN(newValue) ? 0 : newValue;
      setExtractedData(updated);
    }
  };

  const handleUpdateMeasurementUnit = (structIndex: number, paramKey: string, newUnit: string) => {
    const updated = [...extractedData];
    if (updated[structIndex] && updated[structIndex].measurements[paramKey]) {
      updated[structIndex].measurements[paramKey].unit = newUnit;
      setExtractedData(updated);
    }
  };

  const handleAddStructure = () => {
    if (!manualStructureName || !manualStructureKey) {
      showStatus('Forneça nome e chave técnica para registrar uma nova estrutura manualmente.', 'error');
      return;
    }

    const newStruct: StructureData = {
      name: manualStructureName,
      key: manualStructureKey,
      measurements: {
        valor: {
          value: 0.0,
          unit: studyType === 'thyroid' || studyType === 'renal' || studyType === 'obstetric' || studyType === 'abdominal_wall' ? 'mm' : 'cm',
          label: 'Valor Principal'
        }
      }
    };

    setExtractedData([...extractedData, newStruct]);
    setManualStructureName('');
    setManualStructureKey('');
    showStatus(`Estrutura "${manualStructureName}" criada para biometria determinística.`, 'success');
  };

  const handleRemoveStructure = (index: number) => {
    const updated = [...extractedData];
    updated.splice(index, 1);
    setExtractedData(updated);
    showStatus('Estrutura removida da análise biométrica.', 'info');
  };

  // Save changes & Send deterministic metrics + raw measurements summary back to Gemini to synthesize professional Report (Laudo)
  const handleGenerateFinalLaudo = async () => {
    if (extractedData.length === 0) {
      showStatus('Não há medições cadastradas. Extraia via IA ou use os casos de exemplo para preencher.', 'error');
      return;
    }

    setIsGeneratingLaudo(true);
    showStatus('O Gemini está sintetizando os dados com o módulo de programação para formatar um laudo médico seguro...', 'info');

    addAuditLog('info', 'Geração de Laudo', 'Iniciado', 'Sintetizando laudo clínico a partir de dados biométricos.', {
      studyType,
      patientName,
      patientAge,
      patientGender,
      gestationalWeeks,
      gestationalDays,
      structuresCount: extractedData.length,
      structures: extractedData.map(d => ({
        name: d.name,
        key: d.key,
        measurements: Object.keys(d.measurements).map(m => `${m}: ${d.measurements[m].value}`)
      }))
    });

    try {
      const response = await fetch('/api/generate-laudo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyType,
          extractedData,
          patientName,
          patientAge,
          patientGender,
          gestationalWeeks,
          gestationalDays
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro na comunicação do gerador de laudo.');
      }

      const newLaudoMarkdown = data.laudoMarkdown || '';
      setGeneratedLaudo(newLaudoMarkdown);

      addAuditLog('success', 'Geração de Laudo', 'Sucesso', 'Laudo clínico em Markdown gerado com sucesso.', {
        length: newLaudoMarkdown.length,
        snippet: newLaudoMarkdown.slice(0, 500) + '...'
      });

      if (newLaudoMarkdown) {
        try {
          const formattedDate = new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          const saved: SavedLaudo = {
            id: String(Date.now()),
            patientName: patientName.trim() || 'Paciente Anônimo',
            patientAge: patientAge,
            patientGender: patientGender,
            studyType,
            studyTypeLabel: getStudyTypeLabel(studyType),
            generatedLaudo: newLaudoMarkdown,
            extractedData: [...extractedData],
            date: formattedDate
          };
          setLaudoHistory(prev => [saved, ...prev]);
        } catch (historyErr) {
          console.error('Could not save to history', historyErr);
        }
      }

      showStatus('Pré-laudo de Ultrassonografia gerado e registrado no histórico!', 'success');

    } catch (err: any) {
      console.error(err);
      addAuditLog('error', 'Geração de Laudo', 'Falha Técnica', `Erro na síntese: ${err.message}`, {
        error: err.stack || err.message,
        payload: {
          studyType,
          extractedDataLength: extractedData.length
        }
      });
      showStatus(`Falha ao compilar laudo: ${err.message} (ver log de Auditoria no rodapé)`, 'error');
    } finally {
      setIsGeneratingLaudo(false);
    }
  };

  const studyTypeLabels: Record<StudyType | string, string> = {
    thyroid: "Tireoide com e sem Doppler",
    renal: "Rins e Vias Urinárias",
    gallbladder_liver: "Vias Biliares e Hepatobiliar",
    obstetric: "Ultrassonografia Obstétrica de Rotina",
    fgr_barcelona: "Ultrassonografia Obstétrica com Doppler",
    carotid_vascular: "Doppler de Carótidas e Vertebrais",
    echocardiogram: "Ecocardiograma Transtorácico",
    breast_birads: "Ultrassonografia de Mamas",
    ovary_orads: "Ultrassonografia de Anexos (O-RADS)",
    scrotal: "Ultrassonografia de Bolsa Escrotal",
    rheuma_omeract: "Ultrassonografia Articular (OMERACT)",
    abdomen_total: "Ultrassonografia de Abdômen Total",
    pelvic: "Ultrassonografia Pélvica",
    abdomen_superior: "Ultrassonografia de Abdômen Superior",
    prostate: "Ultrassonografia de Próstata",
    transvaginal: "Ultrassonografia Transvaginal",
    obstetric_doppler: "Ultrassonografia Obstétrica com Doppler",
    morphological_1t: "Ultrassonografia Morfológica de 1º Trimestre",
    morphological_2t: "Ultrassonografia Morfológica de 2º Trimestre",
    fetal_echocardiogram: "Ecocardiografia Fetal",
    venous_lower_limbs: "Doppler Venoso de Membros Inferiores",
    arterial_lower_limbs: "Doppler Arterial de Membros Inferiores",
    general_dermatology: "Ultrassonografia Geral (Dermatológica)",
    abdominal_wall: "Ultrassonografia de Parede Abdominal"
  };

  const getDUMAndDPP = () => {
    let dumDateFormatted = '-';
    let dppDateFormatted = '-';
    let igFormatted = '-';
    
    const isObstetric = ['fgr_barcelona', 'obstetric_doppler', 'obstetric', 'morphological_1t', 'morphological_2t', 'fetal_echocardiogram'].includes(studyType);
    if (isObstetric) {
      const today = new Date();
      const totalDays = (gestationalWeeks * 7) + gestationalDays;
      
      const dumDate = new Date();
      dumDate.setDate(today.getDate() - totalDays);
      dumDateFormatted = dumDate.toLocaleDateString('pt-BR');
      
      const dppDate = new Date(dumDate.getTime());
      dppDate.setDate(dumDate.getDate() + 280);
      dppDateFormatted = dppDate.toLocaleDateString('pt-BR');
      
      igFormatted = `${gestationalWeeks} Semanas e ${gestationalDays} Dias`;
    }
    return { dumDateFormatted, dppDateFormatted, igFormatted, isObstetric };
  };

  const parseMarkdownToHtml = (markdown: string) => {
    if (!markdown) return '';
    let html = markdown;
    
    html = html.replace(/CLÍNICA FRANCO/gi, '');
    html = html.replace(/Dr\.\s+Rodrigo\s+Duarte\s+Franco/gi, '');
    html = html.replace(/CRM-MS\s+10087/gi, '');
    html = html.replace(/www\.ajudamediko\.com\.br/gi, '');
    html = html.replace(/LAUDO DE ULTRASSOM/gi, '');
    html = html.replace(/Paciente:\s*[^\n]*/gi, '');
    html = html.replace(/Idade:\s*[^\n]*/gi, '');
    html = html.replace(/Sexo:\s*[^\n]*/gi, '');
    html = html.replace(/DUM:\s*[^\n]*/gi, '');
    html = html.replace(/DPP:\s*[^\n]*/gi, '');
    html = html.replace(/Idade\s+Gestacional:\s*[^\n]*/gi, '');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    html = html.replace(/^### (.*$)/gim, '<h4 style="color: #1e293b; font-size: 13px; font-weight: bold; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; font-family: sans-serif;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="color: #1b365d; font-size: 14px; font-weight: bold; margin-top: 22px; margin-bottom: 8px; text-transform: uppercase; font-family: sans-serif;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="color: #1b365d; font-size: 16px; font-weight: bold; margin-top: 26px; margin-bottom: 10px; text-transform: uppercase; font-family: sans-serif;">$1</h2>');
    
    html = html.replace(/---/g, '<div style="border-top: 1.5px solid #cbd5e1; margin: 18px 0;"></div>');
    html = html.replace(/───+/g, '<div style="border-top: 1.5px solid #cbd5e1; margin: 18px 0;"></div>');
    
    html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<li style="margin-left: 16px; margin-bottom: 6px; font-size: 12.5px; color: #334155; list-style-type: disc; font-family: sans-serif; line-height: 1.5;">$1</li>');
    
    html = html.replace(/\n/g, '<br/>');
    html = html.replace(/(<br\s*\/?>){3,}/gi, '<br/><br/>');
    
    return html;
  };

  const handleCopyToClipboard = () => {
    if (!generatedLaudo) return;
    navigator.clipboard.writeText(generatedLaudo);
    showStatus('Copiado para a área de transferência!', 'success');
  };

  const getActiveImages = () => {
    if (isBatchMode && batchFiles.length > 0) {
      return batchFiles.map(b => b.preview).filter(Boolean);
    }
    if (imagePreview) {
      return [imagePreview];
    }
    return [];
  };

  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const { dumDateFormatted, dppDateFormatted, igFormatted, isObstetric } = getDUMAndDPP();
      const todayStr = new Date().toLocaleDateString('pt-BR');
      const examLabel = studyTypeLabels[studyType] || getStudyTypeLabel(studyType);
      
      const paramRows = calculatedNormality && Array.isArray(calculatedNormality.evaluations) 
        ? calculatedNormality.evaluations.map(ev => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 600; color: #1e293b; font-size: 12.5px; font-family: sans-serif; text-align: left; width: 35%;">${ev.structureName || ev.parameterLabel}</td>
              <td style="padding: 10px 0; font-weight: 700; color: #1e3a8a; font-size: 12.5px; font-family: sans-serif; text-align: left; width: 15%;">${ev.valueObtained}</td>
              <td style="padding: 10px 0; color: #475569; font-size: 11.5px; font-family: sans-serif; text-align: left; width: 50%; line-height: 1.4;">${ev.status === 'altered' ? '<span style="color:#b45309;font-weight:600;">⚠️ Alterado • </span>' : ev.status === 'critical' ? '<span style="color:#b91c1c;font-weight:600;">🚨 Crítico • </span>' : 'Normal • '}${ev.explanation || ''}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #94a3b8; font-size: 12px; font-family: sans-serif;">Nenhum parâmetro biométrico registrado no laudo.</td></tr>`;

      const reportBodyHtml = parseMarkdownToHtml(generatedLaudo);

      const activeImages = getActiveImages();
      const imageChunks = chunkArray(activeImages, 6);
      
      let imagesHtml = '';
      if (imageChunks.length > 0) {
        imagesHtml = imageChunks.map((chunk, chunkIndex) => {
          let chunkImagesHtml = chunk.map((img, imgIndex) => `
            <div class="image-item-wrapper">
              <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; width: 100%;">
                <img src="${img}" alt="Captura do Exame ${chunkIndex * 6 + imgIndex + 1}" />
              </div>
              <div class="image-label">REGISTRO FOTOGRÁFICO #${chunkIndex * 6 + imgIndex + 1}</div>
            </div>
          `).join('');

          // Fill empty slots up to 6 per sheet
          if (chunk.length < 6) {
            const emptyCount = 6 - chunk.length;
            const placeholders = Array.from({ length: emptyCount }).map((_, i) => `
              <div class="image-item-wrapper" style="border-style: dashed; border-color: #cbd5e1; background-color: #f8fafc;">
                <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 10px; font-style: italic; color: #94a3b8; font-weight: 600; font-family: sans-serif;">Espaço Disponível</span>
                </div>
                <div class="image-label" style="color: #cbd5e1;">-</div>
              </div>
            `).join('');
            chunkImagesHtml += placeholders;
          }

          return `
            <div class="image-page">
              <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 20px;">
                <div class="clinic-brand">
                  <h1 style="font-size: 18px; font-weight: 800; color: #1b365d; margin: 0; font-family: sans-serif;">CLÍNICA FRANCO</h1>
                  <p style="font-size: 10px; color: #475569; margin: 1px 0; font-family: sans-serif;">Dr. Rodrigo Duarte Franco • CRM-MS 10087</p>
                </div>
                <div class="laudo-title">
                  <h2 style="font-size: 16px; font-weight: 850; color: #1b365d; margin: 0; font-family: sans-serif;">ANEXO DE IMAGENS DO EXAME</h2>
                  <p style="font-size: 9.5px; color: #475569; margin: 2px 0 0 0; font-weight: 600; font-family: sans-serif; text-transform: uppercase;">Folha ${chunkIndex + 1} de ${imageChunks.length}</p>
                </div>
              </div>
              
              <div class="image-grid">
                ${chunkImagesHtml}
              </div>
              
              <div style="margin-top: 25px; text-align: center; font-size: 9px; color: #64748b; font-family: sans-serif; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                Anexo fotográfico correlacionado ao laudo do paciente <b>${patientName.toUpperCase()}</b> • Exame realizado em ${todayStr}
              </div>
            </div>
          `;
        }).join('');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laudo Clínico - ${patientName}</title>
            <meta charset="utf-8" />
            <style>
              @media print {
                body { margin: 0; padding: 0; background: #fff; color: #1e293b; -webkit-print-color-adjust: exact; }
                @page { size: A4; margin: 1.6cm 1.4cm; }
                .no-print { display: none !important; }
                .signature-container { page-break-inside: avoid; margin-top: 40px !important; }
                .param-table { page-break-inside: avoid; }
                .image-page { page-break-before: always; page-break-inside: avoid; }
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                color: #1e293b;
                line-height: 1.5;
                padding: 10px;
                max-width: 800px;
                margin: 0 auto;
                background-color: #ffffff;
              }
              .header-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-bottom: 2px solid #cbd5e1;
                padding-bottom: 12px;
                margin-bottom: 20px;
              }
              .clinic-brand h1 {
                font-size: 22px;
                font-weight: 800;
                color: #1b365d;
                margin: 0 0 4px 0;
                letter-spacing: 0.5px;
              }
              .clinic-brand p {
                font-size: 11px;
                color: #475569;
                margin: 1px 0;
              }
              .laudo-title {
                text-align: right;
              }
              .laudo-title h2 {
                font-size: 20px;
                font-weight: 800;
                color: #1b365d;
                margin: 0 0 4px 0;
                letter-spacing: 0.5px;
              }
              .laudo-title p {
                font-size: 11.5px;
                color: #475569;
                margin: 2px 0 0 0;
                font-weight: 600;
              }
              .patient-box {
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 14px 18px;
                margin-bottom: 24px;
                background-color: #ffffff;
              }
              .box-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
              }
              .box-row:last-child {
                margin-bottom: 0;
              }
              .box-col {
                flex: 1;
                padding-right: 12px;
              }
              .box-col.double-width {
                flex: 2;
              }
              .col-lbl {
                font-size: 9px;
                font-weight: bold;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                display: block;
                margin-bottom: 2px;
              }
              .col-val {
                font-size: 13px;
                font-weight: 700;
                color: #0f172a;
                display: block;
              }
              .section-tag {
                font-size: 11px;
                font-weight: bold;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 24px;
                margin-bottom: 8px;
              }
              .param-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 24px;
              }
              .param-table tr {
                border-bottom: 1px solid #f1f5f9;
              }
              .param-table td {
                font-size: 12px;
                padding: 8px 0;
              }
              .signature-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 48px;
                page-break-inside: avoid;
              }
              .sig-line {
                width: 220px;
                border-top: 1.5px solid #94a3b8;
                margin-top: 4px;
                margin-bottom: 4px;
              }
              .sig-text {
                font-size: 11px;
                font-weight: 750;
                color: #334155;
                text-align: center;
                margin: 1px 0;
              }
              .content-area {
                font-size: 12.5px;
                color: #1e293b;
                line-height: 1.6;
              }
              .image-page {
                padding-top: 1cm;
                min-height: 95%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
              }
              .image-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-top: 15px;
                flex-grow: 1;
              }
              .image-item-wrapper {
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 10px;
                background-color: #f8fafc;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                height: 250px;
                box-sizing: border-box;
              }
              .image-item-wrapper img {
                max-width: 100%;
                max-height: 190px;
                object-fit: contain;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
              }
              .image-label {
                font-size: 10.5px;
                font-weight: bold;
                color: #475569;
                margin-top: 8px;
                text-align: center;
                letter-spacing: 0.5px;
                font-family: sans-serif;
              }
            </style>
          </head>
          <body>
            <div class="header-container">
              <div class="clinic-brand">
                <h1>CLÍNICA FRANCO</h1>
                <p>Dr. Rodrigo Duarte Franco</p>
                <p>CRM-MS 10087</p>
                <p>www.ajudamediko.com.br</p>
              </div>
              <div class="laudo-title">
                <h2>LAUDO DE ULTRASSOM</h2>
                <p>${examLabel}</p>
              </div>
            </div>

            <div class="patient-box">
              <div class="box-row">
                <div class="box-col double-width">
                  <span class="col-lbl">Paciente</span>
                  <span class="col-val">${patientName.toUpperCase() || 'PACIENTE ANÔNIMO'}</span>
                </div>
                <div class="box-col">
                  <span class="col-lbl">Data do Exame</span>
                  <span class="col-val">${todayStr}</span>
                </div>
                <div class="box-col">
                  <span class="col-lbl">${isObstetric ? 'DUM Informada' : 'Sexo'}</span>
                  <span class="col-val">${isObstetric ? dumDateFormatted : (patientGender === 'M' ? 'Masculino' : 'Feminino')}</span>
                </div>
              </div>
              <div class="box-row" style="margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
                <div class="box-col double-width">
                  <span class="col-lbl">${isObstetric ? 'Idade Gestacional (USG)' : 'Idade'}</span>
                  <span class="col-val">${isObstetric ? igFormatted : (patientAge ? `${patientAge} Anos` : '---')}</span>
                </div>
                <div class="box-col">
                  <span class="col-lbl">${isObstetric ? 'DPP' : 'Médico Corresponsável'}</span>
                  <span class="col-val">${isObstetric ? dppDateFormatted : 'Dr. Rodrigo Franco'}</span>
                </div>
                <div class="box-col">
                  <!-- Auxiliar empty column -->
                </div>
              </div>
            </div>

            <div class="section-tag">Parâmetros do Exame</div>
            <table class="param-table">
              <tbody>
                ${paramRows}
              </tbody>
            </table>

            <div class="content-area">
              ${reportBodyHtml}
            </div>

            <div class="signature-container">
              <!-- Inline SVG resembling Dr. Rodrigo Franco signature -->
              <svg viewBox="0 0 200 60" width="180" height="50" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: -5px;">
                <path d="M 15 42 C 28 18, 38 8, 48 20 C 58 32, 68 46, 78 30 C 88 14, 98 6, 108 22 C 118 38, 128 50, 138 38 C 148 26, 168 8, 178 16 C 188 24, 158 46, 148 48 C 138 50, 118 40, 148 26 C 178 12, 190 6, 196 10 M 74 24 A 4 4 0 1 1 78 28" stroke="#1e3a8a" stroke-width="2" />
              </svg>
              <div class="sig-line"></div>
              <div class="sig-text">Dr. Rodrigo Duarte Franco</div>
              <div class="sig-text" style="font-weight: 500; font-size: 10px; color: #64748b;">CRM-MS 10087</div>
            </div>

            <!-- Annex of Images Sheets -->
            ${imagesHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLaudo], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `laudo_ultrassom_${patientName.toLowerCase().replace(/\s+/g, '_') || 'exame'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isLoggedIn) {
    return (
      <div id="login-root" className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Soft emerald radial reflection */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.06)_0%,transparent_70%)] pointer-events-none" />
        
        <div id="login-card" className="w-full max-w-sm bg-slate-950 border border-slate-800/80 rounded-2xl p-6.5 shadow-2xl relative z-10 flex flex-col gap-5.5 backdrop-blur-md">
          {/* Header Brand */}
          <div className="text-center flex flex-col items-center gap-3">
            <div id="logo-icon-container" className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl w-fit">
              <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">Acesso ao Sistema</h1>
              <p className="text-[11px] text-slate-400 mt-1">Assistente de Ultrassom & Laudos</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500/80" /> Nome de Usuário
              </label>
              <input 
                type="text" 
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="digite seu login" 
                autoFocus
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-slate-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500/80" /> Senha
              </label>
              <input 
                type="password" 
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-slate-600 font-medium"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5 mt-1"
            >
              Entrar
            </button>
          </form>

          {/* Footer Card info */}
          <div className="border-t border-slate-900/80 pt-4 text-center">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <BookmarkCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              Ambiente Clínico Restrito • Dr. Rodrigo Franco
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Toast Notification Top */}
      {statusMessage && (
        <div id="status-toast" className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border transition-all duration-300 max-w-lg ${
          statusMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
          statusMessage.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' :
          'bg-slate-800/95 border-sky-500/50 text-sky-200'
        }`}>
          {statusMessage.type === 'success' && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {statusMessage.type === 'info' && <RefreshCw className="w-5 h-5 text-sky-400 animate-spin shrink-0" />}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Main clinical Header */}
      <header id="clinical-header" className="border-b border-slate-800 bg-slate-950 px-6 py-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div id="logo-icon-container" className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 id="app-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Assistente de Ultrassom <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">v2.1 Determinístico</span>
              </h1>
              <p id="app-subtitle" className="text-xs text-slate-400 mt-0.5">
                Extração óptica assistida por IA e triagem anatômica regulada estritamente por módulos algébricos estruturados.
              </p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Novo Exame Button */}
            <button
              onClick={handleNewExam}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              title="Limpar todos os campos e iniciar novo exame"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Exame
            </button>

            {/* Histórico Button with Badge */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer relative"
              title="Ver histórico de laudos gerados nesta máquina"
            >
              <Clock className="w-3.5 h-3.5" />
              Histórico
              {laudoHistory.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow ring-2 ring-slate-950">
                  {laudoHistory.length}
                </span>
              )}
            </button>

            {/* Sair/Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              title="Sair do sistema com segurança"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>

            <span id="api-status" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/85 border border-slate-700/30 rounded-xl text-xs font-medium text-slate-300 font-sans">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
              Servidor Conectado
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main id="main-space" className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input, Presets & Upload (Span 4) */}
        <section id="col-data-input" className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Patient demographic data card form */}
          <div id="card-patient-info" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5">
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Identificação do Paciente
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome do Paciente" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Idade
                  </label>
                  <input 
                    type="number" 
                    value={patientAge}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setPatientAge('');
                      } else {
                        const parsed = parseInt(val);
                        setPatientAge(isNaN(parsed) ? '' : Math.max(1, parsed));
                      }
                    }}
                    placeholder="Idade (Anos)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">Sexo Biológico</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPatientGender('M')}
                      className={`text-center py-1 text-xs rounded font-semibold transition-all ${
                        patientGender === 'M' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientGender('F')}
                      className={`text-center py-1 text-xs rounded font-semibold transition-all ${
                        patientGender === 'F' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      F
                    </button>
                  </div>
                </div>
              </div>

              {['fgr_barcelona', 'obstetric_doppler', 'obstetric', 'morphological_1t', 'morphological_2t', 'fetal_echocardiogram'].includes(studyType) && (
                <div className="grid grid-cols-2 gap-3 border-t border-slate-900 pt-3">
                  <div>
                    <label className="block text-[11px] text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" /> Idade Gestacional (Semanas)
                    </label>
                    <input 
                      type="number" 
                      min="15"
                      max="42"
                      value={gestationalWeeks}
                      onChange={(e) => setGestationalWeeks(Math.min(42, Math.max(10, parseInt(e.target.value) || 0)))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-emerald-400 font-semibold mb-1">
                      Dias
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      max="6"
                      value={gestationalDays}
                      onChange={(e) => setGestationalDays(Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Scan Image / Metadata Upload Area */}
          <div id="card-image-uploader" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Upload das Imagens do Exame
              </h2>
              <div className="flex bg-slate-900 border border-slate-800/80 p-0.5 rounded-lg text-[9px] select-none shadow-inner">
                <button
                  type="button"
                  onClick={() => setIsBatchMode(false)}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${!isBatchMode ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchMode(true)}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${isBatchMode ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Lote (Suporta 40+)
                </button>
              </div>
            </div>

            {!isBatchMode ? (
              /* SINGLE IMAGE MODE */
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-800 hover:border-slate-700/80 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-900/10 flex flex-col items-center justify-center gap-2 relative group overflow-hidden"
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <div className="absolute inset-0 z-0 bg-slate-950">
                    <img 
                      src={imagePreview} 
                      alt="Preview de Ultrassom" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent flex items-end justify-center pb-3">
                      <span className="text-[10px] bg-slate-900/90 text-slate-300 px-2 py-1 rounded border border-slate-800 font-semibold uppercase tracking-wider">
                        Clique para substituir
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="relative z-10 flex flex-col items-center gap-1 text-slate-400 group-hover:text-slate-300">
                  <Upload className="w-8 h-8 text-emerald-500 mb-1 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-semibold text-slate-300">Arraste a captura do ultrassom</span>
                  <span className="text-[10px] text-slate-500">Aceita JPG, PNG e capturas de terminal</span>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden" 
                />
              </div>
            ) : (
              /* BATCH IMAGES QUEUE MODE */
              <div className="flex flex-col gap-3">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-850 hover:border-slate-800 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-900/15 flex flex-col items-center justify-center gap-1 relative group"
                  onClick={triggerFileInput}
                >
                  <Upload className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-bold text-slate-300">Selecione ou solte múltiplas imagens</span>
                  <span className="text-[9px] text-slate-500">Adicione até 40+ capturas ao mesmo tempo</span>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden" 
                  />
                </div>

                {batchFiles.length > 0 ? (
                  <div className="flex flex-col gap-2 bg-slate-900/30 border border-slate-900 rounded-xl p-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-900 pb-2 font-mono">
                      <span>Fila do Lote ({batchFiles.length} imagens)</span>
                      <button 
                        type="button"
                        onClick={handleClearBatch}
                        className="text-rose-400 hover:text-rose-300 border border-rose-950/20 bg-rose-950/10 px-2 py-0.5 rounded font-semibold cursor-pointer"
                        disabled={isBatchProcessing}
                      >
                        Limpar Fila
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {batchFiles.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs gap-3 transition-colors ${
                            idx === activeBatchIndex 
                              ? 'bg-indigo-950/20 border-indigo-500/50' 
                              : item.status === 'completed'
                                ? 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-900'
                                : 'bg-slate-900/40 border-slate-900 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img 
                              src={item.preview} 
                              className="w-7 h-7 object-cover rounded border border-slate-800" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="flex flex-col min-w-0">
                              <span 
                                className="text-[11px] font-medium text-slate-300 truncate max-w-[150px]" 
                                title={item.name}
                              >
                                {idx + 1}. {item.name}
                              </span>
                              {item.status === 'completed' && (
                                <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                                  <Check className="w-2.5 h-2.5" /> Extraídas {item.extractedCount} med. 
                                  {item.detectedType && ` | ${getStudyTypeLabel(item.detectedType).split(' ')[0]}`}
                                </span>
                              )}
                              {item.status === 'analyzing' && (
                                <span className="text-[9px] text-indigo-400 font-bold font-mono animate-pulse">
                                  Lendo com IA {item.progress}%...
                                </span>
                              )}
                              {item.status === 'pending' && (
                                <span className="text-[9px] text-slate-500 font-mono">Processamento pendente</span>
                              )}
                              {item.status === 'error' && (
                                <span className="text-[9px] text-rose-400 font-mono truncate max-w-[135px] font-semibold" title={item.errorMsg}>
                                  Erro: {item.errorMsg}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.status === 'completed' && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                            {item.status === 'analyzing' && (
                              <RefreshCw className="w-2.5 h-2.5 text-indigo-400 animate-spin" />
                            )}
                            {item.status === 'pending' && (
                              <span className="w-2 h-2 rounded-full bg-slate-700" />
                            )}
                            {item.status === 'error' && (
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                            )}
                            
                            {item.status === 'error' && (
                              <button
                                type="button"
                                disabled={isBatchProcessing}
                                onClick={() => handleRetryFile(item.id)}
                                className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Re-tentar analisar esta imagem"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isBatchProcessing}
                              onClick={() => handleRemoveBatchFile(item.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-850 bg-slate-900/10 rounded-xl text-center text-slate-500 text-[11px] gap-1.5">
                    <Layers className="w-6 h-6 text-slate-700" />
                    <span>Nenhuma imagem de exame no lote</span>
                    <span className="text-[9px] text-slate-600 max-w-[210px] mx-auto">
                      Selecione todas as fotos do paciente de uma vez. O sistema fará a leitura de cada uma sequencialmente.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Manual Clinical Findings Text Area */}
            <div className="flex flex-col gap-2.5 border-t border-slate-900 pt-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label htmlFor="textarea-exam-findings" className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Nome do Exame + O que Encontrou (Auto-Roteamento)
                </label>
                <div className="inline-flex self-start sm:self-auto items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded text-[9px] text-indigo-400 uppercase tracking-tight">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  Ativo: <span className="font-semibold text-indigo-300">{getStudyTypeLabel(studyType)}</span>
                </div>
              </div>
              
              <textarea
                id="textarea-exam-findings"
                rows={4}
                value={examFindings}
                onChange={(e) => setExamFindings(e.target.value)}
                placeholder="Exemplo para teste de Auto-Roteamento:
'Exame de ultrassom de mamas mostrando nódulo de 14.5mm na mama esquerda classificado como BI-RADS 4' ou 'Doppler de carótidas mostrando ACI direita com VPS de 235 cm/s e VDF de 125 cm/s'..."
                className="w-full bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all font-sans leading-relaxed shadow-inner"
              />
              
              <p className="text-[10px] text-slate-400 leading-relaxed bg-indigo-950/10 border border-indigo-900/20 rounded-lg p-2.5">
                💡 <span className="font-semibold text-slate-300">Inteligência Artificial Ativa:</span> Escreva livremente o nome do exame e as medições acima. O Gemini identificará automaticamente a calculadora adequada de acordo com as diretrizes clínicas e adequará o laudo imediatamente!
              </p>
            </div>

            {/* AI Extraction Primary Button */}
            {!isBatchMode ? (
              <button
                id="btn-ai-extraction"
                onClick={handleExtractWithAI}
                disabled={isAnalyzing || (!imagePreview && !examFindings.trim())}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Mapeando com IA (Gemini)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisar Imagem / Texto via IA (Gemini)
                  </>
                )}
              </button>
            ) : (
              <button
                id="btn-ai-batch-extraction"
                onClick={handleProcessBatch}
                disabled={isBatchProcessing || batchFiles.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer"
              >
                {isBatchProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Lote Ativo: Imagem {activeBatchIndex + 1} de {batchFiles.length}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Processar Lote Inteiro via IA ({batchFiles.length} imagens)
                  </>
                )}
              </button>
            )}
          </div>

          {/* Diagnostic Category Selector Card */}
          <div id="card-study-selector" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Selecionar Especialidade do Exame
            </h2>

            {/* Abdomen e Vias Urinarias */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest pl-1 font-mono">
                Abdomen & Vias Urinárias
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { key: 'abdomen_total', label: 'Abdômen Total' },
                  { key: 'abdomen_superior', label: 'Abdômen Superior' },
                  { key: 'prostate', label: 'Próstata' },
                  { key: 'renal', label: 'Rins / Vias Urinárias' },
                  { key: 'gallbladder_liver', label: 'Hepatobiliar' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => { setStudyType(item.key as StudyType); setExtractedData([]); setGeneratedLaudo(''); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      studyType === item.key
                        ? 'border-emerald-500 bg-emerald-950/20 text-white shadow-md font-bold ring-1 ring-emerald-500/20'
                        : 'border-slate-900 bg-slate-900/30 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Layers2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span className="text-[11px] font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ginecologia, Mama & Vasculares */}
            <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
              <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest pl-1 font-mono">
                Ginecologia, Mama, Vasculares & Geral
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { key: 'thyroid', label: 'Tireoide com/sem Doppler' },
                  { key: 'breast_birads', label: 'Mama' },
                  { key: 'pelvic', label: 'Pélvico' },
                  { key: 'transvaginal', label: 'Transvaginal' },
                  { key: 'carotid_vascular', label: 'Carótidas' },
                  { key: 'venous_lower_limbs', label: 'Venoso de Membros Inf.' },
                  { key: 'arterial_lower_limbs', label: 'Arterial de Membros Inf.' },
                  { key: 'ovary_orads', label: 'Anexos (O-RADS)' },
                  { key: 'scrotal', label: 'Bolsa Escrotal' },
                  { key: 'general_dermatology', label: 'Geral (Dermatológico)' },
                  { key: 'abdominal_wall', label: 'Parede Abdominal' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => { setStudyType(item.key as StudyType); setExtractedData([]); setGeneratedLaudo(''); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      studyType === item.key
                        ? 'border-fuchsia-500 bg-fuchsia-950/20 text-white shadow-md font-bold ring-1 ring-fuchsia-500/20'
                        : 'border-slate-900 bg-slate-900/30 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 shrink-0 text-fuchsia-400" />
                    <span className="text-[11px] font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Obstetrícia & Medicina Fetal */}
            <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest pl-1 font-mono">
                Obstetrícia & Medicina Fetal
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { key: 'obstetric_doppler', label: 'Obstétrico com Doppler' },
                  { key: 'morphological_1t', label: 'Morfológico de 1º Trimestre' },
                  { key: 'morphological_2t', label: 'Morfológico de 2º Trimestre' },
                  { key: 'fetal_echocardiogram', label: 'Ecocardiograma Fetal' },
                  { key: 'obstetric', label: 'Obstétrico de Rotina' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => { setStudyType(item.key as StudyType); setExtractedData([]); setGeneratedLaudo(''); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      studyType === item.key
                        ? 'border-pink-500 bg-pink-955/20 text-white shadow-md font-bold ring-1 ring-pink-500/20'
                        : 'border-slate-900 bg-slate-900/30 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 shrink-0 text-pink-400" />
                    <span className="text-[11px] font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* MIDDLE COLUMN: Programmer's Morphometry and Deterministic Normality Checks (Span 4) */}
        <section id="col-normality-calculator" className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Diagnostic Raw Data Adjuster (Interactive inputs populated after AI) */}
          <div id="card-raw-variables" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Medidas Extraídas
              </h2>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded font-mono uppercase">
                Ajuste Manual Livre
              </span>
            </div>

            {extractedData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <Search className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Nenhuma medida de imagem carregada ainda.
                </p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">
                  Por favor, escolha um dos <strong className="text-slate-400">Casos Clínicos</strong> à esquerda ou faça upload de um exame para ver o módulo de programação em tempo real.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">
                
                {extractedData.map((struct, structIdx) => (
                  <div 
                    key={structIdx} 
                    className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col gap-3 relative group"
                  >
                    {/* Structure Details Title */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">{struct.name}</span>
                      <button 
                        onClick={() => handleRemoveStructure(structIdx)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Remover Estrutura"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Numeric Value Sliders & Direct Inputs */}
                    <div className="flex flex-col gap-3">
                      {Object.keys(struct.measurements).map((mKey) => {
                        const mObj = struct.measurements[mKey];
                        const isCode = mObj.unit === 'code';
                        return (
                          <div key={mKey} className="bg-slate-950/85 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-300 font-medium">{mObj.label || mKey}</span>
                              <div className="flex items-center gap-1.5 font-mono">
                                {!isCode ? (
                                  <>
                                    <input 
                                      type="number" 
                                      step={mObj.unit === 'index' ? '0.01' : '1'}
                                      value={mObj.value}
                                      onChange={(e) => handleUpdateMeasurement(structIdx, mKey, parseFloat(e.target.value) || 0)}
                                      className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right font-medium text-emerald-400 text-xs focus:outline-none focus:border-emerald-500"
                                    />
                                    <select
                                      value={mObj.unit}
                                      onChange={(e) => handleUpdateMeasurementUnit(structIdx, mKey, e.target.value)}
                                      className="bg-slate-900 border border-slate-700 rounded px-0.5 py-0.5 text-[10px] text-slate-400 focus:outline-none"
                                    >
                                      <option value="mm">mm</option>
                                      <option value="cm">cm</option>
                                      <option value="g">g</option>
                                      <option value="mL">mL</option>
                                      <option value="bpm">bpm</option>
                                      <option value="sem">sem</option>
                                      <option value="dias">dias</option>
                                      <option value="index">index</option>
                                      <option value="code">code</option>
                                    </select>
                                  </>
                                ) : (
                                  <span className="text-[10px] bg-slate-800 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-semibold select-none">
                                    Qualitativo
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Conditional UI based on key values and types */}
                            {mObj.unit === 'code' ? (
                              <select
                                value={mObj.value}
                                onChange={(e) => handleUpdateMeasurement(structIdx, mKey, parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              >
                                {mKey === 'ua_status' ? (
                                  <>
                                    <option value={0}>0 - Diástole Normal / Presente</option>
                                    <option value={1}>1 - Diástole Ausente (AEDF)</option>
                                    <option value={2}>2 - Diástole Reversa (REDF)</option>
                                  </>
                                ) : mKey === 'aoi_status' ? (
                                  <>
                                    <option value={0}>0 - Fluxo Anterógrado (Normal)</option>
                                    <option value={1}>1 - Fluxo Reverso (Alterado)</option>
                                  </>
                                ) : mKey === 'dv_a_wave' ? (
                                  <>
                                    <option value={0}>0 - Onda "a" Presente (Normal)</option>
                                    <option value={1}>1 - Onda "a" Ausente/Reversa (Alterada)</option>
                                  </>
                                ) : (
                                  <>
                                    <option value={0}>0 - Normal / Conservado</option>
                                    <option value={1}>1 - Anormal / Alterado</option>
                                  </>
                                )}
                              </select>
                            ) : (
                              <input 
                                type="range" 
                                min="0" 
                                max={
                                  mObj.unit === 'g' ? '5000' :
                                  mObj.unit === 'bpm' ? '220' : 
                                  mObj.unit === 'cm' ? '30' : 
                                  mObj.unit === 'sem' ? '42' : 
                                  mObj.unit === 'dias' ? '6' : 
                                  mObj.unit === 'index' ? '4.00' : '350'
                                } 
                                step={mObj.unit === 'index' ? '0.01' : '1'}
                                value={mObj.value || 0}
                                onChange={(e) => handleUpdateMeasurement(structIdx, mKey, parseFloat(e.target.value) || 0)}
                                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Direct Manual Adder - For fully customized scans */}
                <div className="mt-2 p-3 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl flex flex-col gap-2.5">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-500" />
                    Adicionar Estrutura Manualmente
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Nome Ex: Lobo Direito" 
                      value={manualStructureName}
                      onChange={(e) => setManualStructureName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-1.5 rounded text-white"
                    />
                    <select
                      value={manualStructureKey}
                      onChange={(e) => setManualStructureKey(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-1.5 rounded text-slate-300"
                    >
                      <option value="">Selecione a Regra</option>
                      <option value="right_lobe">Volume de Lobo Direito (Tireoide)</option>
                      <option value="left_lobe">Volume de Lobo Esquerdo (Tireoide)</option>
                      <option value="isthmus">Espessura do Ístmo (Tireoide)</option>
                      <option value="right_kidney">Comprimento de Rim Dir (Renal)</option>
                      <option value="left_kidney">Comprimento de Rim Esq (Renal)</option>
                      <option value="gallbladder_wall">Parede Vesícula (Hepatobiliar)</option>
                      <option value="liver_size">Eixo do Fígado (Hepatobiliar)</option>
                      <option value="common_bile_duct">Diâmetro Colédoco (Hepatobiliar)</option>
                      <option value="ccn">CCN Embrionário (Obstétrico)</option>
                      <option value="fcf">FCF Batimento Fetal (Obstétrico)</option>
                      <option value="yolk_sac">Vesícula Vitelina (Obstétrico)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStructure}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-[11px] py-1.5 rounded-lg text-slate-200 transition-colors cursor-pointer"
                  >
                    Inserir Nova Estrutura
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Reference guidelines Card */}
          <div id="card-rules-reference" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Princípios de Regras (Sem IA)
              </h2>
              <button
                onClick={() => {
                  setActiveCategoryFilter(studyType);
                  setShowReferencesModal(true);
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded transition-all font-semibold flex items-center gap-1 cursor-pointer"
                title="Visualizar referências bibliográficas do EURP completas"
              >
                <BookmarkCheck className="w-3 h-3" />
                Biblio EURP
              </button>
            </div>
            
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {referenceRanges[studyType].map((item, index) => (
                <div key={index} className="p-2 bg-slate-900/50 rounded border border-slate-900 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-300">{item.param}</span>
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>Faixa Normal: <strong className="text-slate-200">{item.ref}</strong></span>
                    <span className="font-mono text-[8px] bg-slate-800 px-1 py-0.5 text-indigo-400 rounded">{item.formula}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              id="btn-open-full-ref-library"
              onClick={() => {
                setActiveCategoryFilter('all');
                setShowReferencesModal(true);
              }}
              className="mt-1 w-full bg-slate-900 hover:bg-slate-850 hover:text-emerald-400 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
              Diretório Bibliográfico Geral EURP
            </button>
          </div>

        </section>

        {/* RIGHT COLUMN: Deterministic calculations, live logs & final drafted clinical report (Span 4 / Bento style Layout) */}
        <section id="col-clinical-results" className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Output of Deterministic Calculation - Step-by-Step logs */}
          <div id="card-calculation-display" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              3. Status de Normalidade (Software)
            </h2>

            {calculatedNormality ? (
              <div className="flex flex-col gap-4">
                {/* Overall status health badge done programmatically */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  calculatedNormality.overallStatus === 'altered' 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' 
                    : calculatedNormality.overallStatus === 'borderline'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200'
                }`}>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block opacity-75">Status Global do Diagnóstico</span>
                    <span className="text-sm font-black capitalize flex items-center gap-1.5 mt-0.5">
                      {calculatedNormality.overallStatus === 'altered' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      {calculatedNormality.overallStatus === 'borderline' && <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />}
                      {calculatedNormality.overallStatus === 'normal' && <Check className="w-4 h-4 text-emerald-400" />}
                      {calculatedNormality.overallStatus === 'normal' ? 'Normal / Fisiológico' : calculatedNormality.overallStatus === 'borderline' ? 'Alteração Limítrofe' : 'Disfunção Biométrica Detectada'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-1 rounded select-none font-semibold">
                    CÁLCULO MATEMÁTICO ESTRITO
                  </span>
                </div>

                {/* Individual parsed results structured in boxes showing Obtained vs Normal ranges */}
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {calculatedNormality.structuresEvaluated.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{item.structureName}</span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                          item.status === 'altered' 
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                            : item.status === 'borderline'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {item.status === 'normal' ? 'OK' : item.status === 'borderline' ? 'Limítrofe' : 'Alterado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                        <div>
                          Obtido: <strong className="text-slate-100">{item.valueObtained}</strong>
                        </div>
                        <div>
                          Limites: <strong className="text-slate-200">{item.referenceRange}</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 italic bg-slate-950/40 px-2 py-1.5 rounded border border-slate-900 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Real-time analytical mathematical logs */}
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider block mb-1.5 uppercase">
                    Memória de Execução Programática
                  </span>
                  <div className="flex flex-col gap-1 font-mono text-[10px] text-indigo-300">
                    {calculatedNormality.mathematicalInsights.map((insight, index) => (
                      <span key={index} className="flex gap-1.5 leading-relaxed">
                        <span className="text-indigo-500 shrink-0 select-none">›</span>
                        {insight}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                Inicie um caso para visualizar a triagem morfométrica estruturada por software.
              </div>
            )}
          </div>

          {/* AI Drafting report trigger button and preview block */}
          <div id="card-laudo-draft" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              4. Pré-Laudo Médico Sintetizado
            </h2>

            <button
              id="btn-generate-report"
              disabled={isGeneratingLaudo || extractedData.length === 0}
              onClick={handleGenerateFinalLaudo}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {isGeneratingLaudo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sintetizando Dados no Laudo Modelo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Gerar Laudo Clínico Estruturado
                </>
              )}
            </button>

            {generatedLaudo ? (
              <div className="flex-1 flex flex-col gap-3">
                {/* TABS HEADER */}
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('a4')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        previewTab === 'a4'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualizar Papel (A4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('raw')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        previewTab === 'raw'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Editor de Texto
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Laudo Modelo Franco
                  </span>
                </div>

                {/* TAB CONTENT: A4 SHEETS OR DOCUMENT EDITOR */}
                {previewTab === 'a4' ? (
                  <div className="flex-1 bg-white text-slate-850 rounded-xl shadow-lg border border-slate-200 p-6 max-h-[420px] overflow-y-auto font-sans leading-relaxed text-[12px] select-text selection:bg-indigo-100 selection:text-indigo-900">
                    
                    {/* Header */}
                    <div className="flex justify-between items-end border-b-2 border-slate-200 pb-3 mb-4">
                      <div className="text-left">
                        <h1 className="text-[17px] font-black tracking-tight text-[#1b365d] leading-none mb-1">CLÍNICA FRANCO</h1>
                        <p className="text-[10px] font-bold text-slate-600 leading-none">Dr. Rodrigo Duarte Franco</p>
                        <p className="text-[9.5px] text-slate-500 leading-none mt-1">CRM-MS 10087 • www.ajudamediko.com.br</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-[15px] font-black text-[#1b365d] leading-none mb-0.5">LAUDO DE ULTRASSOM</h2>
                        <p className="text-[10px] font-semibold text-slate-500 leading-none">{studyTypeLabels[studyType] || getStudyTypeLabel(studyType)}</p>
                      </div>
                    </div>

                    {/* Patient/Exam Demographics Card */}
                    {(() => {
                      const { dumDateFormatted, dppDateFormatted, igFormatted, isObstetric } = getDUMAndDPP();
                      const todayStr = new Date().toLocaleDateString('pt-BR');
                      return (
                        <div className="border border-slate-300 rounded-lg p-3 bg-white mb-4">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-2">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Paciente</span>
                              <span className="text-xs font-bold text-slate-900 truncate block">{patientName ? patientName.toUpperCase() : 'PACIENTE ANÔNIMO'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Data do Exame</span>
                              <span className="text-xs font-bold text-slate-900 block">{todayStr}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{isObstetric ? 'DUM Informada' : 'Sexo'}</span>
                              <span className="text-xs font-bold text-slate-900 block">{isObstetric ? dumDateFormatted : (patientGender === 'M' ? 'Masculino' : 'Feminino')}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-3 mt-2.5 pt-2.5 border-t border-dashed border-slate-200">
                            <div className="col-span-2">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{isObstetric ? 'Idade Gestacional (USG)' : 'Idade'}</span>
                              <span className="text-xs font-bold text-[#1b365d] block">{isObstetric ? igFormatted : (patientAge ? `${patientAge} Anos` : '---')}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{isObstetric ? 'DPP' : 'Médico Res.'}</span>
                              <span className="text-xs font-bold text-slate-900 block">{isObstetric ? dppDateFormatted : 'Dr. Rodrigo Franco'}</span>
                            </div>
                            <div>
                              {/* Empty slot */}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Parametric metrics table alignment */}
                    <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parâmetros do Exame</div>
                    <div className="border border-slate-100 rounded-lg px-3 py-1 bg-slate-50/50 mb-5 text-[11px]">
                      <table className="w-full">
                        <tbody>
                          {calculatedNormality && Array.isArray(calculatedNormality.evaluations) && calculatedNormality.evaluations.length > 0 ? (
                            calculatedNormality.evaluations.map((ev, i) => (
                              <tr key={i} className="border-b border-slate-100 last:border-0 py-1.5">
                                <td className="py-1.5 pr-4 text-slate-700 font-semibold w-1/3 text-[11px]">{ev.structureName || ev.parameterLabel}</td>
                                <td className="py-1.5 px-2 text-[#1b365d] font-bold w-1/6 text-[11px]">{ev.valueObtained}</td>
                                <td className="py-1.5 pl-4 text-slate-600 text-[10.5px]">
                                  {ev.status === 'altered' ? (
                                    <span className="text-amber-700 font-bold">⚠️ Alterado • </span>
                                  ) : ev.status === 'critical' ? (
                                    <span className="text-rose-700 font-bold">🚨 Crítico • </span>
                                  ) : (
                                    <span className="text-emerald-700 font-bold">✓ Normal • </span>
                                  )}
                                  {ev.explanation}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-3 text-center text-slate-400 italic">
                                Nenhum parâmetro biométrico registrado no laudo.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Main Markdown Body Content */}
                    <div 
                      className="text-slate-700 leading-relaxed text-[11.5px] font-sans antialiased" 
                      dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(generatedLaudo) }}
                    />

                    {/* Signature stamp section */}
                    <div className="flex flex-col items-center justify-center mt-8 border-t border-slate-100 pt-4">
                      {/* Doctor cursive elegant signature (SVG paths) */}
                      <svg viewBox="0 0 200 60" width="150" height="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" className="text-[#102a43] select-none">
                        <path d="M 15 42 C 28 18, 38 8, 48 20 C 58 32, 68 46, 78 30 C 88 14, 98 6, 108 22 C 118 38, 128 50, 138 38 C 148 26, 168 8, 178 16 C 188 24, 158 46, 148 48 C 138 50, 118 40, 148 26 C 178 12, 190 6, 196 10 M 74 24 A 4 4 0 1 1 78 28" stroke="#102b43" strokeWidth="2" />
                      </svg>
                      <div className="w-1/3 border-t border-slate-300 my-1"></div>
                      <span className="text-[10px] font-black text-slate-700 leading-none">Dr. Rodrigo Duarte Franco</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1">CRM-MS 10087</span>
                    </div>

                    {/* Dynamic Image Sheets (6 per page) */}
                    {(() => {
                      const activeImages = getActiveImages();
                      const imageChunks = chunkArray(activeImages, 6);
                      if (imageChunks.length === 0) return null;
                      
                      return (
                        <div className="mt-10 border-t-2 border-slate-200 pt-6">
                          <h4 className="text-xs font-black text-[#1b365d] mb-4 tracking-wider uppercase flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-500" />
                            Anexo Fotográfico ({activeImages.length} {activeImages.length === 1 ? 'Imagem' : 'Imagens'}) • Distribuição de 6 por Folha
                          </h4>
                          
                          <div className="flex flex-col gap-8">
                            {imageChunks.map((chunk, chunkIndex) => (
                              <div key={chunkIndex} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 shadow-sm relative">
                                <div className="absolute top-3 right-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  Folha {chunkIndex + 1} de {imageChunks.length}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  {chunk.map((img, imgIndex) => (
                                    <div key={imgIndex} className="border border-slate-200 rounded-lg p-2 bg-white flex flex-col justify-between items-center h-[170px] shadow-sm hover:border-indigo-400 transition-colors">
                                      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                                        <img 
                                          src={img} 
                                          alt={`Captura ${chunkIndex * 6 + imgIndex + 1}`}
                                          className="max-w-full max-h-[120px] object-contain rounded"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-500 mt-2 text-center truncate w-full">
                                        REGISTRO #{chunkIndex * 6 + imgIndex + 1}
                                      </span>
                                    </div>
                                  ))}
                                  {/* Dummy boxes to keep the clean A4 look if less than 6 on last sheet */}
                                  {Array.from({ length: 6 - chunk.length }).map((_, i) => (
                                    <div key={`empty-${i}`} className="border border-dashed border-slate-200 rounded-lg p-2 bg-slate-50/30 flex items-center justify-center h-[170px]">
                                      <span className="text-[9px] font-semibold text-slate-350 italic">Espaço Disponível</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                ) : (
                  <textarea
                    id="laudo-preview-editor"
                    className="flex-1 w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-3.5 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[300px] h-[350px] resize-none"
                    value={generatedLaudo}
                    onChange={(e) => setGeneratedLaudo(e.target.value)}
                    placeholder="Escreva ou edite o laudo em formato markdown..."
                  />
                )}

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-800"
                    title="Copiar Texto"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    Copiar
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-1.5 p-2 bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-blue-900/20"
                    title="Imprimir Laudo"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    Imprimir (A4)
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-800"
                    title="Salvar como arquivo TXT"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    Salvar TXT
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-850 rounded-xl bg-slate-900/10 text-slate-500 font-medium text-xs leading-relaxed">
                <FileText className="w-10 h-10 text-slate-700 mb-2 animate-pulse" />
                <span>O laudo preliminar ainda não foi sintetizado.</span>
                <span className="text-[10px] text-slate-600 mt-1">Clique no botão superior após extrair ou definir medidas médicas.</span>
              </div>
            )}
          </div>

        </section>

      </main>

      <footer id="clinical-footer" className="border-t border-slate-800 bg-slate-950 py-4 px-6 mt-auto shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-slate-500 font-mono text-center md:text-left max-w-4xl">
          © 2026 Assistente de Ultrassonografia Determinística. Este software é um assistente clínico de suporte ao diagnóstico. Toda conclusão médica gerada deve ser supervisionada, revisada e homologada por profissional capacitado sob as normas regulatórias de saúde do CFM / CBR.
        </p>
        <button
          onClick={() => setIsAuditOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[11px] font-bold text-slate-350 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition-all cursor-pointer shadow-sm select-none shrink-0"
        >
          <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Auditoria & Rastreabilidade
        </button>
      </footer>

      {showReferencesModal && (
        <div id="modal-eurp-directory" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <BookmarkCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight">Diretório Geral de Referências Bibliográficas EURP</h3>
                  <p className="text-xs text-slate-400">Escola Ultra-sonográfica de Ribeirão Preto • Fundada por Prof. Dr. Francisco Mauad Filho</p>
                </div>
              </div>
              <button
                onClick={() => setShowReferencesModal(false)}
                className="text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-colors cursor-pointer border border-slate-700"
              >
                Fechar
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Category selector */}
              <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'thyroid', label: 'Tireoide' },
                  { key: 'renal', label: 'Rins & Bexiga' },
                  { key: 'gallbladder_liver', label: 'Hepatobiliar/Baço/Pâncreas' },
                  { key: 'obstetric', label: 'Obstetrícia 1º Tri' },
                  { key: 'fgr_barcelona', label: 'Fetal 2º/3º Tri & FGR' },
                  { key: 'carotid_vascular', label: 'Carótida & Vertebral' },
                  { key: 'echocardiogram', label: 'Ecocardiograma' }
                ].map(c => (
                  <button
                    key={c.key}
                    onClick={() => setActiveCategoryFilter(c.key)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeCategoryFilter === c.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search input field */}
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar tabela ou parâmetro..."
                  value={refSearchQuery}
                  onChange={(e) => setRefSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Modal Body / Table Directory Cards */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 grid md:grid-cols-2 gap-4">
              {eurpReferencesDb
                .filter(table => activeCategoryFilter === 'all' || table.category === activeCategoryFilter)
                .filter(table => {
                  if (!refSearchQuery) return true;
                  const query = refSearchQuery.toLowerCase();
                  return (
                    table.tableName.toLowerCase().includes(query) ||
                    table.chapterTitle.toLowerCase().includes(query) ||
                    table.description.toLowerCase().includes(query) ||
                    table.parameters.some(p => p.parameter.toLowerCase().includes(query) || p.clinicalSignificance.toLowerCase().includes(query))
                  );
                })
                .map((table) => (
                  <div key={table.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors">
                    {/* Header: Table Title & Page Number */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono border border-emerald-500/20 uppercase font-bold shrink-0">
                          {table.category === 'thyroid' 
                            ? 'Tireoide' 
                            : table.category === 'renal' 
                            ? 'Rim/Bexiga' 
                            : table.category === 'gallbladder_liver' 
                            ? 'Abdominal' 
                            : table.category === 'obstetric' 
                            ? 'Obst. Inicial' 
                            : table.category === 'carotid_vascular' 
                            ? 'Carótida/Vertebral' 
                            : table.category === 'echocardiogram'
                            ? 'Ecocardiograma'
                            : 'Fetal / FGR'}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 shrink-0">
                          {table.pageRange}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-100 mt-1">{table.tableName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium italic">{table.chapterTitle}</p>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      {table.description}
                    </p>

                    {/* Parameters evaluated mapped */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Critérios Codificados Aplicados:</span>
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {table.parameters.map((p, idx) => (
                          <div key={idx} className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold text-slate-200">{p.parameter}</span>
                              <span className="text-[10.5px] font-black text-emerald-400 font-mono text-right shrink-0 ml-2">{p.normalRange}</span>
                            </div>
                            <p className="text-[9.5px] text-slate-500 leading-relaxed italic">{p.clinicalSignificance}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scientific Citation */}
                    <div className="mt-auto border-t border-slate-800/80 pt-3">
                      <span className="text-[9px] uppercase tracking-widest text-slate-600 block font-bold font-mono">Referência Bibliográfica de Triagem:</span>
                      <p className="text-[9.5px] text-slate-500 font-mono leading-relaxed mt-0.5">{table.citation}</p>
                    </div>
                  </div>
                ))}
              {eurpReferencesDb.filter(table => activeCategoryFilter === 'all' || table.category === activeCategoryFilter).length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                  Nenhuma referência encontrada para esta categoria ou termo pesquisado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Side Drawer for Laudo History */}
      {isHistoryOpen && (
        <div id="history-overlay" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end transition-all duration-300">
          {/* Dismiss Click Area */}
          <div className="absolute inset-0" onClick={() => setIsHistoryOpen(false)} />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Histórico de Laudos</h3>
                  <p className="text-[10px] text-slate-500 font-mono">{laudoHistory.length} {laudoHistory.length === 1 ? 'laudo registrado' : 'laudos registrados'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 px-2.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
              {laudoHistory.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
                  <FileText className="w-12 h-12 text-slate-700 opacity-30" />
                  <p className="text-xs font-medium text-slate-500">Nenhum laudo salvo no histórico ainda.</p>
                  <p className="text-[10px] text-slate-600 max-w-[240px]">Os laudos serão salvos automaticamente aqui sempre que forem gerados comercialmente ou sob demanda.</p>
                </div>
              ) : (
                laudoHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex flex-col gap-3 transition-all group"
                  >
                    {/* Header: Name and Date */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-200 truncate capitalize">
                            {item.patientName || 'Paciente Anônimo'}
                          </span>
                          <span className="text-[9px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.2 rounded font-mono uppercase">
                            {item.studyTypeLabel.replace('Ultrassonografia de ', '').replace('Ultrassonografia ', '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-mono">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.patientAge ? `${item.patientAge} anos` : 'Idade omitida'}</span>
                          <span>•</span>
                          <span>{item.patientGender === 'M' ? 'Masc' : 'Fem'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Report Preview Snippet */}
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-900 text-[10.5px] font-mono text-slate-400 max-h-24 overflow-hidden relative select-none">
                      <div className="line-clamp-4 whitespace-pre-wrap leading-relaxed">
                        {item.generatedLaudo.replace(/[\#\*\-\[\]]/g, '')}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                    </div>

                    {/* Interactive Actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-900/80 pt-2.5">
                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-950 text-rose-400 hover:text-white hover:bg-rose-950/80 border border-rose-950 hover:border-rose-900 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        title="Apagar este laudo permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Apagar
                      </button>
                      <button
                        onClick={() => handleReviewHistoryItem(item)}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all hover:shadow cursor-pointer"
                        title="Rever este laudo e repovoar o painel para impressão"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Rever
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Side Drawer for Technical Audit logs */}
      {isAuditOpen && (
        <div id="audit-overlay" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end transition-all duration-300 animate-none">
          {/* Dismiss Click Area */}
          <div className="absolute inset-0" onClick={() => setIsAuditOpen(false)} />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">Auditoria & Rastreabilidade Técnica</h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {auditLogs.length} transações registradas localmente
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAuditOpen(false)}
                className="p-1 px-2.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {/* Filter controls and Search */}
            <div className="p-4 border-b border-slate-900 bg-slate-900/10 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por erro, ação, imagem..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {auditLogs.length > 0 && (
                  <button
                    onClick={clearAuditLogs}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-950 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                    title="Limpar todos os registros de auditoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {(['all', 'error', 'warning', 'success'] as const).map(f => {
                  const count = f === 'all' 
                    ? auditLogs.length 
                    : auditLogs.filter(l => l.type === f).length;
                  
                  return (
                    <button
                      key={f}
                      onClick={() => setAuditFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        auditFilter === f
                          ? f === 'error'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : f === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : f === 'success'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      {f === 'all' && 'Todos'}
                      {f === 'error' && 'Erros'}
                      {f === 'warning' && 'Avisos'}
                      {f === 'success' && 'Sucessos'}
                      <span className="ml-1 opacity-60 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 custom-scrollbar bg-slate-950">
              {auditLogs.filter(log => {
                if (auditFilter !== 'all' && log.type !== auditFilter) return false;
                if (!auditSearchQuery) return true;
                const search = auditSearchQuery.toLowerCase();
                return (
                  log.action.toLowerCase().includes(search) ||
                  log.status.toLowerCase().includes(search) ||
                  log.details.toLowerCase().includes(search) ||
                  (log.payload && log.payload.toLowerCase().includes(search))
                );
              }).length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center gap-2 bg-slate-900/10 rounded-2xl border border-slate-900/60 p-6">
                  <Activity className="w-10 h-10 text-slate-800" />
                  <p className="text-xs font-semibold text-slate-500">Nenhum evento registrado no filtro ativo.</p>
                  <p className="text-[10px] text-slate-600 max-w-[280px] leading-relaxed">
                    Eventos técnicos como login, análise OCR por IA de imagens, rate limits ou erros de payload do Gemini aparecerão aqui.
                  </p>
                </div>
              ) : (
                auditLogs
                  .filter(log => {
                    if (auditFilter !== 'all' && log.type !== auditFilter) return false;
                    if (!auditSearchQuery) return true;
                    const search = auditSearchQuery.toLowerCase();
                    return (
                      log.action.toLowerCase().includes(search) ||
                      log.status.toLowerCase().includes(search) ||
                      log.details.toLowerCase().includes(search) ||
                      (log.payload && log.payload.toLowerCase().includes(search))
                    );
                  })
                  .map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const isError = log.type === 'error';
                    const isWarning = log.type === 'warning';
                    const isSuccess = log.type === 'success';

                    return (
                      <div 
                        key={log.id} 
                        className={`border rounded-xl transition-all ${
                          isError 
                            ? 'bg-rose-950/10 border-rose-900/40 hover:border-rose-900/70' 
                            : isWarning 
                            ? 'bg-amber-950/10 border-amber-900/30 hover:border-amber-900/60'
                            : isSuccess 
                            ? 'bg-emerald-950/10 border-emerald-900/30 hover:border-emerald-900/60'
                            : 'bg-slate-900/30 border-slate-800/85 hover:border-slate-800'
                        }`}
                      >
                        {/* Event Header Card */}
                        <div 
                          onClick={() => {
                            if (log.payload) {
                              setExpandedLogId(isExpanded ? null : log.id);
                            }
                          }}
                          className={`p-3 flex items-start gap-3 select-none ${log.payload ? 'cursor-pointer' : ''}`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isError 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : isWarning 
                              ? 'bg-amber-500/10 text-amber-400'
                              : isSuccess 
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-indigo-500/15 text-indigo-400'
                          }`}>
                            <Activity className="w-4.5 h-4.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider">{log.timestamp}</span>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md font-mono ${
                                isError 
                                  ? 'bg-rose-500/15 text-rose-300' 
                                  : isWarning 
                                  ? 'bg-amber-500/15 text-amber-300'
                                  : isSuccess 
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-indigo-500/15 text-indigo-300'
                              }`}>
                                {log.status.toUpperCase()}
                              </span>
                            </div>

                            <h4 className="text-[11.5px] font-black text-slate-100 mt-1">{log.action}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">{log.details}</p>
                            
                            {log.payload && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedLogId(isExpanded ? null : log.id);
                                }}
                                className="inline-flex items-center gap-1 text-[9.5px] font-bold text-slate-500 hover:text-indigo-400 transition-colors mt-2 font-mono cursor-pointer"
                              >
                                {isExpanded ? '[-] Recolher dados técnicos' : '[+] Expandir metadados e payload JSON'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expandable Technical Trace details container */}
                        {isExpanded && log.payload && (
                          <div className="px-3 pb-3 border-t border-slate-900 bg-slate-950 rounded-b-xl overflow-hidden animate-none">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Objeto JSON da Transação:</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(log.payload || '');
                                  showStatus('Payload copiado para a área de transferência!', 'success');
                                }}
                                className="px-1.5 py-0.5 text-[8.5px] font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                              >
                                Copiar JSON
                              </button>
                            </div>
                            <pre className="text-[9.5px] font-mono text-emerald-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 overflow-x-auto whitespace-pre leading-normal max-h-60 custom-scrollbar select-text selection:bg-indigo-500/30">
                              {log.payload}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
