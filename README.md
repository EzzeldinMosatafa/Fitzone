# FitZone

A fitness application that uses AI to analyze workout form and provide real-time feedback.

## Features

- Real-time workout analysis for various exercises:
  - Squats
  - Push-ups
  - Planks
  - Lunges
  - Running
  - Bicep Curls
- Form correction and feedback
- Progress tracking
- User authentication
- Newsletter subscription

## Technologies

- Django
- MediaPipe
- OpenCV
- MySQL
- REST API

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fitzone.git
cd fitzone
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with the following variables:
```
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_NAME=fitzone_db
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=3307
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the development server:
```bash
python manage.py runserver
```

## API Endpoints

- `/api/analyze-squat/` - Squat analysis
- `/api/analyze-pushup/` - Push-up analysis
- `/api/analyze-plank/` - Plank analysis
- `/api/analyze-lunges/` - Lunges analysis
- `/api/analyze-running/` - Running analysis
- `/api/analyze-bicepcurl/` - Bicep curl analysis
- `/api/register/` - User registration
- `/api/login/` - User login
- `/api/subscribe/` - Newsletter subscription

## License

MIT 