import { StyleSheet, Platform, Dimensions, RefreshControl } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ThemedView } from '@/components/ThemedView';
import { PizzaPlacesList } from '@/components/PizzaPlacesList';
import { usePizzaPlaces } from '@/hooks/usePizzaPlaces';

export default function HomeScreen() {
  const { pizzaPlaces, loading, error, location, refreshPizzaPlaces } = usePizzaPlaces();

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
        showsUserLocation={true} // blue dot
        showsMyLocationButton={false} // pin
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
        {pizzaPlaces.map((place) => (
          <Marker
            key={place.name}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
          />
        ))}
      </MapView>
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
});
