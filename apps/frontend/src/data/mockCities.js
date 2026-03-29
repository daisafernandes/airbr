// Simple pseudo-random seeded on a number for deterministic mock data
function seeded(seed, min, max) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    const r = x - Math.floor(x);
    return Math.round(min + r * (max - min));
}
function getAQILabel(aqi) {
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
            {
                message: 'Use máscara se precisar permanecer por longos períodos em áreas abertas.',
                severity: 'info',
            },
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
function getFireIntensity(aqi, region) {
    if (region === 'Norte' && aqi > 100)
        return 'high';
    if ((region === 'Norte' || region === 'Centro-Oeste') && aqi > 60)
        return 'medium';
    if (aqi > 100)
        return 'medium';
    return 'low';
}
const FORECAST_ICONS = ['sun', 'cloud-sun', 'cloud', 'haze', 'storm'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HISTORY_DAYS = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Hoje'];
function buildCityData(base, index) {
    const s = index + 1;
    const pm25 = seeded(s * 1, 8, Math.min(Math.floor(base.aqi * 0.6), 250));
    const pm10 = seeded(s * 2, pm25, Math.min(Math.floor(base.aqi * 0.9), 350));
    const co = parseFloat((seeded(s * 3, 1, 12) * 0.1 + 0.2).toFixed(1));
    const no2 = seeded(s * 4, 10, 120);
    const o3 = seeded(s * 5, 20, 180);
    const pollutants = [
        { key: 'pm25', label: 'PM2.5', value: pm25, unit: 'µg/m³', whoLimit: 15 },
        { key: 'pm10', label: 'PM10', value: pm10, unit: 'µg/m³', whoLimit: 45 },
        { key: 'co', label: 'CO', value: co, unit: 'mg/m³', whoLimit: 4 },
        { key: 'no2', label: 'NO₂', value: no2, unit: 'µg/m³', whoLimit: 25 },
        { key: 'o3', label: 'O₃', value: o3, unit: 'µg/m³', whoLimit: 100 },
    ];
    const history = HISTORY_DAYS.map((day, i) => ({
        day,
        aqi: Math.max(10, base.aqi + seeded(s * (10 + i), -30, 30)),
    }));
    const todayDow = new Date().getDay();
    const forecast = [1, 2, 3].map(offset => {
        const fAqi = Math.max(10, base.aqi + seeded(s * (20 + offset), -40, 40));
        const iconIdx = seeded(s * (30 + offset), 0, 4);
        return {
            date: DAY_NAMES[(todayDow + offset) % 7],
            aqi: fAqi,
            condition: fAqi <= 50 ? 'good' : fAqi <= 100 ? 'moderate' : fAqi <= 150 ? 'sensitive' : fAqi <= 200 ? 'bad' : 'very-bad',
            icon: FORECAST_ICONS[iconIdx],
        };
    });
    const fireCount = seeded(s, 2, 6);
    const nearbyFires = Array.from({ length: fireCount }, (_, i) => ({
        lat: base.lat + seeded(s * (40 + i), -20, 20) * 0.08,
        lng: base.lng + seeded(s * (50 + i), -20, 20) * 0.08,
        intensity: getFireIntensity(base.aqi, base.region),
    }));
    const deforestationCount = base.region === 'Norte' ? 3 : base.region === 'Centro-Oeste' ? 2 : base.region === 'Nordeste' ? 1 : 0;
    const deforestationAreas = Array.from({ length: deforestationCount }, (_, i) => ({
        lat: base.lat + seeded(s * (70 + i), -30, 30) * 0.1,
        lng: base.lng + seeded(s * (80 + i), -30, 30) * 0.1,
        radius: seeded(s * (90 + i), 10000, 60000),
    }));
    const uvIndex = seeded(s * 8, 1, 11);
    const pollenLevel = seeded(s * 9, 0, 10);
    const aqiScore = Math.max(0, 10 - base.aqi / 50);
    const uvScore = Math.max(0, 10 - uvIndex);
    const pollenScore = 10 - pollenLevel;
    const outdoorSafetyScore = parseFloat(Math.min(10, aqiScore * 0.6 + uvScore * 0.25 + pollenScore * 0.15).toFixed(1));
    const hospitalizationBase = seeded(s * 11, 80, 600);
    const hospitalizationHistory = Array.from({ length: 12 }, (_, i) => Math.max(20, hospitalizationBase + seeded(s * (60 + i), -80, 80)));
    hospitalizationHistory[11] = hospitalizationBase;
    return {
        name: base.name,
        state: base.state,
        lat: base.lat,
        lng: base.lng,
        aqi: base.aqi,
        aqiLabel: getAQILabel(base.aqi),
        region: base.region,
        omsCompliant: base.aqi <= 50,
        pollutants,
        history,
        forecast,
        windDirection: seeded(s * 6, 0, 359),
        windSpeed: seeded(s * 7, 5, 45),
        nearbyFires,
        deforestationAreas,
        outdoorSafetyScore,
        uvIndex,
        pollenLevel,
        healthAlerts: getHealthAlerts(base.aqi),
        hospitalizations: hospitalizationBase,
        hospitalizationHistory,
    };
}
// All 26 Brazilian state capitals + Cubatão + Campinas (28 cities)
const CITIES_BASE = [
    { name: 'São Paulo', state: 'SP', lat: -23.55, lng: -46.63, aqi: 128, region: 'Sudeste' },
    { name: 'Rio de Janeiro', state: 'RJ', lat: -22.91, lng: -43.17, aqi: 85, region: 'Sudeste' },
    { name: 'Belo Horizonte', state: 'MG', lat: -19.92, lng: -43.94, aqi: 72, region: 'Sudeste' },
    { name: 'Brasília', state: 'DF', lat: -15.79, lng: -47.88, aqi: 45, region: 'Centro-Oeste' },
    { name: 'Salvador', state: 'BA', lat: -12.97, lng: -38.51, aqi: 52, region: 'Nordeste' },
    { name: 'Fortaleza', state: 'CE', lat: -3.72, lng: -38.53, aqi: 61, region: 'Nordeste' },
    { name: 'Curitiba', state: 'PR', lat: -25.43, lng: -49.27, aqi: 38, region: 'Sul' },
    { name: 'Manaus', state: 'AM', lat: -3.12, lng: -60.02, aqi: 142, region: 'Norte' },
    { name: 'Recife', state: 'PE', lat: -8.05, lng: -34.87, aqi: 67, region: 'Nordeste' },
    { name: 'Porto Alegre', state: 'RS', lat: -30.03, lng: -51.23, aqi: 42, region: 'Sul' },
    { name: 'Belém', state: 'PA', lat: -1.46, lng: -48.5, aqi: 95, region: 'Norte' },
    { name: 'Goiânia', state: 'GO', lat: -16.68, lng: -49.25, aqi: 58, region: 'Centro-Oeste' },
    { name: 'Cubatão', state: 'SP', lat: -23.88, lng: -46.42, aqi: 156, region: 'Sudeste' },
    { name: 'Porto Velho', state: 'RO', lat: -8.76, lng: -63.9, aqi: 119, region: 'Norte' },
    { name: 'Rio Branco', state: 'AC', lat: -9.97, lng: -67.81, aqi: 108, region: 'Norte' },
    { name: 'Florianópolis', state: 'SC', lat: -27.59, lng: -48.55, aqi: 18, region: 'Sul' },
    { name: 'Campo Grande', state: 'MS', lat: -20.44, lng: -54.65, aqi: 48, region: 'Centro-Oeste' },
    { name: 'Cuiabá', state: 'MT', lat: -15.6, lng: -56.1, aqi: 89, region: 'Centro-Oeste' },
    { name: 'Natal', state: 'RN', lat: -5.79, lng: -35.21, aqi: 44, region: 'Nordeste' },
    { name: 'São Luís', state: 'MA', lat: -2.53, lng: -44.28, aqi: 76, region: 'Nordeste' },
    { name: 'Maceió', state: 'AL', lat: -9.67, lng: -35.74, aqi: 55, region: 'Nordeste' },
    { name: 'Teresina', state: 'PI', lat: -5.09, lng: -42.8, aqi: 82, region: 'Nordeste' },
    { name: 'Palmas', state: 'TO', lat: -10.18, lng: -48.33, aqi: 91, region: 'Norte' },
    { name: 'Macapá', state: 'AP', lat: 0.03, lng: -51.07, aqi: 63, region: 'Norte' },
    { name: 'Boa Vista', state: 'RR', lat: 2.82, lng: -60.67, aqi: 37, region: 'Norte' },
    { name: 'Vitória', state: 'ES', lat: -20.32, lng: -40.34, aqi: 65, region: 'Sudeste' },
    { name: 'João Pessoa', state: 'PB', lat: -7.12, lng: -34.86, aqi: 47, region: 'Nordeste' },
    { name: 'Aracaju', state: 'SE', lat: -10.91, lng: -37.07, aqi: 59, region: 'Nordeste' },
    { name: 'Campinas', state: 'SP', lat: -22.91, lng: -47.06, aqi: 98, region: 'Sudeste' },
];
export const CITIES_DATA = CITIES_BASE.map((base, i) => buildCityData(base, i));
