import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { PizzaPlace } from '@/types/pizza_place';
import { fetchPlacesGoogleAPI, fetchPlacesGrok, genericCallerGrok } from '@/services/pizzaService';
import { withRepeat } from 'react-native-reanimated';

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
 * Custom hook to manage pizza place data and location services
 * Returns pizza places near the user's current location
 */
export function usePizzaPlaces() {
  // State for storing pizza places data and UI states
  const [pizzaPlaces, setPizzaPlaces] = useState<PizzaPlace[]>([]);   // pizza places is initially an empty array. 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  /**
   * 
   * Fetches pizza places for given coordinates
   * Manages loading and error states during the fetch operation
   */
  const fetchPizzaPlaces = useCallback(async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      // ! Fetch places Grok testing. 

      const googlePlaces = await fetchPlacesGoogleAPI(latitude, longitude); 
      const uniqueGooglePlaces = removeDuplicates(googlePlaces);

      // add ids to the places for use later in PizzaPlaceList
      uniqueGooglePlaces.forEach((place: PizzaPlace, index: number) => {
        place.id = index.toString();
      });

      // TODO: Now call this function with a userPrompt and a systemPrompt. 

      const filterString = "mexican_restaurant"; 
      const userPrompt = 
      `Use your knowledge of restaurants to tell` + 
      `me which of these are ${filterString} restaurants?` + 
      `Give me a modified list, where everything that is not a ${filterString} restaurant is removed.` + 
      ` ${JSON.stringify(uniqueGooglePlaces)}.`; 

      const systemPrompt = "You are a helpful assistant " + 
      "that can answer my questions. " + 
      "You respond in a strict JSON format, that looks like this: " + 
      `{
        "places": [
          {
            "id": string,
            "name": string,
            "address": string,
            "rating": number,
            "distance": number,
            "latitude": number,
            "longitude": number,
            "types": ["string", "string", "string", etc.]
          }
        ]
      }`; 

      const response = await genericCallerGrok(userPrompt, systemPrompt); 
      console.log("The response from the generic caller to Grok is: "); 
      console.log(response); 
      // Parse the JSON string response into an object
      const parsedResponse = JSON.parse(response);
      
      // Convert the parsed response into PizzaPlace objects
      const filteredPlaces = parsedResponse.places.map((place: any) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        rating: place.rating,
        latitude: place.latitude,
        longitude: place.longitude,
        types: place.types,
        distance: place.distance
      }));
      console.log("The filtered food places are: "); 
      console.log(filteredPlaces);

      setPizzaPlaces(uniqueGooglePlaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pizza places');
    } finally {
      setLoading(false);
    }
  }, []);  // this runs only when component mounts, or when it's called 

  /**
   * Effect hook that runs on mount to:
   * 1. Request location permissions
   * 2. Get current location
   * 3. Fetch pizza places near that location
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

        // Get current location and fetch nearby pizza places
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        let response = await Location.reverseGeocodeAsync(location.coords);

        setLocation(location);
        await fetchPizzaPlaces(location.coords.latitude, location.coords.longitude);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
      }
    })();
  }, [fetchPizzaPlaces]);  // this runs anytime fetchPizzaPlaces changes. 

  /**
   * Callback to manually refresh pizza places data
   * Only works if we have a valid location
   */
  const refreshPizzaPlaces = useCallback(async () => {
    if (location) {
      await fetchPizzaPlaces(location.coords.latitude, location.coords.longitude);
    }
  }, [location, fetchPizzaPlaces]);

  return {
    pizzaPlaces,
    loading,
    error,
    location,
    refreshPizzaPlaces,
  };
} 