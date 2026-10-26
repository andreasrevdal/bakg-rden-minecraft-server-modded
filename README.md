# Bakgården – modded SMP

Rolig vanilla+ for Discord-serveren Bakgården. **Minecraft 1.21.1 · Fabric** · status og nedlasting på **[spill.revdal.no](https://spill.revdal.no)**.

## Installer

Last ned **[bakgarden.mrpack](https://github.com/andreasrevdal/bakg-rden-minecraft-server-modded/releases/latest/download/bakgarden.mrpack)** (alltid nyeste versjon).

- **Prism Launcher:** *Add Instance → Import* → lim inn lenken over.
- **Modrinth App:** dra fila inn i appen.

Gi spillet **6–8 GB** minne i instansens Java-innstillinger, og koble til `modded.revdal.no`.

## Automatisk oppdatering (Prism)

Gjør dette én gang, så henter spillet nye mods selv hver gang du starter. Innstillinger, shaders, teksturpakker og kart blir liggende.

1. Høyreklikk instansen → *Edit* → *Settings* → fanen *Custom commands*.
2. Huk av for *Custom commands* og lim inn dette som **Pre-launch command**:

   ```
   "$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/andreasrevdal/bakg-rden-minecraft-server-modded/main/packwiz/pack.toml
   ```

3. Start spillet. Et lite vindu viser at mods sjekkes og lastes ned før Minecraft åpner.

Krever pakken fra v1.0.5 eller nyere (den har med `packwiz-installer-bootstrap.jar`).

## Oppdater manuelt (Modrinth App eller uten auto-oppdatering)

Du må ha samme versjon som serveren. Ny versjon = ny instans, så flytt over det som er ditt:

1. Importer den nye `.mrpack`-en som en **ny** instans (samme lenke som over).
2. Åpne mappa til den gamle instansen (Prism: høyreklikk → *Folder*; Modrinth App: ⋯ → *Open folder*) og kopier disse inn i den nye instansens `minecraft`-mappe:

   | Kopier | Hva det er |
   |---|---|
   | `options.txt` | Taster, grafikk, lyd |
   | `config/iris.properties` | Hvilken shader som er på |
   | `shaderpacks/`, `resourcepacks/` | Shaders og teksturpakker (også de fra Resourcify) |
   | `xaero/` | Minimap, verdenskart og waypoints |
   | `servers.dat`, `screenshots/` | Serverliste og skjermbilder |

3. Sett minnet (6–8 GB) på nytt i den nye instansen, start, og slett den gamle når alt ser riktig ut.

Ikke kopier `mods/` eller resten av `config/` – det er det som kommer nytt med oppdateringen.

## Mods

| Kategori | Mods |
|---|---|
| Progresjon | TieredZ, Artifacts + Trinkets, Bosses of Mass Destruction, Lootr, Bountiful, Simply Swords, Immersive Armors, Advanced Netherite, Enhanced Celestials |
| Mat og farming | Farmer's Delight + More Delight, Let's Do Vinery + Farm & Charm, Serene Seasons, Spice of Fabric, AppleSkin |
| Dyr og mobs | Naturalist, Friends & Foes, Critters and Companions, Creeper Overhaul |
| Bygging | Macaw's (møbler, tak, vinduer, dører, broer, gjerder), Handcrafted, Supplementaries, Rechiseled, Immersive Paintings |
| Verktøy | Traveler's Backpack, Carry On, Waystones, Comforts, FallingTree, Ore Vein Miner, Leaves Be Gone, Iron Chests, Extended Drawers, Tom's Simple Storage, Immersive Aircraft, Universal Graves, Trade Cycling |
| Verden | Tectonic + Terralith, BetterNether, Nullscape + Enderscape (End), YUNG's Dungeons/Mineshafts/Strongholds, Dungeons and Taverns, Towns and Towers, Explorify |
| Sosialt | Simple Voice Chat, Open Parties and Claims, Essential Commands (`/home`, `/tpa`, `/spawn`, `/back`) |
| Ytelse / QoL | Sodium, Iris, Lithium, FerriteCore, ModernFix, EntityCulling, ImmediatelyFast, Dynamic FPS, Jade, EMI, Xaero's Minimap/World Map, Zoomify, Resourcify (finn teksturpakker og shaders i spillet) |

Full liste med versjoner: [`pack/modrinth.index.json`](pack/modrinth.index.json).

## Bygg pakken selv

```bash
node scripts/build.mjs            # dist/bakgarden.mrpack
node scripts/build.mjs --update   # hent nyeste versjoner fra pack/mods.json
node scripts/build.mjs --server   # + serverfiler i dist/server/
node scripts/check.mjs            # sjekk avhengigheter/konflikter som Fabric gjør
```
