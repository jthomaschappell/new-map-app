import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Place } from '@/types/place';
import { fetchPlacesGoogleAPI, genericCallerGrok } from '@/services/placeService';
import { MenuItem } from '@/types/menu_item';
import { generateMenuSearchPrompts } from '@/config/prompts';
import { CUISINES, DIETARY_OPTIONS, EXPERIENCES } from '@/constants/constants';

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
  const fetchPlaces = useCallback(async (latitude: number, longitude: number, radius?: number) => {
    try {
      setLoading(true);
      setError(null);

      const myCuisines = [
        "thai_restaurant",
        "japanese_restaurant",
        "korean_restaurant"
      ];

      const googlePlaces = await fetchPlacesGoogleAPI(latitude, longitude, myCuisines, radius);

      console.log("DEBUGGING AND TESTING: The google places are: ");
      console.log(googlePlaces);

      const likedFoodItems = ["spicy chicken sandwich", "pad thai", "bubble tea", "truffle fries"];

      const myDietaryRestrictions = DIETARY_OPTIONS.filter((option) => option === "Gluten Free" || option === "Lactose Intolerant" || option === "Egg Free");

      const myExperiences = EXPERIENCES.filter((option) => option === "Dinner Sit Down" || option === "Hidden Gem" || option === "Fine Dining");

      const { userPrompt, systemPrompt } = generateMenuSearchPrompts(likedFoodItems, googlePlaces, myDietaryRestrictions, myExperiences);

      const response = await genericCallerGrok(userPrompt, systemPrompt);
      console.log("The response from the generic caller to Grok is: ");
      console.log(response);
      // Parse the JSON string response into an object
      const parsedResponse = JSON.parse(response);

      const menuItems: MenuItem[] = parsedResponse.menu_items;
      console.log("The menu items are: ");
      console.log(menuItems);

      // Set both pizza places and menu items
      setPlaces(googlePlaces);
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
        await fetchPlaces(location.coords.latitude, location.coords.longitude);   // TODO: This takes in radius = null => 50000.0
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
      }
    })();
  }, [fetchPlaces]);

  /**
   * Accepts optional latitude and longitude to refresh based on map center
   */
  const refreshPlaces = useCallback(async (latitude?: number, longitude?: number, radius?: number) => {
    console.log("DEBUGGING AND TESTING REFRESHING PLACES: Refreshing places");
    // if the call is valid, then use the call. 
    if (latitude !== undefined && longitude !== undefined) {
      await fetchPlaces(latitude, longitude, radius);
    // if there is a bad call, then default to current location. 
    } else if (location) {
      await fetchPlaces(location.coords.latitude, location.coords.longitude, radius);
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
