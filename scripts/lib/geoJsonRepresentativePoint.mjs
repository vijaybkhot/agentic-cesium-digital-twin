const EPSILON = 1e-12;

function nearlyEqual(first, second) {
  return Math.abs(first - second) <= EPSILON;
}

function pointOnSegment([x, y], [startX, startY], [endX, endY]) {
  const cross = (x - startX) * (endY - startY) - (y - startY) * (endX - startX);

  if (Math.abs(cross) > EPSILON) {
    return false;
  }

  return (
    x >= Math.min(startX, endX) - EPSILON &&
    x <= Math.max(startX, endX) + EPSILON &&
    y >= Math.min(startY, endY) - EPSILON &&
    y <= Math.max(startY, endY) + EPSILON
  );
}

function pointInRing(point, ring, includeBoundary = true) {
  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const start = ring[previous];
    const end = ring[index];

    if (pointOnSegment(point, start, end)) {
      return includeBoundary;
    }

    const crossesLatitude = start[1] > point[1] !== end[1] > point[1];

    if (crossesLatitude) {
      const crossingLongitude =
        ((end[0] - start[0]) * (point[1] - start[1])) /
          (end[1] - start[1]) +
        start[0];

      if (point[0] < crossingLongitude) {
        inside = !inside;
      }
    }
  }

  return inside;
}

function pointInPolygon(point, rings) {
  const [exteriorRing, ...holes] = rings;

  if (!exteriorRing || !pointInRing(point, exteriorRing, true)) {
    return false;
  }

  return !holes.some((hole) => pointInRing(point, hole, true));
}

function ringAreaCentroid(ring) {
  const [originLongitude, originLatitude] = ring[0];
  let twiceArea = 0;
  let longitudeSum = 0;
  let latitudeSum = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const startLongitude = ring[index][0] - originLongitude;
    const startLatitude = ring[index][1] - originLatitude;
    const endLongitude = ring[index + 1][0] - originLongitude;
    const endLatitude = ring[index + 1][1] - originLatitude;
    const cross = startLongitude * endLatitude - endLongitude * startLatitude;
    twiceArea += cross;
    longitudeSum += (startLongitude + endLongitude) * cross;
    latitudeSum += (startLatitude + endLatitude) * cross;
  }

  if (Math.abs(twiceArea) <= EPSILON) {
    return null;
  }

  return {
    area: twiceArea / 2,
    point: [
      longitudeSum / (3 * twiceArea) + originLongitude,
      latitudeSum / (3 * twiceArea) + originLatitude,
    ],
  };
}

function polygonAreaCentroid(rings) {
  let weightedLongitude = 0;
  let weightedLatitude = 0;
  let totalWeight = 0;

  rings.forEach((ring, index) => {
    const result = ringAreaCentroid(ring);

    if (!result) {
      return;
    }

    const weight = index === 0 ? Math.abs(result.area) : -Math.abs(result.area);
    weightedLongitude += result.point[0] * weight;
    weightedLatitude += result.point[1] * weight;
    totalWeight += weight;
  });

  if (Math.abs(totalWeight) <= EPSILON) {
    return null;
  }

  return [weightedLongitude / totalWeight, weightedLatitude / totalWeight];
}

function longitudeIntersectionsAtLatitude(rings, latitude) {
  const intersections = [];

  rings.forEach((ring) => {
    for (let index = 0; index < ring.length - 1; index += 1) {
      const start = ring[index];
      const end = ring[index + 1];

      if ((start[1] > latitude) === (end[1] > latitude)) {
        continue;
      }

      intersections.push(
        start[0] +
          ((latitude - start[1]) * (end[0] - start[0])) /
            (end[1] - start[1]),
      );
    }
  });

  return intersections.sort((first, second) => first - second);
}

function pointOnPolygonSurface(rings) {
  const exteriorRing = rings[0];
  const latitudes = exteriorRing.map((position) => position[1]);
  const minimumLatitude = Math.min(...latitudes);
  const maximumLatitude = Math.max(...latitudes);
  const span = maximumLatitude - minimumLatitude;

  if (!Number.isFinite(span) || span <= EPSILON) {
    return null;
  }

  let bestCandidate = null;
  let bestWidth = -1;

  for (let index = 0; index < 64; index += 1) {
    const latitude = minimumLatitude + ((index + 0.5) / 64) * span;
    const intersections = longitudeIntersectionsAtLatitude(rings, latitude);

    for (let pairIndex = 0; pairIndex + 1 < intersections.length; pairIndex += 2) {
      const startLongitude = intersections[pairIndex];
      const endLongitude = intersections[pairIndex + 1];
      const candidate = [(startLongitude + endLongitude) / 2, latitude];
      const width = endLongitude - startLongitude;

      if (width > bestWidth && pointInPolygon(candidate, rings)) {
        bestCandidate = candidate;
        bestWidth = width;
      }
    }
  }

  return bestCandidate;
}

function validateCoordinate(position) {
  return (
    Array.isArray(position) &&
    position.length >= 2 &&
    Number.isFinite(position[0]) &&
    Number.isFinite(position[1]) &&
    position[0] >= -180 &&
    position[0] <= 180 &&
    position[1] >= -90 &&
    position[1] <= 90
  );
}

export function pointIntersectsGeoJsonGeometry(point, geometry) {
  if (!validateCoordinate(point) || !geometry) {
    return false;
  }

  if (geometry.type === "Point") {
    return (
      validateCoordinate(geometry.coordinates) &&
      nearlyEqual(point[0], geometry.coordinates[0]) &&
      nearlyEqual(point[1], geometry.coordinates[1])
    );
  }

  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    return pointInPolygon(point, geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.some((rings) => pointInPolygon(point, rings));
  }

  return false;
}

function representativePointForPolygon(rings) {
  const centroid = polygonAreaCentroid(rings);

  if (centroid && pointInPolygon(centroid, rings)) {
    return {
      coordinates: centroid,
      method: "area-centroid-inside",
    };
  }

  const surfacePoint = pointOnPolygonSurface(rings);

  if (!surfacePoint || !pointInPolygon(surfacePoint, rings)) {
    throw new Error("Unable to calculate an inside-footprint representative point.");
  }

  return {
    coordinates: surfacePoint,
    method: "point-on-surface-fallback",
  };
}

export function representativePointForGeometry(geometry) {
  if (!geometry || typeof geometry !== "object") {
    throw new Error("A valid GeoJSON geometry is required.");
  }

  if (geometry.type === "Point" && validateCoordinate(geometry.coordinates)) {
    return {
      coordinates: [...geometry.coordinates.slice(0, 2)],
      method: "source-point",
    };
  }

  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    return representativePointForPolygon(geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    const candidates = geometry.coordinates.map((rings) => ({
      rings,
      area: Math.abs(ringAreaCentroid(rings[0])?.area ?? 0),
    }));
    const largestPolygon = candidates.sort((first, second) => second.area - first.area)[0];

    if (largestPolygon) {
      const result = representativePointForPolygon(largestPolygon.rings);
      return {
        ...result,
        method: `${result.method}-largest-polygon`,
      };
    }
  }

  throw new Error(`Unsupported or invalid GeoJSON geometry type: ${geometry.type ?? "Unknown"}`);
}
