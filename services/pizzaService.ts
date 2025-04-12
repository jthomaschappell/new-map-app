import { PizzaPlace } from '@/types/pizza';

const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY;
const GROK_API_ENDPOINT = process.env.EXPO_PUBLIC_GROK_API_ENDPOINT;

if (!GROK_API_KEY || !GROK_API_ENDPOINT) {
  throw new Error('Missing required environment variables for Grok API');
}

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

export async function fetchNearbyPizzaPlaces(latitude: number, longitude: number): Promise<PizzaPlace[]> {
  try {
    const userPrompt = `Find pizza places near latitude ${latitude} and longitude ${longitude}. 
    Include their names, distances, ratings, addresses, and coordinates.`;

    const response = await fetch(GROK_API_ENDPOINT, {
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
            content: userPrompt
          }
        ],
        stream: false,
        temperature: 0
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