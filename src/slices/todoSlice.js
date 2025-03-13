import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTodos,
  addTodo as fbAddTodo,
  updateTodo as fbUpdateTodo,
  deleteTodo as fbDeleteTodo,
} from '../firebase/todoService';

// Async thunks for Firestore operations
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (username) => {
    if (!username) return [];
    const response = await getTodos(username);
    return response;
  }
);

export const createTodo = createAsyncThunk('todos/createTodo', async (todo) => {
  const docRef = await fbAddTodo(todo);
  return { id: docRef.id, ...todo };
});

export const editTodo = createAsyncThunk('todos/editTodo', async (todo) => {
  await fbUpdateTodo(todo.id, todo);
  return todo;
});

export const removeTodo = createAsyncThunk('todos/removeTodo', async (id) => {
  await fbDeleteTodo(id);
  return id;
});

const initialValue = {
  filterStatus: 'all',
  dueDateFilter: 'all',
  hashtagFilter: '',
  todoList: [],
  currentUser: '',
  loading: false,
  error: null,
};

export const todoSlice = createSlice({
  name: 'todo',
  initialState: initialValue,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    updateDueDateFilter: (state, action) => {
      state.dueDateFilter = action.payload;
    },
    updateHashtagFilter: (state, action) => {
      state.hashtagFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todoList = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create todo
      .addCase(createTodo.fulfilled, (state, action) => {
        state.todoList.push(action.payload);
      })
      // Update todo
      .addCase(editTodo.fulfilled, (state, action) => {
        const index = state.todoList.findIndex(
          (todo) => todo.id === action.payload.id
        );
        if (index !== -1) {
          state.todoList[index] = action.payload;
        }
      })
      // Delete todo
      .addCase(removeTodo.fulfilled, (state, action) => {
        state.todoList = state.todoList.filter(
          (todo) => todo.id !== action.payload
        );
      });
  },
});

export const {
  setCurrentUser,
  updateFilterStatus,
  updateDueDateFilter,
  updateHashtagFilter,
} = todoSlice.actions;
export default todoSlice.reducer;
