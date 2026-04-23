# Connectify Quick Start Guide

## Prerequisites
- ✅ Node.js installed
- ✅ MongoDB running on `localhost:27017`
- ✅ Dependencies installed

## Running the Project

### Option 1: Run Backend & Frontend Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Expected output: `🚀 Server running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Expected output: `Local: http://localhost:5173/`

### Option 2: Run Both Together (from root)
```bash
npm run dev
```
This will start both backend and frontend in parallel.

---

## Testing the Flow

1. **Open Browser:** Go to `http://localhost:5173`
2. **Register:** 
   - Click "Create one" or go to `/admin/register`
   - Fill in: Name, Email, Password (min 6 chars)
   - Click "Create Account"
3. **You'll be redirected to Dashboard** (if registration succeeds)
4. **Test Login:**
   - Click Logout
   - Go to `/admin/login`
   - Enter the credentials you just registered
   - Click "Sign In"

---

## API Endpoints (Backend)

### Health Check
```
GET http://localhost:5000/
```

### Admin Routes

#### Register
```
POST http://localhost:5000/api/admin/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@connectify.com",
  "password": "password123"
}
```

#### Login
```
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "john@connectify.com",
  "password": "password123"
}
```

#### Get Current Admin (Protected)
```
GET http://localhost:5000/api/admin/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│         FRONTEND (Port 5173)            │
│  React + Vite + Tailwind + Framer      │
└──────────────┬──────────────────────────┘
               │ HTTP & JWT
               ▼
┌─────────────────────────────────────────┐
│          BACKEND (Port 5000)            │
│  Express.js + MongoDB + Mongoose       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     MongoDB (Port 27017)                │
│     Database: connectify                │
└─────────────────────────────────────────┘
```

---

## Key Files

**Backend:**
- `backend/server.js` - Entry point
- `backend/src/app.js` - Express app setup
- `backend/src/models/Admin.js` - Admin schema
- `backend/src/controllers/authController.js` - Auth logic
- `backend/src/routes/admin.js` - API routes

**Frontend:**
- `frontend/src/main.jsx` - React entry
- `frontend/src/App.jsx` - Routes setup
- `frontend/src/pages/AdminRegister.jsx` - Registration page
- `frontend/src/pages/AdminLogin.jsx` - Login page
- `frontend/src/pages/AdminDashboard.jsx` - Dashboard
- `frontend/src/context/AuthContext.jsx` - Auth state management

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongod`
- Check connection string in `backend/.env`

### "Login fails but register works"
- Verify password is at least 6 characters
- Check browser DevTools Network tab for API errors
- Check backend console for error details

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### Hot reload not working
- Press Ctrl+Shift+R in browser to clear cache
- Check Vite terminal for compilation errors

---

## Next Phase Features

- [ ] Creator profile registration
- [ ] Designer/Editor marketplace
- [ ] Project posting system
- [ ] Direct messaging
- [ ] Payment gateway integration
- [ ] Admin analytics dashboard
- [ ] Role-based access control
- [ ] Content moderation tools

---

## Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://127.0.0.1:27017/connectify
JWT_SECRET=connectify_dev_secret_key_2024
PORT=5000
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

---

## UI Features Implemented

✨ **Modern Design:**
- Dark theme with vibrant gradients
- Animated gradient blob backgrounds
- Floating auth cards with shadows
- Smooth Framer Motion transitions

🎨 **Interactive Elements:**
- Hover glow effects on buttons
- Focus state animations on inputs
- Page transition animations
- Responsive grid layouts

🔐 **Security:**
- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes
- Token stored in localStorage

---

Happy coding! 🚀
