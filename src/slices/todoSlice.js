import { createSlice } from '@reduxjs/toolkit';

const getInitialTodo = (username) => {
  // If no username, return empty array
  if (!username) {
    return [];
  }
  
  // getting user-specific todo list
  const localTodoList = window.localStorage.getItem(`todoList_${username}`);
  // if todo list is not empty
  if (localTodoList) {
    return JSON.parse(localTodoList);
  }
  window.localStorage.setItem(`todoList_${username}`, JSON.stringify([]));
  return [];
};

const initialValue = {
  filterStatus: 'all',
  dueDateFilter: 'all',
  hashtagFilter: '',
  todoList: [],
  currentUser: ''
};

export const todoSlice = createSlice({
  name: 'todo',
  initialState: initialValue,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      // Load todos for the current user
      state.todoList = getInitialTodo(action.payload);
    },
    addTodo: (state, action) => {
      state.todoList.push(action.payload);
      const username = state.currentUser;
      
      if (!username) return;
      
      const todoList = window.localStorage.getItem(`todoList_${username}`);
      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.push({
          ...action.payload,
        });
        window.localStorage.setItem(`todoList_${username}`, JSON.stringify(todoListArr));
      } else {
        window.localStorage.setItem(
          `todoList_${username}`,
          JSON.stringify([
            {
              ...action.payload,
            },
          ])
        );
      }
    },
    updateTodo: (state, action) => {
      const username = state.currentUser;
      
      if (!username) return;
      
      const todoList = window.localStorage.getItem(`todoList_${username}`);
      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.forEach((todo) => {
          if (todo.id === action.payload.id) {
            todo.status = action.payload.status;
            todo.title = action.payload.title;
            todo.dueDate = action.payload.dueDate;
            todo.dueDateType = action.payload.dueDateType;
            todo.hashtags = action.payload.hashtags;
          }
        });
        window.localStorage.setItem(`todoList_${username}`, JSON.stringify(todoListArr));
        state.todoList = [...todoListArr];
      }
    },
    deleteTodo: (state, action) => {
      const username = state.currentUser;
      
      if (!username) return;
      
      const todoList = window.localStorage.getItem(`todoList_${username}`);
      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.forEach((todo, index) => {
          if (todo.id === action.payload) {
            todoListArr.splice(index, 1);
          }
        });
        window.localStorage.setItem(`todoList_${username}`, JSON.stringify(todoListArr));
        state.todoList = todoListArr;
      }
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
});

export const { 
  setCurrentUser,
  addTodo, 
  updateTodo, 
  deleteTodo, 
  updateFilterStatus, 
  updateDueDateFilter,
  updateHashtagFilter
} = todoSlice.actions;
export default todoSlice.reducer;
