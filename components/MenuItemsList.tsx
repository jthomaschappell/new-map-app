import { StyleSheet, FlatList } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MenuItem } from '@/types/menu_item';

interface MenuItemsListProps {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

export function MenuItemsList({ menuItems, loading, error }: MenuItemsListProps) {
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading menu items...</ThemedText>
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
      <ThemedText type="subtitle" style={styles.title}>Popular Menu Items</ThemedText>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={styles.menuItem}>
            <ThemedText type="defaultSemiBold">{item.name} ({item.distance} miles away)</ThemedText>
            <ThemedText>From: {item.restaurant}</ThemedText>
            {item.price && <ThemedText>${item.price.toFixed(2)}</ThemedText>}
            <ThemedText style={styles.message}>{item.message}</ThemedText>
            <ThemedText>Id: {item.id}</ThemedText>
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
  menuItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  message: {
    marginTop: 8,
    fontStyle: 'italic',
  },
}); 