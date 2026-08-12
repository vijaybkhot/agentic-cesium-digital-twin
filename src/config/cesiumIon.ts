export function getCesiumIonAccessToken(): string | null {
  const accessToken = import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN?.trim();

  return accessToken ? accessToken : null;
}

export function hasCesiumIonAccessToken(): boolean {
  return getCesiumIonAccessToken() !== null;
}

export function isUrbanOsmBuildingsEnabled(): boolean {
  return (
    import.meta.env.VITE_ENABLE_URBAN_OSM_BUILDINGS?.trim().toLowerCase() ===
    "true"
  );
}
