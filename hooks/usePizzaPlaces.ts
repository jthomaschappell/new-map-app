import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { PizzaPlace } from '@/types/pizza';
import { fetchNearbyPizzaPlaces } from '@/services/pizzaService';

export function usePizzaPlaces() {
  const [pizzaPlaces, setPizzaPlaces] = useState<PizzaPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const fetchPizzaPlaces = useCallback(async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);
      const places = await fetchNearbyPizzaPlaces(latitude, longitude);
      setPizzaPlaces(places);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pizza places');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        await fetchPizzaPlaces(location.coords.latitude, location.coords.longitude);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
      }
    })();
  }, [fetchPizzaPlaces]);

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