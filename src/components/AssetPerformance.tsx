import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePortfolio } from '../context/PortfolioContext';

const CATEGORY_COLORS: any = {
  'Mutual Fund': '#3b82f6', 
  'Stock': '#4f46e5', 
  'Real Estate': '#10b981',
  'Fixed Income': '#fb923c', 
  'Cash': '#2dd4bf', 
  'Other Assets': '#94a3b8',
  'Gold': '#fbbf24',
  'Silver': '#cbd5e1'
};

export function AssetPerformance() {
  const { filteredAssets } = usePortfolio();
  const [isAnnualized, setIsAnnualized] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Group by category, calculate timeline, and sum values
  const performanceData = Object.entries(
    filteredAssets.reduce((acc: any, item: any) => {
      if (item.category === 'Liability') return acc; 
      
      if (!acc[item.category]) {
        acc[item.category] = { 
          value: 0, 
          pl: 0, 
          count: 0, 
          earliestStart: item.startDate || todayStr, 
          latestEnd: item.endDate || todayStr 
        };
      }
      
      acc[item.category].value += item.value;
      acc[item.category].pl += item.pl;
      acc[item.category].count += 1;

      // Expand the timeline bounds for the category if assets are older/newer
      const itemStart = item.startDate || todayStr;
      const itemEnd = item.endDate || todayStr;
      if (new Date(itemStart) < new Date(acc[item.category].earliestStart)) {
        acc[item.category].earliestStart = itemStart;
      }
      if (new Date(itemEnd) > new Date(acc[item.category].latestEnd)) {
        acc[item.category].latestEnd = itemEnd;
      }

      return acc;
    }, {})
  )
    .map(([category, data]: [string, any]) => {
      const invested = data.value - data.pl;
      const percent = invested > 0 ? (data.pl / invested) * 100 : 0;
      
      // Calculate years held
      const startMs = new Date(data.earliestStart).getTime();
      const endMs = new Date(data.latestEnd).getTime();
      const years = Math.max((endMs - startMs) / (1000 * 60 * 60 * 24 * 365.25), 0.01); // Prevent division by zero

      // Calculate CAGR (Compound Annual Growth Rate)
      let annualizedPercent = 0;
      if (invested > 0 && data.value > 0) {
        annualizedPercent = (Math.pow(data.value / invested, 1 / years) - 1) * 100;
      } else if (invested > 0 && data.value <= 0) {
        annualizedPercent = -100;
      }

      return { category, ...data, percent, annualizedPercent };
    })
    .sort((a, b) => b.value - a.value); 

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    return '₹' + (num / 100000).toFixed(2) + ' L';
  };

  if (performanceData.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>📊</Text>
          <Text style={styles.title}>Asset Performance</Text>
        </View>
        <TouchableOpacity 
          style={styles.toggleBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsAnnualized(!isAnnualized);
          }}
        >
          <Text style={styles.toggleBtnText}>{isAnnualized ? 'CAGR(p.a.)' : 'Absolute'}</Text>
        </TouchableOpacity>
      </View>

      {performanceData.map((item, index) => {
        const isPositive = item.pl >= 0;
        const displayPercent = isAnnualized ? item.annualizedPercent : item.percent;
        
        return (
          <View key={index} style={[styles.row, index === performanceData.length - 1 && styles.lastRow]}>
            <View style={styles.leftCol}>
              <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[item.category] || '#94a3b8' }]} />
              <View>
                <Text style={styles.categoryName}>{item.category}</Text>
                <Text style={styles.countText}>{item.count} Asset{item.count > 1 ? 's' : ''}</Text>
              </View>
            </View>
            <View style={styles.rightCol}>
              <Text style={styles.valueText}>{formatCurrency(item.value)}</Text>
              <Text style={[styles.plText, isPositive ? styles.textGreen : styles.textRed]}>
                {isPositive ? '+' : ''}{formatCurrency(item.pl)} ({isPositive ? '+' : ''}{displayPercent.toFixed(1)}%{isAnnualized ? ' p.a.' : ''})
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titleGroup: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 18, marginRight: 8 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  toggleBtn: { backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.5)' },
  toggleBtnText: { color: '#60a5fa', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  lastRow: { borderBottomWidth: 0, paddingBottom: 0 },
  leftCol: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  categoryName: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
  countText: { color: '#64748b', fontSize: 12, marginTop: 2 },
  rightCol: { alignItems: 'flex-end' },
  valueText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  plText: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  textGreen: { color: '#10b981' },
  textRed: { color: '#ef4444' },
});