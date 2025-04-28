# SSO Frontend

A Vue 3 based Single Sign-On (SSO) frontend application built with Vite. This application provides user authentication, role management, and application access control features.

## Features

- User authentication and authorization
- Role-based access control
- User management
- Application management
- Password reset functionality
- Responsive dashboard interface

## Technology Stack

- Vue 3 - Progressive JavaScript Framework
- Vite - Next Generation Frontend Tooling
- Vue Router - Official router for Vue.js
- Pinia - State management
- Axios - HTTP client
- JWT Authentication
- Font Awesome - Icon library

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v16 or higher)
- npm (Node Package Manager)
- Git

## Project Setup

1. Clone the repository:
```sh
git clone [your-repository-url]
cd sso-frontend
```

2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file in the project root and configure your environment variables:
```sh
VITE_API_URL=your_backend_api_url
```

## Available Scripts

### Development
To run the application in development mode with hot-reload:
```sh
npm run dev
```

### Production Build
To build the application for production:
```sh
npm run build
```

### Preview Production Build
To preview the production build locally:
```sh
npm run preview
```

## Project Structure

```
src/
├── api/          # API services and axios configuration
├── assets/       # Static assets (images, styles)
├── components/   # Reusable Vue components
├── layouts/      # Page layouts
├── pages/        # View components for routes
├── plugins/      # Vue plugins (FontAwesome)
├── router/       # Vue Router configuration
```

## IDE Setup

Recommended IDE setup for the best development experience:
- [VS Code](https://code.visualstudio.com/) with the following extensions:
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
  - [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Customize Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/) for detailed configuration options.

## Dependencies

### Main Dependencies
- Vue 3
- Vue Router
- Pinia (State Management)
- Axios
- JWT Decode

### Development Dependencies
- Vite
- @vitejs/plugin-vue
- Font Awesome icons
- Vue DevTools

## Additional Notes

- Make sure the backend API is running before starting the frontend application
- The application uses JWT for authentication
- Font Awesome is configured for icons
- The application supports multiple layouts (Auth, Main, Public)
