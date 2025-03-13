import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useSelector } from 'react-redux';
import { isToday, parseISO, isThisWeek, isAfter, endOfWeek, addDays } from 'date-fns';
import styles from '../styles/modules/app.module.scss';
import TodoItem from './TodoItem';

const container = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
const child = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function AppContent() {
  const todoList = useSelector((state) => state.todo.todoList);
  const filterStatus = useSelector((state) => state.todo.filterStatus);
  const dueDateFilter = useSelector((state) => state.todo.dueDateFilter);
  const hashtagFilter = useSelector((state) => state.todo.hashtagFilter);

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

  const sortedTodoList = [...todoList];
  sortedTodoList.sort((a, b) => new Date(b.time) - new Date(a.time));

  // First filter by status
  const statusFilteredList = sortedTodoList.filter((item) => {
    if (filterStatus === 'all') {
      return true;
    }
    return item.status === filterStatus;
  });

  // Then filter by due date
  const dueDateFilteredList = statusFilteredList.filter((item) => {
    // All due dates
    if (dueDateFilter === 'all') {
      return true;
    }
    
    // No due date tasks are only shown when filter is 'all'
    if (!item.dueDate) {
      return false;
    }
    
    // Tasks due today
    if (dueDateFilter === 'today') {
      return isToday(parseISO(item.dueDate));
    }
    
    // Tasks due this week
    if (dueDateFilter === 'this-week') {
      return isThisWeek(parseISO(item.dueDate));
    }
    
    // Tasks due next week (including tasks from this week)
    if (dueDateFilter === 'next-week') {
      return isThisWeek(parseISO(item.dueDate)) || isNextWeekOnly(item.dueDate);
    }
    
    // Tasks due further than next week
    if (dueDateFilter === 'further') {
      return isFurther(item.dueDate);
    }
    
    return true;
  });
  
  // Finally filter by hashtag if applicable
  const filteredTodoList = dueDateFilteredList.filter((item) => {
    if (!hashtagFilter) {
      return true;
    }
    return item.hashtags && item.hashtags.includes(hashtagFilter);
  });

  return (
    <motion.div
      className={styles.content__wrapper}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {filteredTodoList && filteredTodoList.length > 0 ? (
          filteredTodoList.map((todo) => (
            // <motion.div key={todo.id} variants={child}>
            <TodoItem key={todo.id} todo={todo} />
            // </motion.div>
          ))
        ) : (
          <motion.p variants={child} className={styles.emptyText}>
            No Todos
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AppContent;
