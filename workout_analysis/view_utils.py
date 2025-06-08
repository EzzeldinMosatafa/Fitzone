from django.core.cache import cache

def increment_view_count(instance, request, content_type='article'):
    """
    Increment view count for an article or video
    
    Args:
        instance: The article or video instance
        request: The HTTP request
        content_type: Either 'article' or 'video'
    """
    user_ip = request.META.get('REMOTE_ADDR', 'unknown')
    cache_key = f"{content_type}_viewed_{instance.id}_{user_ip}"
    
    if not cache.get(cache_key):
        instance.views = (instance.views or 0) + 1
        instance.save(update_fields=["views"])
        cache.set(cache_key, True, timeout=10)  # 10 seconds timeout
    
    return instance.views 