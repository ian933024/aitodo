# React Todo App Development Guide

## Commands
- `npm start` - Start development server
- `npm run build` - Build production version
- `npm test` - Run all tests
- `npm test -- --testNamePattern="test name"` - Run specific test
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues automatically

## Code Style
- **Components**: Functional components with hooks, PascalCase naming
- **Imports**: Group by: React core, third-party libs, local imports
- **State**: Redux Toolkit for global state, useState for component state
- **CSS**: Use .module.scss files with BEM-inspired naming
- **Redux**: Use createSlice pattern, dispatch for state changes
- **Error Handling**: react-hot-toast for notifications, validate inputs
- **Backend**: Express.js API in backend/ folder
- **Testing**: Jest for unit tests, descriptive test names
- **AI/OpenAI**: Use services/openaiService.js for API interactions
- **Chatbot**: Follow component pattern in Chatbot.js

## Git Workflow
- Commit often with descriptive messages
- Create feature branches from main
- Squash and rebase before merging to main
