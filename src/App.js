import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppContent from './components/AppContent';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import PageTitle from './components/PageTitle';
import Login from './components/Login';
import styles from './styles/modules/app.module.scss';
import { setCurrentUser } from './slices/todoSlice';

function App() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUsername] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentTodoUser');
    if (savedUser) {
      setIsLoggedIn(true);
      setCurrentUsername(savedUser);
      dispatch(setCurrentUser(savedUser));
    }
  }, [dispatch]);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setCurrentUsername(username);
    localStorage.setItem('currentTodoUser', username);
    dispatch(setCurrentUser(username));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUsername('');
    localStorage.removeItem('currentTodoUser');
    dispatch(setCurrentUser(''));
  };

  return (
    <>
      {isLoggedIn ? (
        <div className={styles.appContainer}>
          <Sidebar 
            onSidebarToggle={handleSidebarToggle}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
          <div className={`${styles.mainContent} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
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
