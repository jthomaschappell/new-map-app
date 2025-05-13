import { Region } from "react-native-maps";
import { Place } from "@/types/place";

/**
 * Calculates the radius of a region in meters
 * 
 * @param region - The region to calculate the radius of
 * @returns The radius of the region in meters
 */
export function calculateRadius(region: Region) {
    const metersPerDegree = 111000;
    let radius = (region.longitudeDelta / 2) * metersPerDegree;
    radius = Math.min(radius, 5000); // Clamp to 5000 meters
    return radius;
}

/**
 * Removes duplicate places from an array of places
 * 
 * @param places - Array of place objects
 * @returns Array of unique place objects
 */
export function removeDuplicates(places: Place[]) {
    const seen = new Set();
    return places.filter((place: Place) => {
        const key = JSON.stringify(place);
        if (seen.has(key)) {  // if the place has already been seen, return false
            return false;
        } else {
            seen.add(key); // if the place has not been seen, add it to the set
            return true;
        }
    });
}

/**
 * Maps a cuisine string to a restaurant type string
 * 
 * @param cuisine - The cuisine string to map
 * @returns The mapped restaurant type string
 */
export function getRestaurantType(cuisine: string) {
    const mapping = {
        "Italian": "italian_restaurant",
        "Mexican": "mexican_restaurant",
        "Chinese": "chinese_restaurant",
        "Japanese": "japanese_restaurant",
        "Thai": "thai_restaurant",
        "Indian": "indian_restaurant",
        "Greek": "greek_restaurant",
        "Korean": "korean_restaurant",
        "Vietnamese": "vietnamese_restaurant",
        "American": "american_restaurant"
    };
    return mapping[cuisine as keyof typeof mapping];
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    // Earth's radius in miles
    const earthRadius = 3958.8; // miles (6371 km)

    // Convert latitude and longitude from degrees to radians
    const toRadians = (degrees: number) => degrees * Math.PI / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    // Haversine formula
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    // Return distance rounded to 2 decimal places
    return Math.round(distance * 100) / 100;
}

/**
 * Filters an array of place objects, keeping only those whose 'types' array
 * contains at least one of the provided filter strings.
 * 
 * @param places - Array of place objects (each with a 'types' array)
 * @param filterTypes - Array of type strings to filter by (e.g., ['thai_restaurant', 'japanese_restaurant'])
 * @returns Filtered array of place objects
 */
export function filterPlacesByTypes(
    places: Array<{ types: string[] }>,
    filterTypes: string[]
) {
    return places.filter(place =>
        place.types.some(type => filterTypes.includes(type))
    );
}