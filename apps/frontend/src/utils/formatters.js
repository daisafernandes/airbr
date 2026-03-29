export const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(dateString));
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
