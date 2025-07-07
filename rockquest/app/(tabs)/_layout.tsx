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

      <Tabs.Screen
        name="GeoHomepage"
        options={{
          title: "Homepage",
          tabBarStyle: { display: "none" }, 
        }}
      />
      
      <Tabs.Screen
        name="GeoPosts"
        options={{
          title: "Posts",
          tabBarStyle: { display: "none" }, 
        }}
      />

      <Tabs.Screen
        name="GeoReviewPosts"
        options={{
          title: "Review Posts",
          tabBarStyle: { display: "none" }, 
        }}
      />
      
      <Tabs.Screen
        name="GeoProfile"
        options={{
          title: "Profile",
          tabBarStyle: { display: "none" }, 
        }}
      />

      <Tabs.Screen
        name="edit-profile"
        options={{
          title: "Edit Profile",
          tabBarStyle: { display: "none" }, 
        }}
      />

      <Tabs.Screen
        name="GeoNewPost"
        options={{
          title: "New Post",
          tabBarStyle: { display: "none" }, 
        }}
      />

      <Tabs.Screen
        name="GeoNewFact"
        options={{
          title: "New Fact",
          tabBarStyle: { display: "none" }, 
        }}
      />
    </Tabs>
  )
}
