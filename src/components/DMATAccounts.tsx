import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { usePortfolio } from "../context/PortfolioContext";

export function DMATAccounts() {
  const { filteredAssets, deleteAsset } = usePortfolio();

  // 1. Include both Stocks and Mutual Funds
  const marketHoldings = filteredAssets.filter(
    (a: any) => a.category === "Stock" || a.category === "Mutual Fund",
  );

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000)
      return "₹" + (num / 10000000).toFixed(2) + " Cr";
    return "₹" + (num / 100000).toFixed(2) + " L";
  };

  // Generic function to handle mass deletion with confirmation
  const confirmDeleteAll = (category: string, label: string) => {
    // Find IDs of all assets in the current view that match the category
    const targetIds = filteredAssets
      .filter((a: any) => a.category === category)
      .map((a: any) => a.id);

    if (targetIds.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(`No ${label}`, `There are no ${label} to delete in this view.`);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      `Delete All ${label}`,
      `Are you sure you want to delete all ${targetIds.length} ${label}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            // Delete them all sequentially 
            targetIds.forEach((id: string) => deleteAsset(id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Market Holdings</Text>
      {marketHoldings.map((acc: any) => {
        const isPositive = acc.pl >= 0;
        const invested = acc.value - acc.pl;
        const plPercent =
          invested > 0 ? ((acc.pl / invested) * 100).toFixed(2) : 0;

        return (
          <View key={acc.id} style={styles.card}>
            <View style={styles.leftCol}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>
                  {acc.category === "Mutual Fund" ? "🏦" : "📈"}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text
                    style={styles.name}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {acc.name}
                  </Text>
                  <Text style={styles.tag}>
                    {acc.category === "Mutual Fund" ? "MF" : "STOCK"}
                  </Text>
                </View>
                <Text style={styles.owner}>{acc.owner}</Text>
              </View>
            </View>

            <View style={styles.rightCol}>
              <Text style={styles.value}>{formatCurrency(acc.value)}</Text>
              <Text
                style={[
                  styles.pl,
                  isPositive ? styles.textGreen : styles.textRed,
                ]}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(acc.pl)} ({isPositive ? "+" : ""}
                {plPercent}%)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                deleteAsset(acc.id);
              }}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* REPLACED BUTTONS WITH MASS DELETE OPTIONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.dangerOutlineBtn, { marginRight: 8 }]} 
          onPress={() => confirmDeleteAll("Stock", "Stocks")}
        >
          <Text style={styles.dangerOutlineBtnText}>Delete All Stocks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dangerOutlineBtn, { marginLeft: 8 }]} 
          onPress={() => confirmDeleteAll("Mutual Fund", "Mutual Funds")}
        >
          <Text style={styles.dangerOutlineBtnText}>Delete All MFs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    position: "relative",
  },

  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  textContainer: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  name: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 6,
    flexShrink: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: { fontSize: 18 },
  tag: { color: "#94a3b8", fontSize: 10, letterSpacing: 0.5 },
  owner: { color: "#64748b", fontSize: 12 },

  rightCol: { alignItems: "flex-end", minWidth: 80 },
  value: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  pl: { fontSize: 12 },
  textGreen: { color: "#10b981" },
  textRed: { color: "#ef4444" },

  deleteBtn: { position: "absolute", top: 8, right: 8, padding: 4, zIndex: 10 },
  deleteText: { color: "#64748b", fontSize: 12, fontWeight: "bold" },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  
  // NEW STYLES FOR DANGER BUTTONS
  dangerOutlineBtn: {
    flex: 1,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#ef4444",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  dangerOutlineBtnText: { 
    color: "#fca5a5", 
    fontWeight: "bold" 
  },
});