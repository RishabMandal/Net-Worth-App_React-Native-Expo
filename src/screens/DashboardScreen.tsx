import React from 'react';
import { ScrollView, View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { CircularChart } from '../components/CircularChart';
import { ActionItems } from '../components/ActionItems';
import { AssetPerformance } from '../components/AssetPerformance';
import { FamilyWealth } from '../components/FamilyWealth';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>MeraFolio</Text>
            <Text style={styles.tagline}>Your Trusted Wealth Partner</Text>
          </View>
          <TouchableOpacity style={styles.memberBtn}>
            <Text style={styles.memberBtnText}>All Members ▾</Text>
          </TouchableOpacity>
        </View>

        <CircularChart />
        <ActionItems />
        
        {/* New Component Inserted Here */}
        <AssetPerformance />
        
        <FamilyWealth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  logoText: { color: '#ffffff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  tagline: { color: '#64748b', fontSize: 12 },
  memberBtn: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  memberBtnText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
});