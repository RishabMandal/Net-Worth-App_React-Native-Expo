import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform } from "react-native";
import { Tabs, router } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PortfolioProvider } from "@/context/PortfolioContext";

const { width } = Dimensions.get("window");

const TAB_BAR_MARGIN = 20;
const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN * 2;

function FloatingTabBar({ state, descriptors, navigation }: any) {
  // 1. Get the currently active route name
  const activeRouteName = state.routes[state.index].name;

  // 2. Filter out "backup" so it doesn't get a button in the UI
  const visibleRoutes = state.routes.filter((r: any) => r.name !== "backup");

  // 3. Calculate width based ONLY on the 4 visible tabs
  const tabWidth = TAB_BAR_WIDTH / visibleRoutes.length;
  const translateX = useRef(new Animated.Value(0)).current;

  // 4. Find where the glass bubble should sit based on visible tabs
  const activeVisibleIndex = visibleRoutes.findIndex((r: any) => r.name === activeRouteName);

  // HOOK: Always runs safely
  useEffect(() => {
    if (activeVisibleIndex !== -1) {
      Animated.spring(translateX, {
        toValue: activeVisibleIndex * tabWidth,
        useNativeDriver: true,
        bounciness: 4, 
        speed: 14,
      }).start();
    }
  }, [activeVisibleIndex, tabWidth]);

  // Hide the entire tab bar gracefully when we are on the Backup screen
  if (activeRouteName === "backup") {
    return <View style={{ display: 'none' }} />;
  }

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={60} tint="dark" style={styles.tabBarBackground}>
        
        <Animated.View
          style={[
            styles.slidingIndicator,
            { 
              width: tabWidth,
              transform: [{ translateX }] 
            }
          ]}
        >
          <View style={styles.indicatorInner} />
        </Animated.View>

        {/* Iterate over visibleRoutes instead of state.routes */}
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const isFocused = activeRouteName === route.name;
          const label = options.title !== undefined ? options.title : route.name;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            let defaultPrevented = false;
            
            if (navigation && typeof navigation.emit === "function") {
              const event = navigation.emit({ 
                type: "tabPress", 
                target: route.key, 
                canPreventDefault: true 
              });
              defaultPrevented = event?.defaultPrevented;
            }

            if (!isFocused && !defaultPrevented) {
              if (navigation && typeof navigation.navigate === "function") {
                navigation.navigate(route.name);
              } else {
                const targetPath = route.name === "index" ? "/" : `/${route.name}`;
                router.navigate(targetPath as any);
              }
            }
          };

          return (
            <TouchableOpacity key={route.key} activeOpacity={0.8} onPress={onPress} style={styles.tabItem}>
              {options.tabBarIcon && options.tabBarIcon({
                color: isFocused ? "#38bdf8" : "#94a3b8",
                focused: isFocused,
              })}
              <Text style={[styles.tabLabel, { color: isFocused ? "#38bdf8" : "#94a3b8" }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <PortfolioProvider>
      <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} /> }} />
        <Tabs.Screen name="portfolio" options={{ title: "Portfolio", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={color} /> }} />
        <Tabs.Screen name="analytics" options={{ title: "Analytics", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={22} color={color} /> }} />
        <Tabs.Screen name="manage" options={{ title: "Manage", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} /> }} />
        <Tabs.Screen name="backup" options={{ title: "Backup" }} />
      </Tabs>
    </PortfolioProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: { position: "absolute", bottom: Platform.OS === "ios" ? 30 : 20, left: TAB_BAR_MARGIN, right: TAB_BAR_MARGIN, height: 70, borderRadius: 35, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  tabBarBackground: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 35, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)", backgroundColor: "rgba(15, 23, 42, 0.75)" },
  slidingIndicator: { position: "absolute", height: "100%", padding: 6, zIndex: 0 },
  indicatorInner: { flex: 1, backgroundColor: "rgba(255, 255, 255, 0.12)", borderRadius: 30, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  tabItem: { flex: 1, height: "100%", justifyContent: "center", alignItems: "center", zIndex: 1 },
  tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
});