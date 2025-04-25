import { StyleSheet, Platform, Dimensions, RefreshControl, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ThemedView } from '@/components/ThemedView';
import { PizzaPlacesList } from '@/components/PizzaPlacesList';
import { usePizzaPlaces } from '@/hooks/usePizzaPlaces';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { pizzaPlaces, loading, error, location, refreshPizzaPlaces } = usePizzaPlaces();

  return (
    <ThemedView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          // Default location: San Francisco, CA if user location not available
          latitude: location?.coords?.latitude || 37.78825,
          longitude: location?.coords?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true} // blue dot
        showsMyLocationButton={true} // pin icon
      >
        {/* If location is valid then render the user location marker */}
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
        {/* Pizza places markers */}
        {pizzaPlaces.map((place) => (
          <Marker
            key={place.name}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.address}
          />
        ))}
      </MapView>
      
      <Pressable 
        style={styles.refreshButton}
        onPress={refreshPizzaPlaces}
      >
        <Ionicons name="refresh" size={24} color="black" />
      </Pressable>

      <PizzaPlacesList
        places={pizzaPlaces}
        loading={loading}
        error={error}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
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
