const EPSILON = 1e-12;

function orientation([ax, ay], [bx, by], [cx, cy]) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function pointOnSegment(point, start, end) {
  if (Math.abs(orientation(start, end, point)) > EPSILON) {
    return false;
  }

  return (
    point[0] >= Math.min(start[0], end[0]) - EPSILON &&
    point[0] <= Math.max(start[0], end[0]) + EPSILON &&
    point[1] >= Math.min(start[1], end[1]) - EPSILON &&
    point[1] <= Math.max(start[1], end[1]) + EPSILON
  );
}

function segmentsIntersect(firstStart, firstEnd, secondStart, secondEnd) {
  const firstSideStart = orientation(firstStart, firstEnd, secondStart);
  const firstSideEnd = orientation(firstStart, firstEnd, secondEnd);
  const secondSideStart = orientation(secondStart, secondEnd, firstStart);
  const secondSideEnd = orientation(secondStart, secondEnd, firstEnd);

  if (
    ((firstSideStart > EPSILON && firstSideEnd < -EPSILON) ||
      (firstSideStart < -EPSILON && firstSideEnd > EPSILON)) &&
    ((secondSideStart > EPSILON && secondSideEnd < -EPSILON) ||
      (secondSideStart < -EPSILON && secondSideEnd > EPSILON))
  ) {
    return true;
  }

  return (
    pointOnSegment(secondStart, firstStart, firstEnd) ||
    pointOnSegment(secondEnd, firstStart, firstEnd) ||
    pointOnSegment(firstStart, secondStart, secondEnd) ||
    pointOnSegment(firstEnd, secondStart, secondEnd)
  );
}

function pointInRing(point, ring) {
  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const start = ring[previous];
    const end = ring[index];

    if (pointOnSegment(point, start, end)) {
      return true;
    }

    const crossesLatitude = start[1] > point[1] !== end[1] > point[1];

    if (crossesLatitude) {
      const intersectionLongitude =
        ((end[0] - start[0]) * (point[1] - start[1])) / (end[1] - start[1]) + start[0];

      if (point[0] < intersectionLongitude) {
        inside = !inside;
      }
    }
  }

  return inside;
}

function pointInPolygon(point, polygonCoordinates) {
  const [exteriorRing, ...holes] = polygonCoordinates;

  if (!exteriorRing || !pointInRing(point, exteriorRing)) {
    return false;
  }

  return !holes.some((hole) => pointInRing(point, hole));
}

function lineIntersectsPolygonCoordinates(lineCoordinates, polygonCoordinates) {
  for (let lineIndex = 1; lineIndex < lineCoordinates.length; lineIndex += 1) {
    const lineStart = lineCoordinates[lineIndex - 1];
    const lineEnd = lineCoordinates[lineIndex];

    for (const ring of polygonCoordinates) {
      for (let ringIndex = 1; ringIndex < ring.length; ringIndex += 1) {
        if (segmentsIntersect(lineStart, lineEnd, ring[ringIndex - 1], ring[ringIndex])) {
          return true;
        }
      }
    }
  }

  return lineCoordinates.some((point) => pointInPolygon(point, polygonCoordinates));
}

export function lineStringIntersectsGeometry(lineCoordinates, geometry) {
  if (!Array.isArray(lineCoordinates) || lineCoordinates.length < 2 || !geometry) {
    return false;
  }

  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    return lineIntersectsPolygonCoordinates(lineCoordinates, geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.some((polygonCoordinates) =>
      lineIntersectsPolygonCoordinates(lineCoordinates, polygonCoordinates),
    );
  }

  return false;
}

export function lineStringIntersectsBbox(lineCoordinates, [south, west, north, east]) {
  const bboxRing = [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ];

  return lineStringIntersectsGeometry(lineCoordinates, {
    type: "Polygon",
    coordinates: [bboxRing],
  });
}

export function lineStringWithinBbox(lineCoordinates, [south, west, north, east]) {
  return lineCoordinates.every(
    ([lon, lat]) => lon >= west && lon <= east && lat >= south && lat <= north,
  );
}
