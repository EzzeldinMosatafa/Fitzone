#!/usr/bin/env python3
"""
FitZone Database Restore Script
This script helps restore the database with sample data for new developers.
"""

import os
import sys
import subprocess
import json

def print_header():
    """Print welcome header"""
    print("=" * 60)
    print("🏋️‍♂️  FitZone Database Restore Script")
    print("=" * 60)
    print("This script will help you restore the database with sample data.\n")

def check_mysql_connection():
    """Check if MySQL is running and accessible"""
    try:
        result = subprocess.run([
            'mysql', '--version'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ MySQL is available")
            return True
        else:
            print("❌ MySQL is not available")
            return False
    except FileNotFoundError:
        print("❌ MySQL command not found. Please install MySQL client.")
        return False

def restore_mysql_database():
    """Restore MySQL database from backup"""
    print("\n📊 Restoring MySQL Database...")
    
    # Database connection details
    db_name = input("Enter database name (default: fitzone_db): ").strip() or "fitzone_db"
    db_user = input("Enter MySQL username (default: root): ").strip() or "root"
    db_password = input("Enter MySQL password: ").strip()
    db_host = input("Enter MySQL host (default: localhost): ").strip() or "localhost"
    db_port = input("Enter MySQL port (default: 3307): ").strip() or "3307"
    
    # Create database if not exists
    print(f"\n🔧 Creating database '{db_name}' if not exists...")
    create_db_cmd = [
        'mysql',
        f'-u{db_user}',
        f'-p{db_password}',
        f'-h{db_host}',
        f'-P{db_port}',
        '-e',
        f'CREATE DATABASE IF NOT EXISTS {db_name};'
    ]
    
    try:
        result = subprocess.run(create_db_cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Database created successfully")
        else:
            print(f"❌ Error creating database: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Restore from backup
    print(f"\n📥 Restoring data from backup...")
    backup_file = "fitzone_mysql_backup.sql"
    
    if not os.path.exists(backup_file):
        print(f"❌ Backup file '{backup_file}' not found!")
        return False
    
    restore_cmd = [
        'mysql',
        f'-u{db_user}',
        f'-p{db_password}',
        f'-h{db_host}',
        f'-P{db_port}',
        db_name
    ]
    
    try:
        with open(backup_file, 'r', encoding='utf-8') as f:
            result = subprocess.run(restore_cmd, stdin=f, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Database restored successfully!")
            return True
        else:
            print(f"❌ Error restoring database: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def update_django_settings():
    """Guide user to update Django settings"""
    print("\n⚙️  Django Settings Configuration")
    print("Please update your Django settings.py file with the database connection details:")
    print("""
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
""")

def run_django_migrations():
    """Run Django migrations"""
    print("\n🔄 Running Django migrations...")
    
    try:
        # Check if manage.py exists
        if not os.path.exists('../manage.py'):
            print("❌ manage.py not found. Please run this script from the database_backups directory.")
            return False
        
        # Run migrations
        os.chdir('..')
        result = subprocess.run([sys.executable, 'manage.py', 'migrate'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migrations completed successfully!")
            return True
        else:
            print(f"❌ Migration error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

def show_sample_accounts():
    """Show sample accounts information"""
    print("\n👥 Sample Accounts Available:")
    print("=" * 40)
    print("🔐 Admin Account:")
    print("   Username: admin")
    print("   Password: admin123")
    print("   Email: admin@fitzone.com")
    print()
    print("👤 User Account:")
    print("   Username: testuser")
    print("   Password: testpass123")
    print("   Email: user@fitzone.com")
    print()
    print("📊 Sample Data Included:")
    print("   ✅ Workout videos with calorie data")
    print("   ✅ User profiles and statistics")
    print("   ✅ Articles and content")
    print("   ✅ Completed workout history")

def main():
    """Main function"""
    print_header()
    
    # Check MySQL
    if not check_mysql_connection():
        print("\n❌ Please install MySQL and try again.")
        return
    
    # Restore database
    if restore_mysql_database():
        update_django_settings()
        
        # Ask if user wants to run migrations
        run_migrations = input("\nDo you want to run Django migrations now? (y/N): ").strip().lower()
        if run_migrations in ['y', 'yes']:
            run_django_migrations()
        
        show_sample_accounts()
        
        print("\n🎉 Database restore completed!")
        print("Next steps:")
        print("1. Update your Django settings.py with database credentials")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py runserver")
        print("4. Access the application at http://127.0.0.1:8000/")
    else:
        print("\n❌ Database restore failed. Please check the errors above.")

if __name__ == "__main__":
    main() 