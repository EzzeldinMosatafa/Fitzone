# 🏋️‍♂️ FitZone - Complete Fitness Application

A comprehensive full-stack fitness application built with **Django REST Framework** (Backend) and **React** (Frontend), featuring dynamic calorie tracking, responsive design, and complete user management.

## 🚀 **Project Structure**

```
fitzone/
├── backend/ (Django REST API)
│   ├── fitzone/           # Main Django project
│   ├── users/             # User management & authentication
│   ├── videos/            # Workout videos & calorie tracking
│   ├── articles/          # Fitness articles
│   ├── newsletter/        # Newsletter management
│   └── manage.py
├── frontend/ (React Application)
│   ├── src/               # React source code
│   ├── public/            # Static files
│   ├── package.json       # Dependencies
│   └── tailwind.config.js # Styling configuration
└── README.md
```

## ✨ **Key Features**

### 🎯 **Dynamic Calorie Tracking**
- **Real-time calorie calculation** based on video completion
- **Weekly, Daily, and Total statistics**
- **Automatic calorie addition** when users complete workouts
- **Personal dashboard** with comprehensive stats

### 👤 **Complete User Management**
- **JWT Authentication** with token refresh
- **Registration & Login** with validation
- **Password Management** (change & reset)
- **User profiles** with personal data
- **Admin dashboard** for user management

### 🎥 **Workout Video System**
- **Video library** with categories and difficulty levels
- **Like, Save, and Complete** functionality
- **Comments system** for community interaction
- **Video management** for administrators
- **Responsive video player**

### 📱 **Responsive Design**
- **Mobile-first approach** with Tailwind CSS
- **Dark/Light mode** toggle
- **Hamburger menu** for mobile navigation
- **Touch-friendly interface**
- **Cross-platform compatibility**

### 📊 **Admin Features**
- **User statistics** and analytics
- **Content management** (videos, articles)
- **Newsletter management**
- **Real-time data** visualization

## 🛠️ **Technology Stack**

### Backend (Django)
- **Django 5.2.1** - Web framework
- **Django REST Framework** - API development
- **JWT Authentication** - Secure user sessions
- **SQLite/PostgreSQL** - Database
- **Django CORS** - Cross-origin requests

### Frontend (React)
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

## 🚀 **Quick Start**

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**

### 1. Backend Setup (Django)

```bash
# Clone the repository
git clone https://github.com/EzzeldinMosatafa/Fitzone.git
cd fitzone

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

**Backend will run on:** `http://127.0.0.1:8000/`

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

**Frontend will run on:** `http://localhost:3000/`

## 📡 **API Endpoints**

### Authentication
- `POST /api/users/login/` - User login
- `POST /api/users/register/` - User registration
- `POST /api/token/refresh/` - Token refresh
- `POST /api/user/change-password/` - Change password

### Users
- `GET /api/users/` - List users (admin)
- `GET /api/user/calories-stats/` - Get user calorie statistics

### Videos
- `GET /api/videos/` - List all videos
- `GET /api/videos/{id}/` - Get specific video
- `POST /api/videos/{id}/complete/` - Mark video as completed
- `POST /api/videos/{id}/like/` - Like/unlike video
- `POST /api/videos/{id}/save/` - Save/unsave video

### Articles
- `GET /api/articles/` - List all articles
- `GET /api/articles/{id}/` - Get specific article

## 🔧 **Environment Variables**

Create `.env` files in both backend and frontend:

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (frontend/.env)
```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

## 📱 **Features Showcase**

### 🎯 **Calorie Tracking**
- Dynamic calculation based on video difficulty and duration
- Real-time stats update when completing workouts
- Weekly, daily, and total calorie burn tracking

### 🏠 **User Dashboard**
- Personal statistics cards
- Recent activity tracking
- Quick access to saved and liked videos

### 🎥 **Workout Videos**
- Categorized video library
- Interactive video player
- Social features (like, save, comment)

### 👨‍💼 **Admin Panel**
- User management and statistics
- Content management (videos, articles)
- Analytics dashboard

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team**

- **Ezzeldin Mostafa** - Full-stack Developer
- **Mahmoud Essam** - Backend Developer  
- **Mohamed Hany** - Frontend Developer
- **Nagham Refaat** - UI/UX Designer
- **Omar Othman** - Frontend Developer
- **Reham** - Database Designer
- **Shahed Kamel** - Quality Assurance

## 📞 **Support**

For support, email ezzeldinmostafa@example.com or create an issue on GitHub.

## 🌟 **Show Your Support**

Give a ⭐️ if this project helped you!

---

**Built with ❤️ by the FitZone Team** 