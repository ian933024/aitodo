import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaUser, FaUserPlus } from 'react-icons/fa';
import Button from './Button';
import styles from '../styles/modules/login.module.scss';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Load existing users from localStorage on component mount
  useEffect(() => {
    const existingUsers = localStorage.getItem('todoAppUsers');
    if (existingUsers) {
      setUsers(JSON.parse(existingUsers));
    }
  }, []);
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    if (isCreatingNew) {
      // Check if username already exists
      if (users.includes(username)) {
        toast.error('Username already exists');
        return;
      }
      
      // Add new user
      const newUsers = [...users, username];
      localStorage.setItem('todoAppUsers', JSON.stringify(newUsers));
      setUsers(newUsers);
      
      // Initialize empty todo list for new user
      localStorage.setItem(`todoList_${username}`, JSON.stringify([]));
      
      toast.success('Account created successfully');
    } else {
      // Check if user exists
      if (!users.includes(username)) {
        toast.error('User not found');
        return;
      }
      
      toast.success(`Welcome back, ${username}!`);
    }
    
    // Call the onLogin prop with the username
    if (onLogin) {
      onLogin(username);
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
              {isCreatingNew ? 'Already have an account?' : 'Don\'t have an account?'}
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