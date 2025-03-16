import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';

// Collection reference
const usersCollectionRef = collection(db, 'users');

// Helper function to validate email format
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Get all users
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = [];
    querySnapshot.forEach((docSnapshot) => {
      users.push(docSnapshot.data().username);
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Get all users with details (for admin)
export const getAllUsersWithDetails = async () => {
  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = [];
    querySnapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();
      // Exclude password for security
      const { password, ...safeUserData } = userData;
      users.push({
        id: docSnapshot.id,
        ...safeUserData,
      });
    });
    return users;
  } catch (error) {
    console.error('Error getting users with details:', error);
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

// Get user document by username
export const getUserByUsername = async (username) => {
  try {
    if (!username) {
      throw new Error('Username is required');
    }

    const q = query(usersCollectionRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Authenticate user (check username and password)
export const authenticateUser = async (username, password) => {
  try {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const q = query(usersCollectionRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'User not found' };
    }

    // Get the first matching document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Check if password matches
    if (userData.password !== password) {
      return { success: false, message: 'Incorrect password' };
    }

    return {
      success: true,
      userId: userDoc.id,
      username: userData.username,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

// Add a new user
export const addUser = async (username, password, email = '') => {
  try {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Check if user already exists
    const exists = await checkUserExists(username);
    if (exists) {
      throw new Error('Username already exists');
    }

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // In a production app, you would hash the password here
    // For simplicity, we're storing it as plain text
    return await addDoc(usersCollectionRef, {
      username,
      password,
      email,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Update user username
export const updateUsername = async (userId, newUsername) => {
  try {
    if (!userId || !newUsername) {
      throw new Error('User ID and new username are required');
    }

    // Check if username is already taken by another user
    const exists = await checkUserExists(newUsername);
    if (exists) {
      throw new Error('Username already exists');
    }

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      username: newUsername,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, message: 'Username updated successfully' };
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

// Update user email
export const updateEmail = async (userId, email) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // If email is empty, it's valid (email is optional)
    if (email && !validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      email,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: email
        ? 'Email updated successfully'
        : 'Email removed successfully',
    };
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

// Update user password
export const updatePassword = async (userId, currentPassword, newPassword) => {
  try {
    if (!userId || !currentPassword || !newPassword) {
      throw new Error(
        'User ID, current password, and new password are required'
      );
    }

    // Get user document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    // Verify current password
    if (userData.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Update password
    await updateDoc(userDocRef, {
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Admin functions

// Check if user is admin
export const isAdmin = async (username, password) =>
  // We're using a hardcoded admin account for simplicity
  // In a real application, this would be stored in the database with proper security
  username === 'admin' && password === 'owl';

// Reset user's password (admin only)
export const adminResetPassword = async (userId, newPassword) => {
  try {
    if (!userId || !newPassword) {
      throw new Error('User ID and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // Update password
    await updateDoc(userDocRef, {
      password: newPassword,
      updatedAt: new Date().toISOString(),
      passwordResetByAdmin: true,
      passwordResetAt: new Date().toISOString(),
    });

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Delete user account (admin only)
export const deleteUserAccount = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // In a real app, you would also delete or archive all user data
    // For this example, we're just deleting the user document
    await deleteDoc(userDocRef);

    return { success: true, message: 'User account deleted successfully' };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};
