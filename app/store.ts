import { configureStore } from '@reduxjs/toolkit';
import menuItemsReducer from './menuItemsSlice';
import type { MenuItemsState } from './menuItemsSlice';

export const store = configureStore({
  reducer: {
    menuItems: menuItemsReducer,
  },
});

export interface RootState {
  menuItems: MenuItemsState;
}
export type AppDispatch = typeof store.dispatch; 