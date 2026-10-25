import React from 'react';
import { ScrollView, View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { Link } from 'expo-router';
import { CircularChart } from '../components/CircularChart';
import { ActionItems } from '../components/ActionItems';
import { AssetPerformance } from '../components/AssetPerformance';
import { FamilyWealth } from '../components/FamilyWealth';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
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
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            
            <Link href="/backup" asChild>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={{ zIndex: 10 }}
                onPress={() => console.log("🚀 ATTEMPTING TO ROUTE TO /backup")}
              >
                <Text style={styles.logoText}>MeraNetWorth</Text>
                <Text style={styles.tagline}>Your Trusted Wealth Partner</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity style={styles.memberBtn}>
              <Text style={styles.memberBtnText}>All Members ▾</Text>
            </TouchableOpacity>
          </View>

          <CircularChart />
          <ActionItems />
          <AssetPerformance />
          <FamilyWealth />
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
    paddingBottom: 100 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
    marginTop: 8,
    zIndex: 10
  },
  logoText: { color: '#ffffff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  tagline: { color: '#94a3b8', fontSize: 12 },
  
  memberBtn: { 
    backgroundColor: 'rgba(30, 41, 59, 0.6)', 
    borderColor: 'rgba(255, 255, 255, 0.15)', 
    borderWidth: 1, 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 16 
  },
  memberBtnText: { color: '#f8fafc', fontSize: 12, fontWeight: '600' },
});