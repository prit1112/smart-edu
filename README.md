# SmartEdu - Smart Learning Platform

A comprehensive learning management system built with Express.js, MongoDB, and EJS.

## 🚀 Features

- **Student Management**: User registration, authentication, and profile management
- **Course Management**: Subjects, chapters, notes, videos, and MCQs
- **Assessment System**: Quizzes, homework assignments, and grading
- **Attendance Tracking**: Daily attendance management with analytics
- **Notification System**: Unified notifications via in-app, web push, and WhatsApp
- **Admin Dashboard**: Comprehensive admin panel for school management

## 📱 Notification System

SmartEdu includes a powerful unified notification system:

### Features
- **In-App Notifications**: Bell icon with unread count, notification center
- **Web Push Notifications**: Browser push notifications with service worker
- **WhatsApp Notifications**: Direct messaging via Twilio API
- **Targeted Messaging**: Send to all students, specific classes, or individual students
- **User Preferences**: Students can opt-in/out of different notification channels

### Admin Features
- Send notifications from admin dashboard
- Choose delivery channels (In-App, Push, WhatsApp)
- Target specific audiences (All/Class/Individual)
- View notification analytics and delivery status

### Student Features
- Notification center with filtering (All/Unread/Urgent)
- Mark notifications as read
- Manage notification preferences
- Real-time updates

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-edu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate VAPID Keys for Push Notifications**
   ```bash
   npx web-push generate-vapid-keys
   # Add the keys to your .env file
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/smart-edu

# Session Secret
SESSION_SECRET=your-session-secret-here

# Twilio WhatsApp Configuration
TWILIO_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Web Push VAPID Keys
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=your-email@example.com
```

## 📊 Usage

### Admin Dashboard
- Access at `/admin`
- Manage students, subjects, and content
- Send notifications to students
- View analytics and reports

### Student Portal
- Access at `/student`
- View courses, take quizzes, submit homework
- Check notifications and attendance

## 🏗️ Architecture

- **Backend**: Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates with vanilla JavaScript
- **Authentication**: Session-based with middleware
- **File Upload**: Multer for handling file uploads
- **Notifications**: Web Push API, Twilio WhatsApp API

## 📁 Project Structure

```
smart-edu/
├── config/              # Configuration files
├── middleware/          # Express middleware
├── models/              # MongoDB models
├── public/              # Static assets (CSS, JS, images)
├── routes/              # Express routes
├── services/            # Business logic services
├── views/               # EJS templates
├── uploads/             # File uploads
└── server.js           # Main application file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
