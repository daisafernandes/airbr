// ---------------------------------------------------------------------------
// Deterministic seeded pseudo-random helpers
// ---------------------------------------------------------------------------
function seeded(seed, min, max) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    const r = x - Math.floor(x);
    return Math.round(min + r * (max - min));
}
function seededFloat(seed, min, max, decimals = 1) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    const r = x - Math.floor(x);
    return parseFloat((min + r * (max - min)).toFixed(decimals));
}
// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------
export function getAQILabel(aqi) {
    if (aqi <= 50)
        return 'Bom';
    if (aqi <= 100)
        return 'Moderado';
    if (aqi <= 150)
        return 'Ruim p/ sensíveis';
    if (aqi <= 200)
        return 'Ruim';
    if (aqi <= 300)
        return 'Muito Ruim';
    return 'Perigoso';
}
export function getAQIColor(aqi) {
    if (aqi <= 50)
        return '#4af0c4';
    if (aqi <= 100)
        return '#facc15';
    if (aqi <= 150)
        return '#ff9f4a';
    if (aqi <= 200)
        return '#ef4444';
    if (aqi <= 300)
        return '#a855f7';
    return '#7c3aed';
}
function getHealthAlerts(aqi) {
    if (aqi <= 50)
        return [];
    if (aqi <= 100)
        return [
            {
                message: 'Qualidade do ar aceitável. Pessoas muito sensíveis devem considerar limitar esforços prolongados ao ar livre.',
                severity: 'info',
            },
        ];
    if (aqi <= 150)
        return [
            {
                message: 'Grupos sensíveis (crianças, idosos e pessoas com doenças respiratórias) devem evitar atividades intensas ao ar livre.',
                severity: 'warning',
            },
            { message: 'Use máscara se precisar permanecer por longos períodos em áreas abertas.', severity: 'info' },
        ];
    if (aqi <= 200)
        return [
            { message: 'Evite exercícios ao ar livre. Todos os grupos podem ser afetados.', severity: 'danger' },
            {
                message: 'Grupos sensíveis devem ficar em ambientes fechados com janelas e portas fechadas.',
                severity: 'warning',
            },
            { message: 'Procure atendimento médico se sentir dificuldade respiratória.', severity: 'danger' },
        ];
    if (aqi <= 300)
        return [
            { message: 'ALERTA: Todos devem evitar qualquer atividade ao ar livre.', severity: 'critical' },
            {
                message: 'Grupos sensíveis devem evacuar para ambientes fechados e bem ventilados artificialmente.',
                severity: 'critical',
            },
            { message: 'Use máscara N95 se precisar sair de casa.', severity: 'danger' },
        ];
    return [
        { message: 'EMERGÊNCIA: Condições de saúde perigosas para toda a população.', severity: 'critical' },
        { message: 'Permaneça em ambientes fechados. Evite qualquer exposição ao ar externo.', severity: 'critical' },
        { message: 'Acione o SAMU (192) em caso de sintomas graves (falta de ar, dor no peito).', severity: 'critical' },
    ];
}
const CITY_BASES = [
    // ─── Norte ───────────────────────────────────────────────────────────────
    { name: 'Manaus', state: 'AM', region: 'Norte', lat: -3.12, lng: -60.02, baseAqi: 142, fireRisk: 3, hasDeforestation: true },
    { name: 'Belém', state: 'PA', region: 'Norte', lat: -1.46, lng: -48.5, baseAqi: 95, fireRisk: 2, hasDeforestation: true },
    { name: 'Porto Velho', state: 'RO', region: 'Norte', lat: -8.76, lng: -63.9, baseAqi: 119, fireRisk: 3, hasDeforestation: true },
    { name: 'Rio Branco', state: 'AC', region: 'Norte', lat: -9.97, lng: -67.81, baseAqi: 108, fireRisk: 3, hasDeforestation: true },
    { name: 'Macapá', state: 'AP', region: 'Norte', lat: 0.03, lng: -51.07, baseAqi: 63, fireRisk: 1, hasDeforestation: false },
    { name: 'Boa Vista', state: 'RR', region: 'Norte', lat: 2.82, lng: -60.67, baseAqi: 37, fireRisk: 1, hasDeforestation: false },
    { name: 'Palmas', state: 'TO', region: 'Norte', lat: -10.18, lng: -48.33, baseAqi: 91, fireRisk: 2, hasDeforestation: true },
    // ─── Nordeste ────────────────────────────────────────────────────────────
    { name: 'Salvador', state: 'BA', region: 'Nordeste', lat: -12.97, lng: -38.51, baseAqi: 52, fireRisk: 1, hasDeforestation: false },
    { name: 'Fortaleza', state: 'CE', region: 'Nordeste', lat: -3.72, lng: -38.53, baseAqi: 61, fireRisk: 0, hasDeforestation: false },
    { name: 'Recife', state: 'PE', region: 'Nordeste', lat: -8.05, lng: -34.87, baseAqi: 67, fireRisk: 0, hasDeforestation: false },
    { name: 'São Luís', state: 'MA', region: 'Nordeste', lat: -2.53, lng: -44.28, baseAqi: 76, fireRisk: 1, hasDeforestation: false },
    { name: 'Maceió', state: 'AL', region: 'Nordeste', lat: -9.67, lng: -35.74, baseAqi: 55, fireRisk: 0, hasDeforestation: false },
    { name: 'Teresina', state: 'PI', region: 'Nordeste', lat: -5.09, lng: -42.8, baseAqi: 82, fireRisk: 1, hasDeforestation: false },
    { name: 'Natal', state: 'RN', region: 'Nordeste', lat: -5.79, lng: -35.21, baseAqi: 44, fireRisk: 0, hasDeforestation: false },
    { name: 'João Pessoa', state: 'PB', region: 'Nordeste', lat: -7.12, lng: -34.86, baseAqi: 41, fireRisk: 0, hasDeforestation: false },
    { name: 'Aracaju', state: 'SE', region: 'Nordeste', lat: -10.91, lng: -37.04, baseAqi: 48, fireRisk: 0, hasDeforestation: false },
    // ─── Centro-Oeste ────────────────────────────────────────────────────────
    { name: 'Brasília', state: 'DF', region: 'Centro-Oeste', lat: -15.79, lng: -47.88, baseAqi: 45, fireRisk: 1, hasDeforestation: false },
    { name: 'Goiânia', state: 'GO', region: 'Centro-Oeste', lat: -16.68, lng: -49.25, baseAqi: 58, fireRisk: 1, hasDeforestation: false },
    { name: 'Cuiabá', state: 'MT', region: 'Centro-Oeste', lat: -15.6, lng: -56.1, baseAqi: 89, fireRisk: 2, hasDeforestation: true },
    { name: 'Campo Grande', state: 'MS', region: 'Centro-Oeste', lat: -20.44, lng: -54.65, baseAqi: 48, fireRisk: 1, hasDeforestation: false },
    // ─── Sudeste ─────────────────────────────────────────────────────────────
    { name: 'São Paulo', state: 'SP', region: 'Sudeste', lat: -23.55, lng: -46.63, baseAqi: 128, fireRisk: 0, hasDeforestation: false },
    { name: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste', lat: -22.91, lng: -43.17, baseAqi: 85, fireRisk: 0, hasDeforestation: false },
    { name: 'Belo Horizonte', state: 'MG', region: 'Sudeste', lat: -19.92, lng: -43.94, baseAqi: 72, fireRisk: 0, hasDeforestation: false },
    { name: 'Vitória', state: 'ES', region: 'Sudeste', lat: -20.32, lng: -40.34, baseAqi: 54, fireRisk: 0, hasDeforestation: false },
    { name: 'Cubatão', state: 'SP', region: 'Sudeste', lat: -23.88, lng: -46.42, baseAqi: 162, fireRisk: 0, hasDeforestation: false },
    { name: 'Campinas', state: 'SP', region: 'Sudeste', lat: -22.91, lng: -47.06, baseAqi: 98, fireRisk: 0, hasDeforestation: false },
    // ─── Sul ─────────────────────────────────────────────────────────────────
    { name: 'Curitiba', state: 'PR', region: 'Sul', lat: -25.43, lng: -49.27, baseAqi: 38, fireRisk: 0, hasDeforestation: false },
    { name: 'Porto Alegre', state: 'RS', region: 'Sul', lat: -30.03, lng: -51.23, baseAqi: 42, fireRisk: 0, hasDeforestation: false },
    { name: 'Florianópolis', state: 'SC', region: 'Sul', lat: -27.59, lng: -48.55, baseAqi: 18, fireRisk: 0, hasDeforestation: false },
];
// ---------------------------------------------------------------------------
// Global fire spots (source: INPE/BDQueimadas mock)
// ---------------------------------------------------------------------------
export const GLOBAL_FIRE_SPOTS = [
    // Amazônia / Rondônia — alta intensidade
    { lat: -8.5, lng: -63.0, intensity: 'high' },
    { lat: -9.2, lng: -64.1, intensity: 'high' },
    { lat: -10.0, lng: -62.5, intensity: 'high' },
    { lat: -7.8, lng: -60.3, intensity: 'medium' },
    { lat: -3.5, lng: -55.0, intensity: 'medium' },
    { lat: -4.2, lng: -56.8, intensity: 'medium' },
    // Tocantins / Maranhão — média intensidade
    { lat: -10.2, lng: -48.5, intensity: 'medium' },
    { lat: -7.0, lng: -49.0, intensity: 'medium' },
    { lat: -6.5, lng: -47.2, intensity: 'low' },
    // Mato Grosso — alta intensidade (seca)
    { lat: -12.5, lng: -55.0, intensity: 'high' },
    { lat: -13.0, lng: -57.5, intensity: 'high' },
    { lat: -14.2, lng: -53.0, intensity: 'medium' },
    { lat: -11.8, lng: -59.2, intensity: 'medium' },
    // Acre / Amazonas
    { lat: -9.0, lng: -67.5, intensity: 'high' },
    { lat: -8.2, lng: -69.0, intensity: 'medium' },
    // Pará centro
    { lat: -5.0, lng: -52.0, intensity: 'medium' },
    { lat: -6.3, lng: -50.5, intensity: 'low' },
    // Cerrado — Goiás/Bahia
    { lat: -15.5, lng: -47.0, intensity: 'low' },
    { lat: -13.0, lng: -50.0, intensity: 'low' },
    { lat: -12.0, lng: -46.5, intensity: 'low' },
];
// ---------------------------------------------------------------------------
// Global deforestation areas (source: PRODES/INPE mock)
// ---------------------------------------------------------------------------
export const GLOBAL_DEFORESTATION_AREAS = [
    { lat: -3.0, lng: -59.0, radius: 55000 },
    { lat: -5.5, lng: -55.0, radius: 42000 },
    { lat: -8.0, lng: -63.5, radius: 38000 },
    { lat: -4.0, lng: -49.5, radius: 32000 },
    { lat: -10.0, lng: -56.0, radius: 40000 },
    { lat: -12.5, lng: -54.0, radius: 35000 },
    { lat: -9.5, lng: -65.0, radius: 28000 },
    { lat: -11.0, lng: -51.0, radius: 22000 },
];
// ---------------------------------------------------------------------------
// Build full CityData from base
// ---------------------------------------------------------------------------
const FORECAST_ICONS = ['sun', 'cloud-sun', 'cloud', 'haze', 'storm'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const POLLUTANT_DESCRIPTIONS = {
    pm25: 'Partículas finas (diâmetro < 2,5µm) originadas de combustão, indústria e tráfego. Penetram fundo nos pulmões e causam doenças cardiovasculares e respiratórias.',
    pm10: 'Partículas inaláveis (diâmetro < 10µm) de poeira, pólens e fumaça. Irritam vias aéreas e agravam asma e bronquite.',
    co: 'Monóxido de carbono, gás inodoro produzido pela combustão incompleta. Em altas concentrações reduz oxigenação do sangue.',
    no2: 'Dióxido de nitrogênio emitido por veículos e indústrias. Provoca inflamação das vias respiratórias e contribui para chuva ácida.',
    o3: 'Ozônio troposférico formado pela reação de NOx e COVs com luz solar. Irrita olhos e pulmões, especialmente no verão.',
};
function buildCityData(base, idx) {
    const s = idx + 1;
    // Pollutants with realistic regional adjustments
    const pm25 = seeded(s * 1, 8, Math.min(base.baseAqi * 0.65, 250));
    const pm10 = seeded(s * 2, pm25 + 2, Math.min(base.baseAqi * 0.9, 350));
    const co = seededFloat(s * 3, 0.3, 8.0);
    const no2 = seeded(s * 4, 10, 110);
    const o3 = seeded(s * 5, 20, 175);
    const pollutants = [
        { key: 'pm25', label: 'PM2.5', value: pm25, unit: 'µg/m³', whoLimit: 15, description: POLLUTANT_DESCRIPTIONS['pm25'] },
        { key: 'pm10', label: 'PM10', value: pm10, unit: 'µg/m³', whoLimit: 45, description: POLLUTANT_DESCRIPTIONS['pm10'] },
        { key: 'co', label: 'CO', value: co, unit: 'mg/m³', whoLimit: 4, description: POLLUTANT_DESCRIPTIONS['co'] },
        { key: 'no2', label: 'NO₂', value: no2, unit: 'µg/m³', whoLimit: 25, description: POLLUTANT_DESCRIPTIONS['no2'] },
        { key: 'o3', label: 'O₃', value: o3, unit: 'µg/m³', whoLimit: 100, description: POLLUTANT_DESCRIPTIONS['o3'] },
    ];
    const omsCompliant = pollutants.every(p => p.value <= p.whoLimit);
    // 7-day history
    const history = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Hoje'].map((day, i) => ({
        day,
        aqi: Math.max(10, base.baseAqi + seeded(s * (10 + i), -30, 30)),
    }));
    // 30-day history
    const today = new Date();
    const history30d = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        const label = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
        return {
            day: label,
            aqi: Math.max(10, base.baseAqi + seeded(s * (100 + i), -40, 40)),
        };
    });
    // 3-day forecast
    const todayDow = new Date().getDay();
    const forecast = [1, 2, 3].map(offset => {
        const fAqi = Math.max(10, base.baseAqi + seeded(s * (20 + offset), -40, 40));
        const iconIdx = seeded(s * (30 + offset), 0, 4);
        return {
            date: DAY_NAMES[(todayDow + offset) % 7],
            aqi: fAqi,
            condition: fAqi <= 50
                ? 'good'
                : fAqi <= 100
                    ? 'moderate'
                    : fAqi <= 150
                        ? 'sensitive'
                        : fAqi <= 200
                            ? 'bad'
                            : 'very-bad',
            icon: FORECAST_ICONS[iconIdx],
        };
    });
    // Nearby fire spots — more for Norte/Centro-Oeste cities with fire risk
    const fireCount = base.fireRisk === 3 ? seeded(s, 4, 7) : base.fireRisk === 2 ? seeded(s, 2, 4) : base.fireRisk === 1 ? seeded(s, 0, 2) : 0;
    const nearbyFires = Array.from({ length: fireCount }, (_, i) => {
        const intensitySeed = seeded(s * (40 + i), 0, 2);
        return {
            lat: base.lat + seeded(s * (40 + i), -20, 20) * 0.1,
            lng: base.lng + seeded(s * (50 + i), -20, 20) * 0.1,
            intensity: ['low', 'medium', 'high'][intensitySeed],
        };
    });
    // Deforestation areas near city
    const deforestationAreas = base.hasDeforestation
        ? Array.from({ length: seeded(s * 60, 1, 3) }, (_, i) => ({
            lat: base.lat + seeded(s * (70 + i), -15, 15) * 0.15,
            lng: base.lng + seeded(s * (80 + i), -15, 15) * 0.15,
            radius: seeded(s * (90 + i), 20000, 60000),
        }))
        : [];
    const windDir = seeded(s * 6, 0, 359);
    const windSpeed = seeded(s * 7, 5, 42);
    const uvIndex = seeded(s * 8, 1, 11);
    const pollenLevel = seeded(s * 9, 0, 10);
    const aqiScore = Math.max(0, 10 - base.baseAqi / 50);
    const uvScore = Math.max(0, 10 - uvIndex);
    const pollenScore = 10 - pollenLevel;
    const outdoorSafetyScore = parseFloat(Math.min(10, aqiScore * 0.6 + uvScore * 0.25 + pollenScore * 0.15).toFixed(1));
    const hospitalizationBase = seeded(s * 11, 80, 600);
    const hospitalizationHistory = Array.from({ length: 12 }, (_, i) => Math.max(20, hospitalizationBase + seeded(s * (60 + i), -80, 80)));
    hospitalizationHistory[11] = hospitalizationBase;
    return {
        name: base.name,
        state: base.state,
        region: base.region,
        lat: base.lat,
        lng: base.lng,
        aqi: base.baseAqi,
        aqiLabel: getAQILabel(base.baseAqi),
        pollutants,
        history,
        history30d,
        forecast,
        windDirection: windDir,
        windSpeed,
        nearbyFires,
        deforestationAreas,
        outdoorSafetyScore,
        uvIndex,
        pollenLevel,
        healthAlerts: getHealthAlerts(base.baseAqi),
        hospitalizations: hospitalizationBase,
        hospitalizationHistory,
        omsCompliant,
    };
}
// ---------------------------------------------------------------------------
// Exported data
// ---------------------------------------------------------------------------
export const CITIES_DATA = CITY_BASES.map((base, idx) => buildCityData(base, idx));
// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------
export function getCityByName(name) {
    return CITIES_DATA.find(c => c.name === name);
}
export function getCitiesByRegion(region) {
    return CITIES_DATA.filter(c => c.region === region);
}
export function getCitiesByState(state) {
    return CITIES_DATA.filter(c => c.state === state);
}
export function getUniqueStates() {
    return [...new Set(CITIES_DATA.map(c => c.state))].sort();
}
export function getUniqueRegions() {
    return ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
}
/** Returns the nearest city to a given lat/lng coordinate */
export function getNearestCity(lat, lng) {
    return CITIES_DATA.reduce((closest, city) => {
        const dist = Math.hypot(city.lat - lat, city.lng - lng);
        const closestDist = Math.hypot(closest.lat - lat, closest.lng - lng);
        return dist < closestDist ? city : closest;
    });
}
