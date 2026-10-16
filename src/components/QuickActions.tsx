import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { usePortfolio } from '../context/PortfolioContext';

export function QuickActions() {
  // Destructure the new bulk function
  const { addMultipleAssets } = usePortfolio(); 

  const handleUploadFile = async (assetCategory: 'Stock' | 'Mutual Fund') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true, 
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const dataUrl = e.target?.result as string;
            const base64String = dataUrl.split(',')[1];
            
            const workbook = XLSX.read(base64String, { type: 'base64' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            processGrowwData(parsedData as any[][], assetCategory);
          } catch (parseError: any) {
            Alert.alert("Parsing Error", "Could not parse the file contents.");
          }
        };
        
        reader.onerror = () => Alert.alert("Error", "Failed to read the file into memory.");
        reader.readAsDataURL(blob);
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to pick document: ${error.message || error}`);
    }
  };

  const processGrowwData = (data: any[][], category: 'Stock' | 'Mutual Fund') => {
    let headerRowIndex = -1;
    let nameIdx = -1, currentIdx = -1, investedIdx = -1;
    
    // Array to hold all the parsed items before sending to Context
    const newAssetsToImport: any[] = [];

    // 1. Scan downwards to find the actual table headers
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!Array.isArray(row)) continue;

      const strRow = row.map(cell => (cell || '').toString().toLowerCase().trim());

      nameIdx = strRow.findIndex(cell => ['instrument name', 'stock name', 'company name', 'scheme name', 'name'].includes(cell));
      currentIdx = strRow.findIndex(cell => ['current value', 'closing value', 'current amount', 'market value', 'value'].includes(cell));
      investedIdx = strRow.findIndex(cell => ['invested value', 'buy value', 'invested amount', 'investment', 'total invested'].includes(cell));

      if (nameIdx !== -1 && currentIdx !== -1) {
        headerRowIndex = i;
        break; 
      }
    }

    if (headerRowIndex === -1) {
      Alert.alert("Sync Failed", "Could not find column headers (e.g., 'Instrument Name', 'Current Value') in this file.");
      return;
    }

    // 2. Extract data from the rows below the header
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const name = row[nameIdx];
      
      const cleanNumber = (val: any) => {
        if (typeof val === 'number') return val;
        return parseFloat((val || '0').toString().replace(/,/g, ''));
      };

      const currentValue = cleanNumber(row[currentIdx]);
      const investedValue = investedIdx !== -1 ? cleanNumber(row[investedIdx]) : 0;

      // Clean invalid rows (like blank spaces or sub-headers)
      if (name && currentValue > 0) {
        const nameStr = name.toString().trim();
        newAssetsToImport.push({
          name: nameStr.length > 22 ? nameStr.substring(0, 22) + '...' : nameStr,
          category: category,
          owner: 'Self',
          value: currentValue,
          pl: currentValue - investedValue
        });
      }
    }

    // 3. Bulk Add all found items to Context at exactly the same time
    if (newAssetsToImport.length > 0) {
      addMultipleAssets(newAssetsToImport);
      Alert.alert("Sync Complete", `Successfully imported ${newAssetsToImport.length} ${category}s!`);
    } else {
      Alert.alert("Sync Failed", "File was read successfully, but no valid assets were found.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleUploadFile('Stock')}>
        <Text style={styles.icon}>📈</Text>
        <Text style={styles.label}>Import{'\n'}Stocks</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleUploadFile('Mutual Fund')}>
        <Text style={styles.icon}>🏦</Text>
        <Text style={styles.label}>Import{'\n'}MFs</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionBtn}>
        <Text style={styles.icon}>⏱️</Text>
        <Text style={styles.label}>Live{'\n'}Prices</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionBtn}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.label}>Export{'\n'}Excel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: 16, borderRadius: 16, borderColor: '#1e293b', borderWidth: 1, marginBottom: 24 },
  actionBtn: { alignItems: 'center', flex: 1 },
  icon: { fontSize: 20, marginBottom: 8 },
  label: { color: '#cbd5e1', fontSize: 10, textAlign: 'center' },
});