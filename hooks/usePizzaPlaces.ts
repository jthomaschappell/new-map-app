import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { PizzaPlace } from '@/types/pizza';
import { fetchPlacesGoogleAPI, fetchPlacesGrok } from '@/services/pizzaService';

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

function applyFilterSecondaryType(places: PizzaPlace[], filterString: string): PizzaPlace[] {
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

      const googlePlaces = await fetchPlacesGoogleAPI(latitude, longitude); 
      const uniqueGooglePlaces = removeDuplicates(googlePlaces);

      // add ids to the places for use later in PizzaPlaceList
      uniqueGooglePlaces.forEach((place: PizzaPlace, index: number) => {
        place.id = index.toString();
      });

      // ! Add in some processing that only allows those that are ALSO italian_restaurants. 
      // TODO: What is the call being made? 
      const filter = "italian_restaurant"; 
      const filteredPlaces = applyFilterSecondaryType(uniqueGooglePlaces, filter); 
      console.log(`The places that match the filter: ${filter} are: `); 
      console.log(filteredPlaces); 



      setPizzaPlaces(uniqueGooglePlaces);
      // sort the places by distance
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
        console.log(`ATTENTION MERE MORTALS, YOU ARE HERE: ${response[0].formattedAddress}`);
        console.log(`ATTENTION MERE MORTALS, LATITUDE AND LONGITUDE: ${location.coords.latitude}, ${location.coords.longitude}`);

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