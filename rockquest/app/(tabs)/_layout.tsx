import { Tabs } from "expo-router"

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarStyle: { display: "none" }, // Hide tab bar on home screen
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          title: "Auth",
          tabBarStyle: { display: "none" }, 
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarStyle: { display: "none" }, 
        }}
      />
    </Tabs>
  )
}
