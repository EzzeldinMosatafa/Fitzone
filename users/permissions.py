from rest_framework.permissions import BasePermission, IsAdminUser
import logging

logger = logging.getLogger(__name__)

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        logger.info(f"=== Permission Check Start ===")
        logger.info(f"User: {request.user}")
        logger.info(f"Email: {request.user.email}")
        logger.info(f"Method: {request.method}")
        logger.info(f"Authenticated: {request.user.is_authenticated}")
        logger.info(f"Staff: {request.user.is_staff}")
        logger.info(f"Admin: {getattr(request.user, 'is_admin', False)}")
        logger.info(f"Superuser: {request.user.is_superuser}")
        
        # Allow read-only access for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            logger.info("Read-only access granted")
            return True
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            logger.warning("User is not authenticated")
            return False
        
        # Check if user is admin
        is_admin = request.user.is_staff or getattr(request.user, 'is_admin', False) or request.user.is_superuser
        
        if is_admin:
            logger.info("Admin access granted")
        else:
            logger.warning("Admin access denied")
            
        logger.info(f"=== Permission Check End ===")
        return is_admin

    def has_object_permission(self, request, view, obj):
        logger.info(f"=== Object Permission Check Start ===")
        logger.info(f"User: {request.user}")
        logger.info(f"Email: {request.user.email}")
        logger.info(f"Method: {request.method}")
        logger.info(f"Authenticated: {request.user.is_authenticated}")
        logger.info(f"Staff: {request.user.is_staff}")
        logger.info(f"Admin: {getattr(request.user, 'is_admin', False)}")
        logger.info(f"Superuser: {request.user.is_superuser}")
        
        # Allow read-only access for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            logger.info("Read-only object access granted")
            return True
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            logger.warning("User is not authenticated for object access")
            return False
        
        # Check if user is admin
        is_admin = request.user.is_staff or getattr(request.user, 'is_admin', False) or request.user.is_superuser
        
        if is_admin:
            logger.info("Admin object access granted")
        else:
            logger.warning("Admin object access denied")
            
        logger.info(f"=== Object Permission Check End ===")
        return is_admin 