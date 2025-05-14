import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { fetchPlacesGoogleAPI, genericCallerGrok } from '@/services/placeService';
import { generateMenuSearchPrompts } from '@/config/prompts';
import { DIETARY_OPTIONS, EXPERIENCES } from '@/constants/constants';

interface MenuItem {
  id: string;
  name: string;
  restaurant: string;
  latitude: number;
  longitude: number;
}

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface MenuItemsState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  location: LocationState | null;
}

const initialState: MenuItemsState = {
  menuItems: [],
  loading: false,
  error: null,
  location: null,
};

export const fetchMenuItems = createAsyncThunk(
  'menuItems/fetchMenuItems',
  async (
    { latitude, longitude, radius }: { latitude?: number; longitude?: number; radius?: number },
    { rejectWithValue }
  ) => {
    try {
      let coords = { latitude, longitude };
      if (latitude === undefined || longitude === undefined) {
        // Request permission to access device location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission to access location was denied');
        }
        // Get current location
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        coords = location.coords;
      }
      const myCuisines = [
        'thai_restaurant',
        'japanese_restaurant',
        'korean_restaurant',
      ];
      const googlePlaces = await fetchPlacesGoogleAPI(coords.latitude, coords.longitude, myCuisines, radius);
      const likedFoodItems = ['spicy chicken sandwich', 'pad thai', 'bubble tea', 'truffle fries'];
      const myDietaryRestrictions = DIETARY_OPTIONS.filter(
        (option) => option === 'Gluten Free' || option === 'Lactose Intolerant' || option === 'Egg Free'
      );
      const myExperiences = EXPERIENCES.filter(
        (option) => option === 'Dinner Sit Down' || option === 'Hidden Gem' || option === 'Fine Dining'
      );
      const { userPrompt, systemPrompt } = generateMenuSearchPrompts(
        likedFoodItems,
        googlePlaces,
        myDietaryRestrictions,
        myExperiences
      );
      const response = await genericCallerGrok(userPrompt, systemPrompt);
      const parsedResponse = JSON.parse(response);
      const menuItems: MenuItem[] = parsedResponse.menu_items;
      return {
        menuItems,
        location: { coords },
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch places');
    }
  }
);

const menuItemsSlice = createSlice({
  name: 'menuItems',
  initialState,
  reducers: {
    setMenuItems(state, action: PayloadAction<MenuItem[]>) {
      state.menuItems = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setLocation(state, action: PayloadAction<LocationState | null>) {
      state.location = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload.menuItems;
        state.location = action.payload.location;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setMenuItems, setLoading, setError, setLocation } = menuItemsSlice.actions;
export default menuItemsSlice.reducer;
export type { MenuItemsState }; 