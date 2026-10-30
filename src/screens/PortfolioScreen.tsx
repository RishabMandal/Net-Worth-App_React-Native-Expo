import React, { useState } from 'react';
import { ScrollView, View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar, Dimensions, Modal } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { usePortfolio } from '../context/PortfolioContext';
import { MetricsGrid } from '../components/MetricsGrid';
import { QuickActions } from '../components/QuickActions';
import { DMATAccounts } from '../components/DMATAccounts';

const { width, height } = Dimensions.get('window');

export default function PortfolioScreen() {
  const { activeFilter, setActiveFilter } = usePortfolio();
  const [showDropdown, setShowDropdown] = useState(false);

  const filterOptions = ['All', 'Self', 'Spouse'];
  const displayFilterText = activeFilter === 'All' ? 'All Members' : activeFilter;

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill]} pointerEvents="none">
        <Svg height={height+60} width={width}>
          <Defs>
            <RadialGradient id="glow1" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="glow2" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="glow3" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="glow4" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          <Circle cx={0} cy={height * 0.1} r={width * 0.7} fill="url(#glow1)" />
          <Circle cx={width} cy={height * 0.8} r={width * 0.8} fill="url(#glow2)" />
          <Circle cx={width * 0.7} cy={height * 0.4} r={width * 0.5} fill="url(#glow3)" />
          <Circle cx={width * 0.1} cy={height * 0.7} r={width * 0.6} fill="url(#glow4)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        
        {/* NEW HEADER FOR PORTFOLIO SCREEN */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <TouchableOpacity style={styles.memberBtn} onPress={() => setShowDropdown(true)}>
            <Text style={styles.memberBtnText}>{displayFilterText} ▾</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* <View style={styles.toggleRow}>
            <TouchableOpacity style={styles.activeToggle}>
              <Text style={styles.activeToggleText}>By DMAT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveToggle}>
              <Text style={styles.inactiveToggleText}>Combined</Text>
            </TouchableOpacity>
          </View> */}
          
          <MetricsGrid />
          <Text style={styles.sectionTitle}>Quick Action</Text>
          <QuickActions />
          <DMATAccounts />
        </ScrollView>
      </SafeAreaView>

      {/* Shared Dropdown Modal */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Filter View</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.dropdownItem, activeFilter === option && styles.dropdownItemActive]}
                onPress={() => {
                  setActiveFilter(option);
                  setShowDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, activeFilter === option && styles.dropdownItemTextActive]}>
                  {option === 'All' ? 'All Members' : option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    zIndex: 10,
  },
  headerTitle: { color: "#ffffff", fontSize: 24, fontWeight: "bold", letterSpacing: 0.5 },
  memberBtn: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  memberBtnText: { color: '#f8fafc', fontSize: 12, fontWeight: '600' },

  toggleRow: { flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 16, padding: 6, marginBottom: 24, borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1 },
  activeToggle: { flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.25)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderColor: 'rgba(59, 130, 246, 0.5)', borderWidth: 1 },
  activeToggleText: { color: '#60a5fa', fontWeight: 'bold', fontSize: 14 },
  inactiveToggle: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  inactiveToggleText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 14 },
  
  sectionTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },

  // Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  dropdownContainer: { width: 250, backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  dropdownTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  dropdownItemActive: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  dropdownItemText: { color: '#f8fafc', fontSize: 16, fontWeight: '500' },
  dropdownItemTextActive: { color: '#60a5fa', fontWeight: 'bold' },
});