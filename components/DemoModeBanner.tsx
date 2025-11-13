import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const DemoModeBanner: React.FC = () => {
    const location = useLocation();
    const isDemo = location.pathname.startsWith('/demo');
    
    if (!isDemo) {
        return null;
    }

    return (
        <div className="bg-yellow-400 text-yellow-900 text-center p-2 text-sm font-semibold z-10">
            You are in a demo environment. {' '}
            <Link to="/subscription" className="underline hover:text-yellow-800">
                Subscribe to a plan to use the live application.
            </Link>
        </div>
    );
};

export default DemoModeBanner;
