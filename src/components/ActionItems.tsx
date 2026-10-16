import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePortfolio } from '../context/PortfolioContext';

export function ActionItems() {
  const { assets } = usePortfolio();

  // 1. Filter for losing assets, calculate drop percentage, and sort by worst performers
  const losingAssets = assets
    .filter((a: any) => a.pl < 0 && a.category !== 'Liability')
    .map((a: any) => {
      const investedValue = a.value - a.pl;
      const percentDrop = investedValue > 0 ? (a.pl / investedValue) * 100 : 0;
      return {
        ...a,
        percentDrop,
      };
    })
    .sort((a: any, b: any) => a.percentDrop - b.percentDrop) // Sort ascending (most negative first)
    .slice(0, 3); // Take the top 3

  // 2. Empty State if everything is green
  if (losingAssets.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.icon}>🎉</Text>
            <Text style={styles.title}>All Clear</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>Your portfolio is looking great. No urgent action items needed today.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.title}>Action Items</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{losingAssets.length}</Text>
        </View>
      </View>

      {losingAssets.map((item: any, index: number) => {
        // Truncate long names to prevent UI wrapping issues
        const displayName = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;

        return (
          <TouchableOpacity key={item.id} style={[styles.itemRow, index === losingAssets.length - 1 && styles.lastItem]}>
            <View style={styles.itemLeft}>
              <View style={styles.dot} />
              <Text style={styles.itemLabel}>{displayName} is down</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemStat}>{item.percentDrop.toFixed(1)}%</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 16, marginRight: 8 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  lastItem: { borderBottomWidth: 0 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginRight: 12 }, // Changed to Red
  itemLabel: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemStat: { color: '#ef4444', fontSize: 14, fontWeight: 'bold', marginRight: 8 }, // Changed to Red
  chevron: { color: '#64748b', fontSize: 16 },
  emptyText: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
});