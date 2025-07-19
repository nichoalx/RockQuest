import { Tabs } from "expo-router"

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarStyle: { display: "none" }, 
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
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarStyle : { display: "none" },
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: "Posts",
          tabBarStyle: { display: "none" }, 
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarStyle: { display: "none" }, 
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarStyle: { display: "none" }, 
        }}
      />
    </Tabs>
  )
}
