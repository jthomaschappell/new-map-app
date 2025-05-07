import { StyleSheet, FlatList } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { PizzaPlace } from '@/types/pizza';

interface PizzaPlacesListProps {
  places: PizzaPlace[];
  loading: boolean;
  error: string | null;
}

export function PizzaPlacesList({ places, loading, error }: PizzaPlacesListProps) {
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading pizza places...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Nearby Pizza Places</ThemedText>
      <FlatList
        data={places}
        // TODO: Key shall now be item.id
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ThemedView style={styles.placeItem}>
            <ThemedText type="defaultSemiBold">{item.name} (id: {item.id})</ThemedText>
            <ThemedText>{item.distance} away</ThemedText>
            {item.rating && <ThemedText>Rating: {item.rating}/5</ThemedText>}
            <ThemedText>{item.address}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  placeItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
}); 