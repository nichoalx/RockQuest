import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
      {/* Top-level auth/onboarding screens (still in (tabs)/) */}
      <Tabs.Screen name="auth" options={{ title: "Auth", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="index" options={{ title: "Home", tabBarStyle: { display: "none" }}} />
      <Tabs.Screen name="welcomeScreen" options={{ title: "Welcome to RockQuest", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="choose-role" options={{ title: "Role", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="signup-details" options={{ title: "Signup details", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="upload-documents" options={{ title: "Upload documents", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="thankyouScreen" options={{ title: "Finish", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="edit-profile" options={{ title: "Edit Profile", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="NewPost" options={{ title: "New Post", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="profile-info" options={{ title: "Profile Info", tabBarStyle: { display: "none" } }} />

      {/* Players */}
      <Tabs.Screen name="players/dashboard" options={{ title: "Dashboard", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="players/collections" options={{ title: "Collections", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="players/collection-rock" options={{ title: "Rock collection", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="players/posts" options={{ title: "Posts", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="players/camera" options={{ title: "Camera", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="players/profile" options={{ title: "Profile", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="players/quest" options={{ title: "Quest", tabBarStyle: { display: "none" } }} />

      {/* Geologists */}
      <Tabs.Screen name="geologists/GeoHomepage" options={{ title: "Homepage", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="geologists/GeoPosts" options={{ title: "Posts", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="geologists/GeoReviewPosts" options={{ title: "Review Posts", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="geologists/GeoProfile" options={{ title: "Profile", tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="geologists/GeoNewFact" options={{ title: "New Fact", tabBarStyle: { display: "none" } }} />
    </Tabs>
  );
}
