# EduConnect Mobile App

A comprehensive education platform built with React Native, Expo, and MongoDB that connects teachers and students.

## Features

- **Authentication**: Login and registration system with role-based access (teacher/student)
- **User Profiles**: Customizable profiles with personal information and photos
- **Teacher Features**:
  - Create and manage classes
  - Create and manage lessons for each class
  - View students enrolled in each class
- **Student Features**:
  - Join classes using class codes
  - View lessons and class materials
  - Track enrolled classes

## Tech Stack

### Frontend
- **React Native** with **Expo SDK 53**
- **TypeScript** for type-safe code
- **React Navigation** for navigation
- **React Hook Form** for form management
- **Axios** for API requests
- **Async Storage** for local data persistence

### Backend
- **Node.js** with **Express**
- **MongoDB** for database
- **Mongoose** for data modeling
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads

## Project Structure

```
edu-connect/
├── src/
│   ├── components/      # Reusable components
│   │   ├── classes/     # Class-related components
│   │   ├── lessons/     # Lesson-related components
│   │   └── ui/          # UI components (buttons, inputs, etc.)
│   ├── constants/       # App constants like colors
│   ├── contexts/        # React contexts (auth, etc.)
│   ├── navigation/      # Navigation setup
│   └── screens/         # App screens
│       ├── auth/        # Authentication screens
│       ├── common/      # Screens used by both roles
│       ├── student/     # Student-specific screens
│       └── teacher/     # Teacher-specific screens
├── backend/
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Mongoose models
│   │   └── routes/      # API routes
│   ├── uploads/         # Uploaded files
│   └── .env             # Environment variables
└── app.json             # Expo configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/edu-connect.git
   cd edu-connect
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the backend directory with the following:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/educonnect
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRES_IN=7d
     ```
   - Update the API URL in `src/config/api.ts` with your backend URL

5. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

6. Start the Expo app:
   ```
   cd ..
   npm start
   ```

7. Use the Expo Go app on your physical device or an emulator to run the app

## License

MIT License

## Contact

Your Name - [n.nhathao743@gmail.com](mailto:n.nhathao743@gmail.com) 