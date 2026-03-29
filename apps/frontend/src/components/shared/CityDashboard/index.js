import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
import { AQIGauge } from './AQIGauge';
import { PollutantCards } from './PollutantCards';
import { AQIHistoryChart } from './AQIHistoryChart';
import { AQIForecast } from './AQIForecast';
import { SmokeSourceCard } from './SmokeSourceCard';
import { OutdoorSafetyCard } from './OutdoorSafetyCard';
import { HealthAlertsCard } from './HealthAlertsCard';
import { PublicHealthCard } from './PublicHealthCard';
// ------- mock data -----------------------------------------------------------
const CITIES_SEED = [
    { name: 'São Paulo', state: 'SP', lat: -23.55, lng: -46.63, aqi: 128 },
    { name: 'Rio de Janeiro', state: 'RJ', lat: -22.91, lng: -43.17, aqi: 85 },
    { name: 'Belo Horizonte', state: 'MG', lat: -19.92, lng: -43.94, aqi: 72 },
    { name: 'Brasília', state: 'DF', lat: -15.79, lng: -47.88, aqi: 45 },
    { name: 'Salvador', state: 'BA', lat: -12.97, lng: -38.51, aqi: 52 },
    { name: 'Fortaleza', state: 'CE', lat: -3.72, lng: -38.53, aqi: 61 },
    { name: 'Curitiba', state: 'PR', lat: -25.43, lng: -49.27, aqi: 38 },
    { name: 'Manaus', state: 'AM', lat: -3.12, lng: -60.02, aqi: 142 },
    { name: 'Recife', state: 'PE', lat: -8.05, lng: -34.87, aqi: 67 },
    { name: 'Porto Alegre', state: 'RS', lat: -30.03, lng: -51.23, aqi: 42 },
    { name: 'Belém', state: 'PA', lat: -1.46, lng: -48.50, aqi: 95 },
    { name: 'Goiânia', state: 'GO', lat: -16.68, lng: -49.25, aqi: 58 },
    { name: 'Cubatão', state: 'SP', lat: -23.88, lng: -46.42, aqi: 156 },
    { name: 'Porto Velho', state: 'RO', lat: -8.76, lng: -63.90, aqi: 119 },
    { name: 'Rio Branco', state: 'AC', lat: -9.97, lng: -67.81, aqi: 108 },
    { name: 'Florianópolis', state: 'SC', lat: -27.59, lng: -48.55, aqi: 18 },
    { name: 'Campo Grande', state: 'MS', lat: -20.44, lng: -54.65, aqi: 48 },
    { name: 'Cuiabá', state: 'MT', lat: -15.60, lng: -56.10, aqi: 89 },
    { name: 'Natal', state: 'RN', lat: -5.79, lng: -35.21, aqi: 44 },
    { name: 'São Luís', state: 'MA', lat: -2.53, lng: -44.28, aqi: 76 },
    { name: 'Maceió', state: 'AL', lat: -9.67, lng: -35.74, aqi: 55 },
    { name: 'Teresina', state: 'PI', lat: -5.09, lng: -42.80, aqi: 82 },
    { name: 'Palmas', state: 'TO', lat: -10.18, lng: -48.33, aqi: 91 },
    { name: 'Macapá', state: 'AP', lat: 0.03, lng: -51.07, aqi: 63 },
    { name: 'Boa Vista', state: 'RR', lat: 2.82, lng: -60.67, aqi: 37 },
];
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
// Simple pseudo-random seeded on a number for deterministic mock data
function seeded(seed, min, max) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    const r = x - Math.floor(x);
    return Math.round(min + r * (max - min));
}
function getHealthAlerts(aqi) {
    if (aqi <= 50)
        return [];
    if (aqi <= 100)
        return [
            { message: 'Qualidade do ar aceitável. Pessoas muito sensíveis devem considerar limitar esforços prolongados ao ar livre.', severity: 'info' },
        ];
    if (aqi <= 150)
        return [
            { message: 'Grupos sensíveis (crianças, idosos e pessoas com doenças respiratórias) devem evitar atividades intensas ao ar livre.', severity: 'warning' },
            { message: 'Use máscara se precisar permanecer por longos períodos em áreas abertas.', severity: 'info' },
        ];
    if (aqi <= 200)
        return [
            { message: 'Evite exercícios ao ar livre. Todos os grupos podem ser afetados.', severity: 'danger' },
            { message: 'Grupos sensíveis devem ficar em ambientes fechados com janelas e portas fechadas.', severity: 'warning' },
            { message: 'Procure atendimento médico se sentir dificuldade respiratória.', severity: 'danger' },
        ];
    if (aqi <= 300)
        return [
            { message: 'ALERTA: Todos devem evitar qualquer atividade ao ar livre.', severity: 'critical' },
            { message: 'Grupos sensíveis devem evacuar para ambientes fechados e bem ventilados artificialmente.', severity: 'critical' },
            { message: 'Use máscara N95 se precisar sair de casa.', severity: 'danger' },
        ];
    return [
        { message: 'EMERGÊNCIA: Condições de saúde perigosas para toda a população.', severity: 'critical' },
        { message: 'Permaneça em ambientes fechados. Evite qualquer exposição ao ar externo.', severity: 'critical' },
        { message: 'Acione o SAMU (192) em caso de sintomas graves (falta de ar, dor no peito).', severity: 'critical' },
    ];
}
const FORECAST_ICONS = ['sun', 'cloud-sun', 'cloud', 'haze', 'storm'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HISTORY_DAYS = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Hoje'];
function getCityData(cityName) {
    const cityIndex = CITIES_SEED.findIndex(c => c.name === cityName);
    const base = cityIndex >= 0 ? CITIES_SEED[cityIndex] : null;
    if (!base)
        return null;
    const s = cityIndex + 1; // seed base
    const pm25 = seeded(s * 1, 8, Math.min(base.aqi * 0.6, 250));
    const pm10 = seeded(s * 2, pm25, Math.min(base.aqi * 0.9, 350));
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
    const nearbyFires = Array.from({ length: seeded(s, 2, 5) }, (_, i) => ({
        lat: base.lat + seeded(s * (40 + i), -20, 20) * 0.08,
        lng: base.lng + seeded(s * (50 + i), -20, 20) * 0.08,
        intensity: (base.aqi > 100 ? 'medium' : 'low'),
    }));
    const windDir = seeded(s * 6, 0, 359);
    const windSpeed = seeded(s * 7, 5, 45);
    const uvIndex = seeded(s * 8, 1, 11);
    const pollenLevel = seeded(s * 9, 0, 10);
    // Outdoor safety: invert AQI contribution, scale UV and pollen down
    const aqiScore = Math.max(0, 10 - (base.aqi / 50));
    const uvScore = Math.max(0, 10 - uvIndex);
    const pollenScore = 10 - pollenLevel;
    const outdoorSafetyScore = parseFloat(Math.min(10, (aqiScore * 0.6 + uvScore * 0.25 + pollenScore * 0.15)).toFixed(1));
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
        region: 'Sudeste',
        omsCompliant: base.aqi <= 50,
        pollutants,
        history,
        forecast,
        windDirection: windDir,
        windSpeed,
        nearbyFires,
        deforestationAreas: [],
        outdoorSafetyScore,
        uvIndex,
        pollenLevel,
        healthAlerts: getHealthAlerts(base.aqi),
        hospitalizations: hospitalizationBase,
        hospitalizationHistory,
    };
}
export const CityDashboard = ({ cityName, onClose }) => {
    const city = getCityData(cityName);
    if (!city) {
        return (_jsxs("div", { className: "w-80 flex-shrink-0 bg-card border border-border rounded p-6 flex flex-col items-center justify-center gap-3", children: [_jsxs("p", { className: "text-sm text-muted-foreground font-body text-center", children: ["Dados n\u00E3o dispon\u00EDveis para ", _jsx("strong", { className: "text-foreground", children: cityName }), "."] }), _jsx("button", { onClick: onClose, className: "text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Fechar" })] }));
    }
    return (_jsxs("div", { className: "w-80 flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)] pr-1 space-y-3 animate-fade-in", children: [_jsxs("div", { className: "bg-card border border-border rounded p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-heading text-2xl tracking-wide text-foreground leading-tight", children: city.name }), _jsxs("p", { className: "text-xs text-muted-foreground font-body uppercase tracking-widest mt-0.5", children: [city.state, " \u00B7 Brasil"] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors", "aria-label": "Fechar", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "mt-3 flex justify-center", children: _jsx(AQIGauge, { aqi: city.aqi, label: city.aqiLabel }) })] }), _jsx(PollutantCards, { pollutants: city.pollutants }), _jsx(AQIHistoryChart, { history: city.history }), _jsx(AQIForecast, { forecast: city.forecast }), _jsx(SmokeSourceCard, { lat: city.lat, lng: city.lng, windDirection: city.windDirection, windSpeed: city.windSpeed, nearbyFires: city.nearbyFires }), _jsx(OutdoorSafetyCard, { score: city.outdoorSafetyScore, uvIndex: city.uvIndex, pollenLevel: city.pollenLevel, aqi: city.aqi }), _jsx(HealthAlertsCard, { alerts: city.healthAlerts, aqiLabel: city.aqiLabel }), _jsx(PublicHealthCard, { hospitalizations: city.hospitalizations, history: city.hospitalizationHistory })] }));
};
