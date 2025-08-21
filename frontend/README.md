# Project AIDR - Frontend

## Project info

Agent-driven Integrated Disaster Response platform for emergency management and crisis coordination.

## How to run this project locally

Follow these steps to set up and run the frontend:

```sh
# Step 1: Navigate to the frontend directory
cd frontend

# Step 2: Install the necessary dependencies
npm install

# Step 3: Start the development server with auto-reloading and an instant preview
npm run dev
```

The frontend will be available at `http://localhost:8080` and will automatically proxy API requests to the backend running on `http://localhost:8000`.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)
- React Router (Routing)

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/hooks/` - Custom React hooks
- `src/state/` - Global state management
- `src/lib/` - Utility functions

## Backend Integration

The frontend is configured to proxy API requests to the backend server. Make sure the backend is running on `http://localhost:8000` before starting the frontend.
