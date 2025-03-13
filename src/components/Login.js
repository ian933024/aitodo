import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaUser, FaUserPlus } from 'react-icons/fa';
import styles from '../styles/modules/login.module.scss';
import { getUsers, checkUserExists, addUser } from '../firebase/userService';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  // Load existing users from Firestore on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await getUsers();
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      if (isCreatingNew) {
        // Check if username already exists
        const exists = await checkUserExists(username);
        if (exists) {
          toast.error('Username already exists');
          return;
        }

        // Add new user
        await addUser(username);
        setUsers([...users, username]);

        toast.success('Account created successfully');
      } else {
        // Check if user exists
        const exists = await checkUserExists(username);
        if (!exists) {
          toast.error('User not found');
          return;
        }

        toast.success(`Welcome back, ${username}!`);
      }

      // Call the onLogin prop with the username
      if (onLogin) {
        onLogin(username);
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const switchMode = () => {
    setIsCreatingNew(!isCreatingNew);
    setUsername('');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>
          {isCreatingNew ? 'Create Account' : 'Login'}
        </h1>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <div className={styles.inputWithIcon}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className={styles.loginButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCreatingNew ? 'Create Account' : 'Login'}
          </motion.button>

          <div className={styles.switchMode}>
            <span>
              {isCreatingNew
                ? 'Already have an account?'
                : "Don't have an account?"}
            </span>
            <motion.button
              type="button"
              className={styles.switchButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={switchMode}
            >
              {isCreatingNew ? 'Login' : 'Create Account'}
            </motion.button>
          </div>
        </form>

        {users.length > 0 && !isCreatingNew && (
          <div className={styles.userList}>
            <h3>Available Accounts</h3>
            <div className={styles.userButtons}>
              {users.map((user, index) => (
                <motion.button
                  key={index}
                  className={styles.userButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUsername(user)}
                >
                  <FaUserPlus className={styles.userIcon} />
                  {user}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
