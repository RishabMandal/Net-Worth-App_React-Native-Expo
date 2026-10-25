import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { usePortfolio } from '../context/PortfolioContext';

export function QuickActions() {
  const { assets, addMultipleAssets } = usePortfolio(); 

  // --- 1. IMPORT BROKER DATA (Groww) ---
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
    const newAssetsToImport: any[] = [];

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

    if (newAssetsToImport.length > 0) {
      addMultipleAssets(newAssetsToImport);
      Alert.alert("Sync Complete", `Successfully imported ${newAssetsToImport.length} ${category}s!`);
    } else {
      Alert.alert("Sync Failed", "File was read successfully, but no valid assets were found.");
    }
  };

  // --- 2. EXPORT EXCEL ---
  const handleExportExcel = async () => {
    try {
      const exportData = assets.map((a: any) => ({
        'Asset Name': a.name,
        'Category': a.category,
        'Owner': a.owner,
        'Invested Value': a.category === 'Liability' ? 0 : a.value - a.pl,
        'Current Value': a.value,
        'Total Gain/Loss': a.pl
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Portfolio");
      
      const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const fileUri = FileSystem.documentDirectory + 'MeraFolio_Export.xlsx';
      
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Export Portfolio' });
    } catch (error) {
      Alert.alert("Export Failed", "Could not generate Excel file.");
    }
  };

  // --- 3. JSON BACKUP & RESTORE ---
  const handleBackupRestore = () => {
    Alert.alert(
      "Data Portability",
      "Securely backup or restore your offline portfolio data.",
      [
        { text: "Create Backup", onPress: generateBackup },
        { text: "Restore Backup", onPress: restoreBackup },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const generateBackup = async () => {
    try {
      const jsonString = JSON.stringify(assets, null, 2);
      const fileUri = FileSystem.documentDirectory + 'MeraFolio_Backup.json';
      await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save Backup File' });
    } catch (error) {
      Alert.alert("Backup Failed", "Could not create backup file.");
    }
  };

  const restoreBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
      if (!result.canceled) {
        const file = result.assets[0];
        const response = await fetch(file.uri);
        const jsonText = await response.text();
        const importedData = JSON.parse(jsonText);
        
        if (Array.isArray(importedData)) {
          addMultipleAssets(importedData);
          Alert.alert("Restore Complete", `Successfully merged ${importedData.length} assets from backup.`);
        } else {
          Alert.alert("Invalid File", "The selected file is not a valid MeraFolio backup.");
        }
      }
    } catch (error) {
      Alert.alert("Restore Failed", "Could not read the backup file.");
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
      
      <TouchableOpacity style={styles.actionBtn} onPress={handleBackupRestore}>
        <Text style={styles.icon}>💾</Text>
        <Text style={styles.label}>Backup{'\n'}Restore</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionBtn} onPress={handleExportExcel}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.label}>Export{'\n'}Excel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: 16, borderRadius: 16, borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, marginBottom: 24 },
  actionBtn: { alignItems: 'center', flex: 1 },
  icon: { fontSize: 20, marginBottom: 8 },
  label: { color: '#cbd5e1', fontSize: 10, textAlign: 'center' },
});