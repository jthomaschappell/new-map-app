import { PizzaPlace } from '@/types/pizza';

// API configuration constants
const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY;
const GROK_API_ENDPOINT = process.env.EXPO_PUBLIC_GROK_API_ENDPOINT;

// Example of previous prompt format kept for reference
// const user_prompt = `Find ${DIET_TYPE} ${FOOD_TYPES} within 5mi of ${LATITUDE}, ${LONGITUDE}. ` + 
//                    `Moderate price, casual dining. ` +
//                    `Return 40 real menu items in JSON format with: ` + 
//                    `item, price, restaurant, phone, address, and why I might like it (100 chars max) Just give me the JSON, no other text.`;

/**
 * Builds the prompt for the Grok API to find nearby pizza places
 * @param latitude - The latitude coordinate
 * @param longitude - The longitude coordinate
 * @returns A string prompt for the API
 */
function buildUserPrompt(latitude: number, longitude: number): string {
  return `Find pizza places within 5 miles of latitude ${latitude} and longitude ${longitude}. Moderate price, casual dining. Return 40 real menu items, unless you can only find less than 40. 
    Include their names, distances, ratings, addresses, and coordinates. Do NOT make up places, or catastrophic consequences will occur. Return only as valid JSON.`;
}

// System prompt that defines the expected response format
const SYSTEM_PROMPT = `You are a helpful assistant that provides information about nearby pizza places.
Return the data in the following JSON format:
{
  "places": [
    {
      "name": string,
      "distance": string,
      "rating": number,
      "address": string,
      "latitude": number,
      "longitude": number
    }
  ]
}`;

// Validate required environment variables
if (!GROK_API_KEY || !GROK_API_ENDPOINT) {
  throw new Error('Missing required environment variables for Grok API');
}

/**
 * Fetches nearby pizza places using the Grok API
 * @param latitude - The latitude coordinate to search from
 * @param longitude - The longitude coordinate to search from
 * @returns Promise<PizzaPlace[]> - Array of pizza places
 * @throws Error if API request fails or response parsing fails
 */
export async function fetchNearbyPizzaPlaces(latitude: number, longitude: number): Promise<PizzaPlace[]> {
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
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: buildUserPrompt(latitude, longitude),
          }
        ],
        stream: false,
        temperature: 0  // Use deterministic responses
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return parsePizzaPlacesResponse(data);
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