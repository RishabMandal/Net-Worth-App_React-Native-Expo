import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PortfolioContext = createContext<any>(null);

const ASSETS_STORAGE_KEY = '@portfolio_assets';
const HISTORY_STORAGE_KEY = '@portfolio_history';

const DEFAULT_ASSETS = [
  { id: '1', name: 'Primary Home', category: 'Real Estate', owner: 'Self', value: 13500000, pl: 2500000, lastModified: new Date().toISOString() },
  { id: '4', name: 'Emergency Fund', category: 'Cash', owner: 'Self', value: 650000, pl: 0, lastModified: new Date().toISOString() },
  { id: '5', name: 'Emergency Fund', category: 'Cash', owner: 'Spouse', value: 650000, pl: 0, lastModified: new Date().toISOString() },
  { id: '7', name: 'Home Loan', category: 'Liability', owner: 'Self', value: -11000000, pl: 0, lastModified: new Date().toISOString() },
];

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // NEW: State for member filtering
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Self', 'Spouse'

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
    
    // Calculate wealth for all 3 views simultaneously
    const allWorth = assets.reduce((sum, item) => sum + item.value, 0);
    const selfWorth = assets.filter(a => a.owner === 'Self').reduce((sum, item) => sum + item.value, 0);
    const spouseWorth = assets.filter(a => a.owner === 'Spouse').reduce((sum, item) => sum + item.value, 0);
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    setHistory(prevHistory => {
      const existingRecordIndex = prevHistory.findIndex(h => h.date === todayStr);
      let newHistory = [...prevHistory];

      const dailyRecord = { 
        date: todayStr, 
        netWorth: allWorth, // Legacy fallback
        All: allWorth, 
        Self: selfWorth, 
        Spouse: spouseWorth 
      };

      if (existingRecordIndex >= 0) {
        newHistory[existingRecordIndex] = dailyRecord;
      } else {
        newHistory.push(dailyRecord);
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

  const replaceAllAssets = (importedAssets: any[]) => {
    setAssets(importedAssets);
  };

  // NEW: Filter assets based on the active selection
  const filteredAssets = activeFilter === 'All' ? assets : assets.filter(a => a.owner === activeFilter);

  // UPDATED: Math now uses filteredAssets so the dashboard respects the filter
  const netWorth = filteredAssets.reduce((sum, item) => sum + item.value, 0);
  const totalGainLoss = filteredAssets.reduce((sum, item) => sum + item.pl, 0);

  const categoryTotals = filteredAssets.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.value;
    return acc;
  }, {});

  // Keep wealthByMember using ALL assets so the FamilyWealth component always shows the full picture
  const wealthByMember = assets.reduce((acc: any, item) => {
    acc[item.owner] = (acc[item.owner] || 0) + item.value;
    return acc;
  }, {});

  if (!isLoaded) return null; 

  return (
    // NEW: Expose activeFilter, setActiveFilter, and filteredAssets
    <PortfolioContext.Provider value={{ 
      assets, filteredAssets, activeFilter, setActiveFilter, history, 
      addAsset, addMultipleAssets, updateAsset, deleteAsset, replaceAllAssets,
      netWorth, totalGainLoss, categoryTotals, wealthByMember 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);