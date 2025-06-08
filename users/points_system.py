from django.db import transaction

# Points configuration
POINTS_CONFIG = {
    'video_watch': 5,  # Points for watching a video
    'article_read': 3,  # Points for reading an article
    'exercise_complete': 10,  # Points for completing an exercise
    'daily_login': 2,  # Points for daily login
    'profile_complete': 15,  # Points for completing profile
}

def award_points(user, activity_type):
    """
    Award points to a user based on activity type
    
    Args:
        user: CustomUser instance
        activity_type: String indicating the type of activity
    """
    if activity_type in POINTS_CONFIG:
        points = POINTS_CONFIG[activity_type]
        with transaction.atomic():
            user.add_points(points)
        return points
    return 0 