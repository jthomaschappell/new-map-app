import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Place } from '@/types/place';
import { fetchPlacesGoogleAPI, fetchPlacesGrok, genericCallerGrok } from '@/services/placeService';
import { withRepeat } from 'react-native-reanimated';
import { MenuItem } from '@/types/menu_item';
import { generateMenuSearchPrompts } from '@/config/prompts';
import { DIETARY_OPTIONS } from '@/constants/constants';

function removeDuplicates(places: Place[]) {
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

function filterPlacesByType(places: Place[], filterString: string): Place[] {
  const newPlaces: Place[] = [];
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
  const [places, setPlaces] = useState<Place[]>([]);   // places is initially an empty array.
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); // Add state for menu items
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  /**
   * Fetches places for given coordinates
   * Manages loading and error states during the fetch operation
   */
  const fetchPlaces = useCallback(async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      const googlePlaces = await fetchPlacesGoogleAPI(latitude, longitude);
      const uniqueGooglePlaces = removeDuplicates(googlePlaces);

      const likedFoodItems = ["spicy chicken sandwich", "pad thai", "bubble tea", "truffle fries"];

      const myDietaryRestrictions = DIETARY_OPTIONS.filter((option) => option === "Gluten Free" || option === "Lactose Intolerant" || option === "Egg Free");

      const { userPrompt, systemPrompt } = generateMenuSearchPrompts(likedFoodItems, uniqueGooglePlaces, myDietaryRestrictions);

      // ! TEST: Test the prompts to see if it gives things that are gluten free, lactose intolerant, and egg free

      const response = await genericCallerGrok(userPrompt, systemPrompt);
      console.log("The response from the generic caller to Grok is: ");
      console.log(response);
      // Parse the JSON string response into an object
      const parsedResponse = JSON.parse(response);

      const menuItems: MenuItem[] = parsedResponse.menu_items;
      console.log("The menu items are: ");
      console.log(menuItems);

      // Set both pizza places and menu items
      setPlaces(uniqueGooglePlaces);
      setMenuItems(menuItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  }, []); // this runs only when component mounts, or when it's called

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
  }, [fetchPlaces]); 

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
    menuItems,
    loading,
    error,
    location,
    refreshPlaces,
  };
}