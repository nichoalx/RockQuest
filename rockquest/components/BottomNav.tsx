import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter, Href } from "expo-router";

type IconSpec =
  | { lib: "ion"; name: React.ComponentProps<typeof Ionicons>["name"] }
  | { lib: "mat";  name: React.ComponentProps<typeof MaterialIcons>["name"] };

export type BottomNavItem = {
  label: string;
  route: Href;               
  icon: IconSpec;
  isActive?: (pathname: string) => boolean;
};

const ACTIVE = "#A77B4E";
const INACTIVE = "#BA9B77";

function renderIcon(icon: IconSpec, size: number, color: string) {
  if (icon.lib === "ion") return <Ionicons name={icon.name} size={size} color={color} />;
  return <MaterialIcons name={icon.name} size={size} color={color} />;
}
const normalize = (p: string) =>
  p.replace(/\([^/]+\)/g, "").replace(/\/{2,}/g, "/").replace(/\/+$/, "");

function defaultMatcher(item: BottomNavItem, pathname: string) {
  const a = normalize(String(pathname));      // e.g. "/players/camera"
  const b = normalize(String(item.route));    // e.g. "/(tabs)/players/camera"
  return a === b || a.startsWith(b + "/");    // keep active on nested routes
}

const BottomNav: React.FC<{ items: BottomNavItem[] }> = ({ items }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const active = (item.isActive ?? defaultMatcher.bind(null, item))(pathname);
        const color = active ? ACTIVE : INACTIVE;
        return (
          <TouchableOpacity
            key={String(item.route)}
            style={styles.navItem}
            onPress={() => router.replace(item.route)}  // now typed with Href
            activeOpacity={0.7}
          >
            {renderIcon(item.icon, 24, color)}
            <Text style={active ? styles.navTextActive : styles.navText}>{item.label}</Text>
            <View style={[styles.indicator, active && { backgroundColor: ACTIVE }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default memo(BottomNav);

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: INACTIVE,
    fontWeight: "500",
  },
  navTextActive: {
    color: ACTIVE,
    fontWeight: "700",
  },
  indicator: {
    marginTop: 6,
    height: 3,
    width: "40%",
    borderRadius: 999,
    backgroundColor: "transparent",
  },
});