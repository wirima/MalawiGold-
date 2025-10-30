import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Sale } from '../types';
import { useAuth } from './AuthContext';

interface OfflineContextType {
    isOnline: boolean;
    setIsOnline: (isOnline: boolean) => void;
    syncQueue: Sale[];
    addSaleToQueue: (sale: Omit<Sale, 'id' | 'date' | 'isQueued'>) => Sale;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { addSale } = useAuth();
    const [isOnline, setIsOnline] = useState(true);
    const [syncQueue, setSyncQueue] = useState<Sale[]>(() => {
        try {
            const item = window.localStorage.getItem('gemini-pos-sync-queue');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Failed to load sync queue from local storage:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('gemini-pos-sync-queue', JSON.stringify(syncQueue));
        } catch (error) {
            console.error("Failed to save sync queue to local storage:", error);
        }
    }, [syncQueue]);

    const addSaleToQueue = (saleData: Omit<Sale, 'id' | 'date' | 'isQueued'>): Sale => {
        const newQueuedSale: Sale = {
            ...saleData,
            id: `OFFLINE-${Date.now()}`,
            date: new Date().toISOString(),
            isQueued: true,
        };
        setSyncQueue(prev => [...prev, newQueuedSale]);
        return newQueuedSale;
    };

    const processQueue = useCallback(async () => {
        if (isOnline && syncQueue.length > 0) {
            console.log(`Syncing ${syncQueue.length} sales...`);
            const queueCopy = [...syncQueue];
            
            // Optimistically clear the queue in the UI
            setSyncQueue([]);

            try {
                // In a real app, this would be a Promise.all with API calls
                for (const sale of queueCopy) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, date, isQueued, ...saleDataToSync } = sale;
                    addSale(saleDataToSync); 
                }
                console.log('Sync complete!');
            } catch (error) {
                console.error('Sync failed, restoring queue:', error);
                // If sync fails, put the items back into the queue
                setSyncQueue(prev => [...queueCopy, ...prev]);
            }
        }
    }, [isOnline, syncQueue, addSale]);

    useEffect(() => {
        if (isOnline) {
            // Delay sync slightly to allow other operations to complete
            const timer = setTimeout(() => processQueue(), 1000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, processQueue]);


    const value = { isOnline, setIsOnline, syncQueue, addSaleToQueue };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};
