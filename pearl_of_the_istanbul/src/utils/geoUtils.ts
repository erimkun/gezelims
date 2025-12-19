/**
 * Geo Utilities
 * Geographic calculation and validation utilities
 */

export type Coordinate = [number, number]; // [lng, lat]

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate [lng, lat]
 * @param coord2 Second coordinate [lng, lat]
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  coord1: Coordinate,
  coord2: Coordinate
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[1] * Math.PI) / 180) *
      Math.cos((coord2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Format distance to human-readable string
 * @param kilometers Distance in kilometers
 * @returns Formatted string (e.g., "150m" or "2.5km")
 */
export const formatDistance = (kilometers: number): string => {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  }
  return `${kilometers.toFixed(1)}km`;
};

/**
 * Check if coordinate is valid
 * @param coord Coordinate to validate
 * @returns true if valid
 */
export const isValidCoordinate = (coord: Coordinate): boolean => {
  const [lng, lat] = coord;
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90 &&
    !isNaN(lng) &&
    !isNaN(lat)
  );
};

/**
 * Check if point is inside bounding box
 * @param point Point coordinate
 * @param bbox Bounding box {minLng, maxLng, minLat, maxLat}
 * @returns true if inside
 */
export const isPointInBounds = (
  point: Coordinate,
  bbox: { minLng: number; maxLng: number; minLat: number; maxLat: number }
): boolean => {
  const [lng, lat] = point;
  return (
    lng >= bbox.minLng &&
    lng <= bbox.maxLng &&
    lat >= bbox.minLat &&
    lat <= bbox.maxLat
  );
};

/**
 * Get center point of multiple coordinates
 * @param coordinates Array of coordinates
 * @returns Center coordinate
 */
export const getCenterPoint = (coordinates: Coordinate[]): Coordinate => {
  if (coordinates.length === 0) {
    throw new Error('No coordinates provided');
  }

  const sum = coordinates.reduce(
    (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
    [0, 0] as Coordinate
  );

  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
};

/**
 * Convert meters to kilometers
 * @param meters Distance in meters
 * @returns Distance in kilometers
 */
export const metersToKilometers = (meters: number): number => {
  return meters / 1000;
};

/**
 * Convert kilometers to meters
 * @param kilometers Distance in kilometers
 * @returns Distance in meters
 */
export const kilometersToMeters = (kilometers: number): number => {
  return kilometers * 1000;
};
