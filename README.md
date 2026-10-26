# Bakgården – modded SMP

Rolig vanilla+ for Discord-serveren Bakgården. **Minecraft 1.21.1 · Fabric** · status og nedlasting på **[spill.revdal.no](https://spill.revdal.no)**.

## Installer

Last ned **[bakgarden.mrpack](https://github.com/andreasrevdal/bakg-rden-minecraft-server-modded/releases/latest/download/bakgarden.mrpack)** (alltid nyeste versjon).

- **Prism Launcher:** *Add Instance → Import* → lim inn lenken over.
- **Modrinth App:** dra fila inn i appen.

Gi spillet **6–8 GB** minne i instansens Java-innstillinger, og koble til `modded.revdal.no`. Ny versjon? Importer på nytt – du må ha samme versjon som serveren.

## Mods

| Kategori | Mods |
|---|---|
| Progresjon | TieredZ, Artifacts + Trinkets, Bosses of Mass Destruction, Lootr, Bountiful, Simply Swords, Immersive Armors, Enhanced Celestials |
| Mat og farming | Farmer's Delight + More Delight, Let's Do Vinery + Farm & Charm, Serene Seasons, Spice of Fabric, AppleSkin |
| Dyr og mobs | Naturalist, Friends & Foes, Critters and Companions, Creeper Overhaul |
| Bygging | Macaw's (møbler, tak, vinduer, dører, broer, gjerder), Handcrafted, Supplementaries, Rechiseled, Immersive Paintings |
| Verktøy | Traveler's Backpack, Carry On, Waystones, Comforts, FallingTree, Iron Chests, Tom's Simple Storage, Immersive Aircraft, Universal Graves, Trade Cycling |
| Verden | Tectonic + Terralith, BetterNether, Nullscape (End), YUNG's Dungeons/Mineshafts/Strongholds, Dungeons and Taverns, Towns and Towers, Explorify |
| Sosialt | Simple Voice Chat, Open Parties and Claims |
| Ytelse / QoL | Sodium, Iris, Lithium, FerriteCore, ModernFix, EntityCulling, ImmediatelyFast, Dynamic FPS, Jade, EMI, Xaero's Minimap/World Map, Zoomify |

Full liste med versjoner: [`pack/modrinth.index.json`](pack/modrinth.index.json).

## Bygg pakken selv

```bash
node scripts/build.mjs            # dist/bakgarden.mrpack
node scripts/build.mjs --update   # hent nyeste versjoner fra pack/mods.json
node scripts/build.mjs --server   # + serverfiler i dist/server/
node scripts/check.mjs            # sjekk avhengigheter/konflikter som Fabric gjør
```
