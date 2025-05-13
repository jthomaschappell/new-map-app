import { StyleSheet, Dimensions, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ThemedView } from '@/components/ThemedView';
import { usePlaces } from '@/hooks/usePlaces';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const { menuItems, loading, error, location, refreshPlaces } = usePlaces();
  return (
    <ThemedView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords?.latitude || 37.78825,
          longitude: location?.coords?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
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
        {menuItems.map((menuItem) => (
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
        onPress={refreshPlaces}
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