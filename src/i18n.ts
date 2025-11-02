import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

// Define available languages
export const languages = {
    en: { name: 'English', dir: 'ltr' },
    ar: { name: 'العربية', dir: 'rtl' },
    ny: { name: 'Chichewa', dir: 'ltr' },
    es: { name: 'Español', dir: 'ltr' },
    fr: { name: 'Français', dir: 'ltr' },
    pt: { name: 'Português', dir: 'ltr' },
};

export type LanguageCode = keyof typeof languages;

// Translation data
const translations: Record<LanguageCode, Record<string, string>> = {
    en: {
        appTitle: "Gemini POS - Smart Point of Sale System",
        // Sidebar
        dashboard: "Dashboard",
        contacts: "Contacts",
        products: "Products",
        purchases: "Purchases",
        sell: "Sell",
        stockTransfers: "Stock Transfers",
        stockAdjustments: "Stock Adjustments",
        expenses: "Expenses",
        reports: "Reports",
        userManagement: "User Management",
        notificationTemplates: "Notification Templates",
        settings: "Settings",
        // Header
        searchPlaceholder: "Search...",
        // Dashboard
        totalRevenue: "Total Revenue",
        totalSales: "Total Sales",
        newCustomers: "New Customers",
        pendingOrders: "Pending Orders",
        smartBusinessInsights: "Smart Business Insights",
        getInsights: "Get Insights",
        recentSales: "Recent Sales",
        // Settings
        generalSettings: "General Settings",
        businessLocations: "Business Locations",
        paymentMethods: "Payment Methods",
        ageVerification: "Age Verification",
        deployment: "Deployment",
        language: "Language",
        branding: "Branding",
        selectLanguage: "Select Language",
        languageSettingsDescription: "Choose the display language for the application."
    },
    ar: {
        appTitle: "Gemini POS - نظام نقاط البيع الذكي",
        // Sidebar
        dashboard: "لوحة التحكم",
        contacts: "جهات الاتصال",
        products: "المنتجات",
        purchases: "المشتريات",
        sell: "بيع",
        stockTransfers: "تحويلات المخزون",
        stockAdjustments: "تعديلات المخزون",
        expenses: "المصروفات",
        reports: "التقارير",
        userManagement: "إدارة المستخدمين",
        notificationTemplates: "قوالب الإشعارات",
        settings: "الإعدادات",
        // Header
        searchPlaceholder: "بحث...",
        // Dashboard
        totalRevenue: "إجمالي الإيرادات",
        totalSales: "إجمالي المبيعات",
        newCustomers: "عملاء جدد",
        pendingOrders: "طلبات معلقة",
        smartBusinessInsights: "رؤى الأعمال الذكية",
        getInsights: "احصل على رؤى",
        recentSales: "المبيعات الأخيرة",
        // Settings
        generalSettings: "الإعدادات العامة",
        businessLocations: "مواقع العمل",
        paymentMethods: "طرق الدفع",
        ageVerification: "التحقق من العمر",
        deployment: "النشر",
        language: "اللغة",
        branding: "العلامة التجارية",
        selectLanguage: "اختر اللغة",
        languageSettingsDescription: "اختر لغة عرض التطبيق."
    },
    ny: {
        appTitle: "Gemini POS - Njira Yogulitsira Mwanzeru",
        // Sidebar
        dashboard: "Dashboard",
        contacts: "Othandizira",
        products: "Zogulitsa",
        purchases: "Zogula",
        sell: "Gulitsani",
        stockTransfers: "Kusamutsa Katundu",
        stockAdjustments: "Kusintha kwa Katundu",
        expenses: "Ndalama",
        reports: "Malipoti",
        userManagement: "Kuwongolera Ogwiritsa Ntchito",
        notificationTemplates: "Ma tempulo a Zidziwitso",
        settings: "Zokonda",
        // Header
        searchPlaceholder: "Sakani...",
        // Dashboard
        totalRevenue: "Ndalama Zonse",
        totalSales: "Zogulitsa Zonse",
        newCustomers: "Makasitomala Atsopano",
        pendingOrders: "Madongosolo Oyembekezera",
        smartBusinessInsights: "Malingaliro Anzeru a Bizinesi",
        getInsights: "Pezani Malingaliro",
        recentSales: "Zogulitsa Zaposachedwa",
        // Settings
        generalSettings: "Zokonda Zambiri",
        businessLocations: "Malo a Bizinesi",
        paymentMethods: "Njira Zolipirira",
        ageVerification: "Kutsimikizira Zaka",
        deployment: "Kutumiza",
        language: "Chilankhulo",
        branding: "Chizindikiro",
        selectLanguage: "Sankhani Chilankhulo",
        languageSettingsDescription: "Sankhani chilankhulo chowonetsera pulogalamuyi."
    },
    es: {},
    fr: {},
    pt: {},
};

interface LanguageContextType {
    language: LanguageCode;
    changeLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>('en');

    useEffect(() => {
        const storedLang = localStorage.getItem('gemini-pos-lang') as LanguageCode;
        if (storedLang && languages[storedLang]) {
            setLanguage(storedLang);
        } else {
            const browserLang = navigator.language.split('-')[0] as LanguageCode;
            setLanguage(languages[browserLang] ? browserLang : 'en');
        }
    }, []);

    const t = useCallback((key: string): string => {
        return translations[language]?.[key] || translations.en[key] || key;
    }, [language]);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = languages[language]?.dir || 'ltr';
        localStorage.setItem('gemini-pos-lang', language);
        document.title = t('appTitle');
    }, [language, t]);

    const changeLanguage = useCallback((lang: LanguageCode) => {
        if (languages[lang]) {
            setLanguage(lang);
        }
    }, []);

    const value = useMemo(() => ({ language, changeLanguage, t }), [language, changeLanguage, t]);

    return React.createElement(LanguageContext.Provider, { value: value }, children);
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};