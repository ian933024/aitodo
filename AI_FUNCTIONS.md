# AI Functions Documentation

This document provides detailed information about the AI-powered features in the React Todo App and how they work.

## Overview

The React Todo App includes an AI assistant that can help users manage their tasks through natural language conversations. The assistant is powered by OpenAI's GPT models and integrated with Firebase for persistent storage.

## Available Functions

### 1. createTask

Creates a new task in the todo application from natural language input.

```javascript
createTask(title, (status = "incomplete"), (dueDate = null), (hashtags = ""));
```

**Parameters:**

- `title` (string, required): The title of the task to create
- `status` (string, optional): The status of the task ('incomplete' or 'complete')
- `dueDate` (string, optional): The due date in YYYY-MM-DD format
- `hashtags` (string, optional): Space-separated hashtags for the task (e.g., "#work #urgent")

**Example Usage:**

- User: "Create a task to finish the project report by next Friday"
- AI extracts: title="finish the project report", dueDate="2025-03-28"

**Implementation Flow:**

1. AI recognizes task creation intent
2. Function parameters are extracted from user's message
3. `openaiService.js` passes task data to `chatTaskService.js`
4. Task is formatted with user context (username from localStorage)
5. Redux action is dispatched to add task to store
6. Firebase adds the task to the database
7. User sees confirmation and the new task appears in their list

### 2. searchTasks

Searches for tasks in the todo application based on query terms.

```javascript
searchTasks(query);
```

**Parameters:**

- `query` (string, required): The search query to find tasks

**Example Usage:**

- User: "Show me all my work-related tasks"
- AI extracts: query="work"

### 3. getWeatherInfo

Gets the current weather for a specified location.

```javascript
getWeatherInfo(location);
```

**Parameters:**

- `location` (string, required): The city and state (e.g., "San Francisco, CA")

**Example Usage:**

- User: "What's the weather like in Seattle?"
- AI extracts: location="Seattle"

## Technical Implementation

### Component Architecture

The AI implementation follows a clean separation of concerns pattern:

```
┌─────────────┐             ┌───────────────┐         ┌─────────────────┐
│  Chatbot.js │─────────────►openaiService.js├────────►chatTaskService.js├───┐
└─────────────┘             └───────────────┘         └─────────────────┘   │
      ▲                                                                     │
      │                                                                     │
      │                                                 ┌──────────────┐    │
      └─────────────────────────────────────────────────┤todoSlice.js  ◄────┘
                                                        └──────────────┘
                                                               │
                                                               │
                                                               ▼
                                                        ┌──────────────┐
                                                        │todoService.js│
                                                        └──────────────┘
                                                               │
                                                               │
                                                               ▼
                                                        ┌──────────────┐
                                                        │   Firebase   │
                                                        └──────────────┘
```

### Key Components

1. **openaiService.js**

   - Defines function signatures for OpenAI
   - Handles API communication with OpenAI
   - Processes function calls from AI responses

2. **chatTaskService.js**

   - Formats task data for Firebase/Redux
   - Validates required fields
   - Connects AI responses to application actions

3. **aiPrompts.js**

   - Contains the system prompts and templates
   - Provides guidance to the AI on how to handle user requests
   - Defines task creation and search templates

4. **Chatbot.js**

   - Provides chat UI for user interaction
   - Manages conversation state
   - Handles AI response processing
   - Initializes chat with system prompt

5. **Redux & Firebase Integration**
   - Uses the same Redux actions and Firebase operations as manual task creation

### System Prompt

The AI assistant is initialized with a comprehensive system prompt that guides its behavior. The prompt is stored in `aiPrompts.js` and includes:

- Task creation guidelines
- Search functionality instructions
- Expected behavior patterns
- Examples of user requests

This system prompt helps the AI understand how to:

- Extract relevant information from user messages
- Determine when to use specific functions
- Format dates and hashtags appropriately
- Ask for clarification when needed

## Extending the AI Assistant

To add new AI functions to the application:

1. Define the function signature in `openaiService.js`:

   ```javascript
   {
     name: 'newFunction',
     description: 'Description of what the function does',
     parameters: {
       type: 'object',
       properties: {
         param1: {
           type: 'string',
           description: 'Description of parameter 1'
         }
       },
       required: ['param1']
     }
   }
   ```

2. Implement the function in the `availableFunctions` object:

   ```javascript
   newFunction: async (param1) => {
     // Function implementation
     return {
       success: true,
       result: "...",
     };
   };
   ```

3. Create any necessary service files to handle the function's business logic

4. Update the Chatbot component to handle the new function type:
   ```javascript
   if (
     response.functionCalled === "newFunction" &&
     response.functionResult.success
   ) {
     // Handle the function result
   }
   ```

## Example: Creating a Task Through the AI Assistant

Here's an example conversation that creates a new task:

User: "Can you create a task for me to finish the quarterly report by next Tuesday?"

AI: "I'll create a task for you to finish the quarterly report. Would you like me to set the due date for next Tuesday?"

User: "Yes, please."

AI: "I've created a task 'Finish quarterly report' with a due date of next Tuesday. Is there anything else you'd like to add to this task?"

User: "Add the hashtag #work please."

AI: "I've updated the task 'Finish quarterly report' with the hashtag #work and a due date of next Tuesday. The task has been added to your list."

Behind the scenes:

1. The AI recognized the intent to create a task
2. It extracted "finish the quarterly report" as the title
3. It identified "next Tuesday" as the due date
4. It called the `createTask` function with these parameters
5. The task was added to Firebase via Redux
6. A success message was shown to the user

## current problem

1. AI does not know current date
2. AI cannot search existing tasks correnctly
