import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button, { SelectButton } from './Button';
import styles from '../styles/modules/app.module.scss';
import TodoModal from './TodoModal';
import { updateFilterStatus, updateDueDateFilter } from '../slices/todoSlice';

function AppHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const initialFilterStatus = useSelector((state) => state.todo.filterStatus);
  const initialDueDateFilter = useSelector((state) => state.todo.dueDateFilter);
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const [dueDateFilter, setDueDateFilter] = useState(initialDueDateFilter);
  const dispatch = useDispatch();

  const updateFilter = (e) => {
    setFilterStatus(e.target.value);
    dispatch(updateFilterStatus(e.target.value));
  };
  
  const updateDueDateFilterStatus = (e) => {
    setDueDateFilter(e.target.value);
    dispatch(updateDueDateFilter(e.target.value));
  };

  return (
    <div className={styles.appHeader}>
      <Button variant="primary" onClick={() => setModalOpen(true)}>
        Add Task
      </Button>
      <div className={styles.filterContainer}>
        <SelectButton
          id="status"
          onChange={(e) => updateFilter(e)}
          value={filterStatus}
        >
          <option value="all">All</option>
          <option value="incomplete">Incomplete</option>
          <option value="complete">Completed</option>
        </SelectButton>
        <SelectButton
          id="dueDate"
          onChange={(e) => updateDueDateFilterStatus(e)}
          value={dueDateFilter}
        >
          <option value="all">All Due Dates</option>
          <option value="today">Today</option>
          <option value="this-week">This Week</option>
          <option value="next-week">Next Week</option>
          <option value="further">Further</option>
        </SelectButton>
      </div>
      <TodoModal type="add" modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </div>
  );
}

export default AppHeader;
