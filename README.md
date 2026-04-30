# AI Tutor Monorepo

Welcome to the AI Tutor project repository! This project is a comprehensive Learning Management System (LMS) and AI-powered educational platform designed to provide interactive, personalized learning experiences.

## Repository Structure

This repository is organized as a monorepo containing multiple distinct services and applications:

### 1. Backend (`/backend`)
A robust Node.js and Express backend that serves as the core of the Learning Management System.
- **Key Technologies:** Node.js, Express, Supabase (PostgreSQL), Sequelize ORM, Cloudinary (media storage), LiveKit (real-time video/audio), Socket.IO (WebSockets), Passport (authentication), and Razorpay (payments).
- **Features:** User authentication, course management, progress tracking, live sessions via LiveKit, real-time chat, and database migrations.

### 2. Frontend (`/frontend`)
The user-facing web application for the LMS.
- **Key Technologies:** React 19, Vite, Tailwind CSS v4, React Query, React Router, Recharts (for analytics dashboards), and Socket.IO client.
- **Features:** Interactive UI, real-time communication, course consumption, dashboards, and responsive design.

### 3. OpenMAIC (`/OpenMAIC`)
An advanced Next.js application designed to integrate AI capabilities seamlessly into the educational workflow.
- **Key Technologies:** Next.js 16, React 19, CopilotKit, LangChain, AI SDK, ProseMirror (rich text editing), and various specialized components (e.g., MathML processing, PPTX generation).
- **Features:** AI-assisted content generation, rich text editing, presentation generation, and interactive learning tools.

### 4. A4F Local (`/a4f-local-main`)
A Python-based unified API wrapper.
- **Key Technologies:** Python 3.8+, Pydantic, Requests.
- **Features:** Provides a unified wrapper for various reverse-engineered AI provider APIs with a focus on OpenAI compatibility and Text-to-Speech (TTS) capabilities.

### 5. Langsearch (`/langsearch-main`)
Contains the Langsearch component (currently consists of documentation/README).

## Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **Python** (3.8+ for `a4f-local`)
- **pnpm** (used in `OpenMAIC`)
- **npm** (used in `frontend` and `backend`)

### Running the Services Locally

1. **Backend**
   ```bash
   cd backend
   npm install
   # Configure your .env file based on .env.example
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **OpenMAIC**
   ```bash
   cd OpenMAIC
   pnpm install
   pnpm dev
   ```

4. **A4F Local API**
   ```bash
   cd a4f-local-main
   pip install -r requirements.txt
   python server.py
   ```

## Environment Variables
Each directory contains its own `.env.example` or equivalent. Be sure to copy these to `.env` or `.env.local` and populate them with the appropriate API keys and database connection strings before running the services.

## License
Please refer to the individual `LICENSE` files within each submodule directory for specific licensing details (e.g., AGPL-3.0 in OpenMAIC).
