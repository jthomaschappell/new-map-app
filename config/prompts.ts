/**
 * Configuration file for all API prompts
 */

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
// TODO: This is not returning menu items, this is returning pizza places. 
// TODO: Have it print out the JSON response in the console. 

export function buildUserPrompt(latitude: number, longitude: number): string {
    return `Find pizza places within 5 miles of latitude ${latitude} and longitude ${longitude}. ` +
        `Moderate price, casual dining. ` +
        // `Return 40 real menu items, unless you can only find less than 40. ` +
        `Return exactly 10 places, unless you can only find less than 10. ` +
        `Include their names, distances, ratings, addresses, and coordinates. ` + 
        `Do NOT make up places, or catastrophic consequences will occur. ` +
        `Return only as valid JSON.`;
}

/**
 * System prompt that defines the expected response format for pizza places
 */
export const SYSTEM_PROMPT = `You are a helpful assistant 
that provides information about nearby pizza places.
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