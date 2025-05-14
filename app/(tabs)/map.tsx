import { StyleSheet, Dimensions, Pressable } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { ThemedView } from '@/components/ThemedView';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchMenuItems } from '../menuItemsSlice';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_LATITUDE, GOOGLE_LONGITUDE, PROVO_LATITUDE, PROVO_LONGITUDE } from '@/constants/constants';
import { calculateRadius } from '@/helper-functions/helper_functions';

export default function MapScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const menuItems = useSelector((state: RootState) => state.menuItems.menuItems);
  const loading = useSelector((state: RootState) => state.menuItems.loading);
  const error = useSelector((state: RootState) => state.menuItems.error);
  const location = useSelector((state: RootState) => state.menuItems.location);
  const [region, setRegion] = useState<Region | undefined>(undefined);

  // Set initial region when location is available
  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      console.log("Location changed!", location);
    }
  }, [location]); // listener for when location changes. 

  useEffect(() => {
    if (region) {
      console.log("DEBUGGING AND TESTING REGION CHANGE: Region changed!");
      console.log("DEBUGGING AND TESTING REGION CHANGE: New region is ", region);
    }
  }, [region]);

  // ! TEST the calculation of the radius and using that to search. 
  // ! We should always be within the screen. 
  // ! When we do the initial load, it is NOT always within the screen. 

  // ! TEST: Test the refreshPlaces. 
  /**
   * ! When we move, it should set the region to our new center. 
   * ! When we click refresh, it should search again with that new region. 
   * ! It should do a new Google API -> Grok API -> marker Menu items. 
   */

  const handleRefresh = useCallback(() => {
    if (region) {
      const radius = calculateRadius(region);
      dispatch(fetchMenuItems({ latitude: region.latitude, longitude: region.longitude, radius }));
    }
  }, [region, dispatch]);

  return (
    <ThemedView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords?.latitude || GOOGLE_LATITUDE,
          longitude: location?.coords?.longitude || GOOGLE_LONGITUDE,
          latitudeDelta: 0.0922,
          // Controls how many degrees of longitude to display (zoom level) 
          // A smaller number means more zoomed in
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            pinColor="blue"
            title="You are here"
          />
        )}
        {menuItems.map((menuItem: any) => (
          <Marker
            key={menuItem.id}
            coordinate={{
              latitude: menuItem.latitude,
              longitude: menuItem.longitude,
            }}
            title={menuItem.name}
            description={menuItem.restaurant}
          />
        ))}
      </MapView>
      <Pressable
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={24} color="black" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  refreshButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 
