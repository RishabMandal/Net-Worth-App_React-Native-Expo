import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { usePortfolio } from '../context/PortfolioContext';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { history, netWorth } = usePortfolio();

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    return '₹' + (num / 100000).toFixed(2) + ' L';
  };

  // Sort history chronologically (Oldest to Newest)
  const sortedHistory = [...(history || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Chart Configuration
  const CHART_HEIGHT = 220;
  const CHART_WIDTH = width - 80; // Accounting for screen padding (20px * 2) and card padding (20px * 2)
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 20;

  let points = '';
  let polygonPoints = '';
  let minNetWorth = 0;
  let maxNetWorth = 0;
  let chartData: { x: number, y: number, value: number, date: string }[] = [];

  if (sortedHistory.length > 1) {
    const values = sortedHistory.map(h => h.netWorth);
    minNetWorth = Math.min(...values);
    maxNetWorth = Math.max(...values);
    
    // Add a 10% vertical buffer so the line doesn't hit the absolute top or bottom of the card
    const range = maxNetWorth - minNetWorth || 1; 
    const visualMin = Math.max(0, minNetWorth - range * 0.1);
    const visualMax = maxNetWorth + range * 0.1;
    const visualRange = visualMax - visualMin;

    chartData = sortedHistory.map((item, index) => {
      const x = (index / (sortedHistory.length - 1)) * CHART_WIDTH;
      const y = CHART_HEIGHT - PADDING_BOTTOM - ((item.netWorth - visualMin) / visualRange) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
      return { x, y, value: item.netWorth, date: item.date };
    });

    points = chartData.map(p => `${p.x},${p.y}`).join(' ');
    // Close the polygon at the bottom corners for the gradient fill
    polygonPoints = `0,${CHART_HEIGHT} ${points} ${CHART_WIDTH},${CHART_HEIGHT}`;
  }

  const growthSinceStart = sortedHistory.length > 1 
    ? sortedHistory[sortedHistory.length - 1].netWorth - sortedHistory[0].netWorth 
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wealth History</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Current Net Worth</Text>
          <Text style={styles.summaryValue}>{formatCurrency(netWorth)}</Text>
        </View>

        {sortedHistory.length < 2 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>Not Enough Data Yet</Text>
            <Text style={styles.emptyText}>
              We need at least two days of data to draw your wealth trend. The app is tracking your net worth daily in the background. Check back tomorrow!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Net Worth Trend</Text>
                <Text style={[styles.chartBadge, growthSinceStart >= 0 ? styles.bgGreen : styles.bgRed]}>
                  {growthSinceStart >= 0 ? '+' : ''}{((growthSinceStart / sortedHistory[0].netWorth) * 100).toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.svgContainer}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                  <Defs>
                    <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  
                  {/* Grid Lines */}
                  <Line x1="0" y1={CHART_HEIGHT / 2} x2={CHART_WIDTH} y2={CHART_HEIGHT / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <Line x1="0" y1={CHART_HEIGHT - PADDING_BOTTOM} x2={CHART_WIDTH} y2={CHART_HEIGHT - PADDING_BOTTOM} stroke="#1e293b" strokeWidth="1" />

                  {/* Area Fill */}
                  <Polygon points={polygonPoints} fill="url(#gradient)" />
                  
                  {/* Trend Line */}
                  <Polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="3" />
                  
                  {/* Data Points */}
                  {chartData.map((p, i) => (
                    <Circle key={i} cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                  ))}
                </Svg>
              </View>

              <View style={styles.axisLabels}>
                <Text style={styles.axisText}>{sortedHistory[0].date}</Text>
                <Text style={styles.axisText}>Today</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>All-Time High</Text>
                <Text style={styles.statValue}>{formatCurrency(maxNetWorth)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>All-Time Low</Text>
                <Text style={styles.statValue}>{formatCurrency(minNetWorth)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Growth</Text>
                <Text style={[styles.statValue, growthSinceStart >= 0 ? styles.textGreen : styles.textRed]}>
                  {growthSinceStart >= 0 ? '+' : ''}{formatCurrency(growthSinceStart)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Days Tracked</Text>
                <Text style={styles.statValue}>{sortedHistory.length}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  content: { padding: 20 },
  
  header: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 20 },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  
  summaryCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 20, marginBottom: 20, borderColor: '#1e293b', borderWidth: 1, alignItems: 'center' },
  summaryLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  summaryValue: { color: '#ffffff', fontSize: 36, fontWeight: '800' },

  emptyState: { backgroundColor: '#0f172a', borderRadius: 16, padding: 32, alignItems: 'center', borderColor: '#1e293b', borderWidth: 1, marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  chartCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 20, marginBottom: 20, borderColor: '#1e293b', borderWidth: 1 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  chartTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  chartBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden', color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  bgGreen: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
  bgRed: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
  
  svgContainer: { alignItems: 'center', justifyContent: 'center' },
  axisLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  axisText: { color: '#64748b', fontSize: 10, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', backgroundColor: '#0f172a', borderRadius: 16, padding: 16, marginBottom: 16, borderColor: '#1e293b', borderWidth: 1 },
  statLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  statValue: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
  textGreen: { color: '#10b981' },
  textRed: { color: '#ef4444' },
});