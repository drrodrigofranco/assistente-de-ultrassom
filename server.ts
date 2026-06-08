import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { calculateNormality } from "./src/utils/normalityCalculator";
import { StudyType } from "./src/types";

dotenv.config();

// Ensure Gemini API key is available
if (!process.env.GEMINI_API_KEY) {
  console.warn("[Warning] GEMINI_API_KEY is not defined in the environment variables. Please configure it in your Secrets / .env files.");
}

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper function to handle models.generateContent with automatic recursive rate-limit retry
async function generateContentWithRetry(params: any, maxBackendAttempts = 3): Promise<any> {
  let attempt = 0;
  let delayMs = 3500; // Start with a robust 3.5s delay to let current queue breath
  while (attempt < maxBackendAttempts) {
    attempt++;
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const errorMsg = error.message ? String(error.message) : String(error);
      const errorStatus = error.status || error.statusCode || (error.error && error.error.code);
      
      const isRateLimit = errorStatus === 429 || 
                          errorMsg.includes('429') || 
                          errorMsg.toLowerCase().includes('rate limit') || 
                          errorMsg.toLowerCase().includes('quota') || 
                          errorMsg.toLowerCase().includes('exhausted');

      if (isRateLimit && attempt < maxBackendAttempts) {
        console.warn(`[Backend Retry] Rate limit detectado no OpenAI/Gemini (Tentativa ${attempt}/${maxBackendAttempts}). Aguardando ${delayMs}ms antes de re-tentar...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2.5; // Exponential backoff (3.5s -> 8.75s -> etc.)
        continue;
      }
      throw error;
    }
  }
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Increase payload sizes for holding base64-encoded ultrasound scans
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

/**
 * Endpoint 1: Analyze ultrasound scan and extract measurements.
 * Matches user's custom study types and extracts structure definitions.
 */
app.post("/api/analyze", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { imageBase64, studyType, mimeType, examFindings } = req.body;

    if (!imageBase64 && !examFindings) {
      res.status(400).json({ error: "Por favor, envie uma captura de tela do exame ou insira suas anotações clínicas na caixa de texto." });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: "Chave do Gemini API não configurada no servidor. Por favor, adicione-a nos Secrets." });
      return;
    }

    // Build the general router instructions for all categories
    const categoriesGuidance = `
    Classifique o exame analisado em um dos seguintes tipos possíveis de acordo com a sua identificação automática (se o usuário preencher 'studyType' envie este como pista, mas priorize o verdadeiro contexto clínico encontrado nas anotações 'examFindings' ou imagem):
    
    1) 'thyroid' - Se tratar de Ultrassom de Tireoide com ou sem Doppler. Extraia lobos esquerdo, direito, istmo, nódulos bilaterais e classificação TI-RADS.
    2) 'renal' - Se tratar de Rins e Vias Urinárias (Rim Esquerdo, Rim Direito, espessura de parênquima, bexiga, espessura da parede, resíduo miccional, volume vesical).
    3) 'gallbladder_liver' - Se tratar de Vias Biliares e Hepatobiliar (Fígado, Vesícula Biliar, Colédoco, Baço, Pâncreas).
    4) 'obstetric' - Se tratar de Obstétrico Inicial/1º Trimestre (CCN/CRL, Frequência Cardíaca Fetal, Vesícula Vitelina, Translucência Nucal TN e Osso Nasal).
    5) 'fgr_barcelona' - Restrição de Crescimento Fetal Protocolo Barcelona, Doppler Fetal.
    6) 'carotid_vascular' - Se tratar de Doppler de Carótidas e Vertebrais segundo diretrizes SBC (Velocidades VPS e VDF da ACI e ACC).
    7) 'echocardiogram' - Se tratar de Ecocardiograma Doppler (Aorta, Átrio Esquerdo, volumes de VE LVEDV/LVESV, diâmetros LVIDd/LVIDs, espessuras septal/posterior).
    8) 'breast_birads' - Se tratar de Ultrassom de Mamas (BI-RADS).
    9) 'ovary_orads' - Se tratar de Ultrassom de Anexos / Ovários (O-RADS).
    10) 'scrotal' - Se tratar de Ultrassom da Bolsa Escrotal / Testículos.
    11) 'rheuma_omeract' - Se tratar de Ultrassom Articular utilizando Critérios OMERACT.
    12) 'abdomen_total' - Se tratar de Ultrassom de Abdômen Total (fígado, vesícula biliar, colédoco, baço, rins, bexiga, pâncreas, próstata, etc.).
    13) 'pelvic' - Se tratar de Ultrassom Pélvico por via abdominal / ginecológico clássico.
    14) 'abdomen_superior' - Se tratar de Ultrassom de Abdômen Superior.
    15) 'prostate' - Ultrassom de Próstata transabdominal ou transretal.
    16) 'transvaginal' - Ultrassom Transvaginal (útero, endométrio, ovário esquerdo, ovário direito).
    17) 'obstetric_doppler' - Ultrassom Obstétrico com Doppler colorido/espectral (Frequência Cardíaca Fetal, UA PI, MCA PI, CPR, etc.).
    18) 'morphological_1t' - Ultrassom Morfológico de 1º Trimestre (TN, Osso Nasal, Ducto Venoso).
    19) 'morphological_2t' - Ultrassom Morfológico de 2º Trimestre (fossa posterior, átrio ventricular lateral, cisterna magna, cerebelo, pregue nucal).
    20) 'fetal_echocardiogram' - Ecocardiografia Fetal (frequência cardíaca fetal, miocárdio, arritmias).
    21) 'venous_lower_limbs' - Doppler Venoso de Membros Inferiores (compressibilidade, veias profundas, veia safena, tempo de refluxo).
    22) 'arterial_lower_limbs' - Doppler Arterial de Membros Inferiores (Índice Tornozelo-Braço ITB, padrão trifásico/bifásico e velocidade de pico sistólico VPS).
    `;

    let promptText = `
    Você é um assistente de ultrassom altamente preciso e especialista em radiologia clínica.
    Sua tarefa é ler e interpretar o exame fornecido por imagem ou pelas anotações textuais do médico, classificar sob qual dos tipos cadastrados o exame se enquadra melhor (detectedStudyType), e extrair com total exatidão as estruturas e suas respectivas medidas métricas exatas.
    
    Diretrizes cruciais de Classificação e Extração:
    1. Se as notas médicas descrevem explicitamente o exame (ex: "Ultrassom de Mamas", "escrotal", "Articular", etc.), classifique no tipo de estudo correspondente da lista.
    2. Identifique o tipo de estudo com base no contexto (detectedStudyType).
    3. Extraia as estruturas associadas em português (Brasil) para os itens adequados.
    4. Retorne o JSON estrito conforme o esquema determinado pela inteligência artificial.
    
    5. COERÊNCIA E CONVERSÃO DE UNIDADES (cm vs. mm):
       - Verifique sempre se o valor numérico e a unidade estão correlacionados de forma biologicamente correta.
       - Se for uma medida de diâmetro/espessura/comprimento de órgãos ou estruturas normais (como rim, tireoide, etc.) e o valor for grande (entre 10 e 150), a unidade correta é quase sempre 'mm' (milímetros). Exemplo: se na tela consta 55.4, a unidade correspondente para essa medida é 'mm' (não 55.4 cm, que seria impossível!).
       - Se o valor for pequeno (geralmente entre 1.0 e 15.0), a unidade é quase sempre 'cm' (centímetros). Exemplo: fígado com valor '13.5' é 'cm' (não 13.5 mm, que seria pequenino demais!).
       - Faça a associação coerente para evitar discrepâncias. NUNCA relate diâmetros na unidade errada que possa comprometer os cálculos.
       - Se registrar peso (como peso fetal estimado), use gramas ('g').
       
    6. EXTRAÇÃO EXCLUSIVA DE DADOS DO PACIENTE:
       - No topo do laudo impresso na imagem ou no início do texto, tente identificar com total atenção os dados pessoais do paciente e retorne-os nos respectivos campos do JSON:
         * patientName: Nome completo ou abreviado do paciente (ex: 'Maria das Dores', 'Carlos Eduardo').
         * patientAge: Idade em anos, como número inteiro (ex: 45).
         * patientGender: Sexo/gênero do paciente, mapeie estritamente para 'M' ou 'F'.
         * gestationalWeeks: Se demonstrar idade gestacional obstétrica (ex: 28s4d ou 28 semanas), salve o número inteiro de semanas.
         * gestationalDays: Se demonstrar dias da idade gestacional (ex: 28s4d), salve o número dos dias (0 a 6).
    
    Guia de categorias disponíveis:
    ${categoriesGuidance}
    
    Sugestão / Pista de tipo de estudo selecionado na tela: ${studyType || 'thyroid'}
    `;

    if (examFindings) {
      promptText += `\n\nACHADOS / NOTAS TEXTUAIS DO MÉDICO (Leia isto com máxima atenção e faça a extração com base nestes achados): "${examFindings}"`;
    }

    const parts: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const correctImagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        }
      };
      parts.push(correctImagePart);
    }

    const textPart = {
      text: promptText,
    };
    parts.push(textPart);

    // AI-driven structured extraction
    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "Resultado de classificação e extração detalhada do exame de ultrassonografia",
          properties: {
            detectedStudyType: {
              type: Type.STRING,
              description: "O identificador técnico do tipo de estudo classificado. DEVE ser um dos seguintes: 'thyroid', 'renal', 'gallbladder_liver', 'obstetric', 'fgr_barcelona', 'carotid_vascular', 'echocardiogram', 'breast_birads', 'ovary_orads', 'scrotal', 'rheuma_omeract', 'abdomen_total', 'pelvic', 'abdomen_superior', 'prostate', 'transvaginal', 'obstetric_doppler', 'morphological_1t', 'morphological_2t', 'fetal_echocardiogram', 'venous_lower_limbs', 'arterial_lower_limbs'."
            },
            structures: {
              type: Type.ARRAY,
              description: "Array de estruturas médicas extraídas no exame",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "Nome em português da estrutura medida no ultrassom (Ex: 'Mamas', 'Testículo Direito', 'Plexo Pampiniforme (Varicocele)', 'Sinóvia Articular', 'Maior Nódulo Tireoidiano', 'Lobo Direito', 'Rim Esquerdo')"
                  },
                  key: {
                    type: Type.STRING,
                    description: "Identificador técnico da estrutura. ESCOLHA ENTRE: 'right_lobe', 'left_lobe', 'isthmus', 'right_kidney', 'left_kidney', 'right_parenchyma', 'left_parenchyma', 'bladder_wall', 'post_void_residual', 'bladder_volume', 'gallbladder_wall', 'liver_size', 'common_bile_duct', 'spleen', 'pancreas', 'portal_vein', 'splenic_vein', 'inferior_vena_cava', 'ccn', 'fcf', 'yolk_sac', 'nuchal_translucency', 'nasal_bone_1t', 'gestational_age', 'fetal_biometry', 'doppler_arterial', 'doppler_venoso', 'qualitative_status', 'maior_bolsao', 'cerebelo', 'cisterna_magna', 'ventriculo_lateral', 'pregue_nucal', 'osso_nasal', 'humerus', 'tibia', 'fibula', 'radius', 'ulna', 'mean_sac_diameter', 'cervical_length', 'uterine_artery_doppler', 'right_carotid', 'left_carotid', 'right_vertebral', 'left_vertebral', 'mitral_inflow', 'tdi_mitral', 'la_remodeling', 'pulmonary_pressures', 'aorta', 'la_dimensions', 'lv_volume', 'lv_linear', 'right_heart', 'systolic_function', 'breast_birads', 'ovary_orads', 'right_testicle', 'left_testicle', 'right_epididymis_head', 'left_epididymis_head', 'doppler_varicocele', 'hydrocele_volume', 'rheuma_omeract'."
                  },
                  measurements: {
                    type: Type.ARRAY,
                    description: "Array de medições associadas a esta estrutura específica",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: {
                          type: Type.STRING,
                          description: "Tipo de medida. DEVE SER: 'comprimento' (length), 'largura' (width), 'espessura' (thickness), 'volume' (volume), 'frequencia' (bpm), 'diametro', 'weeks', 'days', 'hc', 'ac', 'fl', 'dbp', 'ofd', 'ep', 'ila', 'mbv', 'cerebelo', 'cisterna_magna', 'ventriculo_lateral', 'pregue_nucal', 'osso_nasal', 'ua_pi', 'mca_pi', 'dv_pi', 'ua_status', 'aoi_status', 'dv_a_wave', 'cabeca', 'corpo', 'cauda', 'ducto', 'umero', 'tibia', 'fibula', 'radius', 'ulna', 'cervical_length', 'uta_pi', 'average_pi', 'vps_ci', 'vdf_ci', 'vps_cc', 'vdf_cc', 'vmax', 'vdf', 'diametro_v2', 'ir', 'e_vel', 'a_vel', 'ea_ratio', 'dt', 'e_prime_septal', 'e_prime_lateral', 'e_prime_average', 'ee_prime_ratio_average', 'lavi', 'lars', 'lv_mass_index', 'tr_vel', 'pasp', 'ivrt', 'seios_valsalva', 'seios_valsalva_index', 'aorta_ascendente', 'aorta_ascendente_index', 'atrio_esquerdo_ap', 'atrio_esquerdo_ap_index', 'lvedv', 'lvedvi', 'lvesv', 'lvesvi', 'lvidd', 'lviddi', 'lvidd_height', 'lvids', 'ivsd', 'pwd', 'mve_cubo', 'lvmi', 'mve_altura', 'rwt', 'teichholz_fe', 'base_tricuspide', 'v_reg_t', 'grad_reg_t', 'tapse', 'birads_category', 'nodule_max_diameter', 'orads_category', 'ovarian_mass_diameter', 'varicocele_vein_diameter', 'post_vals_diameter', 'reflux_seconds', 'hydrocele_volume', 'omeract_synovitis_b_mode', 'omeract_synovitis_doppler', 'joint_effusion_presence', 'tirads_category'."
                        },
                        value: {
                          type: Type.NUMBER,
                          description: "O valor numérico bruto extraído (ex: se for BI-RADS 3 salve 3, se for volume de 15.4 mL salve 15.4, ou se for Grau OMERACT 2 salve 2)."
                        },
                        unit: {
                          type: Type.STRING,
                          description: "Unidade de medida exata indicada, ex: 'mm', 'cm', 'mL', 'bpm', 'sem', 'dias', 'segundos', 'grau', 'categoria'."
                        },
                        label: {
                          type: Type.STRING,
                          description: "Label humanizado para exibição no sistema, ex: 'Categoria BI-RADS', 'Maior Diâmetro do Nódulo', 'Score OMERACT Doppler'."
                        }
                      },
                      required: ["type", "value", "unit", "label"]
                    }
                  }
                },
                required: ["name", "key", "measurements"]
              }
            },
            patientName: {
              type: Type.STRING,
              description: "O nome completo ou reduzido do paciente se encontrado na imagem ou anotações (Ex: 'MARIA SILVA'). Se ausente, retorne null."
            },
            patientAge: {
              type: Type.INTEGER,
              description: "A idade do paciente em anos caso identificada na imagem (Ex: 48). Se ausente, retorne null."
            },
            patientGender: {
              type: Type.STRING,
              description: "O sexo do paciente mapeado para 'M' ou 'F' se identificado na imagem. Se ausente, retorne null."
            },
            gestationalWeeks: {
              type: Type.INTEGER,
              description: "Semanas gestacionais se identificado em caso obstétrico. Se ausente, retorne null."
            },
            gestationalDays: {
              type: Type.INTEGER,
              description: "Dias gestacionais (0 a 6) se identificado em caso obstétrico. Se ausente, retorne null."
            }
          },
          required: ["detectedStudyType", "structures"]
        }
      }
    });

    const jsonText = response.text || "{}";
    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(jsonText.trim());
    } catch (parseErr) {
      console.error("Falha ao analisar JSON retornado pelo Gemini:", jsonText);
      throw new Error("O modelo gerou um formato de dados inválido.");
    }

    const detectedType: StudyType = (parsedResult.detectedStudyType || studyType || 'thyroid') as StudyType;
    const extractedRaw = Array.isArray(parsedResult.structures) ? parsedResult.structures : [];

    // Map extracted list model into standard Map keys format for our deterministic calculator
    const standardizedExtracted = extractedRaw.map((item: any) => {
      const measurementsMap: any = {};
      if (Array.isArray(item.measurements)) {
        item.measurements.forEach((m: any) => {
          measurementsMap[m.type] = {
            value: m.value,
            unit: m.unit,
            label: m.label
          };
        });
      }
      return {
        name: item.name,
        key: item.key,
        measurements: measurementsMap
      };
    });

    res.json({
      success: true,
      studyType: detectedType,
      extractedData: standardizedExtracted,
      patientName: parsedResult.patientName || null,
      patientAge: typeof parsedResult.patientAge === 'number' ? parsedResult.patientAge : null,
      patientGender: parsedResult.patientGender === 'M' || parsedResult.patientGender === 'F' ? parsedResult.patientGender : null,
      gestationalWeeks: typeof parsedResult.gestationalWeeks === 'number' ? parsedResult.gestationalWeeks : null,
      gestationalDays: typeof parsedResult.gestationalDays === 'number' ? parsedResult.gestationalDays : null
    });

  } catch (error: any) {
    console.error("Erro na rota /api/analyze:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido durante processamento." });
  }
});

/**
 * Endpoint 2: Runs the non-AI calculations and feeds everything back to Gemini to synthesize a draft medical report (Laudo).
 */
app.post("/api/generate-laudo", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { 
      studyType, 
      extractedData, 
      patientName, 
      patientAge, 
      patientGender,
      gestationalWeeks,
      gestationalDays
    } = req.body;

    if (!extractedData || !Array.isArray(extractedData)) {
      res.status(400).json({ error: "Parâmetros 'extractedData' inválidos ou ausentes." });
      return;
    }

    const typeOfStudy: StudyType = studyType || 'thyroid';
    const name = patientName || "Paciente Anônimo";
    const age = parseInt(patientAge) || 40;
    const gender = patientGender || 'F';

    // Synchronize or insert gestational age data if obstetric study
    const processedExtractedData = [...extractedData];
    const isObstetric = ['fgr_barcelona', 'obstetric_doppler', 'obstetric', 'morphological_1t', 'morphological_2t', 'fetal_echocardiogram'].includes(typeOfStudy);
    if (isObstetric && typeof gestationalWeeks === 'number') {
      const gWeeks = gestationalWeeks || 28;
      const gDays = typeof gestationalDays === 'number' ? gestationalDays : 0;
      
      const gestStruct = {
        name: "Idade Gestacional",
        key: "gestational_age",
        measurements: {
          weeks: { value: gWeeks, unit: "sem", label: "Semanas" },
          days: { value: gDays, unit: "dias", label: "Dias" }
        }
      };

      const hasGestAge = processedExtractedData.some(d => d.key === 'gestational_age');
      if (hasGestAge) {
        const idx = processedExtractedData.findIndex(d => d.key === 'gestational_age');
        processedExtractedData[idx] = gestStruct;
      } else {
        processedExtractedData.push(gestStruct);
      }
    }

    // 1. PERFORM STRUCTURED DETERMINISTIC CALCULATIONS (EXPLICITLY BY CODE, NO AI AT THIS STAGE)
    const calculationResult = calculateNormality(
      typeOfStudy,
      processedExtractedData,
      gender,
      age
    );

    // 2. COMPOSE COMPREHENSIVE MEDICAL REPORT DRAFT USING GEMINI WITH CALCULATED DATA
    const reportSummaryForPrompt = JSON.stringify({
      paciente: { nome: name, idade: age, sexo: gender === 'M' ? 'Masculino' : 'Feminino' },
      tipoExame: typeOfStudy,
      medidasExtraidas: processedExtractedData,
      analiseNormalidadeCodigo: calculationResult
    }, null, 2);

    const reportPrompt = `
    Você é um radiologista assistente altamente qualificado encarregado de redigir um "LAUDO DE EXAME DE ULTRASSOM" rigorosamente estruturado, formal e profissional em português do Brasil.
    Você recebeu dados detalhados extraídos de um exame de imagem e os resultados do módulo de cálculo de conformidade normal/anormal determinístico do nosso sistema.

    DADOS DO SISTEMA PARA O LAUDO:
    ${reportSummaryForPrompt}

    INSTRUÇÕES CRUCIAS PARA ESCRITA DO LAUDO DO EXAME:
    1. ATENÇÃO: NÃO inclua cabeçalhos de clínica (ex: CLÍNICA FRANCO), nem blocos ou tabelas de dados de identificação do Paciente (Paciente, Idade, Sexo, Data, DUM, DPP), pois o sistema renderiza automaticamente um cabeçalho oficial e um cartão de identificação do paciente em formato A4 na interface do usuário e na impressão. Comece escrevendo os achados diretamente de forma formal.
    2. O laudo deve iniciar diretamente com estas seções ou equivalentes:
       - **TIPO DE EXAME**: <Nome do exame baseado no tipo de estudo de forma curta e formal>
       - **VIA DE ACESSO**: <Defina a via clássica (ex: Transvaginal, Transabdominal, Endovaginal se for obstétrico inicial, etc.)>
       - **DADOS CLÍNICOS E CÁLCULOS GESTACIONAIS** / **INDICAÇÃO CLÍNICA** (Se aplicável, relacione DUM e dados clínicos coletados.)
       - **MEDIDAS E CÁLCULOS**: (Apresente listados todos os parâmetros extraídos e calculados. Ex: Saco Gestacional (D1, D2, D3), Diâmetro Médio do Saco Gestacional (DMSG) em mm ou volumes correspondentes. Seja compatível com os dados numéricos em 'medidasExtraidas'.)
       - **MORFOLOGIA E ACHADOS** / **ANÁLISE DETALHADA**: (Descreva os achados anatômicos de forma clínica fluida. Use terminologias formais como: 'útero de volume aumentado (gravídico)', 'contornos regulares', 'regiões anexiais livres', 'vesícula biliar com paredes finas', 'sem sinais de estase ou cálculos', etc. de acordo com sua categoria.)
       - **AVALIAÇÃO GESTACIONAL**: (Descreva especificamente em detalhes a situação se for estudo gestacional. Ex: Saco Gestacional tópico, Vesícula vitelina observada com morfologia e ecogenicidade usuais, Pólo embrionário ausente ou presente, etc.)
       - **CONCLUSÃO**: (Sumarize de forma clara e rítmica as impressões diagnósticas. Se for gravidez inicial, ex: "ESTUDO ECOGRÁFICO COM SINAIS QUE PODEM CORRESPONDER A: Gestação tópica inicial, evolutivamente compatível com as dimensões do saco gestacional...", ou "Tireoide de dimensões preservadas..." etc. Siga à risca os resultados matemáticos e alertas clínicos de normalidade calculados!)
    3. Nunca utilize cabeçalhos ou dados que contradigam o cálculo determinístico do sistema.
    4. Não adicione nenhuma área de assinatura de médico ao final, visto que o sistema insere dinamicamente o carimbo visual e assinatura digitalizada regulamentada do Dr. Rodrigo Duarte Franco.
    5. Use formatação Markdown limpa e elegante (títulos em negrito, tópicos claros com marcadores normais).
    6. REGRA ABSOLUTA DE CÁLCULO E MATEMÁTICA: Você está PROIBIDO de realizar seus próprios cálculos matemáticos (como percentis, volumes, idades gestacionais ou regressões lineares). Você deve utilizar e reportar UNICAMENTE os resultados de conformidade, classificações de normalidade, limites ideais, percentis, alertas e diástases que já foram pré-calculados de forma determinística por nosso código matemático tradicional (conforme listado no objeto 'analiseNormalidadeCodigo'). Transcreva fielmente as métricas, percentis e alertas médicos gerados pelo sistema para a seção de Conclusão e Tabela de Medidas.
    `;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: reportPrompt,
      config: {
        temperature: 0.2, // Low temperature for high structured fidelity and professional behavior
      }
    });

    res.json({
      success: true,
      patientName: name,
      patientAge: age,
      patientGender: gender,
      studyType: typeOfStudy,
      calculatedNormality: calculationResult,
      laudoMarkdown: response.text
    });

  } catch (error: any) {
    console.error("Erro na rota /api/generate-laudo:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido ao gerar o laudo." });
  }
});

// Setup Vite & static assets loading pipeline for Express
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server pipeline: mount Vite server middleware
    console.log("Iniciando servidor de desenvolvimento Express + Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static delivery assets serving pipeline
    console.log("Iniciando servidor Express em modo de PRODUÇÃO...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Servidor Ativo] Aplicação rodando no endereço http://localhost:${PORT}`);
  });
}

startServer();
