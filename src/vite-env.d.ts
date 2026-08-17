/// <reference types="vite/client" />

declare const CESIUM_BASE_URL: string;

interface Window {
  CESIUM_BASE_URL: string;
}

interface ImportMetaEnv {
  readonly VITE_CESIUM_ION_ACCESS_TOKEN?: string;
  readonly VITE_ENABLE_URBAN_OSM_BUILDINGS?: string;
  readonly VITE_ARCGIS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
