# FitZone - AI-Powered Fitness Platform

FitZone is a comprehensive fitness platform that combines Django REST API backend with React frontend, featuring AI-driven workout corrections, video management, and user tracking systems.

## 🌟 Features

### Backend (Django REST API)
- **User Management**: Registration, authentication, profile management
- **Video Management**: Video uploads, categorization, and completion tracking  
- **Dynamic Calorie Tracking**: Real-time calorie burn calculation and statistics
- **Articles System**: Fitness articles with views tracking
- **Newsletter Subscription**: Email subscription management
- **AI Workout Analysis**: Workout correction and feedback system
- **Admin Dashboard**: Comprehensive admin interface with statistics

### Frontend (React)
- **Responsive Design**: Mobile-first design with dark mode support
- **User Dashboard**: Personal statistics and progress tracking
- **Video Library**: Browse and interact with workout videos
- **Real-time Calorie Stats**: Daily, weekly, and total calorie tracking
- **Article Reading**: Browse fitness articles and resources
- **Profile Management**: Update profile, change password, upload images

## 🛠️ Technologies Used

### Backend
- Django 4.x
- Django REST Framework
- SQLite Database
- JWT Authentication
- CORS Headers
- Pillow for image processing

### Frontend  
- React 18
- React Router DOM
- Axios for API calls
- FontAwesome icons
- Tailwind CSS
- Dark mode support

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitzone
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Django server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd fitzone-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start React development server**
   ```bash
   npm start
   ```

## 🚀 API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/change-password/` - Change password

### Videos
- `GET /api/videos/` - List all videos
- `POST /api/videos/{id}/like/` - Like/unlike video
- `POST /api/videos/{id}/save/` - Save/unsave video
- `POST /api/videos/{id}/complete/` - Mark video as completed

### Calorie Tracking
- `GET /api/user/calories-stats/` - Get user calorie statistics

### Articles
- `GET /api/articles/` - List articles
- `GET /api/articles/{id}/` - Get article details

### Newsletter
- `POST /api/newsletter/subscribe/` - Subscribe to newsletter

## 📱 Usage

### For Users
1. **Registration**: Create account with email and personal details
2. **Browse Content**: Explore workout videos and fitness articles
3. **Track Progress**: Monitor calorie burn and workout completion
4. **Interact**: Like, save, and complete videos
5. **Profile Management**: Update profile information and settings

### For Admins
1. **Content Management**: Upload and manage videos/articles
2. **User Management**: Monitor user activity and statistics
3. **Analytics**: View platform usage and growth metrics

## 🎯 Key Features Implemented

### Dynamic Calorie System
- Real-time calorie calculation based on video completion
- Weekly, daily, and total calorie statistics
- Automatic calorie assignment to videos

### Responsive Navigation
- Mobile-friendly hamburger menu
- Dark mode toggle
- User dropdown with quick actions

### Video Management
- Like, save, and completion tracking
- Video categorization and filtering
- Thumbnail and metadata management

### User Dashboard
- Personal statistics cards
- Recent activity tracking
- Quick access to saved/liked content

## 🔧 Configuration

### Environment Variables
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Configuration
Update API base URL in `src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

## 🎉 Acknowledgments

- Django REST Framework for the powerful API framework
- React community for excellent frontend tools
- FontAwesome for beautiful icons
- Tailwind CSS for styling utilities

---

**Built with ❤️ for fitness enthusiasts** 