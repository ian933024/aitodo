import { format, addWeeks } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { BsCalendarPlus, BsCalendarX } from 'react-icons/bs';
import { FaCalendarDay, FaCalendarWeek, FaHashtag } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { deleteTodo, updateTodo } from '../slices/todoSlice';
import styles from '../styles/modules/todoItem.module.scss';
import { getClasses } from '../utils/getClasses';
import CheckButton from './CheckButton';
import TodoModal from './TodoModal';

const child = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function TodoItem({ todo }) {
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [quickHashtagOpen, setQuickHashtagOpen] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');

  useEffect(() => {
    if (todo.status === 'complete') {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [todo.status]);

  const handleCheck = () => {
    setChecked(!checked);
    dispatch(
      updateTodo({ ...todo, status: checked ? 'incomplete' : 'complete' })
    );
  };

  const handleDelete = () => {
    dispatch(deleteTodo(todo.id));
    toast.success('Todo Deleted Successfully');
  };

  const handleUpdate = () => {
    setUpdateModalOpen(true);
  };

  const handleMoveToNextWeek = () => {
    if (todo.dueDate) {
      const newDueDate = addWeeks(new Date(todo.dueDate), 1).toISOString();
      dispatch(updateTodo({ ...todo, dueDate: newDueDate }));
      toast.success('Due date moved to next week');
    } else {
      const newDueDate = addWeeks(new Date(), 1).toISOString();
      dispatch(updateTodo({ ...todo, dueDate: newDueDate }));
      toast.success('Due date set to next week');
    }
  };
  const handleMoveToTwoWeeksLater = () => {
    if (todo.dueDate) {
      const newDueDate = addWeeks(new Date(todo.dueDate), 2).toISOString();
      dispatch(updateTodo({ ...todo, dueDate: newDueDate }));
      toast.success('Due date moved to two weeks later');
    } else {
      const newDueDate = addWeeks(new Date(), 2).toISOString();
      dispatch(updateTodo({ ...todo, dueDate: newDueDate }));
      toast.success('Due date set to two weeks later');
    }
  };

  const handleSetDueToday = () => {
    const newDueDate = new Date().toISOString();
    dispatch(updateTodo({ ...todo, dueDate: newDueDate }));
    toast.success('Due date set to today');
  };

  const handleCancelDueDate = () => {
    dispatch(updateTodo({ ...todo, dueDate: null }));
    toast.success('Due date cancelled');
  };

  const handleHashtagClick = (tag) => {
    // In the future, this could be used to filter todos by hashtag
    toast.success(`Clicked hashtag: ${tag}`);
  };

  const handleQuickAddHashtag = () => {
    setQuickHashtagOpen(!quickHashtagOpen);
    setNewHashtag('');
  };

  const handleAddNewHashtag = (e) => {
    e.preventDefault();
    if (!newHashtag.trim()) {
      toast.error('Please enter a hashtag');
      return;
    }

    let tag = newHashtag.trim();
    if (!tag.startsWith('#')) {
      tag = `#${tag}`;
    }

    // Ensure no spaces in the hashtag
    tag = tag.replace(/\s+/g, '');

    const currentTags = todo.hashtags ? todo.hashtags.trim() : '';
    const updatedHashtags = currentTags ? `${currentTags} ${tag}` : tag;

    dispatch(updateTodo({ ...todo, hashtags: updatedHashtags }));
    toast.success(`Added hashtag: ${tag}`);
    setQuickHashtagOpen(false);
    setNewHashtag('');
  };

  return (
    <>
      <motion.div className={styles.item} variants={child}>
        <div className={styles.todoDetails}>
          <CheckButton checked={checked} handleCheck={handleCheck} />
          <div className={styles.texts}>
            <p
              className={getClasses([
                styles.todoText,
                todo.status === 'complete' && styles['todoText--completed'],
              ])}
            >
              {todo.title}
            </p>
            <p className={styles.time}>
              {todo.dueDate && (
                <span className={styles.dueDate}>
                  Due: {format(new Date(todo.dueDate), 'MM/dd/yyyy')}
                </span>
              )}
              {!todo.dueDate && (
                <span className={styles.noDueDate}>No due date</span>
              )}
            </p>
            {todo.hashtags && todo.hashtags.trim() !== '' && (
              <p className={styles.hashtags}>
                {todo.hashtags.split(/\s+/).map((tag, index) => (
                  <span 
                    key={index} 
                    className={styles.hashtag}
                    onClick={() => handleHashtagClick(tag)}
                    onKeyDown={(e) => e.key === 'Enter' && handleHashtagClick(tag)}
                    role="button"
                    tabIndex={0}
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </p>
            )}
            {quickHashtagOpen && (
              <form onSubmit={handleAddNewHashtag} className={styles.quickHashtagForm}>
                <input
                  type="text"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  placeholder="Add hashtag (e.g. #work)"
                  className={styles.quickHashtagInput}
                  ref={(input) => input && input.focus()}
                />
                <button type="submit" className={styles.quickHashtagButton}>Add</button>
              </form>
            )}
          </div>
        </div>
        <div className={styles.todoActions}>
          <div className={styles.dueDateActions}>
            <div
              className={styles.icon}
              onClick={() => handleSetDueToday()}
              onKeyDown={() => handleSetDueToday()}
              tabIndex={0}
              role="button"
              title="Due today"
            >
              <FaCalendarDay />
            </div>
            <div
              className={styles.icon}
              onClick={() => handleMoveToNextWeek()}
              onKeyDown={() => handleMoveToNextWeek()}
              tabIndex={0}
              role="button"
              title="Due next week"
            >
              <FaCalendarWeek />
            </div>
            <div
              className={styles.icon}
              onClick={() => handleMoveToTwoWeeksLater()}
              onKeyDown={() => handleMoveToTwoWeeksLater()}
              tabIndex={0}
              role="button"
              title="Due in two weeks"
            >
              <BsCalendarPlus />
            </div>
            <div
              className={styles.icon}
              onClick={() => handleCancelDueDate()}
              onKeyDown={() => handleCancelDueDate()}
              tabIndex={0}
              role="button"
              title="Cancel due date"
            >
              <BsCalendarX />
            </div>
          </div>
          <div
            className={styles.icon}
            onClick={() => handleDelete()}
            onKeyDown={() => handleDelete()}
            tabIndex={0}
            role="button"
          >
            <MdDelete />
          </div>
          <div
            className={styles.icon}
            onClick={() => handleQuickAddHashtag()}
            onKeyDown={() => handleQuickAddHashtag()}
            tabIndex={0}
            role="button"
            title="Add hashtag"
          >
            <FaHashtag />
          </div>
          <div
            className={styles.icon}
            onClick={() => handleUpdate()}
            onKeyDown={() => handleUpdate()}
            tabIndex={0}
            role="button"
          >
            <MdEdit />
          </div>
        </div>
      </motion.div>
      <TodoModal
        type="update"
        modalOpen={updateModalOpen}
        setModalOpen={setUpdateModalOpen}
        todo={todo}
      />
    </>
  );
}

export default TodoItem;
