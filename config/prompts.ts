/**
 * Configuration file for all API prompts
 */

// Example of previous prompt format kept for reference
// const user_prompt = `Find ${DIET_TYPE} ${FOOD_TYPES} within 5mi of ${LATITUDE}, ${LONGITUDE}. ` + 
//                    `Moderate price, casual dining. ` +
//                    `Return 40 real menu items in JSON format with: ` + 
//                    `item, price, restaurant, phone, address, and why I
//  might like it (100 chars max) Just give me the JSON, no other text.`;

export function buildTrampolineUserPrompt(latitude: number, longitude: number): string {
    return `Find` +
        // `food places` + 
        `trampoline parks` +
        `within 10 miles of latitude ${latitude} and longitude ${longitude}. ` +
        // `within 5 miles of 865 N 160 W. ` +
        // `Moderate price, casual dining. ` +
        `Return 10 places, unless you can only find less than 10. ` +
        `Include their names, distances, ratings, addresses, and coordinates. ` +
        `Do NOT make up places, or catastrophic consequences will occur. ` +
        `Triple check your work and make sure that you have the correct address, or the world will end. ` +
        `Return only as valid JSON.`;
}

export function buildTrampolineSystemPrompt(): string {
    return `You are a helpful assistant ` +
        // `that provides information about nearby food places. Not just pizza places, all types of food. ` +
        `that provides information about nearby trampoline parks. ` +
        `Return the data in the following JSON format: ` +
        `{ ` +
        `  "places": [ ` +
        `    { ` +
        `      "name": string, ` +
        `      "distance": string, ` +
        `      "rating": number, ` +
        `      "address": string, ` +
        `      "latitude": number, ` +
        `      "longitude": number ` +
        `    } ` +
        `  ] ` +
        `}`;
}

/**
 * Generates user and system prompts for searching restaurant menus and extracting menu items.
 * @param likedFoodItems - Array of food items the user has liked in the past.
 * @param uniqueGooglePlaces - Array of restaurant objects with location data.
 * @param myDietaryRestrictions - Array of dietary restrictions the user has.
 * @returns An object containing the userPrompt and systemPrompt strings.
 */
export function generateMenuSearchPrompts(
    likedFoodItems: string[],
    uniqueGooglePlaces: any[],
    myDietaryRestrictions: string[]
): { userPrompt: string; systemPrompt: string } {
    const userPrompt = `
  You will receive a list of up to 20 restaurants in JSON format, each with location data.
  Use this list to search the internet for menus from these restaurants.
  Extract popular or signature food items from each menu, aiming to return a total of **up to 40 items** overall.
  
  Some restaurants may not have public menus — if that's the case, skip them or infer likely menu items based on restaurant type or name.
  
  For each menu item you return, include the following:
  - "name" (of the menu item, as a string)
  - "price" (as a number in USD, or null)
  - "restaurant" (name of the restaurant from the input)
  - "message" (a message to the user about why they might like the menu item, or why they should try it. Keep it to 100 characters or less.)
  - "latitude" (the latitude of the restaurant)
  - "longitude" (the longitude of the restaurant)
  - "distance" (the distance from the user's current location to the restaurant in miles)
  
  Please return **only** the result in this JSON format. Here's an example: 
  
  {
    "menu_items": [
      {
        "id": "1",
        "name": "Cheeseburger",
        "price": 9.99,
        "restaurant": "Bob's Burgers",
        "latitude": 37.774929,
        "longitude": -122.419416,
        "distance": "1.5",
        "message": "This is a great menu item for a family of 4."
      },
      ...
    ]
  }
  
  Here is a list of food items this user has liked in the past:
  ${likedFoodItems.join(", ")}
  
  Here is a list of dietary restrictions this user has:
  ${myDietaryRestrictions.join(", ")}
  
  Give preference to restaurants and menu items that match or resemble these preferences.
  
  Here is the input list of restaurants:
  ${JSON.stringify(uniqueGooglePlaces, null, 2)}
  `;

    const systemPrompt = `
  You are a helpful assistant that researches real-world data to help mobile users find local menu items.
  You can read structured JSON input, search the internet for restaurant menus, and return formatted results.
  Your goal is to return menu items in a clean, consistent JSON structure. Be accurate, practical, and concise.
  `;

    return { userPrompt, systemPrompt };
}