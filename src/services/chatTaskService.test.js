import { prepareTaskFromAI, createTaskFromAI } from './chatTaskService';
import { createTodo } from '../slices/todoSlice';

// Mock the date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn(() => '10:00 AM, 03/20/2025'),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Redux
jest.mock('../slices/todoSlice', () => ({
  createTodo: jest.fn().mockImplementation(todo => ({
    payload: { id: 'mocked-id', ...todo },
  })),
}));

describe('chatTaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('currentTodoUser', 'testuser');
  });

  describe('prepareTaskFromAI', () => {
    it('should correctly format a task from AI data', () => {
      const aiData = {
        title: 'Complete project',
        status: 'incomplete',
        dueDate: '2025-03-25',
        hashtags: '#work #urgent',
      };

      const result = prepareTaskFromAI(aiData);

      expect(result).toEqual({
        title: 'Complete project',
        status: 'incomplete',
        time: '10:00 AM, 03/20/2025',
        dueDateType: 'custom',
        dueDate: '2025-03-25',
        hashtags: '#work #urgent',
        user: 'testuser',
      });
    });

    it('should throw error if title is missing', () => {
      const aiData = {
        status: 'incomplete',
      };

      expect(() => prepareTaskFromAI(aiData)).toThrow('Task must have a title');
    });

    it('should throw error if user is not logged in', () => {
      localStorage.removeItem('currentTodoUser');
      
      const aiData = {
        title: 'Complete project',
      };

      expect(() => prepareTaskFromAI(aiData)).toThrow('User not logged in');
    });

    it('should set dueDateType correctly based on dueDate', () => {
      // With due date
      const withDueDate = prepareTaskFromAI({
        title: 'Test task',
        dueDate: '2025-03-25',
      });
      expect(withDueDate.dueDateType).toBe('custom');

      // Without due date
      const withoutDueDate = prepareTaskFromAI({
        title: 'Test task',
      });
      expect(withoutDueDate.dueDateType).toBe('no-due-date');
    });
  });

  describe('createTaskFromAI', () => {
    it('should dispatch createTodo with the prepared task', async () => {
      const dispatch = jest.fn().mockImplementation(() => ({
        unwrap: jest.fn().mockResolvedValue({ id: 'mocked-id' }),
      }));

      const aiData = {
        title: 'Complete project',
        status: 'incomplete',
      };

      await createTaskFromAI(aiData, dispatch);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(expect.any(Object));
      
      // Check that createTodo was called with the correct data
      const expectedTask = {
        title: 'Complete project',
        status: 'incomplete',
        time: '10:00 AM, 03/20/2025',
        dueDateType: 'no-due-date',
        dueDate: null,
        hashtags: '',
        user: 'testuser',
      };
      
      expect(createTodo).toHaveBeenCalledWith(expectedTask);
    });

    it('should throw an error if task preparation fails', async () => {
      const dispatch = jest.fn();
      const aiData = {}; // Missing title will cause prepareTaskFromAI to throw

      await expect(createTaskFromAI(aiData, dispatch)).rejects.toThrow('Task must have a title');
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});