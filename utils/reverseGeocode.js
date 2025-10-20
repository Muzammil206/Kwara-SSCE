export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    if (data && data.address) {
      return {
        address: data.display_name,
        city: data.address.city || data.address.town || data.address.village,
        local_government: data.address.county || data.address.district,
        state: data.address.state,
        country: data.address.country
      };
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}
