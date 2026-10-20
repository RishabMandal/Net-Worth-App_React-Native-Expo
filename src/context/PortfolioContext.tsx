import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PortfolioContext = createContext<any>(null);

const ASSETS_STORAGE_KEY = '@portfolio_assets';
const HISTORY_STORAGE_KEY = '@portfolio_history';

const DEFAULT_ASSETS = [
  { id: '1', name: 'Primary Home', category: 'Real Estate', owner: 'Self', value: 13500000, pl: 2500000, lastModified: new Date().toISOString() },
  { id: '4', name: 'Emergency Fund', category: 'Cash', owner: 'Self', value: 650000, pl: 0, lastModified: new Date().toISOString() },
  { id: '7', name: 'Home Loan', category: 'Liability', owner: 'Self', value: -11000000, pl: 0, lastModified: new Date().toISOString() },
];

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedAssets = await AsyncStorage.getItem(ASSETS_STORAGE_KEY);
        const storedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        
        if (storedAssets !== null) setAssets(JSON.parse(storedAssets));
        else setAssets(DEFAULT_ASSETS);

        if (storedHistory !== null) setHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Failed to load storage', error);
        setAssets(DEFAULT_ASSETS);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
  }, [assets, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    
    const currentNetWorth = assets.reduce((sum, item) => sum + item.value, 0);
    const todayStr = new Date().toISOString().split('T')[0];
    
    setHistory(prevHistory => {
      const existingRecordIndex = prevHistory.findIndex(h => h.date === todayStr);
      let newHistory = [...prevHistory];

      if (existingRecordIndex >= 0) {
        if (newHistory[existingRecordIndex].netWorth !== currentNetWorth) {
          newHistory[existingRecordIndex].netWorth = currentNetWorth;
        } else {
          return prevHistory;
        }
      } else {
        newHistory.push({ date: todayStr, netWorth: currentNetWorth });
      }

      AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, [assets, isLoaded]);

  const addAsset = (newAsset: any) => {
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setAssets(prev => [...prev, { ...newAsset, id: uniqueId, lastModified: new Date().toISOString() }]);
  };

  const addMultipleAssets = (newAssetsArray: any[]) => {
    const timestamp = new Date().toISOString();
    const assetsWithIds = newAssetsArray.map(a => ({
      ...a, 
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      lastModified: timestamp
    }));
    setAssets(prev => [...prev, ...assetsWithIds]);
  };
  
  const updateAsset = (id: string, updatedFields: any) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields, lastModified: new Date().toISOString() } : a));
  };
  
  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // NEW: Completely wipe and replace all data from a backup file
  const replaceAllAssets = (importedAssets: any[]) => {
    setAssets(importedAssets);
  };

  const netWorth = assets.reduce((sum, item) => sum + item.value, 0);
  const totalGainLoss = assets.reduce((sum, item) => sum + item.pl, 0);

  const categoryTotals = assets.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.value;
    return acc;
  }, {});

  const wealthByMember = assets.reduce((acc: any, item) => {
    acc[item.owner] = (acc[item.owner] || 0) + item.value;
    return acc;
  }, {});

  if (!isLoaded) return null; 

  return (
    <PortfolioContext.Provider value={{ 
      assets, history, addAsset, addMultipleAssets, updateAsset, deleteAsset, replaceAllAssets,
      netWorth, totalGainLoss, categoryTotals, wealthByMember 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);