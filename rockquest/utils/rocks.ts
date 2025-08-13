// src/utils/rocks.ts
export type RockClass =
  | "Basalt" | "Conglomerate" | "Dolerite" | "Gneiss" | "Granite" | "Limestone"
  | "Mudstone" | "Norite" | "Quartzite" | "Sandstone" | "Schist" | "Shale" | "Tuff";

// 1) Local images packed with the app:
export const rockImages: Record<RockClass, any> = {
  Basalt: require("@/assets/images/rocks/Basalt.png"),
  Conglomerate: require("@/assets/images/rocks/Conglomerate.png"),
  Dolerite: require("@/assets/images/rocks/Dolerite.png"),
  Gneiss: require("@/assets/images/rocks/Gneiss.png"),
  Granite: require("@/assets/images/rocks/Granite.png"),
  Limestone: require("@/assets/images/rocks/Limestone.jpg"), // note: your file is .jpg
  Mudstone: require("@/assets/images/rocks/Mudstone.png"),
  Norite: require("@/assets/images/rocks/Norite.png"),
  Quartzite: require("@/assets/images/rocks/Quartzite.png"),
  Sandstone: require("@/assets/images/rocks/Sandstone.png"),
  Schist: require("@/assets/images/rocks/Schist.png"),
  Shale: require("@/assets/images/rocks/Shale.png"),
  Tuff: require("@/assets/images/rocks/Tuff.png"),
};

// 2) Quick metadata store.
// For now, fill these from your CSV. (Later you can generate this file from the CSV in a script.)
export const rockMeta: Record<RockClass, { type: "igneous"|"sedimentary"|"metamorphic"; description: string }> = {
  Basalt:       { type: "igneous",     description: "..." },
  Conglomerate: { type: "sedimentary", description: "..." },
  Dolerite:     { type: "igneous",     description: "..." },
  Gneiss:       { type: "metamorphic", description: "..." },
  Granite:      { type: "igneous",     description: "..." },
  Limestone:    { type: "sedimentary", description: "..." },
  Mudstone:     { type: "sedimentary", description: "..." },
  Norite:       { type: "igneous",     description: "..." },
  Quartzite:    { type: "metamorphic", description: "..." },
  Sandstone:    { type: "sedimentary", description: "..." },
  Schist:       { type: "metamorphic", description: "..." },
  Shale:        { type: "sedimentary", description: "..." },
  Tuff:         { type: "igneous",     description: "..." },
};

// helper
export const isKnownClass = (label?: string): label is RockClass =>
  !!label && (label as RockClass) in rockImages;
