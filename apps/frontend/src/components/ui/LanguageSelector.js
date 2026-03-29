import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
const LANGUAGES = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
];
export const LanguageSelector = () => {
    const { i18n } = useTranslation();
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 shrink-0", children: _jsx(Globe, { className: "w-4 h-4" }) }) }), _jsx(DropdownMenuContent, { align: "end", children: LANGUAGES.map(lang => (_jsxs(DropdownMenuItem, { onClick: () => i18n.changeLanguage(lang.code), className: i18n.language === lang.code ? 'text-primary font-semibold' : '', children: [_jsx("span", { className: "mr-2", children: lang.flag }), lang.label] }, lang.code))) })] }));
};
