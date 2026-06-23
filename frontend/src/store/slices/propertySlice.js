import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchProperties = createAsyncThunk('property/fetchAll', async (params = {}) => {
  const { data } = await api.get('/properties', { params });
  return data;
});

export const fetchProperty = createAsyncThunk('property/fetchOne', async (id) => {
  const { data } = await api.get(`/properties/${id}`);
  return data.data;
});

export const fetchFavorites = createAsyncThunk('property/fetchFavorites', async () => {
  const { data } = await api.get('/favorites');
  return data.data;
});

export const toggleFavorite = createAsyncThunk('property/toggleFavorite', async (propertyId) => {
  try {
    await api.post(`/favorites/${propertyId}`);
    return { propertyId, isFavorite: true };
  } catch {
    await api.delete(`/favorites/${propertyId}`);
    return { propertyId, isFavorite: false };
  }
});

const propertySlice = createSlice({
  name: 'property',
  initialState: {
    properties: [],
    property: null,
    favorites: [],
    compareList: [],
    total: 0,
    pages: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addToCompare: (state, action) => {
      if (state.compareList.length < 4 && !state.compareList.find((p) => p._id === action.payload._id)) {
        state.compareList.push(action.payload);
      }
    },
    removeFromCompare: (state, action) => {
      state.compareList = state.compareList.filter((p) => p._id !== action.payload);
    },
    clearCompare: (state) => {
      state.compareList = [];
    },
    clearProperty: (state) => {
      state.property = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.data;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.property = action.payload;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (action.payload.isFavorite) {
          const prop = state.properties.find((p) => p._id === action.payload.propertyId);
          if (prop) state.favorites.push(prop);
        } else {
          state.favorites = state.favorites.filter((p) => p._id !== action.payload.propertyId);
        }
      });
  },
});

export const { addToCompare, removeFromCompare, clearCompare, clearProperty } = propertySlice.actions;
export default propertySlice.reducer;
