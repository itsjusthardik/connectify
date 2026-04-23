# Connectify - Creator Economy Platform

A full-stack creator economy platform connecting content creators with talent (video editors, graphic designers) and consumers. Built with React, Vite, Express.js, and MongoDB.

## Tech Stack

### Backend
- **Node.js + Express.js** - API server
- **MongoDB with Mongoose** - Database
- **JWT (15min access, 7-day refresh)** - Authentication
- **bcryptjs (12 rounds)** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **multer** - File uploads
- **morgan** - Request logging

### Frontend
- **React.js + Vite** - UI framework
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Project Structure

```
.
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .env
│
└── client/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   │   ├── common/
    │   │   ├── cards/
    │   │   └── ui/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## Setup Instructions

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (`.env`)
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/connectify
   NODE_ENV=development
   ACCESS_TOKEN_SECRET=your-access-token-secret-key
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5
   ```

5. **Start the server**
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (`.env`)
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## API Routes

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin Routes
- `POST /api/admin/auth/register` - Admin registration
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/dashboard-stats` - Get dashboard statistics
- `POST /api/admin/auth/logout` - Admin logout

### User Routes
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/image` - Upload profile image
- `GET /api/users/browse/creators` - Browse creators
- `GET /api/users/browse/talent` - Browse talent

### Connection Request Routes
- `POST /api/requests/send` - Send connection request
- `GET /api/requests/my-requests` - Get sent requests
- `GET /api/requests/received` - Get received requests
- `PUT /api/requests/:id/accept` - Accept request
- `PUT /api/requests/:id/decline` - Decline request

### Notification Routes
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## User Roles

### Content Creator
- Create and share content
- Browse editors and designers to collaborate with
- Send connect requests to talent

### Video Editor
- Offer video editing services
- Receive collaboration requests from creators
- Manage portfolio and hourly rates

### Graphic Designer
- Offer graphic design services
- Receive collaboration requests from creators
- Manage portfolio and hourly rates

### Consumer
- Browse content creators
- Send collaboration requests to creators
- Manage business information

## Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Authentication**: Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- **HTTP-Only Cookies**: Secure refresh token storage
- **Rate Limiting**: 10 req/15min on auth routes, 100 on general routes
- **Input Validation**: express-validator on all routes
- **Security Headers**: helmet middleware
- **CORS Configuration**: Restricted to localhost:5173
- **No Password Leakage**: Password never included in API responses
- **Duplicate Request Prevention**: Database indexes + query validation

## Database Models

### User
All user roles in single model with role-specific fields:
- Basic fields: name, email, password, bio, profileImage, location, role
- Creator fields: niche (array), followersCount, socialLinks
- Talent fields: skills, portfolioLinks, experienceYears, hourlyRate
- Consumer fields: businessName, businessType
- Status: isVerified, isActive, refreshToken

### Admin
- name, email, password, refreshToken

### ConnectRequest
- sender, receiver, type ('connect' or 'collaboration'), message
- status ('pending', 'accepted', 'declined')
- Compound index on (sender, receiver, type, status)

### Notification
- user, type, message, relatedRequest, isRead
- Index on (user, createdAt)

## Design System

### Colors
- Dark Background: `#0A0A0F`
- Primary: `#6366F1` (Indigo)
- Secondary: `#22D3EE` (Cyan)
- Border: `rgba(255, 255, 255, 0.1)`

### Fonts
- Display Font: Clash Display (from Fontshare)
- Body Font: Satoshi (from Fontshare)

### Component Classes
- `glass-card` - Glass morphism with backdrop blur
- `glow-button` - Gradient button with hover glow
- `input-field` - Animated input with focus glow
- `animate-fadeInUp` - Fade in up animation
- `animate-slideInLeft` - Slide in left animation
- `animate-pulse-glow` - Pulsing glow animation

## Key Features Implemented

✅ **4-Role System**: Content Creator, Video Editor, Graphic Designer, Consumer
✅ **Collaboration Requests**: Connect and collaboration request types
✅ **Real-Time Notifications**: Auto-created on request events
✅ **Profile Management**: Role-specific profile fields and image uploads
✅ **Browse Features**: Creators browse talent, consumers browse creators
✅ **Advanced Search**: Filter by niche, skills, experience
✅ **JWT Authentication**: Secure token-based auth with refresh
✅ **Admin Panel**: Dashboard with platform statistics
✅ **Responsive Design**: Mobile-optimized UI
✅ **Modern Animations**: Framer Motion for smooth interactions
✅ **Production Security**: All security best practices implemented

## Common Issues & Solutions

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongostat` or `ps aux | grep mongo`
- Check `MONGO_URI` in `.env`
- Try `mongodb://localhost:27017/connectify`

### CORS Errors
- Frontend must run on `http://localhost:5173`
- Backend must have `http://localhost:5173` in CORS origins
- Check Vite proxy in `vite.config.js`

### Token Refresh Issues
- Ensure refresh token cookie is being set (check httpOnly, sameSite)
- Clear cookies in browser dev tools if issues persist
- Check `/auth/refresh` endpoint response

### Image Upload Not Working
- Ensure `/server/uploads` directory exists
- Check multer configuration in routes
- Verify file size limits

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/connectify
NODE_ENV=development
ACCESS_TOKEN_SECRET=your-super-secret-access-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Running Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Testing User Flows

### Creator Flow
1. Register as Content Creator
2. Fill profile with niche and bio
3. Browse talent
4. Send connect requests
5. Check dashboard and requests

### Talent Flow
1. Register as Video Editor/Designer
2. Fill profile with skills and rates
3. Wait for requests
4. Accept/decline requests
5. Check requests page

### Consumer Flow
1. Register as Consumer
2. Fill business information
3. Browse creators
4. Send collaboration requests
5. Track collaborations

## Performance Optimizations

- JWT tokens stored in sessionStorage (cleared on browser close)
- Axios request/response interceptors for token management
- MongoDB indexes on frequently queried fields
- Pagination on browse pages
- React Router code-splitting via lazy imports
- Unused CSS removed via Tailwind purging
- Image optimization with lazy loading

## Future Enhancements

- Video upload and portfolio showcase
- Payment integration
- Messaging system
- Rating and reviews
- Analytics dashboard
- Email notifications
- Two-factor authentication
- Social media integration
- Advanced search with AI recommendations

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Created with ❤️ by GitHub Copilot**
