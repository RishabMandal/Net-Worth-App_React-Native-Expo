import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePortfolio } from "../context/PortfolioContext";

export function DMATAccounts() {
  const { assets, deleteAsset } = usePortfolio();

  // 1. Include both Stocks and Mutual Funds
  const marketHoldings = assets.filter(
    (a: any) => a.category === "Stock" || a.category === "Mutual Fund",
  );

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000)
      return "₹" + (num / 10000000).toFixed(2) + " Cr";
    return "₹" + (num / 100000).toFixed(2) + " L";
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
            {/* Added flex: 1 to leftCol to prevent pushing prices off screen */}
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
              onPress={() => deleteAsset(acc.id)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.outlineBtn}>
          <Text style={styles.outlineBtnText}>+ Add Lumpsum</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>+ Add Holding</Text>
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
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#1e293b",
    borderWidth: 1,
    position: "relative",
  },

  // Layout Fixes
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

  // Delete Button styling
  deleteBtn: { position: "absolute", top: 8, right: 8, padding: 4, zIndex: 10 },
  deleteText: { color: "#64748b", fontSize: 12, fontWeight: "bold" },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  outlineBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderColor: "#3b82f6",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },
  outlineBtnText: { color: "#3b82f6", fontWeight: "bold" },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#ffffff", fontWeight: "bold" },
});
