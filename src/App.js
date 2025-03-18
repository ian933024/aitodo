import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppContent from './components/AppContent';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import PageTitle from './components/PageTitle';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Chatbot from './components/Chatbot';
import styles from './styles/modules/app.module.scss';
import { setCurrentUser, fetchTodos } from './slices/todoSlice';

function App() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.todo);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [appLoading, setAppLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentTodoUser');
    const savedUserId = localStorage.getItem('currentTodoUserId');
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';

    if (savedUser) {
      setAppLoading(true);
      setIsLoggedIn(true);
      setCurrentUsername(savedUser);
      setUserId(savedUserId);
      setIsAdmin(savedIsAdmin);

      if (!savedIsAdmin) {
        dispatch(setCurrentUser(savedUser));

        // Fetch todos from Firestore for regular users
        dispatch(fetchTodos(savedUser))
          .unwrap()
          .then(() => {
            console.log('Todos loaded successfully');
          })
          .catch((error) => {
            console.error('Error loading todos:', error);
          })
          .finally(() => {
            setAppLoading(false);
          });
      } else {
        setAppLoading(false);
      }
    }
  }, [dispatch]);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const handleLogin = (username, id, adminFlag = false) => {
    setAppLoading(true);
    setIsLoggedIn(true);
    setCurrentUsername(username);
    setUserId(id);
    setIsAdmin(adminFlag);

    localStorage.setItem('currentTodoUser', username);
    localStorage.setItem('currentTodoUserId', id);
    localStorage.setItem('isAdmin', adminFlag.toString());

    if (!adminFlag) {
      dispatch(setCurrentUser(username));

      // Fetch todos from Firestore for regular users
      dispatch(fetchTodos(username))
        .unwrap()
        .then(() => {
          console.log('Todos loaded successfully');
        })
        .catch((error) => {
          console.error('Error loading todos:', error);
        })
        .finally(() => {
          setAppLoading(false);
        });
    } else {
      setAppLoading(false);
    }
  };

  const handleUsernameChange = (newUsername) => {
    setCurrentUsername(newUsername);
    localStorage.setItem('currentTodoUser', newUsername);
    dispatch(setCurrentUser(newUsername));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUsername('');
    setUserId('');
    setIsAdmin(false);
    localStorage.removeItem('currentTodoUser');
    localStorage.removeItem('currentTodoUserId');
    localStorage.removeItem('isAdmin');
    dispatch(setCurrentUser(''));
  };

  // Handle error display
  useEffect(() => {
    if (error) {
      console.error('Redux state error:', error);
    }
  }, [error]);

  // Determine which component to render based on login state and user role
  const renderContent = () => {
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
    }

    if (isAdmin) {
      return <AdminPanel onLogout={handleLogout} />;
    }

    // Regular user view
    return (
      <div className={styles.appContainer}>
        {(loading || appLoading) && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
            <p>Loading your tasks...</p>
          </div>
        )}
        <Sidebar
          onSidebarToggle={handleSidebarToggle}
          onLogout={handleLogout}
          currentUser={currentUser}
          userId={userId}
          onUsernameChange={handleUsernameChange}
        />
        <div
          className={`${styles.mainContent} ${
            sidebarOpen ? '' : styles.sidebarClosed
          }`}
        >
          <PageTitle>TODO List</PageTitle>
          <div className={styles.app__wrapper}>
            <AppHeader currentUser={currentUser} />
            <AppContent currentUser={currentUser} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {isLoggedIn && !isAdmin && <Chatbot />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontSize: '1.4rem',
          },
        }}
      />
    </>
  );
}

export default App;
