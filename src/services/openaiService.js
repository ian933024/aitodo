import OpenAI from 'openai';

// Initialize the OpenAI client
// Note: In production, use environment variables for the API key
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for frontend demos, not recommended for production
});

// Define available functions that the model can call
const availableFunctions = {
  // Function to get weather information
  getWeatherInfo: async (location) => {
    // This would normally call a weather API
    // For demo purposes, return mock data
    return {
      location,
      temperature: '72°F',
      forecast: 'Sunny',
      humidity: '45%'
    };
  },
  
  // Function to search tasks in the todo app
  searchTasks: async (query) => {
    // In a real implementation, this would search the Redux store
    // or make an API call to a backend
    console.log(`Searching for tasks with query: ${query}`);
    return {
      results: [
        { id: 1, title: 'Complete React project', status: 'in-progress' },
        { id: 2, title: 'Meeting with team', status: 'pending' }
      ]
    };
  },
  
  // Function to create a new task
  createTask: async (title, status = 'incomplete', dueDate = null, hashtags = '') => {
    // This function now just returns the task data
    // The actual creation happens in Chatbot.js using chatTaskService
    console.log(`AI requested task creation: ${title}`);
    
    // Basic validation of date format if provided
    let validatedDueDate = dueDate;
    if (dueDate) {
      try {
        // Check if it's a valid date
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date format from AI:', dueDate);
          validatedDueDate = null;
        }
      } catch (error) {
        console.error('Error validating due date from AI:', error);
        validatedDueDate = null;
      }
    }
    
    return {
      success: true,
      task: { 
        title, 
        status, 
        dueDate: validatedDueDate, 
        hashtags 
      }
    };
  }
};

// Function definitions for the OpenAI API
const functionDefinitions = [
  {
    name: 'getWeatherInfo',
    description: 'Get the current weather in a given location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        }
      },
      required: ['location']
    }
  },
  {
    name: 'searchTasks',
    description: 'Search for tasks in the todo application',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to find tasks'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'createTask',
    description: 'Create a new task in the todo application',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the task to create'
        },
        status: {
          type: 'string',
          enum: ['incomplete', 'complete'],
          description: 'The status of the task'
        },
        dueDate: {
          type: 'string',
          description: 'The due date in YYYY-MM-DD format (optional)'
        },
        hashtags: {
          type: 'string',
          description: 'Space-separated hashtags for the task, e.g. "#work #urgent" (optional)'
        }
      },
      required: ['title']
    }
  }
];

/**
 * Sends a message to the OpenAI API and processes any function calls
 * @param {array} messages - Array of message objects with 'role' and 'content'
 * @param {object} options - Additional options
 * @returns {object} The response message and any function results
 */
export const sendChatMessage = async (messages, options = {}) => {
  try {
    // Initial API call with function definitions
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      functions: functionDefinitions,
      function_call: 'auto', // Let the model decide when to call functions
    });
    
    // Get the assistant's response
    const responseMessage = response.choices[0].message;
    
    // Check if the model wanted to call a function
    if (responseMessage.function_call) {
      // Get function name and arguments from the response
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      
      // Check if the function exists in our available functions
      if (functionName in availableFunctions) {
        // Execute the function with provided arguments
        const functionResponse = await availableFunctions[functionName](...Object.values(functionArgs));
        
        // Add the function call and result to the message history
        const functionCallMessage = responseMessage;
        const functionResultMessage = {
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResponse),
        };
        
        // Second API call to get the model's response to the function result
        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [...messages, functionCallMessage, functionResultMessage],
        });
        
        return {
          response: secondResponse.choices[0].message,
          functionCalled: functionName,
          functionResult: functionResponse
        };
      }
    }
    
    // If no function was called, return the response directly
    return {
      response: responseMessage,
      functionCalled: null,
      functionResult: null
    };
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    throw error;
  }
};

export default {
  sendChatMessage,
};