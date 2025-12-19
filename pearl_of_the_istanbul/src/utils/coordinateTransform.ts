import proj4 from 'proj4';

// EPSG:5254 - TUREF / TM30 koordinat sistemi tanımı
const EPSG5254 = '+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

// EPSG:4326 - WGS84 (standart lat/lng)
const EPSG4326 = 'EPSG:4326';

// Koordinat dönüşümünü tanımla
proj4.defs('EPSG:5254', EPSG5254);

// Type definitions
type Coordinate = [number, number];
type CoordinateArray = Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][];

interface Geometry {
  type: string;
  coordinates: CoordinateArray;
}

interface Feature {
  type: string;
  properties: Record<string, unknown>;
  geometry: Geometry;
}

interface GeoJSON {
  type: string;
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: Feature[];
}

/**
 * EPSG:5254 (TUREF) koordinatlarını EPSG:4326 (WGS84) koordinatlarına dönüştürür
 * @param x - TUREF X koordinatı (easting)
 * @param y - TUREF Y koordinatı (northing)
 * @returns [longitude, latitude] dizisi
 */
export const transformCoordinate = (x: number, y: number): [number, number] => {
  const [lng, lat] = proj4('EPSG:5254', EPSG4326, [x, y]);
  return [lng, lat];
};

/**
 * GeoJSON geometrisini EPSG:5254'ten EPSG:4326'ya dönüştürür
 * @param geometry - GeoJSON geometry objesi
 * @returns Dönüştürülmüş geometry objesi
 */
export const transformGeometry = (geometry: Geometry): Geometry => {
  if (!geometry) return geometry;

  const transformCoordinates = (coords: CoordinateArray): CoordinateArray => {
    // Tek bir koordinat çifti [x, y]
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return transformCoordinate(coords[0], coords[1]);
    }
    
    // Koordinat dizisi
    return (coords as unknown[]).map((coord) => transformCoordinates(coord as CoordinateArray)) as CoordinateArray;
  };

  return {
    ...geometry,
    coordinates: transformCoordinates(geometry.coordinates)
  };
};

/**
 * Tüm GeoJSON FeatureCollection'ı dönüştürür
 * @param geojson - GeoJSON FeatureCollection
 * @returns Dönüştürülmüş GeoJSON
 */
export const transformGeoJSON = (geojson: GeoJSON): GeoJSON => {
  if (!geojson || geojson.type !== 'FeatureCollection') {
    console.error('Geçersiz GeoJSON formatı');
    return geojson;
  }

  return {
    ...geojson,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features: geojson.features.map((feature) => ({
      ...feature,
      geometry: transformGeometry(feature.geometry)
    }))
  };
};
