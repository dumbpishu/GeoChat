# GeoChat

A location-based real-time chat application that connects people in your vicinity. Chat with others around you using instant messaging, share media, and discover local communities.

## Features

- **Location-Based Chatting** - Connect with people automatically based on your geographic location
- **Real-Time Messaging** - Instant message delivery with Socket.IO
- **Media Sharing** - Share images in your conversations
- **Reactions & Mentions** - React to messages with emojis and mention others
- **Typing Indicators** - See when others are typing
- **Message History** - Paginated message loading for smooth scrolling
- **OTP Authentication** - Secure login with email-based OTP verification
- **Multi-Device Support** - Login from multiple devices simultaneously
- **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO with Redis adapter
- **Authentication**: JWT + OTP
- **File Storage**: Cloudinary
- **Email**: Resend

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Real-Time Client**: Socket.IO-client
- **Routing**: React Router v7

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Redis
- Cloudinary account (for media uploads)

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_uri
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
CROS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_api_key
BASE_URL=http://localhost:3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
geochat/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── sockets/        # Socket.IO handlers
│   │   ├── utils/          # Utility functions
│   │   └── validations/    # Request validations
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/            # API calls
    │   ├── components/     # React components
    │   ├── hooks/          # Custom hooks
    │   ├── pages/          # Page components
    │   ├── store/          # Zustand stores
    │   └── types/          # TypeScript types
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- User profile and settings endpoints

### Chat
- `POST /api/chats/upload` - Upload media files

### Location
- `GET /api/locations/ip` - Get user location by IP

## License

ISC