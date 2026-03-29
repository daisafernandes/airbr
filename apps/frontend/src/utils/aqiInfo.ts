export interface AqiBand {
  min: number
  max: number
  label: string
  color: string
  healthImpact: string
  recommendation: string
}

export interface PollutantInfo {
  key: string
  label: string
  fullName: string
  unit: string
  whoLimit: number
  whoLimitPeriod: string
  description: string
  sources: string
  effects: string
}

export interface UVLevel {
  max: number
  label: string
  color: string
  recommendation: string
}

export interface PollenLevel {
  max: number
  label: string
  color: string
  recommendation: string
}

export interface DataSource {
  name: string
  description: string
  url: string
}

export const AQI_BANDS: AqiBand[] = [
  {
    min: 0,
    max: 50,
    label: 'Bom',
    color: '#4af0c4',
    healthImpact: 'Qualidade do ar satisfatória. Poluição do ar apresenta risco mínimo.',
    recommendation: 'Aproveite atividades ao ar livre normalmente.',
  },
  {
    min: 51,
    max: 100,
    label: 'Moderado',
    color: '#facc15',
    healthImpact: 'Qualidade do ar aceitável. Poluentes podem afetar pessoas extremamente sensíveis.',
    recommendation: 'Pessoas incomumente sensíveis à poluição devem considerar reduzir esforços prolongados ao ar livre.',
  },
  {
    min: 101,
    max: 150,
    label: 'Ruim para sensíveis',
    color: '#ff9f4a',
    healthImpact: 'Grupos sensíveis podem sofrer efeitos na saúde. Público em geral não é afetado.',
    recommendation: 'Crianças, idosos, gestantes e pessoas com doenças cardiorrespiratórias devem limitar esforços ao ar livre.',
  },
  {
    min: 151,
    max: 200,
    label: 'Ruim',
    color: '#ef4444',
    healthImpact: 'Toda a população pode sofrer efeitos na saúde. Grupos sensíveis com efeitos mais sérios.',
    recommendation: 'Evite atividades físicas prolongadas ou intensas ao ar livre. Grupos sensíveis: fique em ambientes fechados.',
  },
  {
    min: 201,
    max: 300,
    label: 'Muito ruim',
    color: '#a855f7',
    healthImpact: 'Alerta de saúde: toda a população pode sofrer efeitos mais sérios.',
    recommendation: 'Evite qualquer atividade ao ar livre. Use máscara se precisar sair. Mantenha janelas fechadas.',
  },
  {
    min: 301,
    max: 500,
    label: 'Perigoso',
    color: '#be123c',
    healthImpact: 'Emergência de saúde: toda a população é afetada. Risco grave de complicações.',
    recommendation: 'Permaneça em ambientes fechados. Não saia de casa. Procure atendimento médico se sentir sintomas.',
  },
]

export const POLLUTANT_INFO: Record<string, PollutantInfo> = {
  pm25: {
    key: 'pm25',
    label: 'PM2.5',
    fullName: 'Material Particulado Fino',
    unit: 'µg/m³',
    whoLimit: 5,
    whoLimitPeriod: 'média anual',
    description:
      'Partículas sólidas ou líquidas com diâmetro aerodinâmico inferior a 2,5 micrômetros (µm). São tão pequenas que penetram profundamente nos pulmões, atingindo os alvéolos pulmonares, e podem entrar na corrente sanguínea.',
    sources: 'Queima de biomassa (queimadas), veículos diesel, indústrias, usinas termelétricas e reações atmosféricas de outros poluentes.',
    effects:
      'Doenças respiratórias (asma, bronquite), cardiovasculares, câncer de pulmão e morte prematura. Crianças, idosos e gestantes são os grupos mais vulneráveis.',
  },
  pm10: {
    key: 'pm10',
    label: 'PM10',
    fullName: 'Material Particulado Inalável',
    unit: 'µg/m³',
    whoLimit: 15,
    whoLimitPeriod: 'média anual',
    description:
      'Partículas com diâmetro aerodinâmico inferior a 10 µm. Ficam retidas nas vias aéreas superiores (nariz, faringe, traqueia) e nos brônquios, sem atingir os alvéolos como o PM2.5.',
    sources: 'Poeira de estradas não pavimentadas, construção civil, mineração, queimadas e ressuspensão de solo.',
    effects:
      'Irritação de olhos, nariz e garganta, agravamento de asma e bronquite, infecções respiratórias e diminuição da função pulmonar.',
  },
  no2: {
    key: 'no2',
    label: 'NO₂',
    fullName: 'Dióxido de Nitrogênio',
    unit: 'µg/m³',
    whoLimit: 10,
    whoLimitPeriod: 'média anual',
    description:
      'Gás de coloração avermelhada com odor pungente. Componente importante do smog fotoquímico e precursor do ozônio troposférico e de aerossóis de nitrato.',
    sources: 'Combustão em motores de veículos (especialmente a diesel), usinas termelétricas e processos industriais.',
    effects:
      'Inflamação das vias aéreas, agravamento de asma, maior suscetibilidade a infecções respiratórias e aumento do risco de doenças cardiovasculares.',
  },
  o3: {
    key: 'o3',
    label: 'O₃',
    fullName: 'Ozônio Troposférico',
    unit: 'µg/m³',
    whoLimit: 60,
    whoLimitPeriod: 'média de 8 horas',
    description:
      'Poluente secundário formado pela reação química entre NOx e Compostos Orgânicos Voláteis (COVs) sob ação da luz solar. Diferente do "ozônio bom" da estratosfera, que nos protege da radiação UV.',
    sources: 'Não é emitido diretamente — formado na atmosfera a partir de emissões de veículos, indústrias e solventes sob luz solar intensa.',
    effects:
      'Irritação de olhos, nariz e garganta, tosse, dificuldade de respirar, agravamento de asma e doenças pulmonares crônicas. Efeitos piores em dias quentes e ensolarados.',
  },
  co: {
    key: 'co',
    label: 'CO',
    fullName: 'Monóxido de Carbono',
    unit: 'mg/m³',
    whoLimit: 4,
    whoLimitPeriod: 'média de 24 horas',
    description:
      'Gás incolor e inodoro produzido pela combustão incompleta de materiais orgânicos. Liga-se à hemoglobina com afinidade 200× maior que o oxigênio, reduzindo a capacidade de transporte de O₂ no sangue.',
    sources: 'Veículos automotores (maior fonte urbana), queimadas, fornos, fogões a lenha e equipamentos a combustão sem ventilação adequada.',
    effects:
      'Em baixas concentrações: dor de cabeça, tontura, fraqueza e náusea. Em altas concentrações: perda de consciência e morte. Grupos de risco: cardiopatas e grávidas.',
  },
}

export const UV_LEVELS: UVLevel[] = [
  { max: 2,  label: 'Baixo',      color: '#4af0c4', recommendation: 'Proteção mínima necessária.' },
  { max: 5,  label: 'Moderado',   color: '#facc15', recommendation: 'Use protetor solar FPS 30+ e óculos de sol.' },
  { max: 7,  label: 'Alto',       color: '#ff9f4a', recommendation: 'Reduza exposição entre 10h–16h. Chapéu e protetor solar.' },
  { max: 10, label: 'Muito Alto', color: '#ef4444', recommendation: 'Evite exposição direta. Protetor solar FPS 50+.' },
  { max: 11, label: 'Extremo',    color: '#a855f7', recommendation: 'Permaneça em local coberto. Risco de queimadura em minutos.' },
]

export const POLLEN_LEVELS: PollenLevel[] = [
  { max: 2,  label: 'Baixo',      color: '#4af0c4', recommendation: 'Risco mínimo para alérgicos.' },
  { max: 5,  label: 'Moderado',   color: '#facc15', recommendation: 'Pessoas alérgicas podem sentir sintomas leves.' },
  { max: 7,  label: 'Alto',       color: '#ff9f4a', recommendation: 'Sintomas moderados a graves. Tome medicação preventiva.' },
  { max: 10, label: 'Muito Alto', color: '#ef4444', recommendation: 'Evite exposição ao ar livre se for alérgico.' },
]

export const DATA_SOURCES: DataSource[] = [
  {
    name: 'OMS – Diretrizes Globais de Qualidade do Ar (2021)',
    description: 'Referência global para limites de PM2.5, PM10, NO₂, O₃ e CO. Atualizada em 2021 com critérios mais rígidos.',
    url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
  },
  {
    name: 'INPE – Monitoramento de Queimadas',
    description: 'Dados de focos de calor e queimadas detectados por satélites no território brasileiro.',
    url: 'https://queimadas.dgi.inpe.br',
  },
  {
    name: 'CETESB – Qualidade do Ar no Estado de SP',
    description: 'Agência ambiental do Estado de São Paulo. Referência brasileira em monitoramento da qualidade do ar.',
    url: 'https://cetesb.sp.gov.br/ar/',
  },
  {
    name: 'IQAir – World Air Quality Report',
    description: 'Plataforma global de dados de qualidade do ar em tempo real e relatórios anuais por país.',
    url: 'https://www.iqair.com/br/brazil',
  },
  {
    name: 'EPA – AirNow (EUA)',
    description: 'Agência de Proteção Ambiental dos EUA. Base do cálculo do índice AQI utilizado internacionalmente.',
    url: 'https://www.airnow.gov/aqi/aqi-basics/',
  },
  {
    name: 'IBAMA – Programa de Controle da Poluição do Ar',
    description: 'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis — fiscalização ambiental.',
    url: 'https://www.gov.br/ibama/pt-br',
  },
]
