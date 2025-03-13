import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import AppContent from './components/AppContent';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import PageTitle from './components/PageTitle';
import styles from './styles/modules/app.module.scss';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <>
      <div className={styles.appContainer}>
        <Sidebar onSidebarToggle={handleSidebarToggle} />
        <div className={`${styles.mainContent} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
          <PageTitle>TODO List</PageTitle>
          <div className={styles.app__wrapper}>
            <AppHeader />
            <AppContent />
          </div>
        </div>
      </div>
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
