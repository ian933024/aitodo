import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { MdOutlineClose } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format, endOfWeek, endOfNextWeek, addDays } from 'date-fns';
import { addTodo, updateTodo } from '../slices/todoSlice';
import styles from '../styles/modules/modal.module.scss';
import Button from './Button';

const dropIn = {
  hidden: {
    opacity: 0,
    transform: 'scale(0.9)',
  },
  visible: {
    transform: 'scale(1)',
    opacity: 1,
    transition: {
      duration: 0.1,
      type: 'spring',
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    transform: 'scale(0.9)',
    opacity: 0,
  },
};

function TodoModal({ type, modalOpen, setModalOpen, todo }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('incomplete');
  const [dueDateType, setDueDateType] = useState('no-due-date');
  const [customDueDate, setCustomDueDate] = useState('');
  const [hashtags, setHashtags] = useState('');

  // Calculate end of current week (Sunday)
  const getEndOfWeek = () => {
    return endOfWeek(new Date());
  };

  // Calculate end of next week (Sunday)
  const getEndOfNextWeek = () => {
    return endOfWeek(addDays(new Date(), 7));
  };

  // Get the actual due date based on selection
  const getActualDueDate = () => {
    switch (dueDateType) {
      case 'this-week':
        return format(getEndOfWeek(), 'yyyy-MM-dd');
      case 'next-week':
        return format(getEndOfNextWeek(), 'yyyy-MM-dd');
      case 'custom':
        return customDueDate;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (type === 'update' && todo) {
      setTitle(todo.title);
      setStatus(todo.status);
      setDueDateType(todo.dueDateType || 'no-due-date');
      setCustomDueDate(todo.dueDate || '');
      setHashtags(todo.hashtags || '');
    } else {
      setTitle('');
      setStatus('incomplete');
      setDueDateType('no-due-date');
      setCustomDueDate('');
      setHashtags('');
    }
  }, [type, todo, modalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title === '') {
      toast.error('Please enter a title');
      return;
    }
    
    // Get the actual due date
    const dueDate = getActualDueDate();
    
    if (title) {
      if (type === 'add') {
        dispatch(
          addTodo({
            id: uuid(),
            title,
            status: 'incomplete', // Always set new tasks to incomplete
            time: format(new Date(), 'p, MM/dd/yyyy'),
            dueDate, // Add due date
            dueDateType, // Add due date type
            hashtags // Add hashtags
          })
        );
        toast.success('Task added successfully');
      }
      if (type === 'update') {
        if (
          todo.title !== title || 
          todo.status !== status || 
          todo.dueDate !== dueDate || 
          todo.dueDateType !== dueDateType ||
          todo.hashtags !== hashtags
        ) {
          dispatch(updateTodo({ 
            ...todo, 
            title, 
            status, 
            dueDate,
            dueDateType,
            hashtags 
          }));
          toast.success('Task Updated successfully');
        } else {
          toast.error('No changes made');
          return;
        }
      }
      setModalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className={styles.wrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.container}
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={styles.closeButton}
              onKeyDown={() => setModalOpen(false)}
              onClick={() => setModalOpen(false)}
              role="button"
              tabIndex={0}
              // animation
              initial={{ top: 40, opacity: 0 }}
              animate={{ top: -10, opacity: 1 }}
              exit={{ top: 40, opacity: 0 }}
            >
              <MdOutlineClose />
            </motion.div>

            <form className={styles.form} onSubmit={(e) => handleSubmit(e)}>
              <h1 className={styles.formTitle}>
                {type === 'add' ? 'Add' : 'Update'} TODO
              </h1>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label htmlFor="dueDate">
                Due Date
                <select
                  id="dueDate"
                  value={dueDateType}
                  onChange={(e) => setDueDateType(e.target.value)}
                >
                  <option value="no-due-date">No Due Date</option>
                  <option value="this-week">This Week</option>
                  <option value="next-week">Next Week</option>
                  <option value="custom">Custom Date</option>
                </select>
              </label>
              {dueDateType === 'custom' && (
                <label htmlFor="customDate">
                  Select Date
                  <input
                    type="date"
                    id="customDate"
                    value={customDueDate}
                    onChange={(e) => setCustomDueDate(e.target.value)}
                  />
                </label>
              )}
              <label htmlFor="hashtags">
                Hashtags
                <input
                  type="text"
                  id="hashtags"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="e.g. #work #urgent #meeting (separate with spaces)"
                />
              </label>
              {type === 'update' && (
                <label htmlFor="type">
                  Status
                  <select
                    id="type"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="incomplete">Incomplete</option>
                    <option value="complete">Completed</option>
                  </select>
                </label>
              )}
              <div className={styles.buttonContainer}>
                <Button type="submit" variant="primary">
                  {type === 'add' ? 'Add Task' : 'Update Task'}
                </Button>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TodoModal;
