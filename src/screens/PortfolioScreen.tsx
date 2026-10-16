import React from 'react';
import { ScrollView, View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MetricsGrid } from '../components/MetricsGrid';
import { QuickActions } from '../components/QuickActions';
import { DMATAccounts } from '../components/DMATAccounts';

export default function PortfolioScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.toggleRow}>
          <TouchableOpacity style={styles.activeToggle}><Text style={styles.activeToggleText}>By DMAT</Text></TouchableOpacity>
          <TouchableOpacity style={styles.inactiveToggle}><Text style={styles.inactiveToggleText}>Combined</Text></TouchableOpacity>
        </View>
        
        <MetricsGrid />
        <Text style={styles.sectionTitle}>Quick Action</Text>
        <QuickActions />
        <DMATAccounts />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  content: { padding: 20 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 12, padding: 4, marginBottom: 24, borderColor: '#1e293b', borderWidth: 1 },
  activeToggle: { flex: 1, backgroundColor: '#1e293b', paddingVertical: 10, borderRadius: 8, alignItems: 'center', margin: 4 },
  activeToggleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inactiveToggle: { flex: 1, paddingVertical: 10, alignItems: 'center', margin: 4 },
  inactiveToggleText: { color: '#64748b', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
});