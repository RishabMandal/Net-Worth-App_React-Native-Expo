import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Polyline,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { usePortfolio } from "../context/PortfolioContext";

const { width, height } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const { history, netWorth } = usePortfolio();

  const formatCurrency = (num: number) => {
    if (Math.abs(num) >= 10000000)
      return "₹" + (num / 10000000).toFixed(2) + " Cr";
    return "₹" + (num / 100000).toFixed(2) + " L";
  };

  // Sort history chronologically (Oldest to Newest)
  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Chart Configuration
  const CHART_HEIGHT = 220;
  const CHART_WIDTH = width - 80;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 20;

  let points = "";
  let polygonPoints = "";
  let minNetWorth = 0;
  let maxNetWorth = 0;
  let chartData: { x: number; y: number; value: number; date: string }[] = [];

  if (sortedHistory.length > 1) {
    const values = sortedHistory.map((h) => h.netWorth);
    minNetWorth = Math.min(...values);
    maxNetWorth = Math.max(...values);

    const range = maxNetWorth - minNetWorth || 1;
    const visualMin = Math.max(0, minNetWorth - range * 0.1);
    const visualMax = maxNetWorth + range * 0.1;
    const visualRange = visualMax - visualMin;

    chartData = sortedHistory.map((item, index) => {
      const x = (index / (sortedHistory.length - 1)) * CHART_WIDTH;
      const y =
        CHART_HEIGHT -
        PADDING_BOTTOM -
        ((item.netWorth - visualMin) / visualRange) *
          (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
      return { x, y, value: item.netWorth, date: item.date };
    });

    points = chartData.map((p) => `${p.x},${p.y}`).join(" ");
    polygonPoints = `0,${CHART_HEIGHT} ${points} ${CHART_WIDTH},${CHART_HEIGHT}`;
  }

  const growthSinceStart =
    sortedHistory.length > 1
      ? sortedHistory[sortedHistory.length - 1].netWorth -
        sortedHistory[0].netWorth
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. True Ambient Glow using SVG Radial Gradients (Rendered first so it stays behind) */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height={height+60} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Top Left Blue Glow */}
            <RadialGradient id="glow1" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </RadialGradient>
            {/* Bottom Right Purple Glow */}
            <RadialGradient id="glow2" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
            </RadialGradient>
            {/* Middle Teal Glow */}
            <RadialGradient id="glow3" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </RadialGradient>
            {/* Bottom Left Rose/Pink Glow */}
            <RadialGradient id="glow4" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Circle cx={0} cy={height * 0.1} r={width * 0.7} fill="url(#glow1)" />
          <Circle
            cx={width}
            cy={height * 0.8}
            r={width * 0.8}
            fill="url(#glow2)"
          />
          <Circle
            cx={width * 0.7}
            cy={height * 0.4}
            r={width * 0.5}
            fill="url(#glow3)"
          />
          <Circle
            cx={width * 0.1}
            cy={height * 0.7}
            r={width * 0.6}
            fill="url(#glow4)"
          />
        </Svg>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wealth History</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.glassCard}>
          <Text style={styles.summaryLabel}>Current Net Worth</Text>
          <Text style={styles.summaryValue}>{formatCurrency(netWorth)}</Text>
        </View>

        {sortedHistory.length < 2 ? (
          <View style={[styles.glassCard, { padding: 32, marginTop: 12 }]}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>Not Enough Data Yet</Text>
            <Text style={styles.emptyText}>
              We need at least two days of data to draw your wealth trend. The
              app is tracking your net worth daily in the background. Check back
              tomorrow!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.glassCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Net Worth Trend</Text>
                <Text
                  style={[
                    styles.chartBadge,
                    growthSinceStart >= 0 ? styles.bgGreen : styles.bgRed,
                  ]}
                >
                  {growthSinceStart >= 0 ? "+" : ""}
                  {(
                    (growthSinceStart / sortedHistory[0].netWorth) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>

              <View style={styles.svgContainer}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                  <Defs>
                    <LinearGradient
                      id="chartGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                      <Stop
                        offset="100%"
                        stopColor="#3b82f6"
                        stopOpacity="0.0"
                      />
                    </LinearGradient>
                  </Defs>

                  {/* Grid Lines */}
                  <Line
                    x1="0"
                    y1={CHART_HEIGHT / 2}
                    x2={CHART_WIDTH}
                    y2={CHART_HEIGHT / 2}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <Line
                    x1="0"
                    y1={CHART_HEIGHT - PADDING_BOTTOM}
                    x2={CHART_WIDTH}
                    y2={CHART_HEIGHT - PADDING_BOTTOM}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                  />

                  {/* Area Fill */}
                  <Polygon points={polygonPoints} fill="url(#chartGradient)" />

                  {/* Trend Line */}
                  <Polyline
                    points={points}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />

                  {/* Data Points */}
                  {chartData.map((p, i) => (
                    <Circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="rgba(30, 41, 59, 1)"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />
                  ))}
                </Svg>
              </View>

              <View style={styles.axisLabels}>
                <Text style={styles.axisText}>{sortedHistory[0].date}</Text>
                <Text style={styles.axisText}>Today</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.glassStatBox}>
                <Text style={styles.statLabel}>All-Time High</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(maxNetWorth)}
                </Text>
              </View>
              <View style={styles.glassStatBox}>
                <Text style={styles.statLabel}>All-Time Low</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(minNetWorth)}
                </Text>
              </View>
              <View style={styles.glassStatBox}>
                <Text style={styles.statLabel}>Total Growth</Text>
                <Text
                  style={[
                    styles.statValue,
                    growthSinceStart >= 0 ? styles.textGreen : styles.textRed,
                  ]}
                >
                  {growthSinceStart >= 0 ? "+" : ""}
                  {formatCurrency(growthSinceStart)}
                </Text>
              </View>
              <View style={styles.glassStatBox}>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1 },
  content: { 
    padding: 20, 
    paddingBottom: 100 // Extra padding so bottom items aren't hidden by the floating tab bar
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  glassCard: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    alignItems: "center",
  },

  summaryLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryValue: { color: "#ffffff", fontSize: 38, fontWeight: "800" },

  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  chartTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  chartBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  bgGreen: { backgroundColor: "rgba(16, 185, 129, 0.25)", color: "#34d399" },
  bgRed: { backgroundColor: "rgba(239, 68, 68, 0.25)", color: "#f87171" },

  svgContainer: { alignItems: "center", justifyContent: "center" },
  axisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
  },
  axisText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  glassStatBox: {
    width: "48%",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
  },
  statLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  statValue: { color: "#f8fafc", fontSize: 17, fontWeight: "bold" },
  textGreen: { color: "#34d399" },
  textRed: { color: "#f87171" },
});
