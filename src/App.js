import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppContent from './components/AppContent';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import PageTitle from './components/PageTitle';
import Login from './components/Login';
import styles from './styles/modules/app.module.scss';
import { setCurrentUser, fetchTodos } from './slices/todoSlice';

function App() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.todo);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUsername] = useState('');
  const [appLoading, setAppLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentTodoUser');
    if (savedUser) {
      setAppLoading(true);
      setIsLoggedIn(true);
      setCurrentUsername(savedUser);
      dispatch(setCurrentUser(savedUser));

      // Fetch todos from Firestore for this user
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
    }
  }, [dispatch]);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const handleLogin = (username) => {
    setAppLoading(true);
    setIsLoggedIn(true);
    setCurrentUsername(username);
    localStorage.setItem('currentTodoUser', username);
    dispatch(setCurrentUser(username));

    // Fetch todos from Firestore for this user
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
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUsername('');
    localStorage.removeItem('currentTodoUser');
    dispatch(setCurrentUser(''));
  };

  // Handle error display
  useEffect(() => {
    if (error) {
      console.error('Redux state error:', error);
    }
  }, [error]);

  return (
    <>
      {isLoggedIn ? (
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
      ) : (
        <Login onLogin={handleLogin} />
      )}
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
