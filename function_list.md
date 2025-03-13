# React Todo App Functions

## App.js
- `App()`: Main component that renders the application structure with PageTitle, AppHeader, and AppContent components.

## components/AppContent.js
- `AppContent()`: Renders the todo list content based on filter status, sorts todos by time, and filters them according to the selected status.

## components/AppHeader.js
- `AppHeader()`: Renders the application header with Add Task button and filter dropdown.
- `updateFilter(e)`: Updates the filter status when the dropdown selection changes.

## components/Button.js
- `Button({ type, variant, children, ...rest })`: Renders a customizable button component.
- `SelectButton({ children, id, ...rest })`: Renders a select dropdown styled as a button.

## components/CheckButton.js
- `CheckButton({ checked, handleCheck })`: Renders an animated checkbox button for marking todos as complete/incomplete.

## components/PageTitle.js
- `PageTitle({ children, ...rest })`: Renders the page title component.

## components/TodoItem.js
- `TodoItem({ todo })`: Renders a single todo item with title, time, status, and action buttons.
- `handleCheck()`: Toggles the checked status of a todo item.
- `handleDelete()`: Deletes a todo item.
- `handleUpdate()`: Opens the update modal for a todo item.

## components/TodoModal.js
- `TodoModal({ type, modalOpen, setModalOpen, todo })`: Renders the modal for adding/updating todos.
- `handleSubmit(e)`: Processes the form submission for adding or updating a todo.

## slices/todoSlice.js
- `getInitialTodo()`: Retrieves the initial todo list from localStorage.
- Redux slice reducer functions:
  - `addTodo(state, action)`: Adds a new todo to the state and localStorage.
  - `updateTodo(state, action)`: Updates an existing todo in the state and localStorage.
  - `deleteTodo(state, action)`: Deletes a todo from the state and localStorage.
  - `updateFilterStatus(state, action)`: Updates the filter status in the state.

## utils/getClasses.js
- `getClasses(classes)`: Utility function to join CSS class names and filter out empty strings.