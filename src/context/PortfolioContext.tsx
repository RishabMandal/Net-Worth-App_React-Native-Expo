import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PortfolioContext = createContext<any>(null);

const ASSETS_STORAGE_KEY = '@portfolio_assets';

// Default data to show only if the user has never saved anything before
const DEFAULT_ASSETS = [
  { id: '1', name: 'Primary Home', category: 'Real Estate', owner: 'Self', value: 13500000, pl: 2500000 },
  { id: '4', name: 'Emergency Fund', category: 'Cash', owner: 'Self', value: 650000, pl: 0 },
  { id: '7', name: 'Home Loan', category: 'Liability', owner: 'Self', value: -11000000, pl: 0 },
];

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load data from storage when the app starts
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const storedAssets = await AsyncStorage.getItem(ASSETS_STORAGE_KEY);
        if (storedAssets !== null) {
          setAssets(JSON.parse(storedAssets));
        } else {
          setAssets(DEFAULT_ASSETS); // Load defaults if first time
        }
      } catch (error) {
        console.error('Failed to load assets from storage', error);
        setAssets(DEFAULT_ASSETS);
      } finally {
        setIsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  // 2. Save data to storage whenever 'assets' array changes
  useEffect(() => {
    const saveAssets = async () => {
      if (isLoaded) { // Only save after initial load is complete
        try {
          await AsyncStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
        } catch (error) {
          console.error('Failed to save assets to storage', error);
        }
      }
    };

    saveAssets();
  }, [assets, isLoaded]);

  const addAsset = (newAsset: any) => {
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setAssets(prev => [...prev, { ...newAsset, id: uniqueId }]);
  };

  const addMultipleAssets = (newAssetsArray: any[]) => {
    const assetsWithIds = newAssetsArray.map(a => ({
      ...a,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7)
    }));
    setAssets(prev => [...prev, ...assetsWithIds]);
  };
  
  const updateAsset = (id: string, updatedFields: any) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };
  
  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
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

  // Do not render children until data is loaded to prevent UI flickering
  if (!isLoaded) return null; 

  return (
    <PortfolioContext.Provider value={{ 
      assets, addAsset, addMultipleAssets, updateAsset, deleteAsset, 
      netWorth, totalGainLoss, categoryTotals, wealthByMember 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);