// Static numeric/color data — language-independent
const AQI_BAND_BASES = [
    { min: 0, max: 50, color: '#4af0c4', key: 'good' },
    { min: 51, max: 100, color: '#facc15', key: 'moderate' },
    { min: 101, max: 150, color: '#ff9f4a', key: 'sensitiveGroup' },
    { min: 151, max: 200, color: '#ef4444', key: 'unhealthy' },
    { min: 201, max: 300, color: '#a855f7', key: 'veryUnhealthy' },
    { min: 301, max: 500, color: '#be123c', key: 'hazardous' },
];
const UV_LEVEL_BASES = [
    { max: 2, color: '#4af0c4', key: 'low' },
    { max: 5, color: '#facc15', key: 'moderate' },
    { max: 7, color: '#ff9f4a', key: 'high' },
    { max: 10, color: '#ef4444', key: 'veryHigh' },
    { max: 11, color: '#a855f7', key: 'extreme' },
];
const POLLEN_LEVEL_BASES = [
    { max: 2, color: '#4af0c4', key: 'low' },
    { max: 5, color: '#facc15', key: 'moderate' },
    { max: 7, color: '#ff9f4a', key: 'high' },
    { max: 10, color: '#ef4444', key: 'veryHigh' },
];
const POLLUTANT_BASES = [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', whoLimit: 5 },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³', whoLimit: 15 },
    { key: 'no2', label: 'NO₂', unit: 'µg/m³', whoLimit: 10 },
    { key: 'o3', label: 'O₃', unit: 'µg/m³', whoLimit: 60 },
    { key: 'co', label: 'CO', unit: 'mg/m³', whoLimit: 4 },
];
const DATA_SOURCE_URLS = {
    who: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
    inpe: 'https://queimadas.dgi.inpe.br',
    cetesb: 'https://cetesb.sp.gov.br/ar/',
    iqair: 'https://www.iqair.com/br/brazil',
    epa: 'https://www.airnow.gov/aqi/aqi-basics/',
    ibama: 'https://www.gov.br/ibama/pt-br',
};
// ─── Translated factory functions ──────────────────────────────────────────
export function getAqiBands(t) {
    return AQI_BAND_BASES.map(b => ({
        min: b.min,
        max: b.max,
        color: b.color,
        label: t(`aqi.bands.${b.key}.label`),
        healthImpact: t(`aqi.bands.${b.key}.healthImpact`),
        recommendation: t(`aqi.bands.${b.key}.recommendation`),
    }));
}
export function getUVLevels(t) {
    return UV_LEVEL_BASES.map(b => ({
        max: b.max,
        color: b.color,
        label: t(`uv.${b.key}.label`),
        recommendation: t(`uv.${b.key}.recommendation`),
    }));
}
export function getPollenLevels(t) {
    return POLLEN_LEVEL_BASES.map(b => ({
        max: b.max,
        color: b.color,
        label: t(`pollen.${b.key}.label`),
        recommendation: t(`pollen.${b.key}.recommendation`),
    }));
}
export function getPollutantInfo(t) {
    const result = {};
    for (const p of POLLUTANT_BASES) {
        result[p.key] = {
            key: p.key,
            label: p.label,
            unit: p.unit,
            whoLimit: p.whoLimit,
            fullName: t(`pollutants.${p.key}.fullName`),
            whoLimitPeriod: t(`pollutants.${p.key}.whoLimitPeriod`),
            description: t(`pollutants.${p.key}.description`),
            sources: t(`pollutants.${p.key}.sources`),
            effects: t(`pollutants.${p.key}.effects`),
            shortDesc: t(`pollutants.${p.key}.shortDesc`),
        };
    }
    return result;
}
export function getDataSources(t) {
    return Object.entries(DATA_SOURCE_URLS).map(([key, url]) => ({
        name: t(`dataSources.${key}.name`),
        description: t(`dataSources.${key}.description`),
        url,
    }));
}
export function getAQILabel(aqi, t) {
    if (aqi <= 50)
        return t('aqi.bands.good.label');
    if (aqi <= 100)
        return t('aqi.bands.moderate.label');
    if (aqi <= 150)
        return t('aqi.sensitiveShort');
    if (aqi <= 200)
        return t('aqi.bands.unhealthy.label');
    if (aqi <= 300)
        return t('aqi.bands.veryUnhealthy.label');
    return t('aqi.bands.hazardous.label');
}
export function getHealthAlerts(aqi, t) {
    if (aqi <= 50)
        return [{ severity: 'info', message: t('healthAlerts.good_0') }];
    if (aqi <= 100)
        return [{ severity: 'warning', message: t('healthAlerts.moderate_0') }];
    if (aqi <= 150)
        return [
            { severity: 'warning', message: t('healthAlerts.sensitive_0') },
            { severity: 'info', message: t('healthAlerts.sensitive_1') },
        ];
    if (aqi <= 200)
        return [
            { severity: 'danger', message: t('healthAlerts.unhealthy_0') },
            { severity: 'warning', message: t('healthAlerts.unhealthy_1') },
        ];
    if (aqi <= 300)
        return [
            { severity: 'critical', message: t('healthAlerts.veryUnhealthy_0') },
            { severity: 'danger', message: t('healthAlerts.veryUnhealthy_1') },
        ];
    return [
        { severity: 'critical', message: t('healthAlerts.hazardous_0') },
        { severity: 'critical', message: t('healthAlerts.hazardous_1') },
    ];
}
// ─── Legacy static constants (kept for backward compatibility) ──────────────
export const AQI_BANDS = [
    { min: 0, max: 50, label: 'Bom', color: '#4af0c4', healthImpact: 'Qualidade do ar satisfatória. Poluição do ar apresenta risco mínimo.', recommendation: 'Aproveite atividades ao ar livre normalmente.' },
    { min: 51, max: 100, label: 'Moderado', color: '#facc15', healthImpact: 'Qualidade do ar aceitável. Poluentes podem afetar pessoas extremamente sensíveis.', recommendation: 'Pessoas incomumente sensíveis à poluição devem considerar reduzir esforços prolongados ao ar livre.' },
    { min: 101, max: 150, label: 'Ruim para sensíveis', color: '#ff9f4a', healthImpact: 'Grupos sensíveis podem sofrer efeitos na saúde. Público em geral não é afetado.', recommendation: 'Crianças, idosos, gestantes e pessoas com doenças cardiorrespiratórias devem limitar esforços ao ar livre.' },
    { min: 151, max: 200, label: 'Ruim', color: '#ef4444', healthImpact: 'Toda a população pode sofrer efeitos na saúde. Grupos sensíveis com efeitos mais sérios.', recommendation: 'Evite atividades físicas prolongadas ou intensas ao ar livre. Grupos sensíveis: fique em ambientes fechados.' },
    { min: 201, max: 300, label: 'Muito ruim', color: '#a855f7', healthImpact: 'Alerta de saúde: toda a população pode sofrer efeitos mais sérios.', recommendation: 'Evite qualquer atividade ao ar livre. Use máscara se precisar sair. Mantenha janelas fechadas.' },
    { min: 301, max: 500, label: 'Perigoso', color: '#be123c', healthImpact: 'Emergência de saúde: toda a população é afetada. Risco grave de complicações.', recommendation: 'Permaneça em ambientes fechados. Não saia de casa. Procure atendimento médico se sentir sintomas.' },
];
export const POLLUTANT_INFO = {
    pm25: { key: 'pm25', label: 'PM2.5', fullName: 'Material Particulado Fino', unit: 'µg/m³', whoLimit: 5, whoLimitPeriod: 'média anual', description: 'Partículas sólidas ou líquidas com diâmetro aerodinâmico inferior a 2,5 micrômetros (µm). São tão pequenas que penetram profundamente nos pulmões, atingindo os alvéolos pulmonares, e podem entrar na corrente sanguínea.', sources: 'Queima de biomassa (queimadas), veículos diesel, indústrias, usinas termelétricas e reações atmosféricas de outros poluentes.', effects: 'Doenças respiratórias (asma, bronquite), cardiovasculares, câncer de pulmão e morte prematura. Crianças, idosos e gestantes são os grupos mais vulneráveis.', shortDesc: 'Partículas finas (< 2,5 µm). Penetram fundo nos pulmões e causam doenças respiratórias e cardiovasculares.' },
    pm10: { key: 'pm10', label: 'PM10', fullName: 'Material Particulado Inalável', unit: 'µg/m³', whoLimit: 15, whoLimitPeriod: 'média anual', description: 'Partículas com diâmetro aerodinâmico inferior a 10 µm. Ficam retidas nas vias aéreas superiores (nariz, faringe, traqueia) e nos brônquios, sem atingir os alvéolos como o PM2.5.', sources: 'Poeira de estradas não pavimentadas, construção civil, mineração, queimadas e ressuspensão de solo.', effects: 'Irritação de olhos, nariz e garganta, agravamento de asma e bronquite, infecções respiratórias e diminuição da função pulmonar.', shortDesc: 'Partículas inaláveis (< 10 µm). Irritam vias aéreas superiores e agravam asma e bronquite.' },
    no2: { key: 'no2', label: 'NO₂', fullName: 'Dióxido de Nitrogênio', unit: 'µg/m³', whoLimit: 10, whoLimitPeriod: 'média anual', description: 'Gás de coloração avermelhada com odor pungente. Componente importante do smog fotoquímico e precursor do ozônio troposférico e de aerossóis de nitrato.', sources: 'Combustão em motores de veículos (especialmente a diesel), usinas termelétricas e processos industriais.', effects: 'Inflamação das vias aéreas, agravamento de asma, maior suscetibilidade a infecções respiratórias e aumento do risco de doenças cardiovasculares.', shortDesc: 'Dióxido de nitrogênio. Emitido por motores e indústrias. Agrava asma e aumenta risco de infecções.' },
    o3: { key: 'o3', label: 'O₃', fullName: 'Ozônio Troposférico', unit: 'µg/m³', whoLimit: 60, whoLimitPeriod: 'média de 8 horas', description: 'Poluente secundário formado pela reação química entre NOx e Compostos Orgânicos Voláteis (COVs) sob ação da luz solar.', sources: 'Não é emitido diretamente — formado na atmosfera a partir de emissões de veículos, indústrias e solventes sob luz solar intensa.', effects: 'Irritação de olhos, nariz e garganta, tosse, dificuldade de respirar, agravamento de asma e doenças pulmonares crônicas.', shortDesc: 'Ozônio troposférico. Formado pela reação de NOx com COV sob luz solar. Irrita olhos e pulmões.' },
    co: { key: 'co', label: 'CO', fullName: 'Monóxido de Carbono', unit: 'mg/m³', whoLimit: 4, whoLimitPeriod: 'média de 24 horas', description: 'Gás incolor e inodoro produzido pela combustão incompleta de materiais orgânicos.', sources: 'Veículos automotores (maior fonte urbana), queimadas, fornos, fogões a lenha e equipamentos a combustão sem ventilação adequada.', effects: 'Em baixas concentrações: dor de cabeça, tontura, fraqueza e náusea. Em altas concentrações: perda de consciência e morte.', shortDesc: 'Monóxido de carbono. Gás inodoro e incolor que reduz a capacidade do sangue de transportar oxigênio.' },
};
export const UV_LEVELS = [
    { max: 2, label: 'Baixo', color: '#4af0c4', recommendation: 'Proteção mínima necessária.' },
    { max: 5, label: 'Moderado', color: '#facc15', recommendation: 'Use protetor solar FPS 30+ e óculos de sol.' },
    { max: 7, label: 'Alto', color: '#ff9f4a', recommendation: 'Reduza exposição entre 10h–16h. Chapéu e protetor solar.' },
    { max: 10, label: 'Muito Alto', color: '#ef4444', recommendation: 'Evite exposição direta. Protetor solar FPS 50+.' },
    { max: 11, label: 'Extremo', color: '#a855f7', recommendation: 'Permaneça em local coberto. Risco de queimadura em minutos.' },
];
export const POLLEN_LEVELS = [
    { max: 2, label: 'Baixo', color: '#4af0c4', recommendation: 'Risco mínimo para alérgicos.' },
    { max: 5, label: 'Moderado', color: '#facc15', recommendation: 'Pessoas alérgicas podem sentir sintomas leves.' },
    { max: 7, label: 'Alto', color: '#ff9f4a', recommendation: 'Sintomas moderados a graves. Tome medicação preventiva.' },
    { max: 10, label: 'Muito Alto', color: '#ef4444', recommendation: 'Evite exposição ao ar livre se for alérgico.' },
];
export const DATA_SOURCES = [
    { name: 'OMS – Diretrizes Globais de Qualidade do Ar (2021)', description: 'Referência global para limites de PM2.5, PM10, NO₂, O₃ e CO. Atualizada em 2021 com critérios mais rígidos.', url: DATA_SOURCE_URLS.who },
    { name: 'INPE – Monitoramento de Queimadas', description: 'Dados de focos de calor e queimadas detectados por satélites no território brasileiro.', url: DATA_SOURCE_URLS.inpe },
    { name: 'CETESB – Qualidade do Ar no Estado de SP', description: 'Agência ambiental do Estado de São Paulo. Referência brasileira em monitoramento da qualidade do ar.', url: DATA_SOURCE_URLS.cetesb },
    { name: 'IQAir – World Air Quality Report', description: 'Plataforma global de dados de qualidade do ar em tempo real e relatórios anuais por país.', url: DATA_SOURCE_URLS.iqair },
    { name: 'EPA – AirNow (EUA)', description: 'Agência de Proteção Ambiental dos EUA. Base do cálculo do índice AQI utilizado internacionalmente.', url: DATA_SOURCE_URLS.epa },
    { name: 'IBAMA – Programa de Controle da Poluição do Ar', description: 'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis — fiscalização ambiental.', url: DATA_SOURCE_URLS.ibama },
];
