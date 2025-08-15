export type RockClass =
  | "Basalt" | "Conglomerate" | "Dolerite" | "Gneiss" | "Granite" | "Limestone"
  | "Mudstone" | "Norite" | "Quartzite" | "Sandstone" | "Schist" | "Shale" | "Tuff";


export const rockImages: Record<RockClass, any> = {
  Basalt: require("@/assets/images/rocks/Basalt.png"),
  Conglomerate: require("@/assets/images/rocks/Conglomerate.png"),
  Dolerite: require("@/assets/images/rocks/Dolerite.png"),
  Gneiss: require("@/assets/images/rocks/Gneiss.png"),
  Granite: require("@/assets/images/rocks/Granite.png"),
  Limestone: require("@/assets/images/rocks/Limestone.png"), 
  Mudstone: require("@/assets/images/rocks/Mudstone.png"),
  Norite: require("@/assets/images/rocks/Norite.png"),
  Quartzite: require("@/assets/images/rocks/Quartzite.png"),
  Sandstone: require("@/assets/images/rocks/Sandstone.png"),
  Schist: require("@/assets/images/rocks/Schist.png"),
  Shale: require("@/assets/images/rocks/Shale.png"),
  Tuff: require("@/assets/images/rocks/Tuff.png"),
};


export const rockMeta: Record<RockClass, { type: "igneous"|"sedimentary"|"metamorphic"; description: string }> = {
  Basalt:       { type: "igneous",     description: "Basalt is an igneous rock characterized by fine-grained extrusive rock rich in iron and magnesium (mafic), formed from rapid cooling lava; dark in color. Commonly formed through the cooling and solidification of magma or lava, it exhibits distinct mineral textures that aid in identification."},
  Conglomerate: { type: "sedimentary", description: "Conglomerate is a sedimentary rock composed of clastic sedimentary rock composed of rounded gravel- to boulder-size clasts cemented in a finer matrix. It typically forms through the accumulation, compaction, and cementation of sediments, often preserving visible layers or fossils."},
  Dolerite:     { type: "igneous",     description: "Dolerite is an igneous rock characterized by medium-grained intrusive equivalent of basalt (also called diabase), coarse version of basalt. Commonly formed through the cooling and solidification of magma or lava, it exhibits distinct mineral textures that aid in identification."},
  Gneiss:       { type: "metamorphic", description: "Gneiss is a metamorphic rock defined by high-grade metamorphic rock with characteristic alternating light and dark foliation (gneissic banding). It develops under high pressure and temperature conditions, leading to recrystallization and distinct foliation or banding."},
  Granite:      { type: "igneous",     description: "Granite is an igneous rock characterized by coarse-grained intrusive rock composed mainly of quartz and feldspar; high silica (felsic). Commonly formed through the cooling and solidification of magma or lava, it exhibits distinct mineral textures that aid in identification."},
  Limestone:    { type: "sedimentary", description: "Limestone is a sedimentary rock composed of common sedimentary rock mostly of calcium carbonate (calcite or aragonite), often containing fossils. It typically forms through the accumulation, compaction, and cementation of sediments, often preserving visible layers or fossils."},
  Mudstone:     { type: "sedimentary", description: "Mudstone is a sedimentary rock composed of fine-grained clastic sedimentary rock formed from compacted silt and clay. It typically forms through the accumulation, compaction, and cementation of sediments, often preserving visible layers or fossils."},
  Norite:       { type: "igneous",     description: "Norite is an igneous rock characterized by coarse-grained mafic intrusive rock similar to gabbro, composed primarily of orthopyroxene and plagioclase. Commonly formed through the cooling and solidification of magma or lava, it exhibits distinct mineral textures that aid in identification."},
  Quartzite:    { type: "metamorphic", description: "Quartzite is a metamorphic rock defined by hard, non-foliated metamorphic rock formed from quartz sandstone recrystallized under heat and pressure. It develops under high pressure and temperature conditions, leading to recrystallization and distinct foliation or banding."},
  Sandstone:    { type: "sedimentary", description: "Sandstone is a sedimentary rock composed of clastic sedimentary rock composed of sand-sized grains, typically quartz, cemented together . It typically forms through the accumulation, compaction, and cementation of sediments, often preserving visible layers or fossils."},
  Schist:       { type: "metamorphic", description: "Schist is a metamorphic rock defined by medium-to-high-grade metamorphic rock with pronounced foliation and visible platy minerals. It develops under high pressure and temperature conditions, leading to recrystallization and distinct foliation or banding."},
  Shale:        { type: "sedimentary", description: "Shale is a sedimentary rock composed of very fine-grained clastic rock formed from mud; fissile along bedding planes. It typically forms through the accumulation, compaction, and cementation of sediments, often preserving visible layers or fossils."},
  Tuff:         { type: "igneous",     description: "Tuff is an igneous rock characterized by pyroclastic igneous rock formed by the lithification of volcanic ash. Commonly formed through the cooling and solidification of magma or lava, it exhibits distinct mineral textures that aid in identification."},
};

// helper
export const isKnownClass = (label?: string): label is RockClass =>
  !!label && (label as RockClass) in rockImages;
