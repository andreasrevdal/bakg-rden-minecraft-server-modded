# Bakgården – modded SMP

Rolig vanilla+ server for Discord-serveren Bakgården. **Minecraft 1.21.1 · Fabric** (~100 mods).

1.21.1 er valgt fordi TieredZ bare finnes for Fabric 1.20.1/1.21.1, og 1.21.1 er versjonen der nesten alle modsene finnes.

## For spillere – installer pakken

Last ned **[bakgarden.mrpack](https://github.com/andreasrevdal/bakg-rden-minecraft-server-modded/releases/latest/download/bakgarden.mrpack)** (alltid nyeste versjon).

- **Prism Launcher:** *Add Instance → Import* → lim inn lenken over (eller velg fila). Sett minne til **6–8 GB** under *Settings → Java*.
- **Modrinth App:** dra `.mrpack`-fila inn i appen (eller *+ → Import*). Sett minne under instansens *Settings → Java and memory*.

Ny versjon av pakken? Importer den nye fila (Prism: høyreklikk instans → *Edit → Version*… enklest er å importere på nytt og flytte `saves/`/`options.txt` om du vil).

## Hva er med

| Kategori | Mods |
|---|---|
| Progresjon ("dra tilbake") | TieredZ (reforging), Artifacts + Trinkets, Bosses of Mass Destruction, Lootr (egen loot per spiller), Bountiful (oppdragstavler), Simply Swords, Immersive Armors, Enhanced Celestials (blodmåne/høstmåne) |
| Mat og farming | Farmer's Delight + More Delight, Let's Do Vinery + Farm & Charm, Serene Seasons (årstider), Spice of Fabric (varier maten), AppleSkin |
| Dyr og mobs | Naturalist, Friends & Foes, Critters and Companions, Creeper Overhaul |
| Bygging | Macaw's (møbler, tak, vinduer, dører, broer, gjerder), Handcrafted, Supplementaries, Rechiseled, Immersive Paintings |
| Verktøy / småtech | Traveler's Backpack, Carry On, Waystones, Comforts, FallingTree, Iron Chests, Tom's Simple Storage, Immersive Aircraft, Universal Graves, Trade Cycling |
| Verden | Tectonic + Terralith, BetterNether, BetterEnd, YUNG's Dungeons/Mineshafts/Strongholds, Dungeons and Taverns, Towns and Towers, Explorify |
| Sosialt | Simple Voice Chat, Open Parties and Claims, Discord MC Chat |
| Admin | LuckPerms, spark, Ledger (logg + rollback), Essential Commands, Chunky, BlueMap |
| Ytelse / QoL | Lithium, C2ME, FerriteCore, ModernFix, Krypton, Sodium, Iris, EntityCulling, ImmediatelyFast, Dynamic FPS, Jade, EMI, Xaero's Minimap/World Map, Zoomify |

Ikke med: **Iron Furnaces** og **Create** finnes ikke for Fabric 1.21.1.

## Plugins?

Nei – Fabric kjører ikke Bukkit/Paper-plugins (hybrid-servere som Arclight/Mohist er ustabile, unngå). Det som vanligvis er plugins er her server-mods: LuckPerms (rettigheter), Ledger (CoreProtect-erstatning), Essential Commands (`/home`, `/tpa`, `/spawn`), Open Parties and Claims (claims), BlueMap (webkart), Discord MC Chat. Server-mods som ikke trengs på klienten kan legges til i `pack/mods.json` uten at spillerne må oppdatere.

## Server på Pelican (gp2.lun.gg)

### Ressurser

| | Anbefalt | Minimum |
|---|---|---|
| RAM | **8 GB** | 6 GB |
| CPU | **3–4 kjerner** (høy single-core-hastighet er viktigst) | 2 |
| Disk | **40 GB** (forhåndsgenerert verden + backups) | 20 GB |

Java-heap bør være ~1–1,5 GB under containerens grense (Java bruker minne utenfor heapen). Hvis startup-kommandoen har `-XX:MaxRAMPercentage=95.0`, senk den til `85.0` hvis du kan redigere den.

### Første oppsett

1. Lag serveren med **Fabric**-egget, Minecraft-versjon **1.21.1**, loader **0.20.1**, Java **21**-image.
2. Start én gang så filene lages, stopp den, og godta EULA.
3. På PC-en din: `node scripts/build.mjs --server` → lager `dist/server/` (mods + config).
4. Last opp innholdet i `dist/server/` til serverens rotmappe via **SFTP** (detaljer under *Settings → SFTP* i panelet; f.eks. WinSCP/FileZilla). Slett gammel `mods/` først ved oppdatering.
5. Start serveren. Sett deg selv som op i konsollen: `op <navn>` og `whitelist add <navn>`.

Voice chat bruker samme port som Minecraft (UDP), så ingen ekstra port trengs. **BlueMap** trenger en ekstra port (be om allocation i panelet, sett den i `config/bluemap/webserver.conf` og `accept-download: true` i `config/bluemap/core.conf`). **Discord MC Chat** trenger en bot-token i `config/discord-mc-chat/` – fjern den fra `pack/mods.json` hvis dere ikke vil ha chat-bro.

### Forhåndsgenerer verden (Chunky)

Gjør dette før spillerne kommer – det tar noen timer, men fjerner lagg når folk utforsker.

```
worldborder set 10000
chunky radius 5000
chunky start
```

Deretter Nether og End (`chunky world minecraft:the_nether`, `chunky radius 1500`, `chunky start` – samme for `minecraft:the_end`). Følg med med `chunky progress`, og sjekk ytelse med `spark tps`.

### Backups

Bruk panelets **Backups**-fane (planlegg daglig under *Schedules*). Ta alltid backup før du oppdaterer mods.

## Endre/oppdatere modpakken

1. Rediger `pack/mods.json` (Modrinth-slugs, dvs. siste del av mod-URLen).
2. `node scripts/build.mjs --update` – henter nyeste versjoner + avhengigheter og låser dem i `pack/modrinth.index.json`.
3. Øk `version` i `mods.json`, commit, og lag en tag: `git tag v1.0.1 && git push --tags`. GitHub Actions lager en Release med ny `.mrpack`, og lenken øverst peker automatisk dit.
4. Bygg serverfiler på nytt (`--server`) og last opp.

Klient og server **må** ha samme versjon av pakken.

Configfiler som skal med til både klient og server legges i `pack/overrides/config/`; kun-server-filer i `server/`.

MOTD-en ligger i `server/config/MiniMOTD/main.conf`. Serverikonet legges som `server/server-icon.png` (64×64 PNG). Det vises også automatisk på spill.revdal.no.
