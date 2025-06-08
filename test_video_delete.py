import os
import django
import requests
import json
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitzone.settings')
django.setup()

from django.contrib.auth import get_user_model
from videos.models import Video
from users.models import CustomUser

def test_video_deletion():
    print("\n=== Starting Video Deletion Test ===\n")
    
    # 1. Check admin user
    try:
        admin_user = CustomUser.objects.filter(is_admin=True).first()
        if admin_user:
            print(f"Found admin user:")
            print(f"Email: {admin_user.email}")
            print(f"Is staff: {admin_user.is_staff}")
            print(f"Is admin: {admin_user.is_admin}")
            print(f"Is superuser: {admin_user.is_superuser}")
        else:
            print("No admin user found!")
            return
    except Exception as e:
        print(f"Error checking admin user: {str(e)}")
        return

    # 2. Check videos
    try:
        videos = Video.objects.all()
        print(f"\nFound {videos.count()} videos in database:")
        for video in videos:
            print(f"ID: {video.id}, Title: {video.title}")
            print(f"  - Description: {video.description[:50]}...")
            print(f"  - Duration: {video.duration} minutes")
            print(f"  - Body Focus: {video.body_focus}")
            print(f"  - Category: {video.category}")
            print(f"  - Difficulty: {video.difficulty}")
            print(f"  - Created at: {video.created_at}")
            print(f"  - Updated at: {video.updated_at}")
            print(f"  - Video file: {video.video_file}")
            print(f"  - Image file: {video.image}")
            print("  ---")
    except Exception as e:
        print(f"Error checking videos: {str(e)}")
        return

    # 3. Test API endpoints
    base_url = "http://127.0.0.1:8000"
    session = requests.Session()
    
    # Login to get token
    try:
        login_data = {
            "email": "super@gmail.com",
            "password": "0500"
        }
        login_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        login_response = session.post(
            f"{base_url}/api/token/",
            json=login_data,
            headers=login_headers
        )
        if login_response.status_code == 200:
            tokens = login_response.json()
            access_token = tokens.get('access')
            print("\nSuccessfully logged in and got access token")
            print(f"Token: {access_token[:20]}...")
        else:
            print(f"\nLogin failed: {login_response.status_code}")
            print(login_response.text)
            return
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return

    # Test video deletion
    if videos.exists():
        test_video = videos.first()  # Get the first video
        if not test_video:
            print("\nNo video found to test!")
            return
            
        print(f"\nTesting deletion of video ID: {test_video.id}")
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        try:
            # First, try to list all videos
            list_url = f"{base_url}/api/videos/"
            print(f"\nTrying to list videos from: {list_url}")
            list_response = session.get(
                list_url,
                headers=headers
            )
            print(f"\nList Response Status: {list_response.status_code}")
            print(f"List Response Headers: {json.dumps(dict(list_response.headers), indent=2)}")
            if list_response.status_code == 200:
                print("Successfully listed videos")
                print(f"Response: {list_response.text[:200]}...")  # Show first 200 chars
            
            # Then try to get the specific video
            get_url = f"{base_url}/api/videos/{test_video.id}/"
            print(f"\nTrying to get video from: {get_url}")
            get_response = session.get(
                get_url,
                headers=headers
            )
            print(f"\nGET Response Status: {get_response.status_code}")
            print(f"GET Response Headers: {json.dumps(dict(get_response.headers), indent=2)}")
            
            if get_response.status_code == 200:
                print("Successfully retrieved video, attempting deletion...")
                
                delete_url = f"{base_url}/api/videos/{test_video.id}/"
                print(f"\nTrying to delete video at: {delete_url}")
                delete_response = session.delete(
                    delete_url,
                    headers=headers
                )
                
                print(f"\nDelete Response Status: {delete_response.status_code}")
                print(f"Delete Response Headers: {json.dumps(dict(delete_response.headers), indent=2)}")
                
                if delete_response.text:
                    print(f"Response Body: {delete_response.text}")
                
                if delete_response.status_code == 204:
                    print("\nVideo deleted successfully!")
                    
                    # Verify deletion in database
                    try:
                        deleted_video = Video.objects.get(id=test_video.id)
                        print(f"Error: Video still exists in database!")
                    except Video.DoesNotExist:
                        print("Verified: Video no longer exists in database")
                else:
                    print("\nFailed to delete video!")
            else:
                print(f"Failed to retrieve video: {get_response.status_code}")
                if get_response.text:
                    print(f"Response: {get_response.text}")
                
        except Exception as e:
            print(f"Error during deletion: {str(e)}")
    else:
        print("\nNo videos found to test deletion")

    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_video_deletion() 