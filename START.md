# 🚀 Connectify Project - Quick Start Guide

## ✅ Project Status: READY TO RUN

Both backend and frontend servers have been hardened and are confirmed operational.

---

## 📋 Prerequisites

- **Node.js** (v16 or later)
- **npm** (v7 or later)
- **MongoDB** (running locally on default port 27017, OR update `MONGO_URI` in `.env`)

---

## 🏃 Quick Start (5 minutes)

### Option A: Sequential Start (Recommended for Testing)

#### Terminal 1 - Start Backend

```bash
cd server
npm start
```

Expected output:
```
> connectify-server@1.0.0 start
> node index.js

🔗 Attempting to connect to MongoDB...
🚀 Connectify API running on http://localhost:5000
📊 Environment: development
```

#### Terminal 2 - Start Frontend

```bash
cd client
npm run dev
```

Expected output:
```
> connectify-client@1.0.0 dev
> vite

VITE v5.4.21  ready in 600 ms
➜  Local:   http://localhost:5173/
```

#### Terminal 3 - (Optional) Start MongoDB

```bash
# If MongoDB is not already running:
# On Windows: mongod
# On Mac: brew services start mongodb-community
# On Linux: sudo systemctl start mongod
```

---

### Option B: Run Both Simultaneously

**Backend:**
```bash
cd server
npm run dev  # Watch mode for development
```

**Frontend:**
```bash
cd client
npm run dev  # Watch mode with hot reload
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `http://localhost:5173` | React app interface |
| Backend API | `http://localhost:5000` | REST API endpoints |
| MongoDB | `localhost:27017` | Database (internal) |

---

## 📁 Project Structure

```
Project/
├── server/                      # Backend (Express.js + MongoDB)
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Business logic (5 files)
│   ├── middleware/             # Auth, error handling (4 files)
│   ├── models/                 # Mongoose schemas (4 files)
│   ├── routes/                 # API routes (5 files)
│   ├── utils/                  # Helpers (2 files)
│   ├── .env                    # Configuration
│   ├── package.json            # Dependencies
│   └── index.js               # Entry point
│
└── client/                      # Frontend (React + Vite)
    ├── src/
    │   ├── pages/             # Page components (14+ files)
    │   ├── components/        # UI components (cards, common, ui)
    │   ├── context/           # React Context (AuthContext)
    │   ├── api/               # Axios instance with interceptors
    │   ├── App.jsx            # Routes (16 total)
    │   ├── main.jsx           # Entry point
    │   └── index.css          # Tailwind CSS
    ├── package.json           # Dependencies
    ├── vite.config.js         # Build config
    ├── tailwind.config.js     # Tailwind theme
    └── index.html             # HTML template
```

---

## 🔧 Available Scripts

### Backend

```bash
npm start              # Production start
npm run dev           # Development with watch mode
```

### Frontend

```bash
npm run dev           # Development server
npm run build         # Production build
npm run preview       # Preview production build
```

---

## 🧪 Testing the Connection

### Test Backend API

```bash
curl http://localhost:5000/api/auth/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running"
}
```

### Test Frontend Load

Open browser: `http://localhost:5173`

Expected: Landing page loads with navigation bar

---

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/connectify
ACCESS_TOKEN_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-key-here
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Authentication Flow

1. **Login** → User enters credentials
2. **Backend validates** → Returns Access Token + Refresh Token
3. **Token stored** → localStorage (access) + httpOnly cookie (refresh)
4. **API calls** → Axios adds Bearer token to Authorization header
5. **Token expires** → Axios interceptor automatically refreshes
6. **Session persists** → AuthContext restores on page reload

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `Module not found: jsonwebtoken`
- **Fix**: `cd server && npm install`

**Error**: `MongoDB Connection Error`
- **Fix**: 
  - Ensure MongoDB is running: `mongod` (Windows) or `brew services start mongodb-community` (Mac)
  - Verify `MONGO_URI` in `server/.env` points to correct MongoDB instance
  - Default: `mongodb://localhost:27017/connectify`

### Frontend Won't Load

**Error**: `Cannot GET /`
- **Fix**: Ensure Vite is running on port 5173
- Check: `npm run dev` in `client/` folder

**Error**: API calls failing (`http://localhost:5000`)
- **Fix**: 
  - Ensure backend is running on port 5000
  - Check `VITE_API_URL` in `client/.env`
  - Browser console may show CORS error if backend middleware not loaded

### Port Already in Use

**Error**: `Error: listen EADDRINUSE :::5000`
- **Fix**: Kill the existing process:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -i :5000` then `kill -9 <PID>`

### Dependencies Missing

**Error**: `npm ERR! Missing ...`
- **Fix**: Clear cache and reinstall
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## 📊 System Health Checks

Run these commands to verify everything is working:

```bash
# Check Node.js version
node --version        # Should be v16+

# Check npm version
npm --version         # Should be v7+

# Check MongoDB connection
# (From Project root)
cd server
node -e "require('mongoose').connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connectify')"

# Test backend
curl http://localhost:5000/api/health

# Verify all dependencies
npm list             # Check for missing packages
```

---

## 🎯 Next Steps

1. ✅ Start both servers (see Quick Start above)
2. ✅ Open `http://localhost:5173` in browser
3. ✅ Test user registration and login
4. ✅ Verify API calls in browser DevTools Network tab
5. ✅ Check MongoDB collections created: `db.users.find()`, `db.admins.find()`

---

## 📝 Notes

- **Hot Reload**: Both servers support hot reload - changes auto-apply
- **Token Expiry**: Access tokens (15min), Refresh tokens (7 days)
- **CORS**: Configured for `localhost:5173` accessing `localhost:5000`
- **Uploads**: User avatars stored in `server/uploads/` directory
- **Database**: MongoDB collections auto-created on first use

---

## 🆘 Need Help?

1. Check browser console (F12) for frontend errors
2. Check terminal output for backend errors
3. Verify `.env` files have correct values
4. Ensure MongoDB is running: `mongod` command
5. Clear browser cache: `Ctrl+Shift+Delete` or `Cmd+Shift+Delete`

---

**Last Updated**: Recovery & Hardening Session
**Status**: ✅ All systems operational
