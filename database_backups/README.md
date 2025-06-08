# 🗄️ FitZone Database Backups

This directory contains database backups and restoration tools for the FitZone application.

## 📦 **What's Included**

### 1. **Complete MySQL Backup**
- **File:** `fitzone_mysql_backup.sql`
- **Size:** ~400KB
- **Contains:** All tables, data, and structure
- **Type:** Complete MySQL dump

### 2. **Django Fixtures** (Partial)
- **users_data.json** - User accounts and profiles
- **videos_data.json** - Video metadata (when working)
- **fitzone_complete_data.json** - Complete data (when working)

### 3. **Restoration Script**
- **File:** `restore_database.py`
- **Purpose:** Automated database restoration
- **Features:** Interactive setup and validation

## 🚀 **Quick Start for New Developers**

### Option 1: Automated Restoration (Recommended)

```bash
# Navigate to database_backups directory
cd database_backups

# Run the restoration script
python restore_database.py
```

The script will guide you through:
1. 🔍 Checking MySQL installation
2. 🔧 Creating the database
3. 📥 Restoring data from backup
4. ⚙️ Setting up Django migrations
5. 👥 Showing sample account credentials

### Option 2: Manual Restoration

#### Prerequisites
- MySQL Server installed and running
- MySQL client tools (`mysql` command available)
- Python 3.8+ with Django

#### Steps

1. **Create Database**
   ```sql
   CREATE DATABASE fitzone_db;
   ```

2. **Restore from Backup**
   ```bash
   mysql -u your_username -p -h localhost -P 3307 fitzone_db < fitzone_mysql_backup.sql
   ```

3. **Update Django Settings**
   
   Update `fitzone/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'fitzone_db',
           'USER': 'your_username',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '3307',
       }
   }
   ```

4. **Run Django Migrations**
   ```bash
   cd ..  # Go back to project root
   python manage.py migrate
   python manage.py runserver
   ```

## 👥 **Sample Accounts**

After restoration, you can use these accounts:

### 🔐 **Admin Account**
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@fitzone.com`
- **Access:** Full admin panel access

### 👤 **Regular User Account**
- **Username:** `testuser`  
- **Password:** `testpass123`
- **Email:** `user@fitzone.com`
- **Access:** Regular user features

## 📊 **Sample Data Included**

### ✅ **Users & Profiles**
- Multiple user accounts with different roles
- User profiles with personal information
- Authentication tokens and permissions

### ✅ **Workout Videos**
- Pre-loaded workout videos with metadata
- Calorie calculations for each video
- Categories and difficulty levels
- Video completion tracking

### ✅ **Articles & Content**
- Fitness articles with rich content
- Categories and tags
- View counts and engagement data

### ✅ **User Activity Data**
- Completed workout history
- Calorie burn statistics (daily, weekly, total)
- Liked and saved videos
- User interactions and preferences

### ✅ **Admin Data**
- Newsletter subscriptions
- User statistics and analytics
- Content management data

## 🔧 **Troubleshooting**

### Common Issues

1. **MySQL Connection Error**
   ```
   Solution: Check MySQL is running and credentials are correct
   ```

2. **Permission Denied**
   ```
   Solution: Ensure MySQL user has CREATE and INSERT privileges
   ```

3. **Encoding Issues**
   ```
   Solution: Use utf8mb4 charset in MySQL settings
   ```

4. **Port Conflicts**
   ```
   Solution: Update port number in Django settings and restore command
   ```

### Database Configuration

If you're using different database settings, update these files:

1. **Django Settings** (`fitzone/settings.py`)
2. **Environment Variables** (`.env` file)
3. **Restoration Script** (`restore_database.py`)

## 📝 **Creating New Backups**

To create a new backup from your current database:

```bash
# MySQL dump
mysqldump -u username -p --port=3307 fitzone_db > new_backup.sql

# Django fixtures (when working)
python manage.py dumpdata --indent=2 > django_backup.json
```

## 🛡️ **Security Note**

⚠️ **Important:** This backup contains sample data and should only be used for development. Never use these credentials in production!

## 📞 **Support**

If you encounter issues with database restoration:

1. Check the console output for specific error messages
2. Verify MySQL server is running
3. Confirm database credentials
4. Review Django settings configuration

---

**Happy coding! 🚀** 