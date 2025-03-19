# React Todo App Functions

## Core Components

### App.js

- `App()`: Main component that renders the application structure with PageTitle, AppHeader, and AppContent components.

### components/AppContent.js

- `AppContent()`: Renders the todo list content based on filter status, sorts todos by time, and filters them according to the selected status.

### components/AppHeader.js

- `AppHeader()`: Renders the application header with Add Task button and filter dropdown.
- `updateFilter(e)`: Updates the filter status when the dropdown selection changes.

### components/Button.js

- `Button({ type, variant, children, ...rest })`: Renders a customizable button component.
- `SelectButton({ children, id, ...rest })`: Renders a select dropdown styled as a button.

### components/CheckButton.js

- `CheckButton({ checked, handleCheck })`: Renders an animated checkbox button for marking todos as complete/incomplete.

### components/PageTitle.js

- `PageTitle({ children, ...rest })`: Renders the page title component.

### components/TodoItem.js

- `TodoItem({ todo })`: Renders a single todo item with title, time, status, and action buttons.
- `handleCheck()`: Toggles the checked status of a todo item.
- `handleDelete()`: Deletes a todo item.
- `handleUpdate()`: Opens the update modal for a todo item.

### components/TodoModal.js

- `TodoModal({ type, modalOpen, setModalOpen, todo })`: Renders the modal for adding/updating todos.
- `handleSubmit(e)`: Processes the form submission for adding or updating a todo.

### slices/todoSlice.js

- Redux slice with Firebase integration:
  - `fetchTodos(username)`: Fetches todos for a specific user from Firebase
  - `createTodo(todo)`: Adds a new todo to Firebase
  - `editTodo(todo)`: Updates an existing todo in Firebase
  - `removeTodo(id)`: Deletes a todo from Firebase
  - State reducers for filter status, due date filters, and hashtag filters

### utils/getClasses.js

- `getClasses(classes)`: Utility function to join CSS class names and filter out empty strings.

## AI Assistant Components

### components/Chatbot.js

- `Chatbot()`: Renders the collapsible chatbot interface for AI interactions
- `handleSubmit(e)`: Processes user messages, sends to OpenAI, and handles responses
- `toggleChatbot()`: Shows/hides the chatbot panel

### services/openaiService.js

- `sendChatMessage(messages, options)`: Sends messages to OpenAI API and processes any function calls
- Available AI functions:
  - `getWeatherInfo(location)`: Gets weather information for a location
  - `searchTasks(query)`: Searches for tasks matching the query
  - `createTask(title, status, dueDate, hashtags)`: Creates a new task from AI interaction

### services/chatTaskService.js

- `prepareTaskFromAI(taskData)`: Formats AI-extracted task data for Firebase/Redux
- `createTaskFromAI(taskData, dispatch)`: Creates a task from AI data and adds it to Redux/Firebase

## Firebase Integration

### firebase/config.js
- Firebase configuration and initialization

### firebase/todoService.js
- `getTodos(username)`: Fetches todos for a specific user
- `addTodo(todo)`: Adds a new todo to Firestore
- `updateTodo(id, updatedTodo)`: Updates a todo in Firestore
- `deleteTodo(id)`: Deletes a todo from Firestore
