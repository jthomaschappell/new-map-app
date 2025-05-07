/**
 * Configuration file for all API prompts
 */

// Example of previous prompt format kept for reference
// const user_prompt = `Find ${DIET_TYPE} ${FOOD_TYPES} within 5mi of ${LATITUDE}, ${LONGITUDE}. ` + 
//                    `Moderate price, casual dining. ` +
//                    `Return 40 real menu items in JSON format with: ` + 
//                    `item, price, restaurant, phone, address, and why I might like it (100 chars max) Just give me the JSON, no other text.`;

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
