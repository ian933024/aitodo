import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaUser, FaLock, FaCheck, FaTimes, FaEnvelope } from "react-icons/fa";
import {
  updateUsername,
  updatePassword,
  updateEmail,
  getUserByUsername,
} from "../firebase/userService";
import styles from "../styles/modules/login.module.scss";

function UserProfile({ currentUser, userId, onUsernameChange, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [newUsername, setNewUsername] = useState(currentUser || "");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user details including email when component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (currentUser) {
          const userData = await getUserByUsername(currentUser);
          if (userData && userData.email) {
            setEmail(userData.email);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate username
      if (!newUsername.trim()) {
        toast.error("Please enter a username");
        setIsLoading(false);
        return;
      }

      // Skip username update if unchanged
      let usernameUpdated = false;
      if (newUsername !== currentUser) {
        const result = await updateUsername(userId, newUsername);

        if (result.success) {
          usernameUpdated = true;
          if (onUsernameChange) {
            onUsernameChange(newUsername);
          }
        } else {
          toast.error(result.message || "Failed to update username");
          setIsLoading(false);
          return;
        }
      }

      // Update email (whether changed or not)
      const emailResult = await updateEmail(userId, email);

      if (emailResult.success) {
        // Show appropriate success message
        if (usernameUpdated) {
          toast.success("Profile updated successfully");
        } else {
          toast.success(emailResult.message);
        }
      } else {
        toast.error(emailResult.message || "Failed to update email");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (
        !currentPassword.trim() ||
        !newPassword.trim() ||
        !confirmNewPassword.trim()
      ) {
        toast.error("Please fill in all password fields");
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast.error("New passwords do not match");
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      if (currentPassword === newPassword) {
        toast.error("New password cannot be the same as current password");
        setIsLoading(false);
        return;
      }

      const result = await updatePassword(userId, currentPassword, newPassword);

      if (result.success) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.message || "An error occurred while updating password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div>
            <h1 className={styles.profileTitle}>Account Settings</h1>
            <p className={styles.profileSubtitle}>
              Manage your account information
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.profileTabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === "profile" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Change Username
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === "security" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            Reset Password
          </button>
        </div>

        {activeTab === "profile" ? (
          <form className={styles.loginForm} onSubmit={handleProfileUpdate}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Current Username</label>
              <div className={styles.currentValue}>{currentUser}</div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="newUsername">New Username</label>
              <div className={styles.inputWithIcon}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="text"
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="profileEmail">
                Email <span className={styles.optionalField}>(Optional)</span>
              </label>
              <div className={styles.inputWithIcon}>
                <FaEnvelope className={styles.inputIcon} />
                <input
                  type="email"
                  id="profileEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email (optional)"
                />
              </div>
              <small className={styles.emailHint}>
                Your email is only used for account recovery and won't be
                shared.
              </small>
            </div>

            <motion.button
              type="submit"
              className={styles.updateButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </motion.button>
          </form>
        ) : (
          <form className={styles.loginForm} onSubmit={handlePasswordUpdate}>
            <div className={styles.inputGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <div className={styles.inputWithIcon}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">New Password</label>
              <div className={styles.inputWithIcon}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <div className={styles.inputWithIcon}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              {newPassword && confirmNewPassword && (
                <div className={styles.passwordMatch}>
                  {newPassword === confirmNewPassword ? (
                    <span className={styles.passwordMatchSuccess}>
                      <FaCheck /> Passwords match
                    </span>
                  ) : (
                    <span className={styles.passwordMatchError}>
                      <FaTimes /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              className={styles.updateButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
