# Copilot Instructions for GrinnDorm

GrinnDorm is a full-stack dorm rating platform with a React/TypeScript frontend and Node.js/Express backend.

## Quick Commands

### Frontend (React + Vite + Tailwind)
- **Install**: `npm install` (from `frontend/`)
- **Develop**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build`

### Backend (Express + Supabase)
- **Install**: `npm install` (from `backend/`)
- **Start**: `npm run dev` or `npm start` (runs on port 5000)

### Running Both
From repository root, you must start frontend and backend separately in different terminals.

## Architecture

### Frontend (`frontend/`)
- **Entry**: `src/main.tsx` → `src/app/App.tsx`
- **Pages**: Main state management in `App.tsx` with React hooks
  - `AuthPage`: Login/signup with email verification
  - `HomePage`: Browse and search dorms
  - `DormDetailsPage`: View dorm details and reviews
- **Components**: 
  - UI components in `src/app/components/ui/` (shadcn/radix-ui based)
  - Page components in `src/app/components/`
- **Configuration**: 
  - API endpoints: `src/config/api.ts`
  - Build config: `vite.config.ts` includes Tailwind plugin
- **Styling**: Tailwind CSS via `@tailwindcss/vite` plugin
- **State**: Local React state + localStorage for session persistence
- **Routing**: React Router for page navigation
- **Dependencies**: Material-UI icons, Radix UI, Recharts, React DnD, Sonner toasts

### Backend (`backend/`)
- **Entry**: `server.js`
- **Routes**:
  - `/api/auth/*`: Signup, login, verify email
  - `/api/dorms`: Get all dorms with average ratings
  - `/api/reviews`: Post reviews, vote on reviews
- **Database**: Supabase PostgreSQL
- **Auth**: JWT tokens with email verification
  - Tokens embedded in Authorization header: `Bearer <token>`
  - Optional auth middleware allows endpoints to work with or without auth
- **Middleware**:
  - `authMiddleware`: Validates JWT tokens
  - Optional auth variant that extracts user if present, continues without token if not
- **Utils**:
  - `utils/jwtUtils.js`: Token generation and verification
  - `seed.js`: Database seeding

## Key Conventions

### Frontend
- **API Calls**: Always use centralized `API_ENDPOINTS` from `config/api.ts` rather than hardcoding URLs
- **Auth State**: 
  - Stored in localStorage: `grinnDormLoggedIn` (boolean), `grinnDormUserEmail` (string), `grinnDormToken` (JWT)
  - App-level state in `App.tsx` with `isLoggedIn`, `userEmail`
- **Fetch Patterns**: Include `Authorization: Bearer <token>` header for protected routes
- **Error Handling**: Display errors via Sonner toasts (already set up in components)

### Backend
- **Supabase Integration**: 
  - Supabase client injected into requests via middleware: `req.supabase`
  - Environment variables: `SUPABASE_URL`, `SUPABASE_KEY`
- **JWT Tokens**: 
  - Generated with user email as payload
  - Verified using `verifyToken()` from `utils/jwtUtils.js`
  - Token verification returns decoded payload or null
- **Error Responses**: Use consistent HTTP status codes (401 for auth, 400 for validation, 500 for server errors)
- **CORS**: Enabled globally via `cors()` middleware

### Database Schema (Supabase)
- **dorms**: id, name, description, campus, rating_count, total_rating_sum, official_link
- **reviews**: id, dorm_id, user_email, rating, comment, date, upvotes, downvotes
- **users**: email, verified (email verification flag)

## Environment Variables

### Frontend
- `VITE_API_URL`: Backend API base URL (defaults to `http://localhost:5000`)

### Backend
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase public API key
- `SMTP_EMAIL`: Email for verification emails (via Nodemailer)
- `JWT_SECRET`: Secret for signing JWT tokens

## Important Notes
- The project was originally generated from a Figma design (see `ATTRIBUTIONS.md`)
- Frontend and backend must run as separate processes
- Email verification is part of signup flow
- Reviews have voting/feedback system (upvotes/downvotes)
