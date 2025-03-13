import React, { useState } from 'react';
import Button from './Button';
import styles from '../styles/modules/app.module.scss';
import TodoModal from './TodoModal';

function AppHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.appHeader}>
      <h2 className={styles.appHeaderTitle}>Task Management</h2>
      <Button variant="primary" onClick={() => setModalOpen(true)}>
        Add Task
      </Button>
      <TodoModal type="add" modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </div>
  );
}

export default AppHeader;
