import { format } from 'date-fns';
import { createTodo } from '../slices/todoSlice';

/**
 * Parse AI-extracted task data and prepare for Redux/Firebase
 * @param {Object} taskData - Task data from AI
 * @returns {Object} Properly formatted task object
 */
export const prepareTaskFromAI = (taskData) => {
  const { 
    title, 
    status = 'incomplete', 
    dueDate = null, 
    hashtags = '' 
  } = taskData;
  
  if (!title) {
    throw new Error('Task must have a title');
  }
  
  const currentUser = localStorage.getItem('currentTodoUser');
  if (!currentUser) {
    throw new Error('User not logged in');
  }
  
  // Validate dueDate if provided
  let validatedDueDate = dueDate;
  if (dueDate) {
    try {
      const date = new Date(dueDate);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid due date provided:', dueDate);
        validatedDueDate = null;
      } else {
        // Ensure consistent format: YYYY-MM-DD
        validatedDueDate = date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error validating due date:', error);
      validatedDueDate = null;
    }
  }
  
  // Format task object to match the expected structure in TodoModal
  return {
    title,
    status,
    time: format(new Date(), 'p, MM/dd/yyyy'),
    dueDateType: validatedDueDate ? 'custom' : 'no-due-date',
    dueDate: validatedDueDate,
    hashtags,
    user: currentUser,
  };
};

/**
 * Process AI task creation request and dispatch to Redux
 * @param {Object} taskData - Task data from AI
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise} Result of task creation
 */
export const createTaskFromAI = async (taskData, dispatch) => {
  try {
    const newTask = prepareTaskFromAI(taskData);
    return await dispatch(createTodo(newTask)).unwrap();
  } catch (error) {
    console.error('Error creating task from AI:', error);
    throw error;
  }
};

export default {
  prepareTaskFromAI,
  createTaskFromAI
};