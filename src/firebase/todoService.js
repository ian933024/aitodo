import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';

// Collection reference
const todosCollectionRef = collection(db, 'todos');

// Get todos for specific user
export const getTodos = async (username) => {
  try {
    if (!username) {
      console.warn('No username provided to getTodos');
      return [];
    }
    const q = query(todosCollectionRef, where('user', '==', username));
    const querySnapshot = await getDocs(q);
    const todos = [];
    querySnapshot.forEach((docSnapshot) => {
      todos.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    return todos;
  } catch (error) {
    console.error('Error getting todos:', error);
    throw error;
  }
};

// Add a new todo
export const addTodo = async (todo) => {
  try {
    if (!todo.user) {
      throw new Error('Todo must have a user property');
    }
    return await addDoc(todosCollectionRef, todo);
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

// Update a todo
export const updateTodo = async (id, updatedTodo) => {
  try {
    if (!id) {
      throw new Error('Todo ID is required for updates');
    }
    // Remove id from the data being sent to Firestore to avoid duplicate ID issues
    const { id: todoId, ...dataToUpdate } = updatedTodo;
    const todoDoc = doc(db, 'todos', id);
    return await updateDoc(todoDoc, dataToUpdate);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (id) => {
  try {
    if (!id) {
      throw new Error('Todo ID is required for deletion');
    }
    const todoDoc = doc(db, 'todos', id);
    return await deleteDoc(todoDoc);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};
