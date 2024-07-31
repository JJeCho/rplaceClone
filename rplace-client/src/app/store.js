import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from '../features/canvasSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
  },
});
