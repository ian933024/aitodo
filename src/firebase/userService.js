import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from './config';

// Collection reference
const usersCollectionRef = collection(db, 'users');

// Get all users
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data().username);
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Check if user exists
export const checkUserExists = async (username) => {
  try {
    if (!username) {
      throw new Error('Username is required');
    }
    const q = query(usersCollectionRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
};

// Add a new user
export const addUser = async (username) => {
  try {
    if (!username) {
      throw new Error('Username is required');
    }

    // Check if user already exists
    const exists = await checkUserExists(username);
    if (exists) {
      throw new Error('Username already exists');
    }

    return await addDoc(usersCollectionRef, { username });
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};
