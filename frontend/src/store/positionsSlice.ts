import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Position {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
}

interface PositionsState {
  data: Position[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PositionsState = {
  data: [],
  status: 'idle',
  error: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/positions';

const normalizePosition = (position: any): Position => ({
  ...position,
  id: String(position.id),
  parentId: position.parentId === null || position.parentId === undefined ? null : String(position.parentId),
});

const normalizePositions = (positions: any[]): Position[] => positions.map(normalizePosition);

const collectDescendantIds = (positions: Position[], rootId: string) => {
  const ids = new Set<string>([String(rootId)]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const position of positions) {
      if (position.parentId !== null && ids.has(String(position.parentId)) && !ids.has(String(position.id))) {
        ids.add(String(position.id));
        changed = true;
      }
    }
  }

  return ids;
};

export const fetchPositions = createAsyncThunk('positions/fetchPositions', async () => {
  const response = await axios.get(API_URL);
  return normalizePositions(response.data);
});

export const addPosition = createAsyncThunk(
  'positions/addPosition',
  async (position: Omit<Position, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, position);
      return normalizePosition(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create position');
    }
  }
);

export const updatePosition = createAsyncThunk(
  'positions/updatePosition',
  async (position: Position, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${position.id}`, position);
      return normalizePosition(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update position');
    }
  }
);

export const deletePosition = createAsyncThunk('positions/deletePosition', async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    addLocalPosition(state, action: PayloadAction<Position>) {
      state.data.push(normalizePosition(action.payload));
    },
    updateLocalPosition(state, action: PayloadAction<Position>) {
      const id = String(action.payload.id);
      const index = state.data.findIndex((p) => String(p.id) === id);
      if (index !== -1) state.data[index] = normalizePosition(action.payload);
    },
    removeLocalPosition(state, action: PayloadAction<string>) {
      const id = String(action.payload);
      const idsToRemove = collectDescendantIds(state.data, id);
      state.data = state.data.filter((p) => !idsToRemove.has(String(p.id)));
    },
    replaceTempPosition(state, action: PayloadAction<{ tempId: string; realPosition: Position }>) {
      const idx = state.data.findIndex(p => String(p.id) === String(action.payload.tempId));
      if (idx !== -1) {
        state.data[idx] = normalizePosition(action.payload.realPosition);
      } else {
        state.data.push(normalizePosition(action.payload.realPosition));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = normalizePositions(action.payload);
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch positions';
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        const id = String(action.payload.id);
        const index = state.data.findIndex((p) => String(p.id) === id);
        if (index !== -1) {
          state.data[index] = normalizePosition(action.payload);
        }
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.data = state.data.filter((p) => p.id !== action.payload);
      });
  },
});

export default positionsSlice.reducer;
export const { addLocalPosition, updateLocalPosition, removeLocalPosition, replaceTempPosition } = positionsSlice.actions;
