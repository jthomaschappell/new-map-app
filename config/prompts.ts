/**
 * Generates user and system prompts for searching restaurant menus and extracting menu items.
 * @param likedFoodItems - Array of food items the user has liked in the past.
 * @param uniqueGooglePlaces - Array of restaurant objects with location data.
 * @param dietaryRestrictions - Array of dietary restrictions selected by the user.
 * @param experienceTypes - Array of dining experience preferences selected by the user.
 * @param cuisineTypes - Array of cuisine preferences selected by the user.
 * @returns An object containing the userPrompt and systemPrompt strings.
 */
export function generateMenuSearchPrompts(
    likedFoodItems: string[],
    uniqueGooglePlaces: any[],
    dietaryRestrictions: string[] = [],
    experienceTypes: string[] = [],
    cuisineTypes: string[] = []
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
  - "matchesDietary" (boolean indicating if this item matches all the user's dietary restrictions)
  - "matchesPreferences" (boolean indicating if this menu item aligns with user's preferences)
  
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
        "matchesDietary": true,
        "matchesPreferences": true,
        "message": "This is a great menu item for a family of 4."
      },
      ...
    ]
  }
  
  ### User Preferences ###
  
  Food items this user has liked in the past:
  ${likedFoodItems.join(", ")}
  
  ${dietaryRestrictions.length > 0 ? 
    `Dietary restrictions (IMPORTANT - strictly filter out non-compliant items):
    ${dietaryRestrictions.join(", ")}
    
    Please carefully analyze each menu item to ensure it meets these dietary requirements. For example:
    - Vegan: No animal products whatsoever (no meat, dairy, eggs, honey, etc.)
    - Vegetarian: No meat but may include dairy, eggs, or honey
    - Gluten Free: No wheat, barley, rye, or derivatives
    - Halal/Kosher: Follows specific religious preparation requirements
    - Allergen restrictions: No trace of the specified allergen (Nut Free, Shellfish Free, etc.)
    ` : 'No dietary restrictions specified.'}
  
  ${experienceTypes.length > 0 ? 
    `Experience preferences (prioritize restaurants matching these experiences):
    ${experienceTypes.join(", ")}` : 'No experience preferences specified.'}
  
  ${cuisineTypes.length > 0 ? 
    `Cuisine preferences (prioritize restaurants matching these cuisines):
    ${cuisineTypes.join(", ")}` : 'No cuisine preferences specified.'}
  
  Give strong preference to restaurants and menu items that match these preferences and restrictions.
  Set matchesDietary to true ONLY if the menu item satisfies ALL dietary restrictions.
  Set matchesPreferences to true if the restaurant type aligns with the user's experience and cuisine preferences.
  
  Here is the input list of restaurants:
  ${JSON.stringify(uniqueGooglePlaces, null, 2)}
  `;

    const systemPrompt = `
  You are a helpful assistant that researches real-world data to help mobile users find local menu items.
  You can read structured JSON input, search the internet for restaurant menus, and return formatted results.
  
  Your primary responsibilities:
  1. Find and analyze restaurant menus from the provided list
  2. Strictly filter menu items based on dietary restrictions (this is critical for user health and safety)
  3. Match restaurants to user experience preferences (breakfast, fine dining, etc.)
  4. Match restaurants to cuisine preferences (Italian, Mexican, etc.)
  5. Return clean, well-structured JSON with menu items that best match the user's needs
  
  For dietary restrictions, be extremely careful and conservative - when in doubt, exclude an item.
  For experience and cuisine matching, use both explicit restaurant information and implicit knowledge.
  
  Your goal is to return menu items in a clean, consistent JSON structure. Be accurate, practical, and concise.
  `;

    return { userPrompt, systemPrompt };
}