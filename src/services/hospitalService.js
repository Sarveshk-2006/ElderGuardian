/**
 * Nearby hospitals using OpenStreetMap Overpass API (no API key).
 * Returns: name, distance, lat, lon, ETA estimate.
 */

import * as Location from 'expo-location';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  try {
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return loc.coords;
  } catch {
    return null;
  }
}

export async function fetchNearbyHospitals(radiusMeters = 10000, limit = 10) {
  const loc = await getCurrentLocation();
  if (!loc) {
    return [];
  }
  const { latitude, longitude } = loc;

  const query = `[out:json][timeout:15];node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});out;`;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });
    const data = await res.json();
    const elements = (data.elements || []).filter((el) => el.type === 'node');

    const hospitals = elements
      .map((el) => {
        const lat = el.lat;
        const lon = el.lon;
        const name = el.tags?.name || 'Hospital';
        const distance = haversineKm(latitude, longitude, lat, lon) * 1000;
        const etaMinutes = Math.round((distance / 1000) * 2.5); // ~40 km/h urban
        return {
          id: el.id || `${lat}-${lon}`,
          name,
          latitude: lat,
          longitude: lon,
          distance: Math.round(distance),
          etaMinutes,
          address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || '',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return hospitals;
  } catch (e) {
    console.warn('Hospital fetch failed:', e.message);
    return [];
  }
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
