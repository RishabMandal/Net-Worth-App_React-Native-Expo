import { Tabs } from "expo-router";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <PortfolioProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#020617" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="portfolio" options={{ title: "Portfolio" }} />
        <Tabs.Screen
          name="manage"
          options={{
            title: "Manage",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>⚙️</Text>
            ),
          }}
        />
      </Tabs>
    </PortfolioProvider>
  );
}
