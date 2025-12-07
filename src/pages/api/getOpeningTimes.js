import axios from 'axios';

// In-memory cache
const cache = {};
// Cache expiration time in milliseconds (e.g., 10 minutes)
const CACHE_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

export default async function handler(_req, res) {
  try {
    // Extract the placeId from environment variables
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }

    // Check if the data is in the cache and still valid
    const cachedData = cache[placeId];
    const isCacheValid =
      cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION_TIME;

    if (isCacheValid) {
      // Return cached data
      return res.status(200).json(cachedData.data);
    }

    // Your Google Places API Key
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // Google Places API URL
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&language=de&region=de&fields=current_opening_hours,opening_hours&key=${apiKey}`;

    // Make the request to Google Places API
    const response = await axios.get(url);

    // Check if the response contains opening_hours data
    if (response.data.result?.opening_hours) {
      // Cache the response data
      cache[placeId] = {
        data: response.data.result.opening_hours,
        timestamp: Date.now(),
      };

      // Send back the opening hours
      return res.status(200).json(response.data.result.opening_hours);
    }

    // If no opening hours found, return an empty object or an error message
    return res
      .status(404)
      .json({ error: 'Opening hours not found for this place' });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({ error: 'Failed to retrieve opening times' });
  }
}
