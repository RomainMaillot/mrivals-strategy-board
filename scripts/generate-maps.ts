import { readdir } from "node:fs/promises";
import path from "node:path";
import { writeFile } from "node:fs/promises";

type MapModeKey = "convoy" | "domination";

interface MapImage {
  fileName: string;
  url: string;
}

interface MapPoint {
  pointKey: string;
  images: MapImage[];
}

interface MapEntry {
  mapKey: string;
  points: MapPoint[];
}

interface MapMode {
  modeKey: MapModeKey;
  label: string;
  maps: MapEntry[];
}

interface MapsResponse {
  modes: MapMode[];
}

const buildPublicUrl = (segments: string[]): string => `/${segments.join("/")}`;

const readDirs = async (p: string) =>
  (await readdir(p, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

const readFiles = async (p: string) =>
  (await readdir(p, { withFileTypes: true }))
    .filter((e) => e.isFile())
    .map((e) => e.name);

async function generateMaps() {
  const root = process.cwd();
  const mapsRoot = path.join(root, "public", "maps");

  const modeKeys: MapModeKey[] = ["convoy", "domination"];
  const modes: MapMode[] = [];

  for (const modeKey of modeKeys) {
    const modePath = path.join(mapsRoot, modeKey);

    let mapDirs: string[] = [];
    try {
      mapDirs = await readDirs(modePath);
    } catch {
      mapDirs = [];
    }

    const maps: MapEntry[] = [];

    for (const mapDir of mapDirs) {
      const mapPath = path.join(modePath, mapDir);
      const pointDirs = await readDirs(mapPath);

      const points: MapPoint[] = [];

      for (const pointDir of pointDirs) {
        const pointPath = path.join(mapPath, pointDir);
        const files = await readFiles(pointPath);

        const images: MapImage[] = files.map((fileName) => ({
          fileName,
          url: buildPublicUrl(["maps", modeKey, mapDir, pointDir, fileName]),
        }));

        points.push({ pointKey: pointDir, images });
      }

      maps.push({ mapKey: mapDir, points });
    }

    const label = modeKey === "convoy" ? "Convoy" : "Domination";

    modes.push({ modeKey, label, maps });
  }

  const outputPath = path.join(mapsRoot, "maps.json");
  await writeFile(outputPath, JSON.stringify({ modes }, null, 2));

  console.log("✅ public/maps/maps.json generated");
}

generateMaps();
