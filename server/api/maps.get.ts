import { readdir } from "node:fs/promises";
import path from "node:path";

type MapModeKey = "convoy" | "domination";

interface MapImage {
  /** File name, e.g. 1st-phase.png */
  fileName: string;
  /** Public URL path, e.g. /maps/convoy/arakko/1st-point/1st-phase.png */
  url: string;
}

interface MapPoint {
  /** Directory name for the point, e.g. 1st-point */
  pointKey: string;
  /** List of image files for this point */
  images: MapImage[];
}

interface MapEntry {
  /** Directory name for the map, e.g. arakko */
  mapKey: string;
  /** Points contained in this map */
  points: MapPoint[];
}

interface MapMode {
  /** Mode key (convoy or domination) */
  modeKey: MapModeKey;
  /** Human readable label */
  label: string;
  /** Maps available for this mode */
  maps: MapEntry[];
}

interface MapsResponse {
  modes: MapMode[];
}

/**
 * Utility to create the public URL for an image based on path segments.
 */
const buildPublicUrl = (segments: string[]): string => {
  return `/${segments.join("/")}`;
};

/**
 * Read the directory at the given path and return only subdirectories.
 */
const readSubDirectories = async (absolutePath: string): Promise<string[]> => {
  const dirents = await readdir(absolutePath, { withFileTypes: true });
  return dirents
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
};

/**
 * Read the directory at the given path and return only file names.
 */
const readFiles = async (absolutePath: string): Promise<string[]> => {
  const dirents = await readdir(absolutePath, { withFileTypes: true });
  return dirents.filter((entry) => entry.isFile()).map((entry) => entry.name);
};

export default defineEventHandler(async (): Promise<MapsResponse> => {
  const root = process.cwd();
  const mapsRoot = path.join(root, "public", "maps");

  const modeKeys: MapModeKey[] = ["convoy", "domination"];

  const modes: MapMode[] = [];

  for (const modeKey of modeKeys) {
    const modePath = path.join(mapsRoot, modeKey);
    let mapDirs: string[] = [];

    try {
      mapDirs = await readSubDirectories(modePath);
    } catch {
      // If the directory does not exist we silently skip this mode
      mapDirs = [];
    }

    const maps: MapEntry[] = [];

    for (const mapDir of mapDirs) {
      const mapPath = path.join(modePath, mapDir);
      const pointDirs = await readSubDirectories(mapPath);

      const points: MapPoint[] = [];

      for (const pointDir of pointDirs) {
        const pointPath = path.join(mapPath, pointDir);
        const files = await readFiles(pointPath);

        const images: MapImage[] = files.map((fileName) => ({
          fileName,
          url: buildPublicUrl(["maps", modeKey, mapDir, pointDir, fileName]),
        }));

        points.push({
          pointKey: pointDir,
          images,
        });
      }

      maps.push({
        mapKey: mapDir,
        points,
      });
    }

    const label = modeKey === "convoy" ? "Convoy" : "Domination";

    modes.push({
      modeKey,
      label,
      maps,
    });
  }

  return {
    modes,
  };
});
