import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePortfolio } from '../context/PortfolioContext';

export function MetricsGrid() {
  const { netWorth, totalGainLoss, assets } = usePortfolio();
  
  // Calculate total invested based on current net worth minus gains
  const totalInvested = netWorth - totalGainLoss;
  
  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    return '₹' + (num / 100000).toFixed(2) + ' L';
  };
  
  const isPositive = totalGainLoss >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Invested</Text>
        <Text style={styles.value}>{formatCurrency(totalInvested)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Current Value</Text>
        <Text style={styles.value}>{formatCurrency(netWorth)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Gain / Loss</Text>
        <Text style={[styles.value, isPositive ? styles.textGreen : styles.textRed]}>
          {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Positions</Text>
        <Text style={styles.value}>{assets.length}</Text>
        <Text style={styles.subtext}>{assets.length} Total Assets</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '48%', backgroundColor: '#0f172a', borderRadius: 16, padding: 16, marginBottom: 16, borderColor: '#1e293b', borderWidth: 1 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
  value: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  textGreen: { color: '#10b981' },
  textRed: { color: '#ef4444' },
  subtext: { color: '#10b981', fontSize: 12, marginTop: 4 },
});