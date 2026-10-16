import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const { assets } = usePortfolio();

  // 1. Group by category, sum values, and calculate returns
  const performanceData = Object.entries(
    assets.reduce((acc: any, item: any) => {
      // Exclude liabilities from performance metrics
      if (item.category === 'Liability') return acc; 
      
      if (!acc[item.category]) acc[item.category] = { value: 0, pl: 0, count: 0 };
      
      acc[item.category].value += item.value;
      acc[item.category].pl += item.pl;
      acc[item.category].count += 1;
      return acc;
    }, {})
  )
    .map(([category, data]: [string, any]) => {
      const invested = data.value - data.pl;
      const percent = invested > 0 ? (data.pl / invested) * 100 : 0;
      return { category, ...data, percent };
    })
    .sort((a, b) => b.value - a.value); // Sort by highest holding value

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    return '₹' + (num / 100000).toFixed(2) + ' L';
  };

  if (performanceData.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.title}>Asset Performance</Text>
      </View>

      {performanceData.map((item, index) => {
        const isPositive = item.pl >= 0;
        
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
                {isPositive ? '+' : ''}{formatCurrency(item.pl)} ({isPositive ? '+' : ''}{item.percent.toFixed(1)}%)
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  icon: { fontSize: 18, marginRight: 8 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
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