import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { MenuItemsList } from '@/components/MenuItemsList';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchMenuItems } from '../menuItemsSlice';
import { useEffect } from 'react';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const menuItems = useSelector((state: RootState) => state.menuItems.menuItems);
  const loading = useSelector((state: RootState) => state.menuItems.loading);
  const error = useSelector((state: RootState) => state.menuItems.error);

  useEffect(() => {
    if (menuItems.length === 0) {
      dispatch(fetchMenuItems({}));
    }
  }, [dispatch, menuItems.length]);

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
