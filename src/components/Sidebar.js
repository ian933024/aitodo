import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { isAfter, endOfWeek, addDays, parseISO } from 'date-fns';
import {
  FaHome,
  FaCalendarDay,
  FaCalendarWeek,
  FaHashtag,
  FaCheckCircle,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaUser,
  FaUserCog,
} from 'react-icons/fa';
import {
  updateFilterStatus,
  updateDueDateFilter,
  updateHashtagFilter,
} from '../slices/todoSlice';
import TodoModal from './TodoModal';
import UserProfile from './UserProfile';
import styles from '../styles/modules/sidebar.module.scss';

function Sidebar({
  onSidebarToggle,
  onLogout,
  currentUser,
  userId,
  onUsernameChange,
}) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const todoList = useSelector((state) => state.todo.todoList);
  const filterStatus = useSelector((state) => state.todo.filterStatus);
  const dueDateFilter = useSelector((state) => state.todo.dueDateFilter);
  const hashtagFilter = useSelector((state) => state.todo.hashtagFilter);
  const [uniqueHashtags, setUniqueHashtags] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Extract unique hashtags from todoList
  useEffect(() => {
    const hashtagSet = new Set();
    todoList.forEach((todo) => {
      if (todo.hashtags) {
        const tags = todo.hashtags.split(/\s+/);
        tags.forEach((tag) => {
          if (tag) {
            hashtagSet.add(tag.startsWith('#') ? tag : `#${tag}`);
          }
        });
      }
    });
    setUniqueHashtags(Array.from(hashtagSet));
  }, [todoList]);

  // Calculate counts for sidebar sections
  const getTaskCounts = () => {
    const taskCounts = {
      all: todoList.length,
      today: 0,
      thisWeek: 0,
      completed: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    weekEnd.setHours(23, 59, 59, 999);

    todoList.forEach((todo) => {
      // Count completed tasks
      if (todo.status === 'complete') {
        taskCounts.completed += 1;
      }

      // Count today's tasks
      if (todo.dueDate) {
        const dueDate = new Date(todo.dueDate);
        if (dueDate >= today && dueDate <= todayEnd) {
          taskCounts.today += 1;
        }

        // Count this week's tasks
        if (dueDate >= today && dueDate <= weekEnd) {
          taskCounts.thisWeek += 1;
        }
      }
    });

    return taskCounts;
  };

  const counts = getTaskCounts();

  const handleFilterByDate = (value) => {
    dispatch(updateDueDateFilter(value));
  };

  const handleFilterByStatus = (value) => {
    dispatch(updateFilterStatus(value));
  };

  const handleFilterByHashtag = (hashtag) => {
    if (hashtagFilter === hashtag) {
      // Clear filter if clicked again
      dispatch(updateHashtagFilter(''));
    } else {
      dispatch(updateHashtagFilter(hashtag));
    }
  };

  // Function to check if a date is in next week but not in this week
  const isNextWeekOnly = (dateStr) => {
    if (!dateStr) return false;

    const date = parseISO(dateStr);
    const thisWeekEnd = endOfWeek(new Date());
    const nextWeekEnd = endOfWeek(addDays(new Date(), 7));

    return isAfter(date, thisWeekEnd) && !isAfter(date, nextWeekEnd);
  };

  // Function to check if a date is further than next week
  const isFurther = (dateStr) => {
    if (!dateStr) return false;

    const date = parseISO(dateStr);
    const nextWeekEnd = endOfWeek(addDays(new Date(), 7));

    return isAfter(date, nextWeekEnd);
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }
  };

  return (
    <>
      <div className={`${styles.sidebar} ${sidebarOpen ? '' : styles.closed}`}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>
              <span className={styles.todoIcon}>📝</span> ToDoApp
            </h1>
            {currentUser && (
              <div
                className={styles.userInfo}
                onClick={() => setProfileOpen(true)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setProfileOpen(true);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <FaUser className={styles.userIcon} />
                <span className={styles.username}>{currentUser}</span>
                <FaUserCog className={styles.settingsIcon} />
              </div>
            )}
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>Main</h3>
            <motion.button
              className={`${styles.sidebarButton} ${
                dueDateFilter === 'all' && filterStatus === 'all'
                  ? styles.active
                  : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                handleFilterByDate('all');
                handleFilterByStatus('all');
              }}
            >
              <FaHome className={styles.sidebarIcon} />
              <span className={styles.buttonText}>All Tasks</span>
              <span className={styles.count}>{counts.all}</span>
            </motion.button>

            <motion.button
              className={`${styles.sidebarButton} ${
                dueDateFilter === 'today' ? styles.active : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterByDate('today')}
            >
              <FaCalendarDay className={styles.sidebarIcon} />
              <span className={styles.buttonText}>Today</span>
              <span className={styles.count}>{counts.today}</span>
            </motion.button>

            <motion.button
              className={`${styles.sidebarButton} ${
                dueDateFilter === 'this-week' ? styles.active : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterByDate('this-week')}
            >
              <FaCalendarWeek className={styles.sidebarIcon} />
              <span className={styles.buttonText}>This Week</span>
              <span className={styles.count}>{counts.thisWeek}</span>
            </motion.button>

            <motion.button
              className={`${styles.sidebarButton} ${
                dueDateFilter === 'next-week' ? styles.active : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterByDate('next-week')}
            >
              <FaCalendarWeek className={styles.sidebarIcon} />
              <span className={styles.buttonText}>Next Week</span>
              <span className={styles.count}>
                {
                  todoList.filter((todo) => {
                    if (!todo.dueDate) return false;
                    return isNextWeekOnly(todo.dueDate);
                  }).length
                }
              </span>
            </motion.button>

            <motion.button
              className={`${styles.sidebarButton} ${
                dueDateFilter === 'further' ? styles.active : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterByDate('further')}
            >
              <FaCalendarDay className={styles.sidebarIcon} />
              <span className={styles.buttonText}>Future</span>
              <span className={styles.count}>
                {
                  todoList.filter((todo) => {
                    if (!todo.dueDate) return false;
                    return isFurther(todo.dueDate);
                  }).length
                }
              </span>
            </motion.button>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>Status</h3>
            <motion.button
              className={`${styles.sidebarButton} ${
                filterStatus === 'incomplete' ? styles.active : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterByStatus('incomplete')}
            >
              <FaCheckCircle className={styles.sidebarIcon} />
              <span className={styles.buttonText}>Incomplete</span>
              <span className={styles.count}>
                {todoList.filter((todo) => todo.status === 'incomplete').length}
              </span>
            </motion.button>

            <motion.button
              className={`${styles.sidebarButton} ${
                filterStatus === 'complete' ? styles.active : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterByStatus('complete')}
            >
              <FaCheckCircle className={styles.sidebarIcon} />
              <span className={styles.buttonText}>Completed</span>
              <span className={styles.count}>{counts.completed}</span>
            </motion.button>
          </div>

          {uniqueHashtags.length > 0 && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>Hashtags</h3>
              {uniqueHashtags.map((tag, index) => (
                <motion.button
                  key={index}
                  className={`${styles.sidebarButton} ${
                    hashtagFilter === tag ? styles.active : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterByHashtag(tag)}
                >
                  <FaHashtag className={styles.sidebarIcon} />
                  <span className={styles.buttonText}>{tag}</span>
                  <span className={styles.count}>
                    {
                      todoList.filter(
                        (todo) => todo.hashtags && todo.hashtags.includes(tag)
                      ).length
                    }
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          <div className={styles.sidebarBottom}>
            <motion.button
              className={styles.addTaskButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalOpen(true)}
            >
              <FaPlus className={styles.sidebarIcon} />
              <span className={styles.buttonText}>Add New Task</span>
            </motion.button>

            {onLogout && (
              <motion.button
                className={styles.logoutButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
              >
                <FaSignOutAlt className={styles.sidebarIcon} />
                <span className={styles.buttonText}>Logout</span>
              </motion.button>
            )}

            <div className={styles.copyright}>
              &copy; {new Date().getFullYear()} TodoApp
            </div>
          </div>
        </div>
      </div>
      <TodoModal type="add" modalOpen={modalOpen} setModalOpen={setModalOpen} />
      {profileOpen && (
        <UserProfile
          currentUser={currentUser}
          userId={userId}
          onUsernameChange={onUsernameChange}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
