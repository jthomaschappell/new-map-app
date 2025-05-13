import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { MenuItemsList } from '@/components/MenuItemsList';
import { usePlaces } from '@/hooks/usePlaces';

export default function HomeScreen() {
  const { menuItems, loading, error } = usePlaces();  
  return (
    <ThemedView style={styles.container}>
      <MenuItemsList
        menuItems={menuItems}
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
});
