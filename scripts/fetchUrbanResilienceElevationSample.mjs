import { mkdir, readFile, writeFile } from "node:fs/promises";
import { collectUrbanElevationSampleEntities } from "./lib/urbanElevationSample.mjs";

const PROPERTY_FILE = new URL(
  "../public/data/urban-resilience/grand_isle_port_fourchon_properties.geojson",
  import.meta.url,
);
const FACILITY_FILE = new URL(
  "../public/data/urban-resilience/experiments/community_public_safety_facilities.geojson",
  import.meta.url,
);
const CACHE_DIR = new URL(".cache/urban-resilience/", import.meta.url);
const CACHE_FILE = new URL("grand-isle-ground-elevation-epqs.json", CACHE_DIR);
const EPQS_ENDPOINT = "https://epqs.nationalmap.gov/v1/json";
const REQUEST_UNITS = "Meters";
const REQUEST_WKID = 4326;

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function queryEpqs(longitude, latitude, retries = 3) {
  const parameters = new URLSearchParams({
    x: String(longitude),
    y: String(latitude),
    wkid: String(REQUEST_WKID),
    units: REQUEST_UNITS,
    includeDate: "true",
  });
  const requestUrl = `${EPQS_ENDPOINT}?${parameters.toString()}`;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(requestUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "agentic-cesium-digital-twin-research/1.0 (USGS 3DEP ground-elevation experiment)",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return {
        requestUrl,
        response: await response.json(),
      };
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await wait(1000 * attempt);
      }
    }
  }

  throw lastError;
}

async function main() {
  const [propertyGeoJson, facilityGeoJson] = await Promise.all([
    readJson(PROPERTY_FILE),
    readJson(FACILITY_FILE),
  ]);
  const entities = collectUrbanElevationSampleEntities(
    propertyGeoJson,
    facilityGeoJson,
  );
  const retrievalStartedAt = new Date().toISOString();
  const records = [];

  for (const entity of entities) {
    const [longitude, latitude] = entity.representativePoint.coordinates;
    process.stdout.write(`Querying ${entity.entityKey}... `);

    try {
      const result = await queryEpqs(longitude, latitude);
      records.push({
        entityKey: entity.entityKey,
        queryLongitude: longitude,
        queryLatitude: latitude,
        representativePointMethod: entity.representativePoint.method,
        retrievedAt: new Date().toISOString(),
        requestUrl: result.requestUrl,
        status: "available",
        response: result.response,
      });
      console.log("available");
    } catch (error) {
      records.push({
        entityKey: entity.entityKey,
        queryLongitude: longitude,
        queryLatitude: latitude,
        representativePointMethod: entity.representativePoint.method,
        retrievedAt: new Date().toISOString(),
        requestUrl:
          `${EPQS_ENDPOINT}?x=${longitude}&y=${latitude}` +
          `&wkid=${REQUEST_WKID}&units=${REQUEST_UNITS}&includeDate=true`,
        status: "unavailable",
        error: error instanceof Error ? error.message : String(error),
        response: null,
      });
      console.log("unavailable");
    }

    await wait(100);
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(
    CACHE_FILE,
    `${JSON.stringify(
      {
        source: "USGS 3DEP Elevation Point Query Service",
        endpoint: EPQS_ENDPOINT,
        serviceVersion: "v1",
        requestUnits: REQUEST_UNITS,
        requestWkid: REQUEST_WKID,
        retrievalStartedAt,
        retrievalCompletedAt: new Date().toISOString(),
        records,
      },
      null,
      2,
    )}\n`,
  );

  const availableCount = records.filter(
    (record) => record.status === "available",
  ).length;
  console.log(
    `Cached ${availableCount}/${records.length} available USGS EPQS results.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
