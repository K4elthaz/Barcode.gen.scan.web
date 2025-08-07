const GOOGLE_MAPS_API_KEY = "AIzaSyDX_h5XN06hZcAYbTS5ixA9d7oYRN8FPCY"; // replace with env var in production

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    // Validate input
    if (
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      isNaN(lat) ||
      isNaN(lon)
    ) {
      throw new Error("Invalid latitude or longitude");
    }

    const latlng = `${lat},${lon}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
      latlng
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    console.error("Geocoding failed:", data.status, data.error_message);
    return "Unknown location";
  } catch (error) {
    console.error("Google Maps Geocode error:", error);
    return "Unknown location";
  }
}