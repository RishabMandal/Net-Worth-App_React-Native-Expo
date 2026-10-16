import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import * as LocalAuthentication from 'expo-local-authentication';
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

export function CircularChart() {
  const { netWorth, totalGainLoss, categoryTotals } = usePortfolio();
  
  // State to manage whether the value is masked or revealed
  const [isValueMasked, setIsValueMasked] = useState(true);

  // Function to handle biometric authentication
  const handleAuthAndToggleMask = async () => {
    // If it's already unmasked, just mask it again without asking for a fingerprint
    if (!isValueMasked) {
      setIsValueMasked(true);
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback: If the device doesn't have a fingerprint scanner or it isn't set up, just unmask it
        setIsValueMasked(false);
        return;
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to view Net Worth',
        fallbackLabel: 'Use Passcode',
      });

      if (authResult.success) {
        setIsValueMasked(false);
      } else {
        Alert.alert('Authentication Failed', 'Could not verify your identity.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during authentication.');
    }
  };

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    return '₹' + (num / 100000).toFixed(2) + ' L';
  };

  const totalPositiveAssets = Object.keys(categoryTotals).reduce((sum, key) => 
    key !== 'Liability' ? sum + categoryTotals[key] : sum, 0
  );

  // SVG Chart Configuration
  const size = 192;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <View style={styles.card}>
      <View style={styles.chartContainer}>
        {/* Dynamic SVG Donut Chart */}
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {Object.keys(categoryTotals).map((cat) => {
              if (cat === 'Liability' || totalPositiveAssets === 0) return null;
              
              const percent = categoryTotals[cat] / totalPositiveAssets;
              const strokeDashoffset = circumference - (percent * circumference);
              const rotation = cumulativePercent * 360;
              cumulativePercent += percent;

              return (
                <Circle
                  key={cat}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={CATEGORY_COLORS[cat] || '#94a3b8'}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  rotation={rotation}
                  origin={`${center}, ${center}`}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>

        {/* Absolute Centered Text with Touchable Area for Authentication */}
        <TouchableOpacity 
          style={styles.centerTextContainer} 
          onPress={handleAuthAndToggleMask}
          activeOpacity={0.7}
        >
          <View style={styles.labelRow}>
            <Text style={styles.netWorthLabel}>Net Worth</Text>
            <Text style={styles.lockIcon}>{isValueMasked ? ' 🔒' : ' 🔓'}</Text>
          </View>
          
          <Text style={styles.netWorthValue}>
            {isValueMasked ? '₹ ********' : formatCurrency(netWorth)}
          </Text>
          
          <Text style={[styles.netWorthChange, totalGainLoss < 0 && styles.textRed]}>
            {isValueMasked ? '***' : `${totalGainLoss >= 0 ? '+' : ''}${formatCurrency(totalGainLoss)}`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legendContainer}>
        {Object.keys(categoryTotals).map((cat, index) => {
          if (cat === 'Liability') return null;
          const percentage = ((categoryTotals[cat] / totalPositiveAssets) * 100).toFixed(1);
          
          return (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendLabelGroup}>
                <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8' }]} />
                <Text style={styles.legendLabel}>{cat}</Text>
              </View>
              <Text style={styles.legendValue}>{percentage}%</Text>
            </View>
          );
        })}
        
        {categoryTotals['Liability'] !== undefined && (
          <View style={styles.liabilityRow}>
            <View style={styles.legendLabelGroup}>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.liabilityLabel}>Loans (Liability)</Text>
            </View>
            <Text style={styles.liabilityValue}>
              {isValueMasked ? '₹ *****' : formatCurrency(categoryTotals['Liability'])}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16 },
  chartContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, position: 'relative' },
  centerTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  netWorthLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  lockIcon: { fontSize: 10, color: '#94a3b8' },
  netWorthValue: { color: '#ffffff', fontSize: 30, fontWeight: '800', marginVertical: 4 },
  netWorthChange: { color: '#34d399', fontSize: 12, fontWeight: 'bold' },
  textRed: { color: '#ef4444' },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 16, marginTop: 16 },
  legendItem: { width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  legendLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: '500' },
  legendValue: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  liabilityRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(30, 41, 59, 0.4)', paddingTop: 8, marginTop: 4 },
  liabilityLabel: { color: '#f87171', fontSize: 12, fontWeight: 'bold' },
  liabilityValue: { color: '#f87171', fontSize: 12, fontWeight: 'bold' },
});