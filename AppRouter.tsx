import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DemoAuthProvider } from './contexts/DemoAuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LanguageProvider } from './src/i18n';
import { CurrencyProvider } from './contexts/CurrencyContext';
import App from './App';

const AppRouter: React.FC = () => {
    const location = useLocation();
    const isDemo = location.pathname.startsWith('/demo');

    const AppContent = (
        <OfflineProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <App />
            </CurrencyProvider>
          </LanguageProvider>
        </OfflineProvider>
    );

    if (isDemo) {
        return (
            <DemoAuthProvider>
                {AppContent}
            </DemoAuthProvider>
        );
    }

    return (
        <AuthProvider>
            {AppContent}
        </AuthProvider>
    );
};

export default AppRouter;
