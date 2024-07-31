import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPixels = createAsyncThunk('canvas/fetchPixels', async () => {
  const response = await axios.get('http://localhost:3001/pixels');
  return response.data;
});

const canvasSlice = createSlice({
  name: 'canvas',
  initialState: {
    pixels: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    updatePixel: (state, action) => {
      const { x, y, color } = action.payload;
      const existingPixel = state.pixels.find(p => p.x === x && p.y === y);
      if (existingPixel) {
        existingPixel.color = color;
      } else {
        state.pixels.push({ x, y, color });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPixels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPixels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pixels = action.payload;
      })
      .addCase(fetchPixels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { updatePixel } = canvasSlice.actions;

export default canvasSlice.reducer;
