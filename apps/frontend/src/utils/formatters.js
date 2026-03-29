import i18n from '@/lib/i18n';
const LOCALE_MAP = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
};
function getLocale() {
    return LOCALE_MAP[i18n.language] ?? 'pt-BR';
}
export const formatDate = (dateString) => {
    return new Intl.DateTimeFormat(getLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(dateString));
};
export const formatDateTime = (date, options) => {
    return date.toLocaleString(getLocale(), options);
};
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};
export const truncate = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, maxLength)}...`;
};
