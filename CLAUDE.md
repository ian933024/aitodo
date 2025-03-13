# React Todo App Development Guide

## Build Commands
- `npm start` - Start development server
- `npm build` - Build production version
- `npm test` - Run all tests
- `npm test -- --testNamePattern="test name"` - Run specific test

## Code Style Guidelines

### Component Structure
- Use functional components with hooks
- PascalCase for component names (TodoItem, AppHeader)
- Group imports by type: React core, third-party, local imports
- Use named exports for utility functions

### State Management
- Use Redux Toolkit for global state
- Use local useState for component-specific state
- Follow slice pattern for Redux state organization

### CSS/Styling
- Use CSS modules (.module.scss files)
- BEM-inspired class naming in modules
- Use getClasses utility for conditional class names

### Error Handling
- Use react-hot-toast for user notifications
- Validate inputs before operations
- Use conditional rendering for UI state management

### Redux Patterns
- Use createSlice for reducers
- Use dispatch for all state changes
- Keep selectors in slice files