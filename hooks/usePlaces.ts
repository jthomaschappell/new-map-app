import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { PizzaPlace } from '@/types/pizza_place';
import { fetchPlacesGoogleAPI, fetchPlacesGrok, genericCallerGrok } from '@/services/placeService';
import { withRepeat } from 'react-native-reanimated';
import { MenuItem } from '@/types/menu_item';

function removeDuplicates(places: PizzaPlace[]) {
  const seen = new Set();
  return places.filter((place: PizzaPlace) => {
    const key = JSON.stringify(place);
    if (seen.has(key)) {  // if the place has already been seen, return false
      return false;
    } else {
      seen.add(key); // if the place has not been seen, add it to the set
      return true; 
    }
  });
} 

function filterPlacesByType(places: PizzaPlace[], filterString: string): PizzaPlace[] {
  const newPlaces: PizzaPlace[] = [];
  for (const place of places) {
    if (place.types.includes(filterString)) {
      newPlaces.push(place);
    }
  }
  return newPlaces;
}

/**
 * Custom hook to manage place data and location services
 * Returns places near the user's current location
 */
export function usePlaces() {
  // State for storing places data and UI states
  const [places, setPlaces] = useState<PizzaPlace[]>([]);   // places is initially an empty array.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  /**
   * 
   * Fetches places for given coordinates
   * Manages loading and error states during the fetch operation
   */
  const fetchPlaces = useCallback(async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      // ! Fetch places Grok testing. 

      const googlePlaces = await fetchPlacesGoogleAPI(latitude, longitude); 
      const uniqueGooglePlaces = removeDuplicates(googlePlaces);

      // add ids to the places for use later in PlaceList
      uniqueGooglePlaces.forEach((place: PizzaPlace, index: number) => {
        place.id = index.toString();
      });

      // !: You need to pass it where you are so that it can calculate the distance and place it here in the List View. 

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

Please return **only** the result in this JSON format:

{
  "menu_items": [
    {
      "id": "1",
      "name": "Cheeseburger",
      "price": 9.99,
      "restaurant": "Bob's Burgers", 
      "message": "This is a great menu item for a family of 4."
    },
    ...
  ]
}

Here is the input list of restaurants:
${JSON.stringify(uniqueGooglePlaces, null, 2)}
`;

const systemPrompt = `
You are a helpful assistant that researches real-world data to help mobile users find local menu items.
You can read structured JSON input, search the internet for restaurant menus, and return formatted results.
Your goal is to return menu items in a clean, consistent JSON structure. Be accurate, practical, and concise.
`;

      const response = await genericCallerGrok(userPrompt, systemPrompt); 
      console.log("The response from the generic caller to Grok is: "); 
      console.log(response); 
      // Parse the JSON string response into an object
      const parsedResponse = JSON.parse(response);

      const menuItems: MenuItem[] = parsedResponse.menu_items;
      console.log("The menu items are: "); 
      console.log(menuItems); 

      // TODO: Next up is taking the menu items and putting them into the list. 
      
      // ! This is for converting the response data into place objects. 
      // // Convert the parsed response into place objects
      // const filteredPlaces = parsedResponse.places.map((place: any) => ({
      //   id: place.id,
      //   name: place.name,
      //   address: place.address,
      //   rating: place.rating,
      //   latitude: place.latitude,
      //   longitude: place.longitude,
      //   types: place.types,
      //   distance: place.distance
      // }));
      // console.log("Grok says that the filtered list is: "); 
      // console.log(filteredPlaces);

      setPlaces(uniqueGooglePlaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  }, []);  // this runs only when component mounts, or when it's called 

  /**
   * Effect hook that runs on mount to:
   * 1. Request location permissions
   * 2. Get current location
   * 3. Fetch places near that location
   */
  useEffect(() => {
    (async () => {
      try {
        // Request permission to access device location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        // Get current location and fetch nearby places
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        let response = await Location.reverseGeocodeAsync(location.coords);

        setLocation(location);
        await fetchPlaces(location.coords.latitude, location.coords.longitude);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
      }
    })();
  }, [fetchPlaces]);  // this runs anytime fetchPlaces changes. 

  /**
   * Callback to manually refresh places data
   * Only works if we have a valid location
   */
  const refreshPlaces = useCallback(async () => {
    if (location) {
      await fetchPlaces(location.coords.latitude, location.coords.longitude);
    }
  }, [location, fetchPlaces]);

  return {
    places,
    loading,
    error,
    location,
    refreshPlaces,
  };
} 