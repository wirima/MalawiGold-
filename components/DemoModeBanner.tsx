import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DemoModeBanner: React.FC = () => {
    const { currentUser } = useAuth();
    
    if (currentUser?.account_status !== 'trial') {
        return null;
    }

    return (
        <div className="bg-yellow-400 text-yellow-900 text-center p-2 text-sm font-semibold z-10">
            You are in a demo environment. {' '}
            <Link to="/subscription" className="underline hover:text-yellow-800">
                Subscribe now to save your data.
            </Link>
        </div>
    );
};

export default DemoModeBanner;