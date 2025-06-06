import { calculateDistance } from '@/helper-functions/helper_functions';
import { MAX_SEARCH_RADIUS } from '@/constants/constants';
import { Place } from '@/types/place';
import Constants from 'expo-constants';

// Get environment variables from Expo Constants
const extra = Constants.expoConfig?.extra;
if (!extra) {
  throw new Error('Expo config is not available');
}
const {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_PLACES_API_ENDPOINT,
  GROK_API_KEY,
  GROK_API_ENDPOINT
} = extra as {
  GOOGLE_MAPS_API_KEY: string;
  GOOGLE_PLACES_API_ENDPOINT: string;
  GROK_API_KEY: string;
  GROK_API_ENDPOINT: string;
};
// Validate Google Maps API environment variables
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('Missing required environment variable: GOOGLE_MAPS_API_KEY');
}
if (!GROK_API_ENDPOINT) {
  throw new Error('Missing required environment variable: GROK_API_ENDPOINT');
}
// Validate Grok API environment variables
if (!GROK_API_KEY) {
  throw new Error('Missing required environment variable: GROK_API_KEY');
}
if (!GOOGLE_PLACES_API_ENDPOINT) {
  throw new Error('Missing required environment variable: GOOGLE_PLACES_API_ENDPOINT');
}


/**
 * Fetches nearby places using the Google Places API
 * @param latitude - The latitude coordinate to search from
 * @param longitude - The longitude coordinate to search from
 * @param cuisine - Array of cuisine types to include in the search
 * @param radius - The radius to search within
 * @returns Promise<Place[]> - Array of places
 * @throws Error if API request fails or response parsing fails
 */
export async function fetchPlacesGoogleAPI(latitude: number, longitude: number, cuisine: string[], radius?: number): Promise<Place[]> {
  try {
    const response = await fetch(GOOGLE_PLACES_API_ENDPOINT as string , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY as string,
        // 'X-Goog-FieldMask': '*'
        // NOTE: It's crucial that we get the places.types field because Grok looks at that downstream. 
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.types' 
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude
            },
            // NOTE: The maximum value is 50_000 meters. 
            radius: radius ?? MAX_SEARCH_RADIUS
          }
        },
        // Note: might cause an error if both "radius" and "rankPreference" are included.
        // rankPreference: "DISTANCE",  
        maxResultCount: 20,
        includedTypes: cuisine
      })
    });

    if (!response.ok) {
      throw new Error(`Google Places API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Google Places API successfully called");

    const result = data.places.map((place: any) => ({
      name: place.displayName.text,
      address: place.formattedAddress,
      types: place.types,
      rating: place.rating,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      distance: calculateDistance(
        latitude,
        longitude,
        place.location.latitude,
        place.location.longitude
      )
    }));

    // add ids to the places for use later in PlaceList
    result.forEach((place: Place, index: number) => {
      place.id = index.toString();
    });

    return result;

  } catch (error) {
    console.error('Error fetching places from Google API:', error);
    throw error;
  }
}


/**
 * Generic caller to Grok API
 * @param userPrompt - The user prompt
 * @param systemPrompt - The system prompt
 * @returns The response from Grok
 */
export async function genericCallerGrok(userPrompt: string, systemPrompt:string) {
  try {
    const response = await fetch(GROK_API_ENDPOINT as string, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
        'Authorization': `Bearer ${GROK_API_KEY}`, 
      },
      body: JSON.stringify({
        model: "grok-2-latest", 
        messages: [
          {
            role: "system", 
            content: systemPrompt, 
          },
          {
            role: "user", 
            content: userPrompt, 
          }, 
        ], 
        stream: false, 
        temperature: 0, 
      }),
    }); 

    if (!response.ok) {
      throw new Error(`Grok API request failed with status: ${response.status}`); 
    }
    const data = await response.json(); 
    return data.choices[0].message.content; 

  } catch (error) {
    console.error("Error with the generic caller to Grok", error); 
  }
}

/**
 * Parses the raw API response into PizzaPlace objects
 * @param data - Raw API response data
 * @returns PizzaPlace[] - Array of parsed pizza places
 * @throws Error if parsing fails or response format is invalid
 */
function parsePizzaPlacesResponse(data: any): Place[] {
  try {
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in API response');
    }

    // Remove markdown syntax and parse JSON
    const jsonContent = content.replace(/```json\n|\n```/g, '');
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData.places)) {
      throw new Error('Invalid response format');
    }

    return parsedData.places;
  } catch (error) {
    console.error('Error parsing pizza places response:', error);
    throw new Error('Failed to parse pizza places data');
  }
} 

// TODO: Boundary errors. When we go big it errors out. When we go far, it errors out. 