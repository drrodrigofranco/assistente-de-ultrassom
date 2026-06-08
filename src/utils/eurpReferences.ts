export interface EurpReferenceUnit {
  parameter: string;
  normalRange: string;
  clinicalSignificance: string;
}

export interface EurpReferenceTable {
  id: string;
  category: string;
  tableName: string;
  chapterTitle: string;
  citation: string;
  description: string;
  pageRange: string;
  parameters: EurpReferenceUnit[];
}

export const eurpReferencesDb: EurpReferenceTable[] = [
  {
    id: "eurp-thyroid-tab97",
    category: "thyroid",
    tableName: "Tabela 97 - Biometria Lobar Individual",
    chapterTitle: "Glândula Tireoide e Istmo - Dimensões e Volumes Normativos",
    citation: "Mauad Filho F, Casabona L, Gallarreta FMP, et al. Livro de Bolso de Ultrassonografia Ginecologia, Obstetrícia e Órgãos Internos. Escola Ultra-sonográfica de Ribeirão Preto (EURP).",
    description: "Define as dimensões limítrofes individuais dos eixos longitudinais, transversais e de espessura (anteroposterior) dos lobos direito e esquerdo da tireoide, permitindo classificar eixos aumentados ou reduzidos de forma preliminar ao cálculo volumétrico elipsoide total.",
    pageRange: "Págs. 178 - 182",
    parameters: [
      {
        parameter: "Eixo Longitudinal (Comprimento)",
        normalRange: "40.0 - 70.0 mm",
        clinicalSignificance: "Se > 70 mm indica hipertrofia longitudinal acentuada; se < 40 mm sugere atrofia ou hipotireoidismo congênito secundário."
      },
      {
        parameter: "Eixo Transversal (Largura)",
        normalRange: "10.0 - 30.0 mm",
        clinicalSignificance: "Eixo horizontal de referência; valores aumentados são sinais comuns de bócio difuso eutireóideo ou tireotoxicose."
      },
      {
        parameter: "Eixo Anteroposterior (Espessura)",
        normalRange: "10.0 - 20.0 mm",
        clinicalSignificance: "Profundidade do lobo; espessamentos AP são os primeiros marcadores físicos de tireoidites autoimunes agudas."
      },
      {
        parameter: "Volume Total (Feminino)",
        normalRange: "2.0 - 15.0 cm³ (mL)",
        clinicalSignificance: "Volume acumulado pela soma dos elipsóides lobares. Valores > 15 cm³ caracterizam bócio tireoidiano clássico."
      },
      {
        parameter: "Volume Total (Masculino)",
        normalRange: "2.0 - 18.0 cm³ (mL)",
        clinicalSignificance: "Volume acumulado masculino normal decorrente de maior superfície corporal corporativa."
      }
    ]
  },
  {
    id: "eurp-thyroid-isthmus",
    category: "thyroid",
    tableName: "Seção de Istmo Tireoidiano",
    chapterTitle: "Espessura Normativa do Ístmo da Tireoide",
    citation: "Mauad Filho F, et al. Manual de Referências e Acertos Diagnósticos em Ultrassonografia, Editora EURP.",
    description: "Determina o nível de espessura máximo fisiológico para o istmo que conecta os lobos tireoidianos. Espessamentos são correlacionados com estados difusivos de tireoidite ou bócio multinodular istmico.",
    pageRange: "Pág. 183",
    parameters: [
      {
        parameter: "Espessura Anteroposterior do Ístmo",
        normalRange: "≤ 5.0 mm",
        clinicalSignificance: "Valores acima de 5.0 mm são considerados espessados, sugerindo reações inflamatórias crônicas (Tireoidite de Hashimoto) ou hipertrofia compensatória."
      }
    ]
  },
  {
    id: "eurp-renal-tab92",
    category: "renal",
    tableName: "Tabela 92 - Dimensões e Proporções do Parênquima Renal em Adultos",
    chapterTitle: "Morfometria do Trato Urinário Superior / Rins",
    citation: "Mauad Filho F, Gadelha MAC, Gallarreta FMP. Diretrizes em Ultrassonografia Renal de Adultos - EURP.",
    description: "Apresenta a variação distributiva ideal para os eixos renais longitudinais, larguras e espessuras anteroposteriores do rim em pacientes normotensos normais, além de delimitar a espessura ideal do parênquima ativo córtex-medular contra senilidade prematura.",
    pageRange: "Págs. 140 - 144",
    parameters: [
      {
        parameter: "Comprimento Longitudinal",
        normalRange: "90.0 - 120.0 mm (9.0 - 12.0 cm)",
        clinicalSignificance: "Reduções bilaterais sugerem insuficiência renal crônica em estágio avançado. Aumentos acentuados indicam edema inflamatório agudo, nefrose aguda ou rim vicariante contralateral."
      },
      {
        parameter: "Largura Renal",
        normalRange: "40.0 - 60.0 mm",
        clinicalSignificance: "Regula o diâmetro transversal renal médio. Valores aumentados apoiam o diagnóstico de nefromegalia por congestão ou hidronefrose severa."
      },
      {
        parameter: "Espessura Renal AP",
        normalRange: "30.0 - 50.0 mm",
        clinicalSignificance: "Diâmetro AP normal do órgão. Alterado em processos obstrutivos e distensões pielocalicinais."
      },
      {
        parameter: "Espessura do Parênquima Renal",
        normalRange: "≥ 10.0 mm",
        clinicalSignificance: "A espessura parenquimatosa inferior a 10 mm é indicadora primária de adelgaçamento cortical, nefropatia crônica difusa ou esclerose senil renal irreversível."
      },
      {
        parameter: "Índice de Simetria Renal (Delta)",
        normalRange: "< 15.0 mm (Diferença Longitudinal)",
        clinicalSignificance: "Umas das maiores referências do EURP: diferenças de comprimento longitudinal superiores a 15 mm entre o rim esquerdo e direito indicam assimetria patológica severa, necessitando de investigação de estenose em artéria renal ou nefropatia unilateral de refluxo."
      }
    ]
  },
  {
    id: "eurp-renal-tab99",
    category: "renal",
    tableName: "Tabela 99 - Criteriólogos Clínicos da Bexiga Urinária de Adultos",
    chapterTitle: "Ultrassonografia do Trato Urinário Inferior e Dinâmica Vesical",
    citation: "Mauad Filho F, et al. Livro de Bolso de Ultrassonografia - EURP.",
    description: "Avalia a parede vesical, resíduos pós-miccionais imediatos e capacidade total repletada volumétrica para triagem de cistites, obstruções prostáticas crônicas ou bexigas de esforço (neurogênicas).",
    pageRange: "Págs. 145 - 149",
    parameters: [
      {
        parameter: "Espessura da Parede (Cheia)",
        normalRange: "≤ 4.0 mm",
        clinicalSignificance: "Paredes espessadas com a bexiga repletada são o sinal patognomônico primário de inflamações bacterianas, cistites crônicas ou hipertrofia idiopática do músculo detrusor de esforço."
      },
      {
        parameter: "Espessura da Parede (Vazia/Parcial)",
        normalRange: "≤ 8.0 mm",
        clinicalSignificance: "Ao exame pós-miccional, a parede acomoda-se e engrossa, sendo aceitos até 8 mm como diâmetro fisiológico contração."
      },
      {
        parameter: "Resíduo Pós-Miccional (RPM)",
        normalRange: "< 30.0 mL",
        clinicalSignificance: "Retenções volumétricas iguais ou acima de 30 mL após o esvaziamento são patológicas, denunciando incapacidade de eliminação por obstrução de fluxo urinário (hiperplasia prostática benigna ou estenose de uretra)."
      },
      {
        parameter: "Capacidade Vesical Máxima (Feminino)",
        normalRange: "≤ 550.0 mL",
        clinicalSignificance: "Sinaliza limite elástico superior saudável. Bexigas flácidas hiperdistendidas de forma patológica excedem este limite."
      },
      {
        parameter: "Capacidade Vesical Máxima (Masculino)",
        normalRange: "≤ 750.0 mL",
        clinicalSignificance: "Volume fisiológico repletado superior esperado para o homem."
      }
    ]
  },
  {
    id: "eurp-hepatobiliar-liver",
    category: "gallbladder_liver",
    tableName: "Diâmetro Hegemônico Hepático (EURP Linha Hemiclavicular)",
    chapterTitle: "Morfometria de Fígado e Vesícula Biliar",
    citation: "Mauad Filho F, Gadelha MAC. Tabela de Biométrica Abdominal EURP - Ribeirão Preto.",
    description: "Normaliza o diâmetro longitudinal máximo do lobo hepático direito medido na linha hemiclavicular. Fornece critérios objetivos para confirmação diagnóstica de hepatomegalia difusa.",
    pageRange: "Pág. 112",
    parameters: [
      {
        parameter: "Diâmetro Longitudinal Hemiclavicular",
        normalRange: "≤ 15.0 cm (150 mm)",
        clinicalSignificance: "Dimensão longitudinal superior tolerada. Valores acima de 15 cm confirmam hepatomegalia (comum em esteatose grave, congestão sistêmica passiva de hepatopatia congestiva ou infiltrações neoplásicas)."
      },
      {
        parameter: "Espessura da Parede da Vesícula Biliar",
        normalRange: "≤ 3.0 mm",
        clinicalSignificance: "Paredes > 3 mm caracterizam espessamento parietal; é o principal achado de colecistite aguda ou crônica ativa, além de ser alterado secundariamente por ascite, hipoalbuminemia grave e insuficiência cardíaca crônica congestiva."
      },
      {
        parameter: "Calibre Colédoco (Bile Duct)",
        normalRange: "≤ 6.0 mm (≤ 8.0 mm se > 60 anos ou pós-colecistectomizado)",
        clinicalSignificance: "Representa a via biliar principal. Diâmetros aumentados indicam obstruções mecânicas (coledocolitíase, tumores da cabeça do pâncreas ou ampuloma) que cursam com síndrome colestática."
      }
    ]
  },
  {
    id: "eurp-spleen-tab93",
    category: "gallbladder_liver",
    tableName: "Tabela 93 - Mapeamento Esplênico (Baço)",
    chapterTitle: "Ecografia Esplênica e Índices de Normalidade",
    citation: "Mauad Filho F, et al. Manual de Referências e Acertos Clínicos de Ribeirão Preto.",
    description: "Estuda os eixos longitudinais, diagonais e transversais do baço. Indispensável para o estadiamento de doenças congestivas porta-esplênicas.",
    pageRange: "Págs. 118 - 120",
    parameters: [
      {
        parameter: "Comprimento Longitudinal do Baço",
        normalRange: "≤ 12.0 cm",
        clinicalSignificance: "Comprimentos esplênicos > 12.0 cm definem esplenomegalia limítrofe, e > 13.0 cm definem esplenomegalia estabelecida (secundária a hipertensão portal, processo infeccioso linfocítico, anemias hemolíticas ou leucemias)."
      },
      {
        parameter: "Largura Esplênica",
        normalRange: "≤ 7.0 cm",
        clinicalSignificance: "Diâmetro transversal do baço. Valores aumentados confirmam bócio ou congestão transversal esplênica precoce."
      },
      {
        parameter: "Espessura Esplênica",
        normalRange: "≤ 4.0 cm",
        clinicalSignificance: "Eixo Anteroposterior de diâmetro plano spline coronal."
      }
    ]
  },
  {
    id: "eurp-pancreas-tab91",
    category: "gallbladder_liver",
    tableName: "Tabela 91 - Calibres Pancreáticos Normativos",
    chapterTitle: "Morfologia e Mapeamento Ducto-Tegumentar Pancreático",
    citation: "Mauad Filho F, Casabona L, et al. Manual de Referências Ultrassonográficas - EURP.",
    description: "Morfometria de cabeça, corpo, cauda pancreática e calibre interno do ducto de Wirsung para detecção de pancreatites, edemas carcinogênicos e dilatações ductais.",
    pageRange: "Págs. 122 - 125",
    parameters: [
      {
        parameter: "Cabeça do Pâncreas",
        normalRange: "< 3.0 cm",
        clinicalSignificance: "Aumentos focais na cabeça do pâncreas exigem exclusão imediata de neoplasia periampular ou pancreatite cefálica focal."
      },
      {
        parameter: "Corpo do Pâncreas",
        normalRange: "< 2.5 cm",
        clinicalSignificance: "Diâmetro transversal plano aórtico-mesentérico."
      },
      {
        parameter: "Cauda do Pâncreas",
        normalRange: "< 2.5 cm",
        clinicalSignificance: "Segmento distal próximo ao hilo esplênico; comumente oculto por gases intestinais."
      },
      {
        parameter: "Ducto Pancreático (Wirsung)",
        normalRange: "≤ 2.0 mm",
        clinicalSignificance: "Dilatação do duto (> 2 mm) é fortemente sugestiva de pancreatite crônica de Wirsung ou obstrução intrínseca lítica tumoral distal."
      }
    ]
  },
  {
    id: "eurp-vessels-tab101",
    category: "gallbladder_liver",
    tableName: "Tabela 101 - Hemodinâmica de Vasos Portais e Sistêmicos",
    chapterTitle: "Anatomia Ultrassonográfica do Fluxo Portal e Caval",
    citation: "Mauad Filho F, Gadelha MAC. Tabela Vascular de Ribeirão Preto.",
    description: "Estabelece os limiares de calibres vasculares e calhas retroperitoneais para a triagem segura de doentes com encefalopatias, ascite ou suspeita de hipertensão portal.",
    pageRange: "Págs. 130 - 132",
    parameters: [
      {
        parameter: "Diâmetro da Veia Porta",
        normalRange: "10.0 - 13.0 mm",
        clinicalSignificance: "Ectasias da veia porta acima de 13 mm, na ausência de colapso expiratório, confirmam congestão portal severa ou síndrome de hipertensão portal estabelecida."
      },
      {
        parameter: "Diâmetro da Veia Esplênica",
        normalRange: "≤ 10.0 mm",
        clinicalSignificance: "Ectasia de veia esplênica (> 10 mm) reforça a presença de congestividade passiva de origem esplenoportônica."
      },
      {
        parameter: "Diâmetro da Veia Cava Inferior",
        normalRange: "≤ 20.0 mm",
        clinicalSignificance: "Diâmetro normal respirando tranquilamente. Calibres > 20 mm sem variabilidade respiratória denotam estase cardíaca direita congestiva (cor pulmonale, estenose tricúspide ou tamponamento parcial)."
      }
    ]
  },
  {
    id: "eurp-early-obst-scans",
    category: "obstetric",
    tableName: "Diretrizes de Gravidez Inicial (EURP pág. 10 - 16)",
    chapterTitle: "Ultrassonografia no Primeiro Trimestre de Gestação (6 a 13 Semanas)",
    citation: "Mauad Filho F, Casabona L, Gallarreta FMP. Diretrizes de Ultrassonografia Fetal Precoce - Ribeirão Preto.",
    description: "Mapeamento rigoroso do complexo saco-embrionário precoce. Contém as equações determinísticas de idade gestacional por MSD e CCN, bem como o rastreio morfológico primário de aneuploidias (TN e Osso Nasal) e rastreamento precoce de pré-eclâmpsia por Doppler uterino (EURP Tabela de 1º Trimestre).",
    pageRange: "Págs. 10 - 16",
    parameters: [
      {
        parameter: "Diâmetro Sacolar Médio (MSD)",
        normalRange: "2.0 - 60.0 mm",
        clinicalSignificance: "Idade Gestacional estimada programaticamente por regressão linear (MSD mm + 30 dias). Se MSD ≥ 10 mm, espera-se VV presente; se MSD ≥ 25 mm, a detecção de embrião com batimentos fetais é mandatória, sob pena de gestação anembrionada primária."
      },
      {
        parameter: "Comprimento Cabeça-Nádega (CCN)",
        normalRange: "2.0 - 84.0 mm",
        clinicalSignificance: "Estimativa perfeita da idade gestacional linear por Hadlock/EURP: (CCN mm + 42 dias) nos dá a idade gestacional exata em dias. Medida de máxima acurácia biométrica para datação pré-natal."
      },
      {
        parameter: "Diâmetro da Vesícula Vitelina (VV)",
        normalRange: "3.0 - 6.0 mm",
        clinicalSignificance: "VV < 3 mm (hipoplasia) ou > 6 mm (megavesícula vitelina) estão estatisticamente associadas com anomalias cromossômicas ou insuficiência nutricional com posterior abortamento espontâneo precoce."
      },
      {
        parameter: "Translucência Nucal (TN)",
        normalRange: "≤ 2.5 mm",
        clinicalSignificance: "Espessamento da nuca do feto. Medida acima de 2.5 mm denota alto risco de anomalias cromossômicas (T21, T18, T13) ou cardiopatias congênitas graves, exigindo acompanhamento morfológico minucioso."
      },
      {
        parameter: "Osso Nasal (ON) no 1º Trimestre",
        normalRange: "Presente / bem visualizado (ou ≥ 2.5 mm)",
        clinicalSignificance: "Ausência em corte sagital médio fetal apropriado no primeiro trimestre representa um dos marcadores secundários de maior especificidade para Síndrome de Down (Trissomia 21)."
      },
      {
        parameter: "Doppler de Artérias Uterinas (Média PI)",
        normalRange: "≤ 1.45 (Primeiro Trimestre)",
        clinicalSignificance: "Resistências e PIs altos no 1º trimestre sinalizam falha precoce na segunda onda de invasão trofoblástica uteroplacentária, permitindo introdução profilática eletiva precoce de Ácido Acetilsalicílico (AAS) e Cálcio para deter o desencadeamento clínico de Pré-eclâmpsia Precoce."
      }
    ]
  },
  {
    id: "eurp-fetal-biometry-tab",
    category: "fgr_barcelona",
    tableName: "Tabelas 8, 12, 14, 16 - Biometria Fetal de 2º/3º Trimestres",
    chapterTitle: "Estimativas e Curvas de Desvios de Crescimento de Ribeirão Preto",
    citation: "Mauad Filho F, et al. Manual de Referências Ultrassonográficas - Biometria Fetal.",
    description: "Curvas completas de diâmetros biparietais (DBP), circunferências cefálicas (CC), abdominais (CA) e comprimentos femorais (CF). Elementos fundamentais para a estimativa programática do Peso Fetal Estimado (EFW) e diferenciação estrita de desvios fisiológicos.",
    pageRange: "Págs. 45 - 72",
    parameters: [
      {
        parameter: "Diâmetro Biparietal (DBP)",
        normalRange: "Curva EURP Tabela 8 (Ex: 86.5mm na 34ª sem)",
        clinicalSignificance: "Mede o diâmetro transversal craniano fetal. Útil para datação tardia e estimativa biométrica de peso."
      },
      {
        parameter: "Circunferência Cefálica (HC/CC)",
        normalRange: "Curva EURP Tabela 12 (Ex: 313.5mm na 34ª sem)",
        clinicalSignificance: "Morfometria craniana máxima de corte transversal. Usada nos cálculos de peso e simetria craniana."
      },
      {
        parameter: "Circunferência Abdominal (AC/CA)",
        normalRange: "Curva EURP Tabela 16 (Ex: 307.4mm na 34ª sem)",
        clinicalSignificance: "A circunferência abdominal é o parâmetro biométrico mais sensível para diagnóstico de RCF/FGR e desnutrição fetal intrauterina ativa."
      },
      {
        parameter: "Comprimento do Fêmur (FL/CF)",
        normalRange: "Curva EURP Tabela 14 (Ex: 68.0mm na 34ª sem)",
        clinicalSignificance: "Parâmetro linear do osso longo femoral; rege o crescimento estotetoral de comprimento longitudinal fetal."
      },
      {
        parameter: "Comprimento dos Ossos Longos do Membros",
        normalRange: "Úmero, Tíbia, Fíbula, Rádio, Ulna (Média ± 5.0 mm - Curvas EURP Tabela 35)",
        clinicalSignificance: "Programado perfeitamente na tabela 35 da EURP, permite triagem de displasias esqueléticas constitucionais e assimetrias severas de membros fetais."
      },
      {
        parameter: "Espessura Placentária (EP)",
        normalRange: "Curva EURP Tabela 18 (Média proporcional às semanas, Ex: 35.5mm na 34ª sem)",
        clinicalSignificance: "Espessamentos placentários acentuados ocorrem em diabetes gestacional, incompatibilidade de Rh materna ou infecções congênitas ativas (sífilis)."
      },
      {
        parameter: "Índice de Líquido Amniótico (ILA)",
        normalRange: "Curva EURP Tabela 20 (Desvios mínimos/máximos por semana)",
        clinicalSignificance: "Regula o volume de líquido amniótico por técnica de 4 quadrantes. Oligoâmnio (abaixo da curva limite) ou polidrâmnio (acima da curva limite) exigem condutas obstétricas específicas."
      },
      {
        parameter: "Cervicometria (Medida de Colo Uterino)",
        normalRange: "≥ 25.0 mm (EURP p. 24)",
        clinicalSignificance: "A medida do colo de útero inferior a 25.0 mm em gestantes sintomáticas ou assintomáticas de segundo trimestre é o marcador prognóstico de maior sensibilidade e especificidade para parto pré-termo induzido, necessitando de introdução oportuna de Progesterona Vaginal ou cerclagem uterina."
      }
    ]
  },
  {
    id: "sbc-carotid-2023",
    category: "carotid_vascular",
    tableName: "Tabela 2 - Quantificação das Estenoses Carotídeas (ACI)",
    chapterTitle: "Graduação das Estenoses da Artéria Carótida Interna",
    citation: "Atualização da Recomendação para Avaliação da Doença das Artérias Carótidas e Vertebrais pela Ultrassonografia Vascular: DIC, CBR, SBACV – 2023 (Arq Bras Cardiol. 2023;120(10):e20230695).",
    description: "Estabelece os critérios hemodinâmicos multiparamétricos baseados na velocidade de pico sistólico (VPS), velocidade diastólica final (VDF) e suas relações (razões) para classificar o grau de estenose em decis, suboclusão e oclusão de forma rigorosa.",
    pageRange: "Pág. 13",
    parameters: [
      {
        parameter: "Estenose < 50% (Normal / Sem repercussão)",
        normalRange: "VPS ACI < 140 cm/s | VDF ACI < 40 cm/s | VPS ACI/ACC < 2.0 | VPS ACI/VDF ACC < 8 | VDF ACI/VDF ACC < 2.6",
        clinicalSignificance: "Fluxometria standard sem repercussão hemodinâmica. Caracterizar anatomicamente no Modo B (protusão < 1.5mm ou EMI normal)."
      },
      {
        parameter: "Estenose 50 - 59% (Moderada Inicial / NASCET)",
        normalRange: "VPS ACI: 140 - 230 cm/s | VDF ACI: 40 - 69 cm/s | Relação ACI/ACC: 2.0 - 3.1 | VPS ACI/VDF ACC: 8 - 10 | VDF ACI/VDF ACC: 2.6 - 5.5",
        clinicalSignificance: "Estágio inicial de estenose moderada. Todas as relações encontram-se limítrofes em conformidade com o consenso multiparamétrico."
      },
      {
        parameter: "Estenose 60 - 69% (Moderada Avançada / NASCET)",
        normalRange: "VPS ACI: 140 - 230 cm/s | VDF ACI: 70 - 100 cm/s | Relação ACI/ACC: 3.2 - 4.0 | VPS ACI/VDF ACC: 11 - 13 (VDF ACI/ACC não especificada)",
        clinicalSignificance: "Estágio avançado de estenose moderada. Caracterizado por elevação substancial da diástole carotídea distal."
      },
      {
        parameter: "Estenose 70 - 79% (Grave / NASCET)",
        normalRange: "VPS ACI > 230 cm/s | VDF ACI > 100 cm/s | Relação ACI/ACC > 4.0 | VPS ACI/VDF ACC: 14 - 21",
        clinicalSignificance: "Estenose grave com repercussão crítica. Relação VPS ACI / VPS ACC superior a 4.0 é o marcador hemodinâmico de maior acurácia."
      },
      {
        parameter: "Estenose 80 - 89% (Crítica / NASCET)",
        normalRange: "VPS ACI > 230 cm/s | VDF ACI > 140 cm/s | Relação ACI/ACC > 4.0 | VPS ACI/VDF ACC: 22 - 29 | VDF ACI/VDF ACC > 5.5",
        clinicalSignificance: "Estenose crítica. VDF significativamente aumentada (> 140 cm/s) e relação de diástoles > 5.5 confirmam alto padrão restritivo distal."
      },
      {
        parameter: "Estenose ≥ 90% a < Oclusão (Subtotal / NASCET)",
        normalRange: "VPS ACI > 400 cm/s | VDF ACI > 140 cm/s | Relação ACI/ACC > 5.0 | VPS ACI/VDF ACC > 30",
        clinicalSignificance: "Estenose pré-oclusiva extrema. Caracteriza-se por velocidades excepcionalmente elevadas sucedidas de colapso circulatório distal."
      },
      {
        parameter: "Suboclusão Carotídea (Colapso Parcial / Trickle Flow)",
        normalRange: "Fluxo filiforme de velocidade variável (String Sign) | Lúmen estenótico < 1.3 mm | Calibre distal < 3.5 mm",
        clinicalSignificance: "Colapso do leito distal. Parâmetros de velocidade convencionais são variáveis; diagnóstico baseia-se no mapeamento de fluxo lento residual."
      },
      {
        parameter: "Oclusão Completa de ACI (Sinal do Cordão)",
        normalRange: "Ausência total de preenchimento e fluxo Doppler | Fluxo em staccato / alta resistência na CC proximal",
        clinicalSignificance: "Ausência de perviedade. Colapso completo distal (sinal do cordão) ou fluxo de altíssima resistência pré-oclusivo."
      }
    ]
  },
  {
    id: "sbc-vertebral-2023",
    category: "carotid_vascular",
    tableName: "Tabela 6 - Estenoses Proximais da Artéria Vertebral (V0-V1)",
    chapterTitle: "Morfologia e Parâmetros para Artérias Vertebrais",
    citation: "Atualização de Recomendação Ultrassonografia Vascular: DIC, CBR, SBACV – 2023 (adaptado de Hua et al.).",
    description: "Determina os valores limítrofes de corte de velocidade sistólica máxima (Vmax) e diastólica final (Vdf) para quantificar as estenoses proximais da artéria vertebral na sua origem.",
    pageRange: "Pág. 23",
    parameters: [
      {
        parameter: "Estenose de Vertebral < 50% (Leve)",
        normalRange: "Vmax < 85 cm/s | Vdf < 27 cm/s | IVV* < 1.3",
        clinicalSignificance: "Estenose na origem sem repercussão hemodinâmica ou alteração nos padrões de fluxo distal (V2-V4)."
      },
      {
        parameter: "Estenose de Vertebral 50 - 69% (Moderada)",
        normalRange: "Vmax ≥ 140 cm/s | Vdf ≥ 35 cm/s | IVV* ≥ 2.1",
        clinicalSignificance: "Presença de turbilhonamento local ao Doppler colorido e aumento moderado das velocidades de fluxo."
      },
      {
        parameter: "Estenose de Vertebral 70 - 99% (Grave/Crítica)",
        normalRange: "Vmax ≥ 210 cm/s | Vdf ≥ 55 cm/s | IVV* ≥ 4.0",
        clinicalSignificance: "Comprometimento hemodinâmico severo na origem. Curva espectral amortecida e tardus-parvus à vazante no segmento distal intertransverso."
      },
      {
        parameter: "Índice de Velocidade Máxima (IVV*)",
        normalRange: "Razão entre Vmax no ponto de estenose e no segmento V2",
        clinicalSignificance: "Criteriólogo adjuvante valioso para compensação de desvios anatômicos ou velocidades intrinsecamente baixas."
      },
      {
        parameter: "Hipoplasia de Artéria Vertebral (Parâmetros)",
        normalRange: "Diâmetro ≤ 2.0 mm | IR > 0.75 | Baixa Diástole",
        clinicalSignificance: "Consenso 2023: diâmetro <= 2 mm no segmento V2, redução do componente diastólico e aumento do calibre contralateral (> 4 mm) com velocidades normais definem hipofluxo congênito benigno."
      }
    ]
  },
  {
    id: "ase-diastolic-normal-2025",
    category: "echocardiogram",
    tableName: "Tabela 5 - Valores de Referência Saudáveis por Faixa Etária",
    chapterTitle: "Valores Normais para Parâmetros de Função Diastólica (ASE 2025)",
    citation: "Recommendations for the Evaluation of Left Ventricular Diastolic Function by Echocardiography and for Heart Failure With Preserved Ejection Fraction Diagnosis: An Update From the American Society of Echocardiography (J Am Soc Echocardiogr 2025;38:537-569).",
    description: "Compila os valores normativos (percentil 5 a 95) para dízimas cruciais da ecocardiografia como velocidades mitrais E e A, índices TDI lateral/septal/médio, razão E/e', LAVi e volume do átrio esquerdo, velocidade de regurgitação tricúspide (TR) e strain atrial esquerdo (LARS), divididos em faixas de 20-39, 40-60 e 60-80 anos.",
    pageRange: "Pág. 15",
    parameters: [
      {
        parameter: "Velocidade da Onda E (Influxo Mitral)",
        normalRange: "20-39a: 0.54 - 1.11 m/s | 40-60a: 0.47 - 1.02 m/s | 60-80a: 0.39 - 0.92 m/s",
        clinicalSignificance: "Representa o enchimento ventricular rápido inicial; diminui fisiologicamente com o avanço da idade devido à complacência celular."
      },
      {
        parameter: "Velocidade da Onda A (Sístole Atrial)",
        normalRange: "20-39a: 0.24 - 0.68 m/s | 40-60a: 0.33 - 0.82 m/s | 60-80a: 0.43 - 0.97 m/s",
        clinicalSignificance: "Reflete a contração atrial ativa no final da diástole; aumenta compensatoriamente com o envelhecimento."
      },
      {
        parameter: "Relação E/A (Padrões de Enchimento)",
        normalRange: "20-39a: 0.88 - 2.73 | 40-60a: 0.69 - 2.07 | 60-80a: 0.50 - 1.40",
        clinicalSignificance: "Razão chave. Valores progressivamente menores refletem padrão de relaxamento alterado (fisiológico na senescência ou patológico no Grau 1)."
      },
      {
        parameter: "Velocidade e' Média (TDI Annular)",
        normalRange: "20-39a: ≥ 8.7 cm/s | 40-60a: ≥ 6.7 cm/s | 60-80a: ≥ 4.7 cm/s",
        clinicalSignificance: "Velocidade de deslocamento do anel mitral ao Doppler tecidual. Excelente indicador de relaxamento intrínseco de VE."
      },
      {
        parameter: "Relação E/e' Média (Pilar de Pressão)",
        normalRange: "20-39a: 4.0 - 9.1 | 40-60a: 4.6 - 11.5 | 60-80a: 5.2 - 14.0",
        clinicalSignificance: "A relação de velocidades média constitui o melhor indicador não-invasivo da pressão de enchimento do átrio esquerdo (LAP)."
      },
      {
        parameter: "Índice de Volume do Átrio Esquerdo (LAVi)",
        normalRange: "20-80a: ≤ 34.0 mL/m²",
        clinicalSignificance: "Medida volumétrica indexada à área de superfície corporal. O remodelamento do AE reflete cronicidade de pressões elevadas."
      },
      {
        parameter: "Velocidade de Regurgitação Tricúspide (TR)",
        normalRange: "20-80a: ≤ 2.7 m/s (ou PASP ≤ 35 mmHg)",
        clinicalSignificance: "Marcador indireto de pressão sistólica na artéria pulmonar; o aumento indica elevação passiva por refluxo ou cardiopatia direita."
      },
      {
        parameter: "LARS (Strain do Reservatório Atrial Esquerdo)",
        normalRange: "20-39a: ≥ 29.5% | 40-60a: ≥ 26.8% | 60-80a: ≥ 24.1%",
        clinicalSignificance: "Análise avançada de deformação miocárdica do AE. LARS ≤ 18% é um sinal consistente de pressões atriais significativamente elevadas."
      }
    ]
  },
  {
    id: "ase-diastolic-dysfunction-2025",
    category: "echocardiogram",
    tableName: "Figuras 2 e 3 + Tabela 7 - Diagnóstico e Estimação de Pressões",
    chapterTitle: "Algoritmo para Diagnóstico de Disfunção Diastólica e LAP (ASE 2025)",
    citation: "Consenso ASE 2025 para Fração de Ejeção Preservada (HFpEF) e Diastologia atualizada.",
    description: "Estabelece os passos lógicos e limiares rigorosos para diagnosticar a disfunção diastólica, estimar a pressão do átrio esquerdo (LAP) e avaliar populações especiais como Fibrilação Atrial, Taquicardia e Miocardiopatia Hipertrófica.",
    pageRange: "Págs. 17, 18, 21",
    parameters: [
      {
        parameter: "STEP 1 - Identificação de Relaxamento Alterado",
        normalRange: "e' septal < 6 cm/s OU lateral < 7 cm/s OU média < 6.5 cm/s",
        clinicalSignificance: "Define relaxamento de VE prejudicado. Se reduzido, necessita de apenas 1 critério do Step 2 para diagnosticar disfunção; se preservado, necessita de 2."
      },
      {
        parameter: "STEP 2 - Marcadores de LAP e Remodelamento",
        normalRange: "E/e' média > 14 | LARS ≤ 18% | LAVi > 34 mL/m² | E/A ≤ 0.8 ou ≥ 2",
        clinicalSignificance: "Conjunto de critérios funcionais e estruturais de preenchimento de volume sob estresse hemodinâmico."
      },
      {
        parameter: "Estimação da Pressão Atrial (LAP) e Graus",
        normalRange: "LAP Normal (Grau 1) vs LAP Aumentada (Graus 2 e 3)",
        clinicalSignificance: "Se E/e' média > 14, TR > 2.8 m/s e e' reduzida estão presentes: LAP elevada garantida. Se nenhum, LAP normal. Se conflitante: refinar com LARS, S/D ou IVRT."
      },
      {
        parameter: "Pressões na Fibrilação Atrial (FA)",
        normalRange: "E/e' septal ≥ 11 | TR > 2.8 m/s | IVRT ≤ 65 ms | DT E < 160 ms (LVEF↓)",
        clinicalSignificance: "A ausência de sístole atrial invalida o critério E/A comum. Utiliza-se de preferência o tempo de desaceleração da onda E e velocidade tecidual septal."
      },
      {
        parameter: "Pressões na Miocardiopatia Hipertrófica (HCM)",
        normalRange: "E/e' média > 14 | Ar-A ≥ 30 ms | TR > 2.8 m/s | LAVi > 34 mL/m²",
        clinicalSignificance: "Padrão de hipertensão tecidual acentuado exige cautela diagnóstica pela hipertrofia maciça e refluxo de via de saída."
      },
      {
        parameter: "Pressões na Miocardiopatia Restritiva",
        normalRange: "E/A > 2.5 | DT < 140 ms | IVRT < 50 ms | E/e' média > 14",
        clinicalSignificance: "Padrão de enchimento altamente restritivo clássico, com relaxamento e complacência celular extremamente rígidos e colapsados."
      }
    ]
  },
  {
    id: "ase-sbc-dimensions-2025",
    category: "echocardiogram",
    tableName: "Tabela de Dimensões e Volumes das Câmaras Cardíacas (SBC/ASE)",
    chapterTitle: "Normalidade em Ecocardiografia Bidimensional Geral",
    citation: "Diretrizes de Ecocardiografia da SBC/DIC & ASE Chamber Quantitation Guidelines.",
    description: "Limiares de referência para dimensões lineares da aorta de Valsalva, átrio esquerdo, diâmetro diastólico e sistólico do VE, cálculo de massa absoluta e indexada de VE, volumes ventriculares e parâmetros de função sistólica VD/VE.",
    pageRange: "Págs. 143 - 150",
    parameters: [
      {
        parameter: "Seios de Valsalva",
        normalRange: "Feminino: 26.0 - 37.0 mm | Masculino: 30.0 - 40.0 mm",
        clinicalSignificance: "Diâmetro da raiz da aorta no nível dos seios. Ectasias requerem monitorização rigorosa (risco de dissecção)."
      },
      {
        parameter: "Átrio Esquerdo antero-posterior",
        normalRange: "Feminino: 27.0 - 38.0 mm | Masculino: 30.0 - 40.0 mm",
        clinicalSignificance: "Dimensão AP clássica; valores aumentados denotam remodelamento por sobrecarga de volume/pressão."
      },
      {
        parameter: "V.E. Diâmetro Diastólico (LVIDd)",
        normalRange: "Feminino: 38.0 - 52.2 mm | Masculino: 42.0 - 58.4 mm",
        clinicalSignificance: "Parâmetro chave para identificar dilatação do ventrículo esquerdo."
      },
      {
        parameter: "V.E. Diâmetro Sistólico (LVIDs)",
        normalRange: "Feminino: 21.6 - 34.8 mm | Masculino: 25.0 - 40.0 mm",
        clinicalSignificance: "Diâmetro interno final da sístole."
      },
      {
        parameter: "Espessura Miocárdica (IVSd / PWd)",
        normalRange: "6.0 - 10.0 mm (Ambos os sexos)",
        clinicalSignificance: "Espessuras septal (IVSd) ou posterior (PWd) > 10 mm em mulheres ou > 11 mm em homens definem hipertrofia miocárdica."
      },
      {
        parameter: "ERP / RWT (Espessura Relativa de Parede)",
        normalRange: "≤ 0.42",
        clinicalSignificance: "Relação de espessura (2 * PWd / LVIDd). ERP > 0.42 com massa normal = Remodelamento Concêntrico; ERP > 0.42 com massa elevada = Hipertrofia Concêntrica."
      },
      {
        parameter: "Índice de Massa de VE (LVMi)",
        normalRange: "Feminino: ≤ 95.0 g/m² | Masculino: ≤ 115.0 g/m²",
        clinicalSignificance: "Massa ventricular indexada pela ASC. Padrão ouro para estadiar Hipertrofia Ventricular Esquerda (HVE)."
      },
      {
        parameter: "Fração de Ejeção do VE (Teichholz)",
        normalRange: "≥ 52.0%",
        clinicalSignificance: "Avaliação do grau de encurtamento sistólico global do ventrículo esquerdo."
      },
      {
        parameter: "Volume Diastólico Final VE (LVEDV)",
        normalRange: "Feminino: 56.0 - 104.0 mL | Masculino: 62.0 - 150.0 mL",
        clinicalSignificance: "Volume derivado ideal para medir o grau de dilatação diastólica verdadeira do VE."
      },
      {
        parameter: "TAPSE (Coração Direito)",
        normalRange: "≥ 17.0 mm",
        clinicalSignificance: "Sensível e independente para quantificação do encurtamento longitudinal sistólico do ventrículo direito."
      }
    ]
  },
  {
    id: "acr-tirads-2017",
    category: "thyroid",
    tableName: "Consenso ACR TI-RADS (Thyroid Imaging Reporting and Data System)",
    chapterTitle: "Estratificação de Risco para Nódulos de Tireoide",
    citation: "Tessler FN, et al. ACR Thyroid Imaging, Reporting and Data System (TI-RADS): White Paper of the ACR TI-RADS Committee. J Am Coll Radiol 2017.",
    description: "Determinação de risco do nódulo tireoidiano baseado em 5 categorias de achados (Composição, Ecogenicidade, Formato, Margens e Focos Ecogênicos). Define se indica biópsia por agulha fina (PAAF) ou seguimento.",
    pageRange: "Págs. 587 - 595",
    parameters: [
      {
        parameter: "TR1 - Benigno (0 pontos)",
        normalRange: "Risco de malignidade: < 2%",
        clinicalSignificance: "Nenhuma ação de PAAF ou acompanhamento ecográfico ativo é necessária."
      },
      {
        parameter: "TR2 - Não Suspeito (2 pontos)",
        normalRange: "Risco de malignidade: < 2%",
        clinicalSignificance: "Nódulo benigno sólido/cístico ou espongiforme puro. Sem recomendação de PAAF."
      },
      {
        parameter: "TR3 - Levemente Suspeito (3 pontos)",
        normalRange: "Risco de malignidade: ~4.8%",
        clinicalSignificance: "Indica PAAF se o diâmetro for ≥ 2.5 cm. Acompanhamento anual se o diâmetro for ≥ 1.5 cm."
      },
      {
        parameter: "TR4 - Moderadamente Suspeito (4-6 pontos)",
        normalRange: "Risco de malignidade: 5% - 20%",
        clinicalSignificance: "Indica PAAF se o diâmetro for ≥ 1.5 cm. Acompanhamento se o diâmetro for ≥ 1.0 cm."
      },
      {
        parameter: "TR5 - Altamente Suspeito (≥ 7 pontos)",
        normalRange: "Risco de malignidade: > 20%",
        clinicalSignificance: "Indica PAAF se o diâmetro do nódulo for ≥ 1.0 cm. Acompanhamento se o diâmetro for ≥ 0.5 cm. Fatores de risco elevados incluem formato 'mais alto do que largo'."
      }
    ]
  },
  {
    id: "acr-birads-breast-2013",
    category: "breast_birads",
    tableName: "Consenso BI-RADS (Breast Imaging-Reporting and Data System)",
    chapterTitle: "Laudagem Sistêmica e Condutas para Ultrassom de Mama",
    citation: "Manual de Laudos do American College of Radiology (ACR) BI-RADS Atlas - 5ª Edição 2013.",
    description: "Linguagem padronizada médica para lesões mamárias, cistos e nódulos, categorizando achados de 0 a 6 com as respectivas estimativas de malignidade e orientações de biópsia ou rastreio clínico.",
    pageRange: "Págs. 120 - 135",
    parameters: [
      {
        parameter: "BI-RADS 0 - Incompleto",
        normalRange: "Indefinido",
        clinicalSignificance: "Necessita de exames de imagem adicionais (mamografia complementar, compressões ou ressonância magnética) para conclusão diagnóstica."
      },
      {
        parameter: "BI-RADS 1 - Negativo",
        normalRange: "0% risco de malignidade",
        clinicalSignificance: "Exame rigorosamente normal. Manter rastreamento anual conforme a idade."
      },
      {
        parameter: "BI-RADS 2 - Achados Benignos",
        normalRange: "0% risco de malignidade",
        clinicalSignificance: "Cistos simples, fibroadenomas calcificados, implantes estáveis. Manter rastreamento de rotina."
      },
      {
        parameter: "BI-RADS 3 - Provavelmente Benigno",
        normalRange: "≤ 2.0% risco de malignidade",
        clinicalSignificance: "Nódulos sólidos ovais, bem circunscritos, paralelos à pele. Recomendado controle ultrassonográfico em 6 meses para avaliar estabilidade dimensional."
      },
      {
        parameter: "BI-RADS 4 - Achados Suspeitos",
        normalRange: "> 2.0% a < 95.0% risco de malignidade",
        clinicalSignificance: "Lesões que indicam biópsia (Core Biopsy ou PAAF). Subdividido em: 4A (baixa suspeição: 2-10%), 4B (moderada suspeição: 10-50%) e 4C (alta suspeição: 50-95%)."
      },
      {
        parameter: "BI-RADS 5 - Altamente Suspeito",
        normalRange: "≥ 95.0% risco de malignidade",
        clinicalSignificance: "Nódulos espiculados, com microcalcificações e margens anguladas. Exige biópsia histológica imediata com conduta terapêutica oncológica."
      },
      {
        parameter: "BI-RADS 6 - Malignidade Comprovada",
        normalRange: "100.0% confirmado histologicamente",
        clinicalSignificance: "Utilizado para pacientes com diagnóstico de câncer já confirmado por biópsia prévia, que realizam ultrassom para planejamento pré-operatório ou quimioterapia neoadjuvante."
      }
    ]
  },
  {
    id: "acr-orads-pelvic-2020",
    category: "ovary_orads",
    tableName: "Consenso O-RADS US (Ovarian-Adnexal Reporting and Data System)",
    chapterTitle: "Estratificação do Risco de Câncer de Ovário e Massas Anexiais",
    citation: "American College of Radiology (ACR) O-RADS Committee, consensus guidelines for ultrasound evaluation.",
    description: "Escala clínica padronizada para caracterizar massas anexiais, cistos complexos, tumores ovarianos uniloculares/multiloculares e lesões em geral, direcionando o manejo cirúrgico ou a conduta expectante.",
    pageRange: "Págs. 12 - 28",
    parameters: [
      {
        parameter: "O-RADS 1 - Fisiológico (Pré-menopausa)",
        normalRange: "0% risco de malignidade",
        clinicalSignificance: "Folículo simples ≤ 3.0 cm, corpo lúteo simples ≤ 3.0 cm. Manejo ordinário expectante."
      },
      {
        parameter: "O-RADS 2 - Quase Certamente Benigno",
        normalRange: "< 1.0% risco de malignidade",
        clinicalSignificance: "Cistos uniloculares simples < 10.0 cm, cistos dermóides (teratomas benignos), endometriomas clássicos < 10.0 cm. Seguimento conservador simples."
      },
      {
        parameter: "O-RADS 3 - Baixo Risco de Malignidade",
        normalRange: "1.0% a < 10.0% risco",
        clinicalSignificance: "Cisto simples ≥ 10.0 cm, cisto multilocular de paredes lisas < 10.0 cm, lesão sólida regular sem vascularização. Consulta ginecológica recomendada."
      },
      {
        parameter: "O-RADS 4 - Risco Intermediário de Malignidade",
        normalRange: "10.0% a < 50.0% risco",
        clinicalSignificance: "Cisto multilocular ≥ 10.0 cm, componente sólido com vascularização discreta, paredes irregulares. Requer avaliação com ginecologista oncológico ou ressonância complementar."
      },
      {
        parameter: "O-RADS 5 - Alto Risco de Malignidade",
        normalRange: "≥ 50.0% risco de malignidade",
        clinicalSignificance: "Componentes sólidos altamente vascularizados (score Doppler 4), cistos espessados com ascite livre abdominal secundária. Encaminhamento urgente para cirurgia oncológica."
      }
    ]
  },
  {
    id: "scrotal-ref-manual",
    category: "scrotal",
    tableName: "Tabela de Referências Morfométricas da Bolsa Escrotal (Testículos & Epidídimo)",
    chapterTitle: "Normalidade Biométrica em Ultrassom de Testículos",
    citation: "Manual de Ultrassonografia de Ribeirão Preto & Consenso da Sociedade de Radiologia Pélvica.",
    description: "Parâmetros normativos de volume para testículos, espessura da cabeça do epidídimo, calibres venosos do plexo pampiniforme (pesquisa de varicocele) em repouso e sob manobra de Valsalva, além de critérios de hidrocele.",
    pageRange: "Pág. 195",
    parameters: [
      {
        parameter: "Volume Testicular Adulto",
        normalRange: "12.0 - 25.0 cm³ (mL) (ou comprimento 3.0 - 5.0 cm)",
        clinicalSignificance: "Hipoplasias / volumes < 12 mL podem indicar hipogonadismo ou sequelados de orquite/trauma. Volumes aumentados denotam orquiepididimite, processos expansivos neoplásicos ou torção aguda (edema congestivo)."
      },
      {
        parameter: "Cabeça do Epidídimo",
        normalRange: "< 10.0 - 12.0 mm de espessura",
        clinicalSignificance: "Aumentos de espessura acima de 12 mm com hiperemia local ao Color Doppler indicam epididimite aguda; alterações focais ovais anecoicas definem cistos benignos ependimários ordinários."
      },
      {
        parameter: "Veias do Plexo Pampiniforme (Repouso)",
        normalRange: "< 2.0 mm (ou ≤ 2.5 mm de diâmetro interno)",
        clinicalSignificance: "Dilatações acima de 2.5 mm em repouso são compatíveis com ectasia venosa crônica (varicocele)."
      },
      {
        parameter: "Veias do Plexo Pampiniforme (Valsalva)",
        normalRange: "Aumento de calibre discreto, sem refluxo venoso prolongado",
        clinicalSignificance: "Valsalva positiva com calibre ≥ 3.0 mm acompanhado de refluxo persistente de fluxo por mais de 2.0 segundos ao Doppler Espectral confirma Varicocele clínica quantificada."
      },
      {
        parameter: "Líquido Intracavitário (Hidrocele)",
        normalRange: "Fisiológico: < 2.0 mL (Mínima película protetiva)",
        clinicalSignificance: "Acúmulos anecoicos circundando o testículo que excedem os limites fisiológicos definem hidrocele verdadeira, que pode ser idiopática, traumática ou reacional inflamatória."
      }
    ]
  },
  {
    id: "omeract-rheuma-joint",
    category: "rheuma_omeract",
    tableName: "Critérios OMERACT de Quantificação de Sinovite Urinária / Articular",
    chapterTitle: "Estratificação Semiquantitativa de Artrite por Modo B e Power Doppler",
    citation: "OMERACT (Outcome Measures in Rheumatology Clinical Trials) Ultrasonography Synovitis Scoring System.",
    description: "Escala semiquantitativa mundial para graduação de espessamento sinovial (hipertrofia da sinóvia no Modo B) e atividade vascular local (Color / Power Doppler) em articulações de mamas, punhos, mãos, joelhos para avaliação de artrite reumatoide ativa.",
    pageRange: "Págs. 104 - 112",
    parameters: [
      {
        parameter: "Modo B - Grau 0 (Normal)",
        normalRange: "Ausência de espessamento ou hipertrofia sinovial",
        clinicalSignificance: "Articulação saudável. Sem distensão de margens cápsulo-ligamentares."
      },
      {
        parameter: "Modo B - Grau 1 (Leve)",
        normalRange: "Espessamento sinovial mínimo",
        clinicalSignificance: "Espessamento discreto que preenche as reentrâncias ósseas articulares sem ultrapassar a linha articular superior."
      },
      {
        parameter: "Modo B - Grau 2 (Moderado)",
        normalRange: "Espessamento sinovial moderado",
        clinicalSignificance: "Espessamento evidente que distende a cápsula articular, mas sem abaular ou estender-se além da interlinha óssea lateral."
      },
      {
        parameter: "Modo B - Grau 3 (Grave)",
        normalRange: "Espessamento sinovial volumoso e acentuado",
        clinicalSignificance: "Hipertrofia severa que deforma os contornos articulares, abaulando marcadamente a cápsula para além das margens normais."
      },
      {
        parameter: "Doppler - Grau 0 (Normal)",
        normalRange: "Ausência total de sinal de fluxo na sinóvia ativa",
        clinicalSignificance: "Sinaliza remissão inflamatória total ou articulação preservada."
      },
      {
        parameter: "Doppler - Grau 1 (Leve)",
        normalRange: "Sinal Doppler capilar discreto ou mínimo",
        clinicalSignificance: "Até 3 pontos vasculares independentes (focos) ou uma única linha curta contínua de sinal intra-articular ativa."
      },
      {
        parameter: "Doppler - Grau 2 (Moderado)",
        normalRange: "Sinais múltiplos confluentes em menos de 50%",
        clinicalSignificance: "Fluxo Doppler bem visível, atingindo áreas de vasos em leque que preenchem até metade da área de hipertrofia sinovial."
      },
      {
        parameter: "Doppler - Grau 3 (Grave)",
        normalRange: "Sinais vasculares múltiplos e densos em mais de 50%",
        clinicalSignificance: "Atividade inflamatória articular generalizada grave em atividade total, com preenchimento massivo da sinóvia hipertrofiada."
      }
    ]
  }
];
