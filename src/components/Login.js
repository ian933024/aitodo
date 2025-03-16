import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaUser, FaUserPlus, FaLock } from "react-icons/fa";
import styles from "../styles/modules/login.module.scss";
import {
  getUsers,
  checkUserExists,
  addUser,
  authenticateUser,
  isAdmin,
} from "../firebase/userService";

// Helper functions
const fetchUsers = async (setUsers) => {
  try {
    const usersList = await getUsers();
    setUsers(usersList);
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to load users");
  }
};

const validateEmail = (email) => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load existing users from Firestore on component mount
  useEffect(() => {
    fetchUsers(setUsers);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    try {
      // Email validation if provided (for new accounts)
      if (isCreatingNew && email && !validateEmail(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (isCreatingNew) {
        // Validate confirm password
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        // Check password strength
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters long");
          return;
        }

        // Check if username already exists
        const exists = await checkUserExists(username);
        if (exists) {
          toast.error("Username already exists");
          return;
        }

        // Add new user
        await addUser(username, password, email);
        setUsers([...users, username]);

        toast.success("Account created successfully");

        // Call the onLogin prop with the username
        if (onLogin) {
          onLogin(username);
        }
      } else {
        // Check if this is the admin account
        const adminCheck = await isAdmin(username, password);

        if (adminCheck) {
          toast.success("Welcome, Admin!");

          // Call the onLogin prop with admin flag
          if (onLogin) {
            onLogin(username, "admin", true);
          }
          return;
        }

        // Regular user authentication
        const authResult = await authenticateUser(username, password);

        if (!authResult.success) {
          toast.error(authResult.message);
          return;
        }

        toast.success(`Welcome back, ${username}!`);

        // Call the onLogin prop with the username and userId
        if (onLogin) {
          onLogin(username, authResult.userId, false);
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const switchMode = () => {
    setIsCreatingNew(!isCreatingNew);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setShowPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const filterUsers = (userQuery) => {
    return users.filter((user) =>
      user.toLowerCase().includes(userQuery.toLowerCase())
    );
  };

  const handleUserSelection = (user) => {
    setUsername(user);
    // Clear password when a user is selected
    setPassword("");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>
          {isCreatingNew ? "Create Account" : "Login"}
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
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWithIcon}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={
                  isCreatingNew ? "new-password" : "current-password"
                }
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {isCreatingNew && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.inputWithIcon}>
                  <FaLock className={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">
                  Email <span className={styles.optionalField}>(Optional)</span>
                </label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputIcon}>@</span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (optional)"
                    autoComplete="email"
                  />
                </div>
              </div>
            </>
          )}

          <motion.button
            type="submit"
            className={styles.loginButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCreatingNew ? "Create Account" : "Login"}
          </motion.button>

          <div className={styles.switchMode}>
            <span>
              {isCreatingNew
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>
            <motion.button
              type="button"
              className={styles.switchButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={switchMode}
            >
              {isCreatingNew ? "Login" : "Create Account"}
            </motion.button>
          </div>
        </form>

        {users.length > 0 && !isCreatingNew && (
          <div className={styles.userList}>
            <h3>Available Accounts</h3>
            <p className={styles.userListHint}>
              Select an account (you'll still need to enter a password)
            </p>
            <div className={styles.userButtons}>
              {users.map((user, index) => (
                <motion.button
                  type="button"
                  key={index}
                  className={styles.userButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUserSelection(user)}
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
