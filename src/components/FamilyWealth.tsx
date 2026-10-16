import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePortfolio } from '../context/PortfolioContext';

export function FamilyWealth() {
  const { netWorth, wealthByMember } = usePortfolio();

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    return '₹' + (num / 100000).toFixed(2) + ' L';
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Family Wealth</Text>
      
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(netWorth)}</Text>
      </View>

      {Object.keys(wealthByMember).map((member, index) => {
        const percentage = netWorth > 0 ? ((wealthByMember[member] / netWorth) * 100).toFixed(1) : 0;
        
        return (
          <View key={index} style={styles.memberRow}>
            <View>
              <Text style={styles.memberRole}>{member}</Text>
              <Text style={styles.memberDetail}>{percentage}% of total</Text>
            </View>
            <Text style={styles.memberValue}>{formatCurrency(wealthByMember[member])}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Keep the exact same StyleSheet from your previous FamilyWealth.tsx
const styles = StyleSheet.create({
  card: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 24 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 12 },
  totalLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  memberRole: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  memberDetail: { color: '#64748b', fontSize: 12, marginTop: 2 },
  memberValue: { color: '#cbd5e1', fontSize: 14, fontWeight: 'bold' },
});