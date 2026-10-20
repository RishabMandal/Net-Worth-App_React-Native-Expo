import { Tabs } from "expo-router";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function TabLayout() {
  return (
    <PortfolioProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#020617",
            borderTopColor: "#1e293b", // Subtle top border separation
            height: 60,                // Comfortable height
            paddingBottom: 8,          // Padding for modern phones
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#38bdf8",   // Bright sky blue for active state
          tabBarInactiveTintColor: "#64748b", // Muted slate gray for inactive state
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
        screenListeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          },
        }}
      >
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: "Dashboard",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }} 
        />
        <Tabs.Screen 
          name="portfolio" 
          options={{ 
            title: "Portfolio",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "wallet" : "wallet-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }} 
        />
        <Tabs.Screen 
          name="analytics" 
          options={{ 
            title: "Analytics",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "stats-chart" : "stats-chart-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }} 
        />
        <Tabs.Screen
          name="manage"
          options={{
            title: "Manage",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "settings" : "settings-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="backup"
          options={{
            title: "Backup",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "arrow-up" : "arrow-up-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
    </PortfolioProvider>
  );
}