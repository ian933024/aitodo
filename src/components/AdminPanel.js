import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaUserEdit,
  FaUserMinus,
  FaKey,
  FaTimes,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaRobot,
  FaCode,
} from 'react-icons/fa';
import {
  getAllUsersWithDetails,
  adminResetPassword,
  deleteUserAccount,
} from '../firebase/userService';
import { getTodoCount } from '../firebase/todoService';
import testOpenAIService from '../services/openaiService.test';
import styles from '../styles/modules/admin.module.scss';

function AdminPanel({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState(null); // 'reset-password', 'delete', or 'openai-test'
  const [newPassword, setNewPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState('');
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [openAITestResults, setOpenAITestResults] = useState(null);
  const [openAITestError, setOpenAITestError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'username',
    direction: 'asc',
  });

  // Load users on component mount
  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    fetchUsers();
  }, []);

  // Update filtered users when search term or users change
  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersList = await getAllUsersWithDetails();

      // Get todo counts for each user
      const usersWithCounts = await Promise.all(
        usersList.map(async (user) => {
          const todoCount = await getTodoCount(user.username);
          return { ...user, todoCount };
        })
      );

      setUsers(usersWithCounts);
      setFilteredUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers([...users]);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredUsers(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }

    const sorted = [...filteredUsers].sort((a, b) => {
      if (a[key] === undefined || a[key] === null) return 1;
      if (b[key] === undefined || b[key] === null) return -1;

      if (direction === 'asc') {
        return a[key] < b[key] ? -1 : 1;
      }
      return a[key] > b[key] ? -1 : 1;
    });

    setSortConfig({ key, direction });
    setFilteredUsers(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await adminResetPassword(selectedUser.id, newPassword);
      if (result.success) {
        toast.success(`Password reset for ${selectedUser.username}`);
        // eslint-disable-next-line no-use-before-define
        closeModal();
        await fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (confirmDelete !== selectedUser.username) {
      toast.error('Username does not match. Deletion canceled.');
      return;
    }

    try {
      const result = await deleteUserAccount(selectedUser.id);
      if (result.success) {
        toast.success(`User ${selectedUser.username} deleted successfully`);
        // eslint-disable-next-line no-use-before-define
        closeModal();
        await fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setAction('reset-password');
    setNewPassword('');
  };

  const openDeleteUserModal = (user) => {
    setSelectedUser(user);
    setAction('delete');
    setConfirmDelete('');
  };

  const openOpenAITestModal = () => {
    setAction('openai-test');
    setOpenAITestResults(null);
    setOpenAITestError(null);
  };

  const runOpenAITest = async () => {
    setIsTestingOpenAI(true);
    setOpenAITestResults(null);
    setOpenAITestError(null);
    
    try {
      const testResults = await testOpenAIService();
      setOpenAITestResults(testResults);
      
      if (testResults.success) {
        toast.success('OpenAI API test completed successfully!');
      } else {
        toast.error('OpenAI API test failed');
      }
    } catch (error) {
      console.error('Error running OpenAI test:', error);
      setOpenAITestError(error.message || 'An unknown error occurred');
      toast.error(`OpenAI test failed: ${error.message}`);
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setAction(null);
    setNewPassword('');
    setConfirmDelete('');
    setOpenAITestResults(null);
    setOpenAITestError(null);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Admin Dashboard</h1>
        <div className={styles.adminActions}>
          <button
            type="button"
            className={styles.openaiButton}
            onClick={openOpenAITestModal}
          >
            <FaRobot /> Test OpenAI
          </button>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={fetchUsers}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className={styles.userTable}>
        <div className={styles.tableHeader}>
          <div
            className={styles.headerCell}
            onClick={() => handleSort('username')}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSort('username');
              }
            }}
            role="button"
            tabIndex={0}
          >
            Username {getSortIcon('username')}
          </div>
          <div
            className={styles.headerCell}
            onClick={() => handleSort('email')}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSort('email');
              }
            }}
            role="button"
            tabIndex={0}
          >
            Email {getSortIcon('email')}
          </div>
          <div
            className={styles.headerCell}
            onClick={() => handleSort('createdAt')}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSort('createdAt');
              }
            }}
            role="button"
            tabIndex={0}
          >
            Created At {getSortIcon('createdAt')}
          </div>
          <div
            className={styles.headerCell}
            onClick={() => handleSort('todoCount')}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSort('todoCount');
              }
            }}
            role="button"
            tabIndex={0}
          >
            Todo Items {getSortIcon('todoCount')}
          </div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        {isLoading && (
          <div className={styles.loadingMessage}>Loading users...</div>
        )}
        {!isLoading && filteredUsers.length === 0 && (
          <div className={styles.emptyMessage}>No users found</div>
        )}
        {!isLoading &&
          filteredUsers.length > 0 &&
          filteredUsers.map((user) => (
            <div key={user.id} className={styles.tableRow}>
              <div className={styles.userCell}>{user.username}</div>
              <div className={styles.userCell}>{user.email || '-'}</div>
              <div className={styles.userCell}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '-'}
              </div>
              <div className={styles.userCell}>{user.todoCount}</div>
              <div className={styles.actionCell}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.resetButton}`}
                  onClick={() => openResetPasswordModal(user)}
                  title="Reset Password"
                >
                  <FaKey />
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => openDeleteUserModal(user)}
                  title="Delete User"
                >
                  <FaUserMinus />
                </button>
              </div>
            </div>
          ))}
      </div>

      {selectedUser && action === 'reset-password' && (
        <div className={styles.modalOverlay} onClick={(e) => {
          // Close modal if clicking on overlay outside the modal
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Reset Password</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>You are about to reset the password for:</p>
              <p className={styles.confirmUsername}>{selectedUser.username}</p>

              <div className={styles.inputGroup}>
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className={styles.confirmMessage}>
                Are you sure you want to reset this user's password?
                <span className={styles.confirmWarning}>
                  This action cannot be undone.
                </span>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={handleResetPassword}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUser && action === 'delete' && (
        <div className={styles.modalOverlay} onClick={(e) => {
          // Close modal if clicking on overlay outside the modal
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Delete User</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>
                You are about to{' '}
                <span className={styles.deleteWarning}>permanently delete</span>{' '}
                the user:
              </p>
              <p className={styles.confirmUsername}>{selectedUser.username}</p>

              <div className={styles.confirmMessage}>
                This will delete all user data and cannot be undone.
                <span className={styles.confirmWarning}>
                  This is permanent!
                </span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmDelete">
                  Type the username to confirm deletion
                </label>
                <input
                  type="text"
                  id="confirmDelete"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder={`Type ${selectedUser.username} to confirm`}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.deleteConfirmButton}
                  onClick={handleDeleteUser}
                  disabled={confirmDelete !== selectedUser.username}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {action === 'openai-test' && (
        <div className={styles.modalOverlay} onClick={(e) => {
          // Close modal if clicking on overlay outside the modal
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}>
          <div className={`${styles.modal} ${styles.openaiModal}`}>
            <div className={styles.modalHeader}>
              <h2><FaRobot /> OpenAI API Test</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Test the OpenAI API integration with function calling capabilities.</p>
              
              <div className={styles.openaiTestInfo}>
                <h3>This test will verify:</h3>
                <ul>
                  <li>Connection to OpenAI API</li>
                  <li>Function calling functionality</li>
                  <li>Processing of API responses</li>
                  <li>Error handling</li>
                </ul>
                
                <div className={styles.apiKeyNote}>
                  <p><strong>Important:</strong> You must have a valid OpenAI API key set in your <code>.env</code> file.</p>
                  <p>Environment variable: <code>REACT_APP_OPENAI_API_KEY</code></p>
                </div>
              </div>
              
              {openAITestError && (
                <div className={styles.errorMessage}>
                  <h3>Error:</h3>
                  <p>{openAITestError}</p>
                </div>
              )}
              
              {openAITestResults && (
                <div className={styles.testResults}>
                  <h3>Test Results:</h3>
                  <div className={styles.resultStatus}>
                    Status: <span className={openAITestResults.success ? styles.successText : styles.errorText}>
                      {openAITestResults.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  {openAITestResults.success && (
                    <div className={styles.resultDetails}>
                      <p>All tests completed successfully!</p>
                      <div className={styles.codeContainer}>
                        <pre>
                          {JSON.stringify(openAITestResults.results, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={styles.openaiTestButton}
                  onClick={runOpenAITest}
                  disabled={isTestingOpenAI}
                >
                  {isTestingOpenAI ? 'Testing...' : 'Run Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
