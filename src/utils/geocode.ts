const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type BigDataCloudResponse = {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
  localityInfo?: {
    administrative?: Array<{
      name?: string;
      order?: number;
    }>;
  };
};

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results?: Array<{
    formatted_address?: string;
  }>;
};

const geocodeCache = new Map<string, string>();

function isValidCoordinate(value: number) {
  return typeof value === 'number' && Number.isFinite(value);
}

function getCacheKey(lat: number, lon: number) {
  return `${lat.toFixed(6)},${lon.toFixed(6)}`;
}

export function formatCoordinates(lat: number, lon: number) {
  if (!isValidCoordinate(lat) || !isValidCoordinate(lon)) {
    return 'Unknown location';
  }

  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

async function reverseGeocodeWithGoogle(lat: number, lon: number) {
  const latlng = `${lat},${lon}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
    latlng
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = (await response.json()) as GoogleGeocodeResponse;

  if (data.status === 'OK' && data.results?.[0]?.formatted_address) {
    return data.results[0].formatted_address;
  }

  throw new Error(
    `Google geocoding failed: ${data.status}${data.error_message ? ` ${data.error_message}` : ''}`
  );
}

function formatBigDataCloudAddress(data: BigDataCloudResponse) {
  const parts = [
    data.locality,
    data.city,
    data.principalSubdivision,
    data.countryName,
  ].filter((value, index, array): value is string => {
    return Boolean(value) && array.indexOf(value) === index;
  });

  if (parts.length > 0) {
    return parts.join(', ');
  }

  const adminParts = data.localityInfo?.administrative
    ?.slice()
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
    .map((entry) => entry.name)
    .filter((value, index, array): value is string => {
      return Boolean(value) && array.indexOf(value) === index;
    });

  if (adminParts && adminParts.length > 0) {
    return adminParts.join(', ');
  }

  return '';
}

async function reverseGeocodeWithBigDataCloud(lat: number, lon: number) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
    lat
  )}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`BigDataCloud request failed: ${response.status}`);
  }

  const data = (await response.json()) as BigDataCloudResponse;
  const address = formatBigDataCloudAddress(data);

  if (address) {
    return address;
  }

  throw new Error('BigDataCloud returned no address');
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    if (!isValidCoordinate(lat) || !isValidCoordinate(lon)) {
      throw new Error('Invalid latitude or longitude');
    }

    const cacheKey = getCacheKey(lat, lon);
    const cachedAddress = geocodeCache.get(cacheKey);

    if (cachedAddress) {
      return cachedAddress;
    }

    let address: string;

    if (GOOGLE_MAPS_API_KEY) {
      try {
        address = await reverseGeocodeWithGoogle(lat, lon);
      } catch (error) {
        console.warn('Google geocoding unavailable, falling back to BigDataCloud:', error);
        address = await reverseGeocodeWithBigDataCloud(lat, lon);
      }
    } else {
      address = await reverseGeocodeWithBigDataCloud(lat, lon);
    }

    geocodeCache.set(cacheKey, address);
    return address;
  } catch (error) {
    console.warn('Reverse geocoding failed, using coordinates instead:', error);
    const fallback = formatCoordinates(lat, lon);
    geocodeCache.set(getCacheKey(lat, lon), fallback);
    return fallback;
  }
}