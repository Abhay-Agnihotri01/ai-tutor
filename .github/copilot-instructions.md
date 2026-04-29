# AI Tutor Platform - Copilot Instructions

## Project Overview
This is a live tutoring platform with video streaming capabilities, focusing on live classes, recordings, and student-instructor interactions.

## Architecture
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express
- Video Streaming: LiveKit integration
- Storage: Cloudinary for video storage
- State Management: React Context + Hooks

## Key Components

### Live Class System
- LiveClassRoom component handles video streaming sessions
- Uses LiveKit for real-time video/audio
- Recording functionality using MediaRecorder API
- Cloudinary integration for storing recordings

### File Structure
```
frontend/
  ├── src/
  │   ├── components/     # Reusable UI components
  │   ├── pages/         # Route-level components
  │   ├── contexts/      # React contexts
  │   └── styles/        # Component styles
backend/
  ├── src/
  │   ├── routes/        # API endpoints
  │   ├── controllers/   # Business logic
  │   └── models/        # Data models
```

## Development Workflow

### Environment Setup
1. Frontend: `npm run dev` (port 5173)
2. Backend: `npm run dev` (port 5000)

### Key Commands
```bash
# Frontend
npm run dev
npm run build
npm run preview

# Backend
npm run dev
npm run start
```

## Conventions

### Components
- Use TypeScript interfaces for props
- Functional components with React.FC type
- Hooks at top level, never conditional
- Use ...existing code... comment for unchanged sections

### State Management
- Context for global state
- useState for component-level state
- useCallback for memoized functions

### API Integration
- Axios for HTTP requests
- Error handling with try/catch
- Toast notifications for user feedback

## Common Patterns

### Video Recording
```typescript
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
  // Initialize MediaRecorder
}
```

### Error Handling
```typescript
try {
  await someOperation();
  toast.success('Operation successful');
} catch (error) {
  console.error(error);
  toast.error('Operation failed');
}
```

## Key Dependencies
- LiveKit: Video streaming
- Cloudinary: Video storage
- React-Toastify: Notifications
- Axios: HTTP client

## Testing
- Jest for unit tests
- React Testing Library for component tests