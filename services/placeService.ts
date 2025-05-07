import { PizzaPlace } from '@/types/pizza_place';
import { buildTrampolineSystemPrompt, buildTrampolineUserPrompt } from '@/config/prompts';
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
 * @returns Promise<PizzaPlace[]> - Array of places
 * @throws Error if API request fails or response parsing fails
 */
export async function fetchPlacesGoogleAPI(latitude: number, longitude: number): Promise<PizzaPlace[]> {
  try {
    const response = await fetch(GOOGLE_PLACES_API_ENDPOINT as string , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY as string,
        // 'X-Goog-FieldMask': '*'
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.types'
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude
            },
            // radius: 1500.0
            radius: 30000.0
          }
        },
        // rankPreference: "DISTANCE",
        maxResultCount: 20,
        includedTypes: [
          // "italian_restaurant", 
          // "mexican_restaurant", 
          "restaurant"
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Google Places API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Google Places API successfully called");

    return data.places.map((place: any) => ({
      name: place.displayName.text,
      address: place.formattedAddress,
      rating: place.rating,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      types: place.types,
      distance: calculateDistance(
        latitude,
        longitude,
        place.location.latitude,
        place.location.longitude
      )
    }));

  } catch (error) {
    console.error('Error fetching places from Google API:', error);
    throw error;
  }
}


export async function genericCallerGrok(userPrompt: string, systemPrompt:string) {

  console.log("Debugging logs:")
  console.log("The user prompt is: "); 
  console.log(userPrompt); 
  console.log("The system prompt is: "); 
  console.log(systemPrompt); 

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
 * Fetches nearby pizza places using the Grok API
 * @param latitude - The latitude coordinate to search from
 * @param longitude - The longitude coordinate to search from
 * @returns Promise<PizzaPlace[]> - Array of pizza places
 * @throws Error if API request fails or response parsing fails
 */
export async function fetchPlacesGrok(latitude: number, longitude: number): Promise<PizzaPlace[]> {
  try {
    // Make API request to Grok
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
            content: buildTrampolineSystemPrompt(),
          },
          {
            role: "user",
            content: buildTrampolineUserPrompt(latitude, longitude),
          }
        ],
        stream: false,
        temperature: 0  // Use deterministic responses
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API request (fetch places) failed with status ${response.status}`);
    }

    const data = await response.json();
    const parsedResponse = parsePizzaPlacesResponse(data);
    console.log('Parsed response:', parsedResponse);
    return parsedResponse;
  } catch (error) {
    console.error('Error fetching pizza places:', error);
    throw error;
  }
}

/**
 * Parses the raw API response into PizzaPlace objects
 * @param data - Raw API response data
 * @returns PizzaPlace[] - Array of parsed pizza places
 * @throws Error if parsing fails or response format is invalid
 */
function parsePizzaPlacesResponse(data: any): PizzaPlace[] {
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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Earth's radius in miles
  const earthRadius = 3958.8; // miles (6371 km)
  
  // Convert latitude and longitude from degrees to radians
  const toRadians = (degrees: number ) => degrees * Math.PI / 180;
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = earthRadius * c;
  // Return distance rounded to 2 decimal places
  return Math.round(distance * 100) / 100;
}