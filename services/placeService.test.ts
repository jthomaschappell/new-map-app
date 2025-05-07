import { PizzaPlace } from '@/types/pizza_place';
import { fetchPlacesGoogleAPI } from './placeService';

// Mock data that matches the Google Places API response structure
const mockGooglePlacesResponse = {
  places: [
    {
      displayName: { text: "Pizza Palace" },
      formattedAddress: "123 Main St, San Francisco, CA 94105",
      rating: 4.5,
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    },
    {
      displayName: { text: "Slice of Heaven" },
      formattedAddress: "456 Market St, San Francisco, CA 94105",
      rating: 4.8,
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    }
  ]
};

// Mock implementation of fetchPlacesGoogleAPI
export const mockFetchPlacesGoogleAPI = async (
  latitude: number,
  longitude: number
): Promise<PizzaPlace[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock data transformed to match PizzaPlace interface
  return mockGooglePlacesResponse.places.map(place => ({
    name: place.displayName.text,
    address: place.formattedAddress,
    rating: place.rating,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    distance: "0.5 miles" // Mock distance since it's not in the API response
  }));
};

// Mock the fetch function
global.fetch = jest.fn();

describe('pizzaService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('fetchPlacesGoogleAPI', () => {
    it('should return pizza places in the correct format', async () => {
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGooglePlacesResponse
      });

      const result = await fetchPlacesGoogleAPI(37.7749, -122.4194);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "Pizza Palace",
        address: "123 Main St, San Francisco, CA 94105",
        rating: 4.5,
        latitude: 37.7749,
        longitude: -122.4194
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock a failed fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(fetchPlacesGoogleAPI(37.7749, -122.4194))
        .rejects
        .toThrow('Google Places API request failed with status 500');
    });

    it('should handle empty response data', async () => {
      // Mock an empty response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ places: [] })
      });

      const result = await fetchPlacesGoogleAPI(37.7749, -122.4194);
      expect(result).toHaveLength(0);
    });
  });
}); 