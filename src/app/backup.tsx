import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, Alert, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { usePortfolio } from '../context/PortfolioContext';

export default function BackupScreen() {
  const router = useRouter();
  const { assets, replaceAllAssets } = usePortfolio();

  const [pastedJson, setPastedJson] = useState('');
  const currentJsonString = JSON.stringify(assets, null, 2);

  const handleGenerateBackupFile = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'MeraNetWorth_Backup.json';
      await FileSystem.writeAsStringAsync(fileUri, currentJsonString, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save Backup File' });
    } catch (error) {
      Alert.alert("Backup Failed", "Could not create backup file.");
    }
  };

  const handleCopyToClipboard = async () => {
    await Clipboard.setStringAsync(currentJsonString);
    Alert.alert("Copied!", "Your raw portfolio JSON has been copied to your clipboard.");
  };

  const processReset = (dataToImport: any) => {
    if (Array.isArray(dataToImport)) {
      replaceAllAssets(dataToImport);
      Alert.alert("Restore Complete", `Successfully reset your portfolio with ${dataToImport.length} assets.`);
      router.back();
    } else {
      Alert.alert("Invalid Format", "The provided JSON is not a valid MeraNetWorth array.");
    }
  };

  const handleRestoreFromFile = async () => {
    Alert.alert(
      "Warning: Reset All Data",
      "This will permanently replace your current data with the backup file. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Reset Data", 
          style: "destructive",
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
              if (!result.canceled) {
                const file = result.assets[0];
                const response = await fetch(file.uri);
                const jsonText = await response.text();
                processReset(JSON.parse(jsonText));
              }
            } catch (error) {
              Alert.alert("Restore Failed", "Could not read the backup file.");
            }
          }
        }
      ]
    );
  };

  const handleRestoreFromPaste = () => {
    if (!pastedJson.trim()) {
      Alert.alert("Empty Input", "Please paste your JSON data first.");
      return;
    }

    Alert.alert(
      "Warning: Reset All Data",
      "This will permanently replace your current data with the pasted JSON. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Reset Data", 
          style: "destructive",
          onPress: () => {
            try {
              processReset(JSON.parse(pastedJson));
            } catch (error) {
              Alert.alert("Invalid JSON", "The pasted text is not valid JSON data.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Data Management</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          
          {/* EXPORT SECTION */}
          <Text style={styles.sectionTitle}>Export Backup</Text>
          <View style={styles.card}>
            <TextInput 
              style={styles.readonlyTextArea} 
              value={currentJsonString} 
              multiline 
              editable={false} 
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleCopyToClipboard}>
                <Text style={styles.outlineBtnText}>📋 Copy Text</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerateBackupFile}>
                <Text style={styles.primaryBtnText}>💾 Save File</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* IMPORT SECTION */}
          <Text style={[styles.sectionTitle, { marginTop: 24, color: '#ef4444' }]}>Import & Reset</Text>
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={styles.warningText}>
              Warning: Importing data will permanently overwrite your current portfolio.
            </Text>
            
            <TextInput 
              style={styles.editableTextArea} 
              placeholder="Paste your JSON backup here..." 
              placeholderTextColor="#64748b"
              value={pastedJson} 
              onChangeText={setPastedJson}
              multiline 
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.dangerOutlineBtn} onPress={handleRestoreFromPaste}>
                <Text style={styles.dangerOutlineBtnText}>Reset from Text</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerPrimaryBtn} onPress={handleRestoreFromFile}>
                <Text style={styles.primaryBtnText}>Upload File</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  backBtn: { width: 60 },
  backBtnText: { color: '#3b82f6', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  container: { flex: 1 },
  content: { padding: 20 },
  
  sectionTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  card: { backgroundColor: '#0f172a', padding: 16, borderRadius: 16, borderColor: '#1e293b', borderWidth: 1, marginBottom: 16 },
  dangerCard: { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' },
  
  readonlyTextArea: { backgroundColor: '#020617', color: '#64748b', height: 120, padding: 12, borderRadius: 8, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', textAlignVertical: 'top', marginBottom: 16 },
  editableTextArea: { backgroundColor: '#020617', color: '#ffffff', height: 140, padding: 12, borderRadius: 8, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', textAlignVertical: 'top', marginBottom: 16, borderColor: '#1e293b', borderWidth: 1 },
  
  warningText: { color: '#ef4444', fontSize: 12, marginBottom: 12, fontWeight: '600' },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  outlineBtn: { flex: 1, backgroundColor: 'transparent', borderColor: '#3b82f6', borderWidth: 1, padding: 12, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  outlineBtnText: { color: '#3b82f6', fontWeight: 'bold' },
  primaryBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 12, borderRadius: 12, marginLeft: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontWeight: 'bold' },
  
  dangerOutlineBtn: { flex: 1, backgroundColor: 'transparent', borderColor: '#ef4444', borderWidth: 1, padding: 12, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  dangerOutlineBtnText: { color: '#ef4444', fontWeight: 'bold' },
  dangerPrimaryBtn: { flex: 1, backgroundColor: '#ef4444', padding: 12, borderRadius: 12, marginLeft: 8, alignItems: 'center' },
});