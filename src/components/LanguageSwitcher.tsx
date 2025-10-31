import React from 'react';
import { useTranslation, languages, LanguageCode } from '../i18n';

const LanguageSwitcher: React.FC = () => {
    const { language, changeLanguage } = useTranslation();
    const activeLanguages: LanguageCode[] = ['en', 'ar', 'ny'];

    return (
        <div className="relative">
            <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value as LanguageCode)}
                className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                aria-label="Select language"
            >
                {activeLanguages.map((langCode) => (
                    <option key={langCode} value={langCode}>
                        {languages[langCode].name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
