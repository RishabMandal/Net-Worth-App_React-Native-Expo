import React from 'react';
import { ScrollView, View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { MetricsGrid } from '../components/MetricsGrid';
import { QuickActions } from '../components/QuickActions';
import { DMATAccounts } from '../components/DMATAccounts';

const { width, height } = Dimensions.get('window');

export default function PortfolioScreen() {
  return (
    // 1. Root Container establishes the dark base
    <View style={styles.root}>
      
      {/* 2. 4-Color Ambient Background (Locked to the back) */}
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

      {/* 3. Foreground Content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={styles.activeToggle}>
              <Text style={styles.activeToggleText}>By DMAT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveToggle}>
              <Text style={styles.inactiveToggleText}>Combined</Text>
            </TouchableOpacity>
          </View>
          
          <MetricsGrid />
          <Text style={styles.sectionTitle}>Quick Action</Text>
          <QuickActions />
          <DMATAccounts />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: "#020617" 
  },
  safeArea: { 
    flex: 1, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  container: { flex: 1 },
  content: { 
    padding: 20, 
    paddingBottom: 100 // Extra padding so bottom items aren't hidden by the floating tab bar
  },
  
  // Upgraded Toggle Switch to Glass UI
  toggleRow: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Deep translucent base
    borderRadius: 16, 
    padding: 6, 
    marginBottom: 24, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    borderWidth: 1 
  },
  activeToggle: { 
    flex: 1, 
    backgroundColor: 'rgba(59, 130, 246, 0.25)', // Subtle blue glow for active state
    paddingVertical: 12, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderColor: 'rgba(59, 130, 246, 0.5)', 
    borderWidth: 1 
  },
  activeToggleText: { color: '#60a5fa', fontWeight: 'bold', fontSize: 14 },
  inactiveToggle: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 12 
  },
  inactiveToggleText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 14 },
  
  sectionTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
});