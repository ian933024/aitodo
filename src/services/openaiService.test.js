import { sendChatMessage } from './openaiService';

// Simple test function to verify openaiService is working
const testOpenAIService = async () => {
  console.log('Starting OpenAI service test...');
  
  try {
    // Test a message that should trigger a normal response
    const normalMessages = [
      { role: 'system', content: 'You are a helpful assistant for a todo application.' },
      { role: 'user', content: 'Hello, can you help me with my tasks?' }
    ];
    
    console.log('Testing normal chat message...');
    const normalResponse = await sendChatMessage(normalMessages);
    console.log('Normal response received:', normalResponse);
    
    // Test a message that should trigger the getWeatherInfo function
    const weatherMessages = [
      { role: 'system', content: 'You are a helpful assistant for a todo application.' },
      { role: 'user', content: 'What\'s the weather like in New York?' }
    ];
    
    console.log('Testing weather function call...');
    const weatherResponse = await sendChatMessage(weatherMessages);
    console.log('Weather response received:', weatherResponse);
    
    // Test a message that should trigger the searchTasks function
    const searchMessages = [
      { role: 'system', content: 'You are a helpful assistant for a todo application.' },
      { role: 'user', content: 'Find all my tasks related to the React project' }
    ];
    
    console.log('Testing search tasks function call...');
    const searchResponse = await sendChatMessage(searchMessages);
    console.log('Search response received:', searchResponse);
    
    // Test a message that should trigger the createTask function
    const createMessages = [
      { role: 'system', content: 'You are a helpful assistant for a todo application.' },
      { role: 'user', content: 'Create a new task to finish the OpenAI integration by tomorrow' }
    ];
    
    console.log('Testing create task function call...');
    const createResponse = await sendChatMessage(createMessages);
    console.log('Create task response received:', createResponse);
    
    console.log('All tests completed successfully!');
    return {
      success: true,
      results: {
        normalResponse,
        weatherResponse,
        searchResponse,
        createResponse
      }
    };
  } catch (error) {
    console.error('Error during OpenAI service test:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run the test if this file is executed directly
if (typeof window !== 'undefined' && window.runOpenAITest) {
  testOpenAIService()
    .then(results => {
      console.log('Test results:', results);
    })
    .catch(error => {
      console.error('Test failed:', error);
    });
}

export default testOpenAIService;