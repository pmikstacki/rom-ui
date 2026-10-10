/** Disclosed host records only. No ROM discovery, query, codec or mutation work. */
export interface MapResourcePoint {
  readonly id: string;
  readonly title: string;
  readonly longitude: number;
  readonly latitude: number;
}

export function captureMapResources(
  points: readonly MapResourcePoint[],
  maxPoints = 200,
): readonly Readonly<MapResourcePoint>[] {
  if (
    !Number.isSafeInteger(maxPoints) ||
    maxPoints < 1 ||
    !Array.isArray(points) ||
    points.length > maxPoints
  )
    throw new RangeError("Map resource limit exceeded or invalid");
  const ids = new Set<string>();
  return Object.freeze(
    points.map((point) => {
      if (
        !point ||
        typeof point !== "object" ||
        typeof point.id !== "string" ||
        !point.id ||
        typeof point.title !== "string"
      )
        throw new TypeError("Invalid map resource identity");
      if (ids.has(point.id))
        throw new TypeError("Duplicate map resource identity");
      if (
        !Number.isFinite(point.longitude) ||
        !Number.isFinite(point.latitude) ||
        Math.abs(point.longitude) > 180 ||
        Math.abs(point.latitude) > 90
      )
        throw new TypeError("Invalid map resource coordinates");
      ids.add(point.id);
      return Object.freeze({
        id: point.id,
        title: point.title,
        longitude: point.longitude,
        latitude: point.latitude,
      });
    }),
  );
}
